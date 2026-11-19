import * as THREE from 'three';
import { ARENA_VERSUS_POSITION, CHAPTERS } from '../data/chaptersAndQuestions';
import {
  createAsphaltTexture,
  createBuildingFacadeTexture,
  createGrassTexture,
  createInteriorFloorTexture,
  createSidewalkTexture,
  createSignboardTexture,
} from './proceduralTextures';

export interface BuildingPortal {
  id: string;
  label: string;
  x: number;
  z: number;
  radius: number;
  isArena: boolean;
  beaconGroup?: THREE.Group;
  starMesh?: THREE.Mesh;
}

export interface InteriorStationTrigger {
  stationId: 'video' | 'quiz' | 'sheet' | 'exit';
  label: string;
  x: number;
  z: number;
  radius: number;
}

export interface TrafficVehicle {
  mesh: THREE.Group;
  axis: 'z' | 'x';
  dir: 1 | -1;
  speed: number;
  laneCoord: number;
}

export interface CityBuildResult {
  outdoorGroup: THREE.Group;
  interiorGroup: THREE.Group;
  portals: BuildingPortal[];
  colliders: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>;
  streetLampBulbs: THREE.MeshStandardMaterial[];
  streetPointLights: THREE.PointLight[];
  trafficLightMats: {
    nsRed: THREE.MeshStandardMaterial;
    nsYellow: THREE.MeshStandardMaterial;
    nsGreen: THREE.MeshStandardMaterial;
    ewRed: THREE.MeshStandardMaterial;
    ewYellow: THREE.MeshStandardMaterial;
    ewGreen: THREE.MeshStandardMaterial;
  };
  vehicles: TrafficVehicle[];
  roadMat: THREE.MeshStandardMaterial;
  interiorRewardSlotGroups: THREE.Group[];
  interiorStations: InteriorStationTrigger[];
  interiorSignMaterial: THREE.MeshStandardMaterial;
  updateCompletedBeacons: (completedChapterIds: string[]) => void;
  updateInteriorScene: (chapterId: string, correctInChapter: number, maxAnisotropy: number) => void;
}

function buildCompositeTree(): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.42, 2.8, 7),
    new THREE.MeshStandardMaterial({ color: '#6b4423', roughness: 0.9 })
  );
  trunk.position.y = 1.4;
  trunk.castShadow = true;

  const foliageMat = new THREE.MeshStandardMaterial({ color: '#2e7d32', roughness: 0.8 });
  const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.65, 1), foliageMat);
  c1.position.set(0, 3.6, 0);
  c1.castShadow = true;
  const c2 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.25, 1),
    new THREE.MeshStandardMaterial({ color: '#388e3c', roughness: 0.78 })
  );
  c2.position.set(0.65, 4.3, 0.35);
  const c3 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.1, 1),
    new THREE.MeshStandardMaterial({ color: '#43a047', roughness: 0.75 })
  );
  c3.position.set(-0.6, 4.1, -0.35);

  g.add(trunk, c1, c2, c3);
  return g;
}

function buildCompositeCar(bodyColor: string): THREE.Group {
  const g = new THREE.Group();
  const paintMat = new THREE.MeshPhysicalMaterial({
    color: bodyColor,
    metalness: 0.55,
    roughness: 0.25,
    clearcoat: 0.85,
  });
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.68, 4.2), paintMat);
  chassis.position.y = 0.62;
  chassis.castShadow = true;

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 0.62, 2.2),
    new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.2, metalness: 0.3 })
  );
  cabin.position.set(0, 1.22, -0.15);

  const bumperF = new THREE.Mesh(
    new THREE.BoxGeometry(2.04, 0.24, 0.25),
    new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5, metalness: 0.4 })
  );
  bumperF.position.set(0, 0.4, 2.1);
  const bumperB = bumperF.clone();
  bumperB.position.z = -2.1;

  const headMat = new THREE.MeshStandardMaterial({
    color: '#fef08a',
    emissive: '#facc15',
    emissiveIntensity: 0.8,
  });
  const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.08), headMat);
  hlL.position.set(-0.64, 0.66, 2.12);
  const hlR = hlL.clone();
  hlR.position.x = 0.64;

  const wheelMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.85, roughness: 0.2 });
  const wheelCoords: Array<[number, number]> = [
    [-0.98, 1.35],
    [0.98, 1.35],
    [-0.98, -1.35],
    [0.98, -1.35],
  ];
  for (const [wx, wz] of wheelCoords) {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 14), wheelMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(wx, 0.36, wz);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.28, 10), rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(wx, 0.36, wz);
    g.add(tire, rim);
  }

  g.add(chassis, cabin, bumperF, bumperB, hlL, hlR);
  return g;
}

function buildRewardObject(slotIndex: number): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.1, 0.6, 12),
    new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4, metalness: 0.5 })
  );
  base.position.y = 0.3;
  const trim = new THREE.Mesh(
    new THREE.TorusGeometry(0.96, 0.06, 8, 24),
    new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.85, roughness: 0.2 })
  );
  trim.rotation.x = Math.PI / 2;
  trim.position.y = 0.6;
  g.add(base, trim);

  if (slotIndex === 0) {
    // Classic Bookcase
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.6, 0.45),
      new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.7 })
    );
    shelf.position.y = 1.4;
    const bookColors = ['#ef4444', '#3b82f6', '#10b981', '#eab308'];
    for (let i = 0; i < 4; i++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.45, 0.34),
        new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.5 })
      );
      book.position.set(-0.32 + i * 0.22, 1.6, 0.08);
      g.add(book);
    }
    g.add(shelf);
  } else if (slotIndex === 1) {
    // Educational Globe
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.3, 0.7, 10),
      new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.8, roughness: 0.25 })
    );
    stand.position.y = 0.95;
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.35, metalness: 0.1 })
    );
    globe.position.y = 1.6;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.04, 8, 24),
      new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.85, roughness: 0.2 })
    );
    ring.position.y = 1.6;
    ring.rotation.z = 0.35;
    g.add(stand, globe, ring);
  } else if (slotIndex === 2) {
    // Golden Desk Lamp
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 1.3, 8),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.85, roughness: 0.2 })
    );
    pole.position.y = 1.25;
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.48, 0.52, 12),
      new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.3 })
    );
    shade.position.set(0.15, 1.9, 0);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 10, 10),
      new THREE.MeshStandardMaterial({ color: '#fef08a', emissive: '#fde047', emissiveIntensity: 1.2 })
    );
    bulb.position.set(0.15, 1.72, 0);
    g.add(pole, shade, bulb);
  } else if (slotIndex === 3) {
    // Golden Owl Statue
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.42, 0.95, 10),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.88, roughness: 0.18 })
    );
    body.position.y = 1.1;
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.9, roughness: 0.16 })
    );
    head.position.y = 1.68;
    const eyeL = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 1 })
    );
    eyeL.position.set(-0.12, 1.72, 0.26);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.12;
    g.add(body, head, eyeL, eyeR);
  } else {
    // Championship Star Trophy
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.28, 0.9, 10),
      new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.92, roughness: 0.15 })
    );
    stem.position.y = 1.05;
    const cup = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.MeshStandardMaterial({
        color: '#fde047',
        emissive: '#d97706',
        emissiveIntensity: 0.55,
        metalness: 0.95,
        roughness: 0.12,
      })
    );
    cup.position.y = 1.85;
    g.add(stem, cup);
  }
  return g;
}

export function buildCityAndInteriors(maxAnisotropy: number): CityBuildResult {
  const outdoorGroup = new THREE.Group();
  const interiorGroup = new THREE.Group();
  interiorGroup.visible = false;

  const portals: BuildingPortal[] = [];
  const colliders: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }> = [];
  const streetLampBulbs: THREE.MeshStandardMaterial[] = [];
  const streetPointLights: THREE.PointLight[] = [];
  const vehicles: TrafficVehicle[] = [];

  // Textures
  const grassTex = createGrassTexture(maxAnisotropy);
  const roadTex = createAsphaltTexture(maxAnisotropy);
  const sidewalkTex = createSidewalkTexture(maxAnisotropy);

  // Extended natural ground (never boxed in indoor walls!)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(460, 460),
    new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.92 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  outdoorGroup.add(ground);

  // Main North-South Asphalt Avenue & East-West Cross Street
  const roadMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    roughness: 0.85,
    metalness: 0.08,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(14, 170), roadMat);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.set(0, 0.03, -10);
  mainRoad.receiveShadow = true;
  outdoorGroup.add(mainRoad);

  const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(150, 14), roadMat);
  crossRoad.rotation.x = -Math.PI / 2;
  crossRoad.position.set(0, 0.025, -12);
  crossRoad.rotation.z = Math.PI / 2;
  // Wait: rotating plane by rotation.z after rotation.x spins in local axes; use PlaneGeometry(14, 150) rotated Y!
  crossRoad.geometry.dispose();
  crossRoad.geometry = new THREE.PlaneGeometry(14, 150);
  crossRoad.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  crossRoad.position.set(0, 0.022, -12);
  crossRoad.receiveShadow = true;
  outdoorGroup.add(crossRoad);

  // Sidewalks flanking main avenue
  const swMat = new THREE.MeshStandardMaterial({ map: sidewalkTex, roughness: 0.85 });
  const swLeft = new THREE.Mesh(new THREE.BoxGeometry(5, 0.14, 160), swMat);
  swLeft.position.set(-9.5, 0.07, -10);
  swLeft.receiveShadow = true;
  const swRight = swLeft.clone();
  swRight.position.x = 9.5;
  outdoorGroup.add(swLeft, swRight);

  // Central Park Plaza
  const parkDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 10.4, 0.2, 24),
    new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8 })
  );
  parkDeck.position.set(0, 0.1, 42);
  parkDeck.receiveShadow = true;
  const fountainBase = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.6, 0.7, 16),
    new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.5 })
  );
  fountainBase.position.set(0, 0.45, 42);
  const fountainWater = new THREE.Mesh(
    new THREE.CylinderGeometry(2.8, 2.8, 0.55, 16),
    new THREE.MeshStandardMaterial({ color: '#0ea5e9', roughness: 0.15, metalness: 0.2 })
  );
  fountainWater.position.set(0, 0.58, 42);
  const monumentPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.7, 3.2, 12),
    new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.35 })
  );
  monumentPillar.position.set(0, 2.0, 42);
  const monumentStar = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.75, 0),
    new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#d97706',
      emissiveIntensity: 0.45,
      metalness: 0.88,
      roughness: 0.2,
    })
  );
  monumentStar.position.set(0, 4.1, 42);
  outdoorGroup.add(parkDeck, fountainBase, fountainWater, monumentPillar, monumentStar);

  // Traffic Light Materials (Automatic Red/Yellow/Green Cycle)
  const trafficLightMats = {
    nsRed: new THREE.MeshStandardMaterial({ color: '#7f1d1d', emissive: '#ef4444', emissiveIntensity: 0 }),
    nsYellow: new THREE.MeshStandardMaterial({ color: '#713f12', emissive: '#eab308', emissiveIntensity: 0 }),
    nsGreen: new THREE.MeshStandardMaterial({ color: '#14532d', emissive: '#22c55e', emissiveIntensity: 1.5 }),
    ewRed: new THREE.MeshStandardMaterial({ color: '#7f1d1d', emissive: '#ef4444', emissiveIntensity: 1.5 }),
    ewYellow: new THREE.MeshStandardMaterial({ color: '#713f12', emissive: '#eab308', emissiveIntensity: 0 }),
    ewGreen: new THREE.MeshStandardMaterial({ color: '#14532d', emissive: '#22c55e', emissiveIntensity: 0 }),
  };

  function addTrafficLight(x: number, z: number, axis: 'ns' | 'ew') {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 4.8, 8),
      new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.6, roughness: 0.4 })
    );
    pole.position.y = 2.4;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 1.55, 0.55),
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 })
    );
    box.position.y = 4.3;
    const rM = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 10),
      axis === 'ns' ? trafficLightMats.nsRed : trafficLightMats.ewRed
    );
    rM.position.set(0, 4.78, 0.26);
    const yM = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 10),
      axis === 'ns' ? trafficLightMats.nsYellow : trafficLightMats.ewYellow
    );
    yM.position.set(0, 4.3, 0.26);
    const gM = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 10),
      axis === 'ns' ? trafficLightMats.nsGreen : trafficLightMats.ewGreen
    );
    gM.position.set(0, 3.82, 0.26);
    g.add(pole, box, rM, yM, gM);
    if (axis === 'ew') g.rotation.y = Math.PI / 2;
    outdoorGroup.add(g);
  }
  addTrafficLight(-8.2, -3.5, 'ns');
  addTrafficLight(8.2, -20.5, 'ns');
  addTrafficLight(-8.2, -20.5, 'ew');
  addTrafficLight(8.2, -3.5, 'ew');

  // Streetlamps along main avenue
  const lampOffsets = [-36, -18, 0, 18, 34];
  for (const lz of lampOffsets) {
    for (const lx of [-10.8, 10.8]) {
      const lamp = new THREE.Group();
      lamp.position.set(lx, 0, lz);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.14, 5.4, 8),
        new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.7, roughness: 0.3 })
      );
      pole.position.y = 2.7;
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.12, 0.12),
        new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.7, roughness: 0.3 })
      );
      arm.position.set(lx < 0 ? 0.55 : -0.55, 5.35, 0);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: '#fef3c7',
        emissive: '#fbbf24',
        emissiveIntensity: 0,
      });
      streetLampBulbs.push(bulbMat);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), bulbMat);
      bulb.position.set(lx < 0 ? 1.05 : -1.05, 5.2, 0);
      lamp.add(pole, arm, bulb);
      outdoorGroup.add(lamp);

      // Add selective point lights on 4 key lamps for atmospheric night glow
      if (lz === -18 || lz === 18) {
        const pt = new THREE.PointLight('#fbbf24', 0, 26, 1.6);
        pt.position.set(lx + (lx < 0 ? 1.1 : -1.1), 5.0, lz);
        outdoorGroup.add(pt);
        streetPointLights.push(pt);
      }
    }
  }

  // 5 Chapter Buildings (Composite 6+ Part Structures + Portals + Completed Golden Beacon & Rotating Star)
  for (const ch of CHAPTERS) {
    const bGroup = new THREE.Group();
    bGroup.position.set(ch.position.x, 0, ch.position.z);
    bGroup.rotation.y = ch.position.facing;

    const facadeTex = createBuildingFacadeTexture(ch.accentHex, maxAnisotropy);
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(13.5, 0.5, 13.5),
      new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.8 })
    );
    plinth.position.y = 0.25;
    plinth.receiveShadow = true;

    const mainBody = new THREE.Mesh(
      new THREE.BoxGeometry(12, 9.5, 12),
      new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.55 })
    );
    mainBody.position.y = 5.0;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;

    const roofCrown = new THREE.Mesh(
      new THREE.BoxGeometry(12.6, 0.9, 12.6),
      new THREE.MeshStandardMaterial({ color: ch.accentHex, roughness: 0.4, metalness: 0.2 })
    );
    roofCrown.position.y = 10.15;

    const roofDome = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 3.4, 1.6, 12),
      new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.5, roughness: 0.35 })
    );
    roofDome.position.y = 11.4;

    // Entrance Canopy & Twin Pillars
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.4, 2.8),
      new THREE.MeshStandardMaterial({ color: ch.accentHex, roughness: 0.35 })
    );
    canopy.position.set(0, 4.2, 7.0);
    const pLeft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.34, 4.0, 10),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4 })
    );
    pLeft.position.set(-2.4, 2.0, 7.6);
    const pRight = pLeft.clone();
    pRight.position.x = 2.4;

    // 3D Signboard
    const signTex = createSignboardTexture(
      `BAB ${ch.number} · ${ch.title.split(':')[1]?.trim() || ch.title}`,
      ch.subtitle,
      '#0f172a',
      ch.accentHex,
      maxAnisotropy
    );
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 2.4, 0.35),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 })
    );
    signBoard.position.set(0, 7.6, 6.2);

    // Glowing Portal Ring in front of door
    const portalRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.18, 12, 32),
      new THREE.MeshStandardMaterial({
        color: ch.accentHex,
        emissive: ch.accentHex,
        emissiveIntensity: 1.1,
        roughness: 0.2,
      })
    );
    portalRing.position.set(0, 2.15, 7.4);

    const portalPad = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.5, 0.14, 24),
      new THREE.MeshStandardMaterial({
        color: ch.accentHex,
        emissive: ch.accentHex,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.75,
      })
    );
    portalPad.position.set(0, 0.08, 7.4);

    // Golden Beacon + Rotating Star (visible when chapter completed!)
    const beaconGroup = new THREE.Group();
    beaconGroup.visible = false;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.35, 36, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: '#fbbf24',
        transparent: true,
        opacity: 0.26,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    beam.position.y = 28;
    const starMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.6, 0),
      new THREE.MeshStandardMaterial({
        color: '#fde047',
        emissive: '#f59e0b',
        emissiveIntensity: 0.9,
        metalness: 0.9,
        roughness: 0.15,
      })
    );
    starMesh.position.y = 14.5;
    beaconGroup.add(beam, starMesh);

    bGroup.add(
      plinth,
      mainBody,
      roofCrown,
      roofDome,
      canopy,
      pLeft,
      pRight,
      signBoard,
      portalRing,
      portalPad,
      beaconGroup
    );
    outdoorGroup.add(bGroup);

    // Compute world portal position (7.4 units forward along facing)
    const worldPortalX = ch.position.x + Math.sin(ch.position.facing) * 7.4;
    const worldPortalZ = ch.position.z + Math.cos(ch.position.facing) * 7.4;
    portals.push({
      id: ch.id,
      label: `Masuk ${ch.buildingName}`,
      x: worldPortalX,
      z: worldPortalZ,
      radius: 3.2,
      isArena: false,
      beaconGroup,
      starMesh,
    });

    colliders.push({
      minX: ch.position.x - 6.4,
      maxX: ch.position.x + 6.4,
      minZ: ch.position.z - 6.4,
      maxZ: ch.position.z + 6.4,
    });
  }

  // Red-Gold Arena Versus 1v1 at end of main avenue
  {
    const arenaGroup = new THREE.Group();
    arenaGroup.position.set(ARENA_VERSUS_POSITION.x, 0, ARENA_VERSUS_POSITION.z);
    const arenaBody = new THREE.Mesh(
      new THREE.CylinderGeometry(10.5, 11.5, 10.5, 16),
      new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.45, metalness: 0.25 })
    );
    arenaBody.position.y = 5.25;
    arenaBody.castShadow = true;

    const goldRingUpper = new THREE.Mesh(
      new THREE.TorusGeometry(10.8, 0.45, 10, 32),
      new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.9, roughness: 0.18 })
    );
    goldRingUpper.rotation.x = Math.PI / 2;
    goldRingUpper.position.y = 10.4;

    const goldDome = new THREE.Mesh(
      new THREE.SphereGeometry(7.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.82, roughness: 0.22 })
    );
    goldDome.position.y = 10.4;

    const arenaSignTex = createSignboardTexture(
      'ARENA VERSUS 1v1',
      'DUEL BAHASA INGGRIS · REAL-TIME PvP & BOT',
      '#7f1d1d',
      '#fbbf24',
      maxAnisotropy
    );
    const arenaSign = new THREE.Mesh(
      new THREE.BoxGeometry(11.5, 2.8, 0.4),
      new THREE.MeshStandardMaterial({ map: arenaSignTex, roughness: 0.35 })
    );
    arenaSign.position.set(0, 7.8, 11.0);

    const arenaPortalRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.22, 12, 32),
      new THREE.MeshStandardMaterial({
        color: '#fbbf24',
        emissive: '#ef4444',
        emissiveIntensity: 1.2,
      })
    );
    arenaPortalRing.position.set(0, 2.6, 11.8);

    const arenaPad = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 3.0, 0.16, 24),
      new THREE.MeshStandardMaterial({
        color: '#ef4444',
        emissive: '#f59e0b',
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.8,
      })
    );
    arenaPad.position.set(0, 0.09, 11.8);

    arenaGroup.add(arenaBody, goldRingUpper, goldDome, arenaSign, arenaPortalRing, arenaPad);
    outdoorGroup.add(arenaGroup);

    portals.push({
      id: 'arena-versus',
      label: 'Masuk Arena Versus 1v1',
      x: ARENA_VERSUS_POSITION.x,
      z: ARENA_VERSUS_POSITION.z + 11.8,
      radius: 3.6,
      isArena: true,
    });

    colliders.push({
      minX: ARENA_VERSUS_POSITION.x - 10.2,
      maxX: ARENA_VERSUS_POSITION.x + 10.2,
      minZ: ARENA_VERSUS_POSITION.z - 10.2,
      maxZ: ARENA_VERSUS_POSITION.z + 10.2,
    });
  }

  // Trees around park & city perimeter (natural outdoor boundary)
  const treeCoords: Array<[number, number, number]> = [
    [-15, 22, 1.0],
    [15, 22, 1.1],
    [-16, 46, 1.15],
    [16, 46, 0.95],
    [-38, -40, 1.3],
    [38, -40, 1.25],
    [-42, -10, 1.15],
    [42, -10, 1.2],
    [-40, 18, 1.3],
    [40, 18, 1.1],
    [-34, 48, 1.25],
    [34, 48, 1.2],
    [-22, 58, 1.35],
    [22, 58, 1.3],
    [-55, -55, 1.5],
    [55, -55, 1.5],
  ];
  for (const [tx, tz, scale] of treeCoords) {
    const t = buildCompositeTree();
    t.position.set(tx, 0, tz);
    t.scale.setScalar(scale);
    outdoorGroup.add(t);
  }

  // Distant Rolling Hills & City Horizon Silhouettes
  const hillMat = new THREE.MeshStandardMaterial({ color: '#2d5a3c', roughness: 0.95 });
  const hillPositions: Array<[number, number, number, number]> = [
    [-95, -105, 42, 18],
    [0, -130, 52, 24],
    [95, -105, 45, 20],
    [-120, 30, 48, 22],
    [120, 30, 46, 19],
    [0, 130, 55, 21],
  ];
  for (const [hx, hz, r, h] of hillPositions) {
    const hill = new THREE.Mesh(new THREE.ConeGeometry(r, h, 14), hillMat);
    hill.position.set(hx, h / 2 - 1, hz);
    outdoorGroup.add(hill);
  }

  // Distant city skyline silhouettes
  const skylineMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.85 });
  for (let i = -5; i <= 5; i++) {
    if (Math.abs(i) < 2) continue;
    const h = 18 + (Math.abs(i * 7) % 22);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(10, h, 10), skylineMat);
    tower.position.set(i * 22, h / 2, -96);
    outdoorGroup.add(tower);
  }

  // Automated Traffic Cars
  const carConfigs: Array<{ axis: 'z' | 'x'; dir: 1 | -1; lane: number; start: number; color: string }> = [
    { axis: 'z', dir: 1, lane: -3.2, start: -40, color: '#ef4444' },
    { axis: 'z', dir: -1, lane: 3.2, start: 40, color: '#3b82f6' },
    { axis: 'x', dir: 1, lane: -8.8, start: -45, color: '#10b981' },
    { axis: 'x', dir: -1, lane: -15.2, start: 45, color: '#f59e0b' },
  ];
  for (const cfg of carConfigs) {
    const carMesh = buildCompositeCar(cfg.color);
    if (cfg.axis === 'z') {
      carMesh.position.set(cfg.lane, 0, cfg.start);
      carMesh.rotation.y = cfg.dir === 1 ? 0 : Math.PI;
    } else {
      carMesh.position.set(cfg.start, 0, cfg.lane);
      carMesh.rotation.y = cfg.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    }
    outdoorGroup.add(carMesh);
    vehicles.push({
      mesh: carMesh,
      axis: cfg.axis,
      dir: cfg.dir,
      speed: 8.5,
      laneCoord: cfg.lane,
    });
  }

  // =========================================================
  // BUILDING INTERIOR HALL (Shared Configurable 3D Room)
  // =========================================================
  const intFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({
      map: createInteriorFloorTexture(maxAnisotropy),
      roughness: 0.45,
    })
  );
  intFloor.rotation.x = -Math.PI / 2;
  intFloor.receiveShadow = true;
  interiorGroup.add(intFloor);

  const wallMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });
  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(30, 9, 0.8), wallMat);
  wallBack.position.set(0, 4.5, -15);
  const wallFront = new THREE.Mesh(new THREE.BoxGeometry(30, 9, 0.8), wallMat);
  wallFront.position.set(0, 4.5, 15);
  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9, 30), wallMat);
  wallLeft.position.set(-15, 4.5, 0);
  const wallRight = wallLeft.clone();
  wallRight.position.x = 15;
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.85, side: THREE.DoubleSide })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 9;
  interiorGroup.add(wallBack, wallFront, wallLeft, wallRight, ceiling);

  const interiorLight = new THREE.PointLight('#ffffff', 2.4, 48, 0.8);
  interiorLight.position.set(0, 7.8, 0);
  interiorGroup.add(interiorLight);

  const interiorSignMaterial = new THREE.MeshStandardMaterial({
    map: createSignboardTexture('RUANG MATERI', 'Pilih Stasiun Belajar', '#0f172a', '#38bdf8', maxAnisotropy),
    roughness: 0.35,
  });
  const hallBanner = new THREE.Mesh(new THREE.BoxGeometry(12, 2.2, 0.3), interiorSignMaterial);
  hallBanner.position.set(0, 6.4, -14.3);
  interiorGroup.add(hallBanner);

  // 4 Interactive Stations inside the room
  const interiorStations: InteriorStationTrigger[] = [
    { stationId: 'video', label: 'Layar Video Pembahasan', x: -7.5, z: -8.5, radius: 2.9 },
    { stationId: 'quiz', label: 'Meja Soal & Refleksi', x: 0, z: -8.5, radius: 2.9 },
    { stationId: 'sheet', label: 'Terminal Kirim Google Sheet', x: 7.5, z: -8.5, radius: 2.9 },
    { stationId: 'exit', label: 'Pintu Keluar Kota', x: 0, z: 12.2, radius: 2.9 },
  ];

  // Build 3D station props
  // 1) Video Screen Station
  {
    const g = new THREE.Group();
    g.position.set(-7.5, 0, -8.5);
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.9, 1.2),
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 })
    );
    stand.position.y = 0.45;
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 2.5, 0.25),
      new THREE.MeshStandardMaterial({
        map: createSignboardTexture('VIDEO PEMBAHASAN', 'Tekan E / Interaksi', '#1e3a8a', '#60a5fa', maxAnisotropy),
        emissive: '#1d4ed8',
        emissiveIntensity: 0.25,
      })
    );
    screen.position.y = 2.3;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.1, 8, 28),
      new THREE.MeshStandardMaterial({ color: '#3b82f6', emissive: '#3b82f6', emissiveIntensity: 0.9 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.08;
    g.add(stand, screen, ring);
    interiorGroup.add(g);
  }

  // 2) Quiz & Reflection Desk Station
  {
    const g = new THREE.Group();
    g.position.set(0, 0, -8.5);
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.0, 1.8),
      new THREE.MeshStandardMaterial({ color: '#065f46', roughness: 0.45 })
    );
    desk.position.y = 0.5;
    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.6, 0.2),
      new THREE.MeshStandardMaterial({
        map: createSignboardTexture('MEJA SOAL & REFLEKSI', '10 Soal + 5 Objek 3D', '#064e3b', '#34d399', maxAnisotropy),
        emissive: '#059669',
        emissiveIntensity: 0.25,
      })
    );
    monitor.position.y = 2.0;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.1, 8, 28),
      new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#10b981', emissiveIntensity: 0.9 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.08;
    g.add(desk, monitor, ring);
    interiorGroup.add(g);
  }

  // 3) Google Sheet Terminal Station
  {
    const g = new THREE.Group();
    g.position.set(7.5, 0, -8.5);
    const kiosk = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 2.2, 1.2),
      new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4, metalness: 0.4 })
    );
    kiosk.position.y = 1.1;
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.5, 0.2),
      new THREE.MeshStandardMaterial({
        map: createSignboardTexture('TERMINAL SHEET', 'Kirim Nilai ke Guru', '#14532d', '#4ade80', maxAnisotropy),
        emissive: '#16a34a',
        emissiveIntensity: 0.25,
      })
    );
    panel.position.y = 2.8;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.1, 8, 28),
      new THREE.MeshStandardMaterial({ color: '#22c55e', emissive: '#22c55e', emissiveIntensity: 0.9 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.08;
    g.add(kiosk, panel, ring);
    interiorGroup.add(g);
  }

  // 4) Exit Door Station
  {
    const g = new THREE.Group();
    g.position.set(0, 0, 12.8);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 4.4, 0.5),
      new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.4, metalness: 0.4 })
    );
    frame.position.y = 2.2;
    const portal = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 3.6, 0.6),
      new THREE.MeshStandardMaterial({
        map: createSignboardTexture('PINTU KELUAR', 'Kembali ke Kota 3D', '#7c2d12', '#fbbf24', maxAnisotropy),
        emissive: '#f59e0b',
        emissiveIntensity: 0.3,
      })
    );
    portal.position.y = 1.9;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.1, 8, 28),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 0.95 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.08, -0.6);
    g.add(frame, portal, ring);
    interiorGroup.add(g);
  }

  // 5 Permanent 3D Reward Objects inside the building (1 unlocked per 2 correct answers!)
  const interiorRewardSlotGroups: THREE.Group[] = [];
  const rewardCoords: Array<[number, number]> = [
    [-10.5, 0],
    [-10.5, 6.5],
    [10.5, 0],
    [10.5, 6.5],
    [0, 1.5],
  ];
  for (let i = 0; i < 5; i++) {
    const slot = buildRewardObject(i);
    slot.position.set(rewardCoords[i][0], 0, rewardCoords[i][1]);
    slot.visible = false;
    interiorGroup.add(slot);
    interiorRewardSlotGroups.push(slot);
  }

  return {
    outdoorGroup,
    interiorGroup,
    portals,
    colliders,
    streetLampBulbs,
    streetPointLights,
    trafficLightMats,
    vehicles,
    roadMat,
    interiorRewardSlotGroups,
    interiorStations,
    interiorSignMaterial,
    updateCompletedBeacons(completedChapterIds) {
      for (const p of portals) {
        if (!p.isArena && p.beaconGroup) {
          p.beaconGroup.visible = completedChapterIds.includes(p.id);
        }
      }
    },
    updateInteriorScene(chapterId, correctInChapter, maxAniso) {
      const ch = CHAPTERS.find((c) => c.id === chapterId);
      if (ch) {
        const nextMap = createSignboardTexture(
          ch.buildingName,
          `${correctInChapter}/${ch.questions.length} Soal Benar · ${Math.min(5, Math.floor(correctInChapter / 2))}/5 Objek 3D`,
          '#0f172a',
          ch.accentHex,
          maxAniso
        );
        interiorSignMaterial.map?.dispose();
        interiorSignMaterial.map = nextMap;
        interiorSignMaterial.needsUpdate = true;
      }
      const unlockedCount = Math.min(5, Math.floor(correctInChapter / 2));
      interiorRewardSlotGroups.forEach((slot, idx) => {
        slot.visible = idx < unlockedCount;
      });
    },
  };
}
