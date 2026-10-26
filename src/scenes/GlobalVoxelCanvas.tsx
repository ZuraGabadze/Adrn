import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

// 9x9 Pixel-Art Minecraft Heart Bitmap (1 = red core, 2 = white highlight, 3 = dark border)
const HEART_BITMAP = [
  [0, 3, 3, 0, 0, 0, 3, 3, 0],
  [3, 2, 2, 3, 0, 3, 1, 1, 3],
  [3, 2, 1, 1, 3, 1, 1, 1, 3],
  [3, 1, 1, 1, 1, 1, 1, 1, 3],
  [0, 3, 1, 1, 1, 1, 1, 3, 0],
  [0, 0, 3, 1, 1, 1, 3, 0, 0],
  [0, 0, 0, 3, 1, 3, 0, 0, 0],
  [0, 0, 0, 0, 3, 0, 0, 0, 0],
];

export const GlobalVoxelCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060410');
    scene.fog = new THREE.FogExp2('#060410', 0.024);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      140
    );
    camera.position.set(0, 4.5, 15);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const gl = renderer.getContext();
    const rendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const unmaskedRenderer = rendererInfo
      ? String(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL))
      : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(unmaskedRenderer);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isSoftwareGl ? 0.65 : Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting (day/night scroll reactive)
    const ambientLight = new THREE.AmbientLight('#2b2347', 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#ff4d29', 2.4);
    sunLight.position.set(14, 22, 12);
    scene.add(sunLight);

    const rankPointLight = new THREE.PointLight('#25FF57', 3.5, 28);
    rankPointLight.position.set(0, 5, 4);
    scene.add(rankPointLight);

    // 1. 3D Pixel-Art Heart (9x8 grid of cubes) floating in Hero
    const heartGroup = new THREE.Group();
    heartGroup.position.set(0, 4.2, 2.5);
    scene.add(heartGroup);

    const heartGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    const matCore = new THREE.MeshStandardMaterial({
      color: '#ff1f1f',
      emissive: '#990000',
      emissiveIntensity: 0.7,
      roughness: 0.3,
    });
    const matHighlight = new THREE.MeshStandardMaterial({
      color: '#ffd6d6',
      emissive: '#ff5555',
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const matBorder = new THREE.MeshStandardMaterial({
      color: '#3a0408',
      roughness: 0.6,
    });

    for (let row = 0; row < HEART_BITMAP.length; row++) {
      for (let col = 0; col < HEART_BITMAP[row].length; col++) {
        const cell = HEART_BITMAP[row][col];
        if (cell === 0) continue;
        const mat = cell === 2 ? matHighlight : cell === 3 ? matBorder : matCore;
        const voxel = new THREE.Mesh(heartGeo, mat);
        voxel.position.set((col - 4) * 0.44, (3.5 - row) * 0.44, 0);
        heartGroup.add(voxel);
      }
    }

    // 2. Minecraft Voxel Panorama Terrain (Hills, Oak Trees, Water, Glowing Ore Veins)
    const panoramaGroup = new THREE.Group();
    scene.add(panoramaGroup);

    const blockGeo = new THREE.BoxGeometry(1, 1, 1);
    const grassMat = new THREE.MeshLambertMaterial({ color: '#3b8526' });
    const dirtMat = new THREE.MeshLambertMaterial({ color: '#6b4728' });
    const stoneMat = new THREE.MeshLambertMaterial({ color: '#55555e' });
    const obsidianMat = new THREE.MeshLambertMaterial({ color: '#1b162a' });
    const woodMat = new THREE.MeshLambertMaterial({ color: '#6e5230' });
    const leavesMat = new THREE.MeshLambertMaterial({ color: '#27691b' });
    const oreMat = new THREE.MeshStandardMaterial({
      color: '#8C6CFF',
      emissive: '#25FF57',
      emissiveIntensity: 0.8,
    });

    interface VoxelPlacement {
      x: number;
      y: number;
      z: number;
      type: 'grass' | 'dirt' | 'stone' | 'obsidian' | 'wood' | 'leaves' | 'ore';
    }

    const placements: VoxelPlacement[] = [];
    const radius = isSoftwareGl ? 12 : 17;

    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        const dist = Math.sqrt(x * x + z * z);
        if (dist < 5.5 || dist > radius) continue;

        const height = Math.floor(
          Math.sin(x * 0.25) * 1.8 + Math.cos(z * 0.25) * 1.8 + (dist > 11 ? 2 : 0)
        );

        placements.push({
          x,
          y: height,
          z,
          type: (x + z) % 9 === 0 ? 'ore' : dist > 13 ? 'obsidian' : 'grass',
        });
        placements.push({ x, y: height - 1, z, type: 'dirt' });
        if (!isSoftwareGl) {
          placements.push({ x, y: height - 2, z, type: 'stone' });
        }

        // Occasional blocky oak tree on hilltops
        if (height >= 1 && (Math.abs(x * 7 + z * 13) % 29 === 0) && dist > 8) {
          placements.push({ x, y: height + 1, z, type: 'wood' });
          placements.push({ x, y: height + 2, z, type: 'wood' });
          for (let lx = -1; lx <= 1; lx++) {
            for (let lz = -1; lz <= 1; lz++) {
              placements.push({ x: x + lx, y: height + 3, z: z + lz, type: 'leaves' });
            }
          }
          placements.push({ x, y: height + 4, z, type: 'leaves' });
        }
      }
    }

    const buildInstancedLayer = (
      type: VoxelPlacement['type'],
      material: THREE.Material
    ) => {
      const items = placements.filter((p) => p.type === type);
      if (items.length === 0) return null;
      const mesh = new THREE.InstancedMesh(blockGeo, material, items.length);
      const dummy = new THREE.Object3D();
      items.forEach((p, idx) => {
        dummy.position.set(p.x, p.y - 2.5, p.z);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      panoramaGroup.add(mesh);
      return mesh;
    };

    buildInstancedLayer('grass', grassMat);
    buildInstancedLayer('dirt', dirtMat);
    buildInstancedLayer('stone', stoneMat);
    buildInstancedLayer('obsidian', obsidianMat);
    buildInstancedLayer('wood', woodMat);
    buildInstancedLayer('leaves', leavesMat);
    buildInstancedLayer('ore', oreMat);

    // 3. Drifting Blocky Clouds
    const cloudsGroup = new THREE.Group();
    cloudsGroup.position.y = 11;
    scene.add(cloudsGroup);
    const cloudMat = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.14,
    });
    for (let i = 0; i < (isSoftwareGl ? 6 : 14); i++) {
      const w = 3 + (i % 4);
      const d = 2 + (i % 3);
      const cloud = new THREE.Mesh(new THREE.BoxGeometry(w, 0.55, d), cloudMat);
      const angle = (i / 14) * Math.PI * 2;
      const r = 10 + (i % 5) * 2.5;
      cloud.position.set(Math.cos(angle) * r, (i % 3) * 0.8, Math.sin(angle) * r);
      cloudsGroup.add(cloud);
    }

    // 4. Floating Firefly / XP Particles
    const fireflyCount = isSoftwareGl ? 45 : 140;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    for (let i = 0; i < fireflyCount; i++) {
      fireflyPositions[i * 3] = (Math.random() - 0.5) * 32;
      fireflyPositions[i * 3 + 1] = Math.random() * 12 - 1;
      fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * 32;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
    const fireflyMat = new THREE.PointsMaterial({
      color: '#37ff2f',
      size: 0.22,
      transparent: true,
      opacity: 0.8,
    });
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflies);

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let timeoutId = 0;
    let isDisposed = false;
    const targetColor = new THREE.Color('#25FF57');

    const scheduleNextFrame = (cb: () => void) => {
      if (isSoftwareGl) {
        timeoutId = window.setTimeout(cb, 260);
      } else {
        frameId = requestAnimationFrame(cb);
      }
    };

    const tick = () => {
      if (isDisposed) return;

      const t = clock.getElapsedTime();
      const state = useAppStore.getState();
      const activeRank = state.db.ranks.find((r) => r.id === state.activeRankId);

      if (activeRank) {
        targetColor.set(activeRank.colorPrimary);
      }
      rankPointLight.color.lerp(targetColor, 0.08);
      oreMat.emissive.lerp(targetColor, 0.08);

      // Heartbeat pulse
      const freq = (state.currentBpm / 60) * Math.PI * 2;
      const pulse = Math.pow(Math.max(0, Math.sin(t * freq)), 6);
      const heartScale = 1 + pulse * 0.22;
      heartGroup.scale.set(heartScale, heartScale, heartScale);
      heartGroup.rotation.y = Math.sin(t * 0.6) * 0.35 + mouseX * 0.25;
      heartGroup.position.y = 4.2 + Math.sin(t * 1.5) * 0.25 - state.scrollProgress * 6.5;

      // Rotate Minecraft Panorama slowly + scroll camera glide
      panoramaGroup.rotation.y = t * 0.055 + state.scrollProgress * 1.4;
      cloudsGroup.rotation.y = -t * 0.03;
      fireflies.rotation.y = t * 0.04;

      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.05;
      camera.position.y += (4.5 - mouseY * 0.6 - state.scrollProgress * 1.2 - camera.position.y) * 0.05;
      camera.lookAt(0, 2.2, 0);

      renderer.render(scene, camera);
      scheduleNextFrame(tick);
    };

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
