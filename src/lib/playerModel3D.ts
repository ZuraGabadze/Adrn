import * as THREE from 'three';

export interface PlayerJoints {
  root: THREE.Group;
  head: THREE.Group;
  body: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
}

export interface PoseKeyframe {
  rootPos: [number, number, number];
  rootRot: [number, number, number];
  headRot: [number, number, number];
  bodyRot: [number, number, number];
  leftArmRot: [number, number, number];
  rightArmRot: [number, number, number];
  leftLegRot: [number, number, number];
  rightLegRot: [number, number, number];
}

// Helper to map exact 64x64 Minecraft skin pixel rectangles onto a BoxGeometry's 6 faces
// Three.js BoxGeometry face order: +X (Right/Inner), -X (Left/Outer), +Y (Top), -Y (Bottom), +Z (Front), -Z (Back)
function applyMinecraftBoxUVs(
  geo: THREE.BoxGeometry,
  u: number,
  v: number,
  w: number,
  h: number,
  d: number,
  texW = 64,
  texH = 64
) {
  const uvAttr = geo.attributes.uv as THREE.BufferAttribute;

  function setFaceUV(
    faceIndex: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    flipY = false
  ) {
    const u1 = x1 / texW;
    const u2 = x2 / texW;
    const v1 = 1 - y1 / texH;
    const v2 = 1 - y2 / texH;

    const offset = faceIndex * 4;
    if (!flipY) {
      uvAttr.setXY(offset + 0, u1, v1);
      uvAttr.setXY(offset + 1, u2, v1);
      uvAttr.setXY(offset + 2, u1, v2);
      uvAttr.setXY(offset + 3, u2, v2);
    } else {
      uvAttr.setXY(offset + 0, u1, v2);
      uvAttr.setXY(offset + 1, u2, v2);
      uvAttr.setXY(offset + 2, u1, v1);
      uvAttr.setXY(offset + 3, u2, v1);
    }
  }

  // Face 0 (+X): viewer's right (character's left side): [u + d + w, v + d, u + d + w + d, v + d + h]
  setFaceUV(0, u + d + w, v + d, u + d + w + d, v + d + h);
  // Face 1 (-X): viewer's left (character's right side): [u, v + d, u + d, v + d + h]
  setFaceUV(1, u, v + d, u + d, v + d + h);
  // Face 2 (+Y): Top: [u + d, v, u + d + w, v + d]
  setFaceUV(2, u + d, v, u + d + w, v + d);
  // Face 3 (-Y): Bottom: [u + d + w, v, u + d + w + w, v + d]
  setFaceUV(3, u + d + w, v, u + d + w + w, v + d, true);
  // Face 4 (+Z): Front: [u + d, v + d, u + d + w, v + d + h]
  setFaceUV(4, u + d, v + d, u + d + w, v + d + h);
  // Face 5 (-Z): Back: [u + d + w + d, v + d, u + d + w + d + w, v + d + h]
  setFaceUV(5, u + d + w + d, v + d, u + d + w + d + w, v + d + h);

  uvAttr.needsUpdate = true;
}

export function createMinecraftPlayerRig(
  skinCanvas: HTMLCanvasElement,
  isSlim = false
): {
  joints: PlayerJoints;
  dispose: () => void;
} {
  const scale = 1 / 16; // 16 pixels = 1.0 unit (total character height = 32px = 2.0 units)
  const skinTex = new THREE.CanvasTexture(skinCanvas);
  skinTex.magFilter = THREE.NearestFilter;
  skinTex.minFilter = THREE.NearestFilter;
  skinTex.colorSpace = THREE.SRGBColorSpace;
  skinTex.needsUpdate = true;

  const baseMat = new THREE.MeshStandardMaterial({
    map: skinTex,
    roughness: 0.65,
    metalness: 0.08,
  });

  const overlayMat = new THREE.MeshStandardMaterial({
    map: skinTex,
    transparent: true,
    alphaTest: 0.05,
    side: THREE.DoubleSide,
    roughness: 0.55,
    metalness: 0.1,
  });

  const geometries: THREE.BufferGeometry[] = [];

  function makePart(
    w: number,
    h: number,
    d: number,
    baseUV: [number, number],
    overlayUV: [number, number],
    pivotOffsetY: number
  ): THREE.Group {
    const group = new THREE.Group();

    const geo = new THREE.BoxGeometry(w * scale, h * scale, d * scale);
    applyMinecraftBoxUVs(geo, baseUV[0], baseUV[1], w, h, d);
    const mesh = new THREE.Mesh(geo, baseMat);
    mesh.position.y = pivotOffsetY * scale;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    geometries.push(geo);

    const overGeo = new THREE.BoxGeometry(
      w * scale * 1.11,
      h * scale * 1.11,
      d * scale * 1.11
    );
    applyMinecraftBoxUVs(overGeo, overlayUV[0], overlayUV[1], w, h, d);
    const overMesh = new THREE.Mesh(overGeo, overlayMat);
    overMesh.position.y = pivotOffsetY * scale;
    group.add(overMesh);
    geometries.push(overGeo);

    return group;
  }

  const root = new THREE.Group();

  // Body (8x12x4), pivot at waist/center (y = 18px above feet -> center of body is 18px)
  const body = makePart(8, 12, 4, [16, 16], [16, 32], 0);
  body.position.set(0, 18 * scale, 0);
  root.add(body);

  // Head (8x8x8), pivot at neck (y = 24px above feet, mesh offset +4px)
  const head = makePart(8, 8, 8, [0, 0], [32, 0], 4);
  head.position.set(0, 24 * scale, 0);
  root.add(head);

  // Arms (3x12x4 if slim, else 4x12x4), pivot at shoulder (y = 22px, mesh offset -4px)
  const armW = isSlim ? 3 : 4;
  const armOffsetX = isSlim ? 5.5 : 6;

  const rightArm = makePart(armW, 12, 4, [40, 16], [40, 32], -4);
  rightArm.position.set(-armOffsetX * scale, 22 * scale, 0);
  root.add(rightArm);

  const leftArm = makePart(armW, 12, 4, [32, 48], [48, 48], -4);
  leftArm.position.set(armOffsetX * scale, 22 * scale, 0);
  root.add(leftArm);

  // Legs (4x12x4), pivot at hip (y = 12px, mesh offset -6px so feet touch y = 0)
  const rightLeg = makePart(4, 12, 4, [0, 16], [0, 32], -6);
  rightLeg.position.set(-2 * scale, 12 * scale, 0);
  root.add(rightLeg);

  const leftLeg = makePart(4, 12, 4, [16, 48], [0, 48], -6);
  leftLeg.position.set(2 * scale, 12 * scale, 0);
  root.add(leftLeg);

  return {
    joints: {
      root,
      head,
      body,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      baseMat.dispose();
      overlayMat.dispose();
      skinTex.dispose();
    },
  };
}

// ============================================================================
// POSE DATA & INTERPOLATION ENGINE
// ============================================================================

export const OWNER_LEFT_POSES: Record<'O1' | 'O2' | 'O3' | 'O4', PoseKeyframe> = {
  // O1 "Back-to-Back": angled outward, arms crossed, head turned toward camera over shoulder
  O1: {
    rootPos: [-0.85, 0, 0.15],
    rootRot: [0, -0.55, 0],
    headRot: [-0.08, 0.55, 0.04],
    bodyRot: [0, 0, 0],
    leftArmRot: [-0.75, -0.45, -0.25],
    rightArmRot: [-0.75, 0.45, 0.25],
    leftLegRot: [0.1, 0, -0.05],
    rightLegRot: [-0.1, 0, 0.05],
  },
  // O2 "Mirror Sync": step apart, face camera angled inward, outer (right) fist raised to sky
  O2: {
    rootPos: [-1.35, 0, 0],
    rootRot: [0, 0.28, 0],
    headRot: [-0.18, -0.15, 0],
    bodyRot: [-0.05, 0, 0],
    leftArmRot: [0.25, 0, 0.15],
    rightArmRot: [-2.75, 0.1, -0.15],
    leftLegRot: [-0.15, 0, -0.08],
    rightLegRot: [0.18, 0, 0.08],
  },
  // O3 "Fist Bump": turn inward toward center and bump fists
  O3: {
    rootPos: [-0.92, 0, 0.1],
    rootRot: [0, 1.15, 0],
    headRot: [0, -0.45, 0],
    bodyRot: [0.05, 0, 0],
    leftArmRot: [-1.45, -0.2, 0],
    rightArmRot: [0.35, 0, 0.12],
    leftLegRot: [-0.22, 0, 0],
    rightLegRot: [0.22, 0, 0],
  },
  // O4 "Power Stance": shoulder to shoulder, arms crossed, heads high
  O4: {
    rootPos: [-0.75, 0, 0.25],
    rootRot: [0, 0.12, 0],
    headRot: [-0.14, -0.08, 0],
    bodyRot: [-0.04, 0, 0],
    leftArmRot: [-0.82, -0.5, -0.2],
    rightArmRot: [-0.82, 0.5, 0.2],
    leftLegRot: [0, 0, -0.08],
    rightLegRot: [0, 0, 0.08],
  },
};

export const OWNER_RIGHT_POSES: Record<'O1' | 'O2' | 'O3' | 'O4', PoseKeyframe> = {
  O1: {
    rootPos: [0.85, 0, -0.15],
    rootRot: [0, 0.55, 0],
    headRot: [-0.08, -0.55, -0.04],
    bodyRot: [0, 0, 0],
    leftArmRot: [-0.75, -0.45, -0.25],
    rightArmRot: [-0.75, 0.45, 0.25],
    leftLegRot: [-0.1, 0, -0.05],
    rightLegRot: [0.1, 0, 0.05],
  },
  O2: {
    rootPos: [1.35, 0, 0],
    rootRot: [0, -0.28, 0],
    headRot: [-0.18, 0.15, 0],
    bodyRot: [-0.05, 0, 0],
    leftArmRot: [-2.75, -0.1, 0.15],
    rightArmRot: [0.25, 0, -0.15],
    leftLegRot: [0.18, 0, -0.08],
    rightLegRot: [-0.15, 0, 0.08],
  },
  O3: {
    rootPos: [0.92, 0, 0.1],
    rootRot: [0, -1.15, 0],
    headRot: [0, 0.45, 0],
    bodyRot: [0.05, 0, 0],
    leftArmRot: [0.35, 0, -0.12],
    rightArmRot: [-1.45, 0.2, 0],
    leftLegRot: [0.22, 0, 0],
    rightLegRot: [-0.22, 0, 0],
  },
  O4: {
    rootPos: [0.75, 0, 0.25],
    rootRot: [0, -0.12, 0],
    headRot: [-0.14, 0.08, 0],
    bodyRot: [-0.04, 0, 0],
    leftArmRot: [-0.82, -0.5, -0.2],
    rightArmRot: [-0.82, 0.5, 0.2],
    leftLegRot: [0, 0, -0.08],
    rightLegRot: [0, 0, 0.08],
  },
};

// Developer Poses: Jajo_1121 ("Terminal Sit") & godkissed ("Code Caster")
export const DEV_JAJO_POSE: PoseKeyframe = {
  rootPos: [-1.15, 0.42, 0.15],
  rootRot: [0, 0.22, 0],
  headRot: [0.15, -0.1, 0],
  bodyRot: [0.06, 0, 0],
  leftArmRot: [-1.15, -0.15, 0],
  rightArmRot: [-1.15, 0.15, 0],
  leftLegRot: [-1.35, 0.08, 0],
  rightLegRot: [-1.35, -0.08, 0],
};

export const DEV_GODKISSED_POSE: PoseKeyframe = {
  rootPos: [1.15, 0, 0.15],
  rootRot: [0, -0.25, 0],
  headRot: [-0.08, 0.15, 0],
  bodyRot: [-0.04, 0, 0],
  // Left arm on hip, right arm extended holding floating code cube
  leftArmRot: [0.35, 0, 0.45],
  rightArmRot: [-1.35, -0.2, -0.1],
  leftLegRot: [0.12, 0, -0.12],
  rightLegRot: [-0.12, 0, 0.12],
};

export function applyBlendedPose(
  joints: PlayerJoints,
  target: PoseKeyframe,
  elapsed: number,
  dt: number,
  options?: {
    phaseOffset?: number;
    isTyping?: boolean;
    isCodeCaster?: boolean;
  }
) {
  const damp = (curr: number, dst: number) => THREE.MathUtils.damp(curr, dst, 6.5, dt);
  const phase = options?.phaseOffset || 0;
  const breath = Math.sin(elapsed * 2.2 + phase) * 0.025;
  const sway = Math.cos(elapsed * 1.4 + phase) * 0.02;

  joints.root.position.set(
    damp(joints.root.position.x, target.rootPos[0]),
    damp(joints.root.position.y, target.rootPos[1] + breath * 0.4),
    damp(joints.root.position.z, target.rootPos[2])
  );

  joints.root.rotation.set(
    damp(joints.root.rotation.x, target.rootRot[0]),
    damp(joints.root.rotation.y, target.rootRot[1] + sway),
    damp(joints.root.rotation.z, target.rootRot[2])
  );

  // Periodic look-up and nod for Terminal Sit developer
  let extraHeadX = breath * 0.8;
  if (options?.isTyping) {
    const cycle = elapsed % 6;
    if (cycle > 4.2 && cycle < 5.5) {
      extraHeadX = -0.22 + Math.sin(elapsed * 10) * 0.08;
    }
  }

  joints.head.rotation.set(
    damp(joints.head.rotation.x, target.headRot[0] + extraHeadX),
    damp(joints.head.rotation.y, target.headRot[1] + sway * 1.5),
    damp(joints.head.rotation.z, target.headRot[2])
  );

  joints.body.rotation.set(
    damp(joints.body.rotation.x, target.bodyRot[0]),
    damp(joints.body.rotation.y, target.bodyRot[1]),
    damp(joints.body.rotation.z, target.bodyRot[2])
  );

  let leftArmExtraX = breath;
  let rightArmExtraX = -breath;
  let leftLegExtraX = 0;
  let rightLegExtraX = 0;

  if (options?.isTyping) {
    leftArmExtraX = Math.sin(elapsed * 14) * 0.14;
    rightArmExtraX = Math.cos(elapsed * 14) * 0.14;
    leftLegExtraX = Math.sin(elapsed * 2.6) * 0.16;
    rightLegExtraX = -Math.sin(elapsed * 2.6) * 0.16;
  } else if (options?.isCodeCaster) {
    rightArmExtraX = Math.sin(elapsed * 3.0) * 0.08;
  }

  joints.leftArm.rotation.set(
    damp(joints.leftArm.rotation.x, target.leftArmRot[0] + leftArmExtraX),
    damp(joints.leftArm.rotation.y, target.leftArmRot[1]),
    damp(joints.leftArm.rotation.z, target.leftArmRot[2])
  );

  joints.rightArm.rotation.set(
    damp(joints.rightArm.rotation.x, target.rightArmRot[0] + rightArmExtraX),
    damp(joints.rightArm.rotation.y, target.rightArmRot[1]),
    damp(joints.rightArm.rotation.z, target.rightArmRot[2])
  );

  joints.leftLeg.rotation.set(
    damp(joints.leftLeg.rotation.x, target.leftLegRot[0] + leftLegExtraX),
    damp(joints.leftLeg.rotation.y, target.leftLegRot[1]),
    damp(joints.leftLeg.rotation.z, target.leftLegRot[2])
  );

  joints.rightLeg.rotation.set(
    damp(joints.rightLeg.rotation.x, target.rightLegRot[0] + rightLegExtraX),
    damp(joints.rightLeg.rotation.y, target.rightLegRot[1]),
    damp(joints.rightLeg.rotation.z, target.rightLegRot[2])
  );
}
