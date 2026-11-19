import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createRobloxAvatar, type AvatarRig } from '../three/avatarBuilder';
import { buildCityAndInteriors, type BuildingPortal, type InteriorStationTrigger } from '../three/cityBuilder';
import type {
  AnimState,
  DayPhase,
  OnlinePlayer,
  PlayerProgress,
  PlayerSession,
  WeatherKind,
} from '../types/game';
import { audioGuide } from '../services/audioGuide';

export interface NearbyPrompt {
  type: 'portal' | 'station';
  id: string;
  label: string;
  isArena?: boolean;
}

export interface SpectatorState {
  mode: 'off' | 'free' | 'follow';
  targetSessionId: string | null;
}

export interface GameCanvasHandle {
  teleportTo: (x: number, z: number) => void;
  exitBuilding: () => void;
  triggerJump: () => void;
  setJumpHeld: (held: boolean) => void;
  setJoystickInput: (dx: number, dy: number) => void;
  setMobileSprint: (sprint: boolean) => void;
}

interface GameCanvas3DProps {
  session: PlayerSession;
  progress: PlayerProgress;
  onlinePlayers: OnlinePlayer[];
  currentBuildingId: string;
  weatherCondition: WeatherKind;
  dayPhaseOverride: DayPhase | 'auto';
  spectator: SpectatorState;
  frozen: boolean;
  onPlayerMove: (state: {
    x: number;
    y: number;
    z: number;
    rotY: number;
    animState: AnimState;
  }) => void;
  onNearbyChange: (prompt: NearbyPrompt | null) => void;
  onInteract: (prompt: NearbyPrompt) => void;
  onDayPhaseComputed: (phase: DayPhase, timeStr: string) => void;
}

// Pre-allocated math helpers (zero GC inside animation loop)
const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();
const _camGoal = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _skyColor = new THREE.Color();
const _fogColor = new THREE.Color();
const _sunColor = new THREE.Color();

function getLocalDayPhaseAndSun(): { phase: DayPhase; hourFloat: number; timeStr: string } {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const hourFloat = h + m / 60;
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  let phase: DayPhase = 'Siang';
  if (hourFloat >= 5.5 && hourFloat < 10.5) phase = 'Pagi';
  else if (hourFloat >= 10.5 && hourFloat < 15.5) phase = 'Siang';
  else if (hourFloat >= 15.5 && hourFloat < 18.5) phase = 'Sore';
  else phase = 'Malam';
  return { phase, hourFloat, timeStr };
}

export const GameCanvas3D = forwardRef<GameCanvasHandle, GameCanvas3DProps>(function GameCanvas3D(
  {
    session,
    progress,
    onlinePlayers,
    currentBuildingId,
    weatherCondition,
    dayPhaseOverride,
    spectator,
    frozen,
    onPlayerMove,
    onNearbyChange,
    onInteract,
    onDayPhaseComputed,
  },
  ref
) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Mutable refs so the 3D scene never resets on React state updates
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const onlinePlayersRef = useRef(onlinePlayers);
  onlinePlayersRef.current = onlinePlayers;
  const currentBuildingRef = useRef(currentBuildingId);
  currentBuildingRef.current = currentBuildingId;
  const weatherRef = useRef(weatherCondition);
  weatherRef.current = weatherCondition;
  const dayPhaseOverrideRef = useRef(dayPhaseOverride);
  dayPhaseOverrideRef.current = dayPhaseOverride;
  const spectatorRef = useRef(spectator);
  spectatorRef.current = spectator;
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  const callbacksRef = useRef({
    onPlayerMove,
    onNearbyChange,
    onInteract,
    onDayPhaseComputed,
  });
  callbacksRef.current = {
    onPlayerMove,
    onNearbyChange,
    onInteract,
    onDayPhaseComputed,
  };

  // Player physics & input state in refs
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 30));
  const playerVelYRef = useRef(0);
  const playerRotYRef = useRef(Math.PI);
  const onGroundRef = useRef(true);
  const jumpBufferTimerRef = useRef(0);
  const jumpHeldRef = useRef(false);
  const keysRef = useRef<Record<string, boolean>>({});
  const joystickRef = useRef({ dx: 0, dy: 0 });
  const mobileSprintRef = useRef(false);
  const cameraOrbitRef = useRef({ yaw: 0, pitch: 0.38, distance: 11.5 });
  const freeCamPosRef = useRef(new THREE.Vector3(0, 18, 45));
  const nearbyRef = useRef<NearbyPrompt | null>(null);
  const localAvatarRef = useRef<AvatarRig | null>(null);
  const cityRef = useRef<ReturnType<typeof buildCityAndInteriors> | null>(null);
  const maxAnisotropyRef = useRef(1);
  const savedOutdoorPosRef = useRef(new THREE.Vector3(0, 0, 30));

  useImperativeHandle(ref, () => ({
    teleportTo(x: number, z: number) {
      playerPosRef.current.set(x, 0, z);
      playerVelYRef.current = 0;
      onGroundRef.current = true;
    },
    exitBuilding() {
      playerPosRef.current.copy(savedOutdoorPosRef.current);
      playerVelYRef.current = 0;
      onGroundRef.current = true;
    },
    triggerJump() {
      jumpBufferTimerRef.current = 0.16;
      if (onGroundRef.current && !frozenRef.current) {
        audioGuide.playJumpSfx();
      }
    },
    setJumpHeld(held: boolean) {
      jumpHeldRef.current = held;
      if (held) {
        jumpBufferTimerRef.current = 0.16;
      }
    },
    setJoystickInput(dx: number, dy: number) {
      joystickRef.current.dx = dx;
      joystickRef.current.dy = dy;
    },
    setMobileSprint(sprint: boolean) {
      mobileSprintRef.current = sprint;
    },
  }));

  // Update avatar look when customization or progress changes
  useEffect(() => {
    const rig = localAvatarRef.current;
    if (!rig) return;
    const pct = Math.min(100, Math.round((progress.answeredCorrectIds.length / 50) * 100));
    rig.updateStyle(
      session.avatar,
      session.name,
      session.className,
      progress.level,
      pct,
      session.role === 'teacher'
    );
  }, [session, progress.level, progress.answeredCorrectIds.length]);

  // Update building completed beacons & interior scene when buildingId or progress changes
  useEffect(() => {
    const city = cityRef.current;
    if (!city) return;
    city.updateCompletedBeacons(progress.completedChapterIds);

    if (currentBuildingId && currentBuildingId !== 'arena-versus') {
      const enteringFromOutdoor = city.outdoorGroup.visible;
      city.outdoorGroup.visible = false;
      city.interiorGroup.visible = true;
      if (enteringFromOutdoor) {
        savedOutdoorPosRef.current.copy(playerPosRef.current);
        playerPosRef.current.set(0, 0, 8.5);
        playerRotYRef.current = Math.PI;
      }
      const prefix =
        currentBuildingId === 'bab-1'
          ? ['q1', 'q2', 'q3', 'q4', 'q5', 'q15', 'q34', 'q35', 'q36', 'q37']
          : currentBuildingId === 'bab-2'
            ? ['q6', 'q7', 'q13', 'q14', 'q19', 'q20', 'q21', 'q22', 'q24', 'q30']
            : currentBuildingId === 'bab-3'
              ? ['q8', 'q9', 'q10', 'q11', 'q12', 'q25', 'q26', 'q27', 'q31', 'q33']
              : currentBuildingId === 'bab-4'
                ? ['q16', 'q17', 'q18', 'q28', 'q29', 'q38', 'q39', 'q40', 'q45', 'q46']
                : ['q23', 'q32', 'q41', 'q42', 'q43', 'q44', 'q47', 'q48', 'q49', 'q50'];
      const correctCount = prefix.filter((id) => progress.answeredCorrectIds.includes(id)).length;
      city.updateInteriorScene(currentBuildingId, correctCount, maxAnisotropyRef.current);
    } else {
      if (!city.outdoorGroup.visible) {
        playerPosRef.current.copy(savedOutdoorPosRef.current);
      }
      city.outdoorGroup.visible = true;
      city.interiorGroup.visible = false;
    }
  }, [currentBuildingId, progress.completedChapterIds, progress.answeredCorrectIds]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL probe
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    maxAnisotropyRef.current = maxAniso;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#7dd3fc');
    scene.fog = new THREE.FogExp2('#7dd3fc', 0.0068);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      62,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.2,
      360
    );

    // 3-Point / Outdoor Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#bae6fd', '#4d7c0f', 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.45);
    sunLight.position.set(45, 70, 35);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.set(1024, 1024);
    const d = 58;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 190;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // City & Interiors
    const city = buildCityAndInteriors(maxAniso);
    cityRef.current = city;
    scene.add(city.outdoorGroup);
    scene.add(city.interiorGroup);
    city.updateCompletedBeacons(progressRef.current.completedChapterIds);

    // Local Player Avatar
    const initPct = Math.min(100, Math.round((progressRef.current.answeredCorrectIds.length / 50) * 100));
    const localRig = createRobloxAvatar(
      sessionRef.current.avatar,
      sessionRef.current.name,
      sessionRef.current.className,
      progressRef.current.level,
      initPct,
      sessionRef.current.role === 'teacher'
    );
    localRig.root.position.copy(playerPosRef.current);
    scene.add(localRig.root);
    localAvatarRef.current = localRig;

    // 3D Rain Particle System (900 drops)
    const rainCount = 900;
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 90;
      rainPositions[i * 3 + 1] = Math.random() * 34;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: '#cbd5e1',
      size: 0.28,
      transparent: true,
      opacity: 0.72,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.visible = false;
    rainPoints.frustumCulled = false;
    scene.add(rainPoints);

    // Remote Multiplayer Avatars Cache
    const remoteRigs = new Map<
      string,
      {
        rig: AvatarRig;
        targetPos: THREE.Vector3;
        targetRotY: number;
        animState: AnimState;
        signature: string;
      }
    >();

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Input Listeners (Keyboard + Mouse Orbit + Touch Orbit + Wheel Zoom)
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      keysRef.current[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        jumpBufferTimerRef.current = 0.16;
        jumpHeldRef.current = true;
        if (onGroundRef.current && !frozenRef.current) {
          audioGuide.playJumpSfx();
        }
      }
      if ((e.code === 'KeyE' || e.code === 'Enter') && nearbyRef.current && !frozenRef.current) {
        callbacksRef.current.onInteract(nearbyRef.current);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      if (e.code === 'Space') {
        jumpHeldRef.current = false;
      }
    };

    let dragging = false;
    let activePointerId: number | null = null;
    let prevX = 0;
    let prevY = 0;

    const canvasEl = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      if (activePointerId !== null) return;
      activePointerId = e.pointerId;
      dragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      cameraOrbitRef.current.yaw -= dx * 0.0065;
      cameraOrbitRef.current.pitch = THREE.MathUtils.clamp(
        cameraOrbitRef.current.pitch + dy * 0.005,
        0.08,
        1.25
      );
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId === activePointerId) {
        dragging = false;
        activePointerId = null;
      }
    };
    const onWheel = (e: WheelEvent) => {
      cameraOrbitRef.current.distance = THREE.MathUtils.clamp(
        cameraOrbitRef.current.distance + e.deltaY * 0.01,
        5,
        24
      );
    };

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
    canvasEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    canvasEl.addEventListener('wheel', onWheel, { passive: true });

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    let lastEmitMoveMs = 0;
    let lastClockSyncMs = 0;
    let lightningFlash = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function updateEnvironmentAndWeather(dt: number, elapsed: number) {
      const nowMs = performance.now();
      const localClock = getLocalDayPhaseAndSun();
      const activePhase =
        dayPhaseOverrideRef.current === 'auto' ? localClock.phase : dayPhaseOverrideRef.current;

      if (nowMs - lastClockSyncMs > 1000) {
        lastClockSyncMs = nowMs;
        callbacksRef.current.onDayPhaseComputed(activePhase, localClock.timeStr);
      }

      const weather = weatherRef.current;
      const isNight = activePhase === 'Malam';
      const isDusk = activePhase === 'Sore';
      const isDawn = activePhase === 'Pagi';
      const isRain = weather === 'Hujan' || weather === 'Badai';

      // Target sky & sun palette
      if (isNight) {
        _skyColor.set('#0f172a');
        _sunColor.set('#93c5fd');
        sunLight.intensity = 0.42;
        hemiLight.intensity = 0.45;
      } else if (isDusk) {
        _skyColor.set('#fb923c');
        _sunColor.set('#fdba74');
        sunLight.intensity = 1.05;
        hemiLight.intensity = 0.68;
      } else if (isDawn) {
        _skyColor.set('#7dd3fc');
        _sunColor.set('#fef08a');
        sunLight.intensity = 1.25;
        hemiLight.intensity = 0.82;
      } else {
        _skyColor.set(weather === 'Terik' ? '#38bdf8' : '#60a5fa');
        _sunColor.set('#fffbeb');
        sunLight.intensity = weather === 'Terik' ? 1.75 : 1.48;
        hemiLight.intensity = 0.9;
      }

      if (weather === 'Berawan') {
        _skyColor.lerp(_fogColor.set('#94a3b8'), 0.45);
        sunLight.intensity *= 0.72;
      } else if (weather === 'Hujan') {
        _skyColor.lerp(_fogColor.set('#475569'), 0.62);
        sunLight.intensity *= 0.55;
      } else if (weather === 'Badai') {
        _skyColor.lerp(_fogColor.set('#1e293b'), 0.78);
        sunLight.intensity *= 0.35;
        if (Math.random() < 0.008) {
          lightningFlash = 1.0;
        }
      }

      if (lightningFlash > 0) {
        lightningFlash = Math.max(0, lightningFlash - dt * 4.5);
        sunLight.intensity += lightningFlash * 3.5;
        _skyColor.lerp(_fogColor.set('#e2e8f0'), lightningFlash * 0.6);
      }

      // Sun position arc
      const sunAngle =
        activePhase === 'Pagi'
          ? 0.45
          : activePhase === 'Siang'
            ? 1.35
            : activePhase === 'Sore'
              ? 2.55
              : 4.5;
      sunLight.position.set(Math.cos(sunAngle) * 70, Math.abs(Math.sin(sunAngle)) * 75 + 15, 35);
      sunLight.color.copy(_sunColor);

      if (currentBuildingRef.current && currentBuildingRef.current !== 'arena-versus') {
        _skyColor.set('#0f172a');
      }
      (scene.background as THREE.Color).lerp(_skyColor, Math.min(1, dt * 3));
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(scene.background as THREE.Color);
        scene.fog.density = isRain ? 0.011 : 0.0062;
      }

      // Streetlamps ON at Sore, Malam, Hujan, Badai
      const lampsOn = isNight || isDusk || isRain;
      const bulbEmissive = lampsOn ? 1.4 : 0;
      const ptIntensity = lampsOn ? 2.2 : 0;
      for (const bMat of city.streetLampBulbs) {
        bMat.emissiveIntensity = bulbEmissive;
      }
      for (const pt of city.streetPointLights) {
        pt.intensity = ptIntensity;
      }

      // Wet asphalt reflection in rain
      city.roadMat.roughness = isRain ? 0.14 : 0.85;
      city.roadMat.metalness = isRain ? 0.35 : 0.08;

      // Rain particle animation
      rainPoints.visible = isRain && (!currentBuildingRef.current || currentBuildingRef.current === 'arena-versus');
      if (rainPoints.visible) {
        rainPoints.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);
        const posAttr = rainGeo.getAttribute('position') as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const fallSpeed = weather === 'Badai' ? 38 : 26;
        for (let i = 0; i < rainCount; i++) {
          arr[i * 3 + 1] -= fallSpeed * dt;
          if (arr[i * 3 + 1] < 0) {
            arr[i * 3 + 1] = 32;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Rotate chapter completed stars
      for (const p of city.portals) {
        if (p.starMesh && p.beaconGroup?.visible) {
          p.starMesh.rotation.y = elapsed * 1.8;
          p.starMesh.position.y = 14.5 + Math.sin(elapsed * 2.5) * 0.55;
        }
      }
    }

    function updateTraffic(dt: number, elapsed: number) {
      // 14-second cycle: 0..6 NS Green, 6..7.5 NS Yellow, 7.5..13.5 EW Green, 13.5..15 EW Yellow
      const cycle = elapsed % 15;
      const nsState = cycle < 6 ? 'green' : cycle < 7.5 ? 'yellow' : 'red';
      const ewState = cycle < 7.5 ? 'red' : cycle < 13.5 ? 'green' : 'yellow';

      city.trafficLightMats.nsGreen.emissiveIntensity = nsState === 'green' ? 1.8 : 0;
      city.trafficLightMats.nsYellow.emissiveIntensity = nsState === 'yellow' ? 1.8 : 0;
      city.trafficLightMats.nsRed.emissiveIntensity = nsState === 'red' ? 1.8 : 0;

      city.trafficLightMats.ewGreen.emissiveIntensity = ewState === 'green' ? 1.8 : 0;
      city.trafficLightMats.ewYellow.emissiveIntensity = ewState === 'yellow' ? 1.8 : 0;
      city.trafficLightMats.ewRed.emissiveIntensity = ewState === 'red' ? 1.8 : 0;

      for (const car of city.vehicles) {
        let shouldStop = false;
        if (car.axis === 'z') {
          const z = car.mesh.position.z;
          if (nsState !== 'green') {
            if (car.dir === 1 && z > -28 && z < -20) shouldStop = true;
            if (car.dir === -1 && z < 4 && z > -4) shouldStop = true;
          }
          if (!shouldStop) {
            car.mesh.position.z += car.dir * car.speed * dt;
            if (car.mesh.position.z > 62) car.mesh.position.z = -50;
            if (car.mesh.position.z < -50) car.mesh.position.z = 62;
          }
        } else {
          const x = car.mesh.position.x;
          if (ewState !== 'green') {
            if (car.dir === 1 && x > -16 && x < -9) shouldStop = true;
            if (car.dir === -1 && x < 16 && x > 9) shouldStop = true;
          }
          if (!shouldStop) {
            car.mesh.position.x += car.dir * car.speed * dt;
            if (car.mesh.position.x > 65) car.mesh.position.x = -65;
            if (car.mesh.position.x < -65) car.mesh.position.x = 65;
          }
        }
      }
    }

    function updateLocalPhysicsAndCamera(dt: number, elapsed: number) {
      const spec = spectatorRef.current;
      const isTeacher = sessionRef.current.role === 'teacher';
      const inInterior = Boolean(currentBuildingRef.current && currentBuildingRef.current !== 'arena-versus');

      // Spectator Mode ONLY allowed for Teacher Admin
      if (isTeacher && spec.mode === 'free') {
        localRig.root.visible = false;
        const yaw = cameraOrbitRef.current.yaw;
        _fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
        _right.set(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();
        const k = keysRef.current;
        let moveZ = (k['KeyW'] || k['ArrowUp'] ? 1 : 0) - (k['KeyS'] || k['ArrowDown'] ? 1 : 0);
        let moveX = (k['KeyD'] || k['ArrowRight'] ? 1 : 0) - (k['KeyA'] || k['ArrowLeft'] ? 1 : 0);
        moveX += joystickRef.current.dx;
        moveZ -= joystickRef.current.dy;
        const flySpeed = 28;
        freeCamPosRef.current.addScaledVector(_fwd, moveZ * flySpeed * dt);
        freeCamPosRef.current.addScaledVector(_right, moveX * flySpeed * dt);
        if (k['Space']) freeCamPosRef.current.y += 18 * dt;
        if (k['ShiftLeft'] || k['ShiftRight']) freeCamPosRef.current.y = Math.max(2, freeCamPosRef.current.y - 18 * dt);

        camera.position.copy(freeCamPosRef.current);
        _lookTarget.set(
          freeCamPosRef.current.x - Math.sin(yaw) * 10,
          freeCamPosRef.current.y - Math.sin(cameraOrbitRef.current.pitch) * 8,
          freeCamPosRef.current.z - Math.cos(yaw) * 10
        );
        camera.lookAt(_lookTarget);
        return;
      }

      if (isTeacher && spec.mode === 'follow' && spec.targetSessionId) {
        const target = onlinePlayersRef.current.find((p) => p.sessionId === spec.targetSessionId);
        if (target) {
          localRig.root.visible = true;
          const dist = cameraOrbitRef.current.distance;
          const yaw = cameraOrbitRef.current.yaw;
          const pitch = cameraOrbitRef.current.pitch;
          _camGoal.set(
            target.x + Math.sin(yaw) * Math.cos(pitch) * dist,
            target.y + 2.2 + Math.sin(pitch) * dist,
            target.z + Math.cos(yaw) * Math.cos(pitch) * dist
          );
          camera.position.lerp(_camGoal, 1 - Math.exp(-8 * dt));
          _lookTarget.set(target.x, target.y + 1.8, target.z);
          camera.lookAt(_lookTarget);
          return;
        }
      }

      localRig.root.visible = true;

      // Player Movement (unless class is frozen by Teacher)
      let animState: AnimState = 'idle';
      let speedMag = 0;

      if (!frozenRef.current) {
        const k = keysRef.current;
        let inX = (k['KeyD'] || k['ArrowRight'] ? 1 : 0) - (k['KeyA'] || k['ArrowLeft'] ? 1 : 0);
        let inZ = (k['KeyW'] || k['ArrowUp'] ? 1 : 0) - (k['KeyS'] || k['ArrowDown'] ? 1 : 0);

        inX += joystickRef.current.dx;
        inZ -= joystickRef.current.dy;

        const len = Math.hypot(inX, inZ);
        if (len > 1) {
          inX /= len;
          inZ /= len;
        }

        const sprinting = Boolean(k['ShiftLeft'] || k['ShiftRight'] || mobileSprintRef.current);
        const speed = sprinting ? 15.0 : 8.8;

        if (len > 0.08) {
          const yaw = cameraOrbitRef.current.yaw;
          _fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
          _right.set(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();
          _move.set(0, 0, 0).addScaledVector(_fwd, inZ).addScaledVector(_right, inX);
          if (_move.lengthSq() > 0.0001) {
            _move.normalize();
            const nextX = playerPosRef.current.x + _move.x * speed * dt;
            const nextZ = playerPosRef.current.z + _move.z * speed * dt;

            // Collision bounds
            if (inInterior) {
              playerPosRef.current.x = THREE.MathUtils.clamp(nextX, -13.4, 13.4);
              playerPosRef.current.z = THREE.MathUtils.clamp(nextZ, -13.4, 13.4);
            } else {
              let blockedX = false;
              let blockedZ = false;
              for (const box of city.colliders) {
                if (
                  nextX > box.minX - 0.6 &&
                  nextX < box.maxX + 0.6 &&
                  playerPosRef.current.z > box.minZ - 0.6 &&
                  playerPosRef.current.z < box.maxZ + 0.6
                ) {
                  blockedX = true;
                }
                if (
                  playerPosRef.current.x > box.minX - 0.6 &&
                  playerPosRef.current.x < box.maxX + 0.6 &&
                  nextZ > box.minZ - 0.6 &&
                  nextZ < box.maxZ + 0.6
                ) {
                  blockedZ = true;
                }
              }
              if (!blockedX) playerPosRef.current.x = THREE.MathUtils.clamp(nextX, -82, 82);
              if (!blockedZ) playerPosRef.current.z = THREE.MathUtils.clamp(nextZ, -72, 72);
            }

            // Smoothly face movement direction
            const targetRot = Math.atan2(_move.x, _move.z);
            let diff = targetRot - playerRotYRef.current;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            playerRotYRef.current += diff * Math.min(1, dt * 14);
            speedMag = speed * Math.min(1, len);
            animState = sprinting ? 'run' : 'walk';
          }
        }

        // Roblox-style Jump Buffer + Hold-to-Jump without stopping horizontal motion
        if (jumpBufferTimerRef.current > 0) {
          jumpBufferTimerRef.current = Math.max(0, jumpBufferTimerRef.current - dt);
        }
        if (onGroundRef.current && (jumpBufferTimerRef.current > 0 || jumpHeldRef.current)) {
          playerVelYRef.current = 11.4;
          onGroundRef.current = false;
          jumpBufferTimerRef.current = 0;
        }
      }

      // Vertical gravity
      if (!onGroundRef.current || playerVelYRef.current !== 0) {
        playerVelYRef.current -= 28.0 * dt;
        playerPosRef.current.y += playerVelYRef.current * dt;
        if (playerPosRef.current.y <= 0) {
          playerPosRef.current.y = 0;
          playerVelYRef.current = 0;
          onGroundRef.current = true;
        } else {
          animState = 'jump';
        }
      }

      localRig.root.position.copy(playerPosRef.current);
      localRig.root.rotation.y = playerRotYRef.current;
      localRig.animate(elapsed, animState, speedMag);

      // Smooth 3rd-person orbit camera
      const dist = inInterior ? Math.min(cameraOrbitRef.current.distance, 10.5) : cameraOrbitRef.current.distance;
      const yaw = cameraOrbitRef.current.yaw;
      const pitch = cameraOrbitRef.current.pitch;
      _camGoal.set(
        playerPosRef.current.x + Math.sin(yaw) * Math.cos(pitch) * dist,
        playerPosRef.current.y + 1.9 + Math.sin(pitch) * dist,
        playerPosRef.current.z + Math.cos(yaw) * Math.cos(pitch) * dist
      );
      camera.position.lerp(_camGoal, 1 - Math.exp(-14 * dt));
      _lookTarget.set(playerPosRef.current.x, playerPosRef.current.y + 1.75, playerPosRef.current.z);
      camera.lookAt(_lookTarget);

      // Proximity check for portals or interior stations
      let foundPrompt: NearbyPrompt | null = null;
      if (inInterior) {
        for (const st of city.interiorStations) {
          const dSq =
            (playerPosRef.current.x - st.x) ** 2 + (playerPosRef.current.z - st.z) ** 2;
          if (dSq <= st.radius ** 2) {
            foundPrompt = { type: 'station', id: st.stationId, label: st.label };
            break;
          }
        }
      } else {
        for (const p of city.portals) {
          const dSq =
            (playerPosRef.current.x - p.x) ** 2 + (playerPosRef.current.z - p.z) ** 2;
          if (dSq <= p.radius ** 2) {
            foundPrompt = { type: 'portal', id: p.id, label: p.label, isArena: p.isArena };
            break;
          }
        }
      }
      if (
        foundPrompt?.id !== nearbyRef.current?.id ||
        foundPrompt?.type !== nearbyRef.current?.type
      ) {
        nearbyRef.current = foundPrompt;
        callbacksRef.current.onNearbyChange(foundPrompt);
      }

      // Emit local player movement at ~12Hz
      const nowMs = performance.now();
      if (nowMs - lastEmitMoveMs > 85) {
        lastEmitMoveMs = nowMs;
        callbacksRef.current.onPlayerMove({
          x: Number(playerPosRef.current.x.toFixed(2)),
          y: Number(playerPosRef.current.y.toFixed(2)),
          z: Number(playerPosRef.current.z.toFixed(2)),
          rotY: Number(playerRotYRef.current.toFixed(2)),
          animState,
        });
      }
    }

    function updateRemotePlayers(dt: number, elapsed: number) {
      const localSid = sessionRef.current.sessionId;
      const myBuilding = currentBuildingRef.current;
      const list = onlinePlayersRef.current;
      const activeIds = new Set<string>();

      for (const p of list) {
        if (p.sessionId === localSid) continue;
        // Only show players in the same space (outdoor vs same building)
        if (p.buildingId !== myBuilding) continue;
        activeIds.add(p.sessionId);

        const sig = `${p.name}|${p.className}|${p.level}|${Math.round(p.progressPct)}|${p.role}|${p.avatar.shirtColor}|${p.avatar.pantsColor}|${p.avatar.hairColor}|${p.avatar.hatColor}|${p.avatar.companion}`;
        let entry = remoteRigs.get(p.sessionId);
        if (!entry) {
          const rig = createRobloxAvatar(
            p.avatar,
            p.name,
            p.className,
            p.level,
            p.progressPct,
            p.role === 'teacher'
          );
          rig.root.position.set(p.x, p.y, p.z);
          rig.root.rotation.y = p.rotY;
          scene.add(rig.root);
          entry = {
            rig,
            targetPos: new THREE.Vector3(p.x, p.y, p.z),
            targetRotY: p.rotY,
            animState: p.animState,
            signature: sig,
          };
          remoteRigs.set(p.sessionId, entry);
        } else {
          if (entry.signature !== sig) {
            entry.signature = sig;
            entry.rig.updateStyle(
              p.avatar,
              p.name,
              p.className,
              p.level,
              p.progressPct,
              p.role === 'teacher'
            );
          }
          entry.targetPos.set(p.x, p.y, p.z);
          entry.targetRotY = p.rotY;
          entry.animState = p.animState;
        }

        entry.rig.root.position.lerp(entry.targetPos, 1 - Math.exp(-10 * dt));
        entry.rig.root.rotation.y = THREE.MathUtils.lerp(
          entry.rig.root.rotation.y,
          entry.targetRotY,
          1 - Math.exp(-10 * dt)
        );
        entry.rig.animate(elapsed, entry.animState, 8);
      }

      for (const [sid, entry] of remoteRigs.entries()) {
        if (!activeIds.has(sid)) {
          scene.remove(entry.rig.root);
          remoteRigs.delete(sid);
        }
      }
    }

    function tick() {
      if (disposed) return;
      const dt = Math.min(0.08, clock.getDelta());
      const elapsed = clock.getElapsedTime();

      updateEnvironmentAndWeather(dt, elapsed);
      updateTraffic(dt, elapsed);
      updateLocalPhysicsAndCamera(dt, elapsed);
      updateRemotePlayers(dt, elapsed);

      renderer.render(scene, camera);
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      canvasEl.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full touch-none-select cursor-grab active:cursor-grabbing"
      aria-label="Dunia Terbuka 3D EduCity"
    />
  );
});
