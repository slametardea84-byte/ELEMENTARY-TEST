import * as THREE from 'three';
import type { AnimState, AvatarCustomization, CompanionType } from '../types/game';
import { createNameplateTexture } from './proceduralTextures';

export interface AvatarRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  companionGroup: THREE.Group;
  nameSprite: THREE.Sprite;
  updateStyle: (
    avatar: AvatarCustomization,
    name: string,
    className: string,
    level: number,
    progressPct: number,
    isTeacher: boolean
  ) => void;
  animate: (elapsed: number, animState: AnimState, moveSpeed: number) => void;
}

function buildCompanionMesh(type: CompanionType): THREE.Group {
  const g = new THREE.Group();
  if (type === 'owl') {
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.36, 10),
      new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.7 })
    );
    const belly = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 10, 10),
      new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.8 })
    );
    belly.position.set(0, -0.02, 0.1);
    const eyeL = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#fde047', emissive: '#ca8a04', emissiveIntensity: 0.4 })
    );
    eyeL.position.set(-0.07, 0.1, 0.15);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.07;
    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.1, 6),
      new THREE.MeshStandardMaterial({ color: '#f97316', roughness: 0.4 })
    );
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.05, 0.22);
    const wingL = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.22, 0.16),
      new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.75 })
    );
    wingL.position.set(-0.22, 0, 0);
    const wingR = wingL.clone();
    wingR.position.x = 0.22;
    g.add(body, belly, eyeL, eyeR, beak, wingL, wingR);
  } else if (type === 'robot') {
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.28, 0.28),
      new THREE.MeshStandardMaterial({ color: '#38bdf8', metalness: 0.7, roughness: 0.25 })
    );
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.09, 0.04),
      new THREE.MeshStandardMaterial({ color: '#0f172a', emissive: '#22d3ee', emissiveIntensity: 0.9 })
    );
    visor.position.set(0, 0.02, 0.14);
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.16, 6),
      new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.85, roughness: 0.2 })
    );
    antenna.position.set(0, 0.21, 0);
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#f59e0b', emissiveIntensity: 1 })
    );
    orb.position.set(0, 0.3, 0);
    const thruster = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.16, 8),
      new THREE.MeshStandardMaterial({ color: '#f97316', emissive: '#ea580c', emissiveIntensity: 0.7 })
    );
    thruster.rotation.x = Math.PI;
    thruster.position.set(0, -0.2, 0);
    g.add(head, visor, antenna, orb, thruster);
  } else if (type === 'fox') {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.24, 0.34),
      new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.65 })
    );
    const earL = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.14, 4),
      new THREE.MeshStandardMaterial({ color: '#c2410c', roughness: 0.7 })
    );
    earL.position.set(-0.08, 0.18, 0.08);
    const earR = earL.clone();
    earR.position.x = 0.08;
    const snout = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.09, 0.14),
      new THREE.MeshStandardMaterial({ color: '#fff7ed', roughness: 0.8 })
    );
    snout.position.set(0, -0.02, 0.2);
    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.28, 8),
      new THREE.MeshStandardMaterial({ color: '#fb923c', roughness: 0.65 })
    );
    tail.rotation.x = -Math.PI / 3;
    tail.position.set(0, 0.05, -0.24);
    g.add(body, earL, earR, snout, tail);
  } else {
    // crystal
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshPhysicalMaterial({
        color: '#a855f7',
        emissive: '#7e22ce',
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.2,
      })
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.025, 8, 24),
      new THREE.MeshStandardMaterial({ color: '#fde047', metalness: 0.85, roughness: 0.2 })
    );
    ring.rotation.x = Math.PI / 2.4;
    const sat = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0ea5e9', emissiveIntensity: 0.9 })
    );
    sat.position.set(0.3, 0.04, 0);
    g.add(core, ring, sat);
  }
  return g;
}

export function createRobloxAvatar(
  avatar: AvatarCustomization,
  name: string,
  className: string,
  level: number,
  progressPct: number,
  isTeacher: boolean
): AvatarRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const skinMat = new THREE.MeshStandardMaterial({ color: '#f3c69f', roughness: 0.7 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: avatar.shirtColor, roughness: 0.55 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: avatar.pantsColor, roughness: 0.75 });
  const hairMat = new THREE.MeshStandardMaterial({ color: avatar.hairColor, roughness: 0.65 });
  const hatMat = new THREE.MeshStandardMaterial({
    color: avatar.hatColor,
    roughness: 0.35,
    metalness: 0.15,
  });

  // Torso (primary silhouette)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.84, 0.42), shirtMat);
  torso.position.y = 1.24;
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Backpack accent on torso
  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.56, 0.18),
    new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 })
  );
  backpack.position.set(0, 1.24, -0.28);
  backpack.castShadow = true;
  bodyGroup.add(backpack);

  // Head + face + hair + hat
  const head = new THREE.Group();
  head.position.y = 1.94;
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.58, 0.58), skinMat);
  skull.castShadow = true;
  head.add(skull);

  // Eyes & smile
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3 });
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), eyeMat);
  eyeL.position.set(-0.13, 0.04, 0.29);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.13;
  const smile = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.04), eyeMat);
  smile.position.set(0, -0.12, 0.29);
  head.add(eyeL, eyeR, smile);

  // Hair cap
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.18, 0.62), hairMat);
  hairTop.position.set(0, 0.26, -0.01);
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.44, 0.14), hairMat);
  hairBack.position.set(0, 0.05, -0.26);
  head.add(hairTop, hairBack);

  // Cap / Hat
  const hatCrown = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.64), hatMat);
  hatCrown.position.set(0, 0.37, 0);
  const hatVisor = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.06, 0.32), hatMat);
  hatVisor.position.set(0, 0.29, 0.34);
  head.add(hatCrown, hatVisor);

  bodyGroup.add(head);

  // Arms (pivoted at shoulder)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.56, 1.56, 0);
  const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.4, 0.32), shirtMat);
  lSleeve.position.y = -0.16;
  const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.26), skinMat);
  lHand.position.y = -0.5;
  leftArm.add(lSleeve, lHand);
  leftArm.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) c.castShadow = true;
  });

  const rightArm = new THREE.Group();
  rightArm.position.set(0.56, 1.56, 0);
  const rSleeve = lSleeve.clone();
  const rHand = lHand.clone();
  rightArm.add(rSleeve, rHand);
  rightArm.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) c.castShadow = true;
  });
  bodyGroup.add(leftArm, rightArm);

  // Legs (pivoted at hip, bottom sits at y=0)
  const shoeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 });
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.2, 0.82, 0);
  const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.68, 0.36), pantsMat);
  lLegMesh.position.y = -0.34;
  const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.42), shoeMat);
  lShoe.position.set(0, -0.75, 0.03);
  leftLeg.add(lLegMesh, lShoe);
  leftLeg.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) c.castShadow = true;
  });

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.2, 0.82, 0);
  const rLegMesh = lLegMesh.clone();
  const rShoe = lShoe.clone();
  rightLeg.add(rLegMesh, rShoe);
  rightLeg.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) c.castShadow = true;
  });
  bodyGroup.add(leftLeg, rightLeg);

  // Floating 3D Companion beside shoulder
  let companionType = avatar.companion;
  const companionGroup = new THREE.Group();
  companionGroup.position.set(0.95, 2.05, -0.1);
  companionGroup.add(buildCompanionMesh(companionType));
  root.add(companionGroup);

  // Floating nameplate sprite
  let nameplateTex = createNameplateTexture(name, className, level, progressPct, isTeacher);
  const spriteMat = new THREE.SpriteMaterial({
    map: nameplateTex,
    transparent: true,
    depthTest: false,
  });
  const nameSprite = new THREE.Sprite(spriteMat);
  nameSprite.position.set(0, 2.85, 0);
  nameSprite.scale.set(2.5, 0.78, 1);
  root.add(nameSprite);

  return {
    root,
    bodyGroup,
    head,
    torso,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    companionGroup,
    nameSprite,
    updateStyle(nextAvatar, nextName, nextClass, nextLevel, nextPct, nextTeacher) {
      shirtMat.color.set(nextAvatar.shirtColor);
      pantsMat.color.set(nextAvatar.pantsColor);
      hairMat.color.set(nextAvatar.hairColor);
      hatMat.color.set(nextAvatar.hatColor);
      if (nextAvatar.companion !== companionType) {
        companionType = nextAvatar.companion;
        companionGroup.clear();
        companionGroup.add(buildCompanionMesh(companionType));
      }
      nameplateTex.dispose();
      nameplateTex = createNameplateTexture(nextName, nextClass, nextLevel, nextPct, nextTeacher);
      spriteMat.map = nameplateTex;
      spriteMat.needsUpdate = true;
    },
    animate(elapsed, animState, moveSpeed) {
      // Companion hover bob
      companionGroup.position.y = 2.05 + Math.sin(elapsed * 3.2) * 0.14;
      companionGroup.rotation.y = Math.sin(elapsed * 1.6) * 0.35;

      if (animState === 'jump') {
        leftArm.rotation.x = -2.45;
        rightArm.rotation.x = -2.45;
        leftLeg.rotation.x = 0.55;
        rightLeg.rotation.x = -0.45;
        bodyGroup.position.y = 0;
      } else if (animState === 'walk' || animState === 'run') {
        const freq = animState === 'run' ? 13 : 8.5;
        const amp = animState === 'run' ? 0.92 : 0.58;
        const phase = elapsed * freq + moveSpeed * 0.01;
        leftLeg.rotation.x = Math.sin(phase) * amp;
        rightLeg.rotation.x = -Math.sin(phase) * amp;
        leftArm.rotation.x = -Math.sin(phase) * amp * 0.85;
        rightArm.rotation.x = Math.sin(phase) * amp * 0.85;
        bodyGroup.position.y = Math.abs(Math.sin(phase)) * 0.07;
      } else {
        leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.2);
        rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.2);
        leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, Math.sin(elapsed * 1.8) * 0.05, 0.2);
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -Math.sin(elapsed * 1.8) * 0.05, 0.2);
        bodyGroup.position.y = Math.sin(elapsed * 2.2) * 0.02;
      }
    },
  };
}
