import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Sparkles, Terminal, Crown, Code2, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../i18n/translations';
import { loadStaffSkin } from '../lib/skinLoader';
import {
  applyBlendedPose,
  createMinecraftPlayerRig,
  DEV_GODKISSED_POSE,
  DEV_JAJO_POSE,
  OWNER_LEFT_POSES,
  OWNER_RIGHT_POSES,
  PlayerJoints,
} from '../lib/playerModel3D';
import { getBlockDataUrl } from '../lib/textures';
import { audioEngine } from '../lib/audio';

const POSE_KEYS: Array<'O1' | 'O2' | 'O3' | 'O4'> = ['O1', 'O2', 'O3', 'O4'];
const POSE_NAMES = [
  'O1 // BACK-TO-BACK',
  'O2 // MIRROR SYNC',
  'O3 // FIST BUMP',
  'O4 // POWER STANCE',
];

export const StaffShowcase3D: React.FC = () => {
  const language = useAppStore((s) => s.language);
  const staff = useAppStore((s) => s.db.staff);
  const addAdvancementToast = useAppStore((s) => s.addAdvancementToast);
  const t = TRANSLATIONS[language];

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [activePoseIndex, setActivePoseIndex] = useState(0);
  const [skinHeadUrls, setSkinHeadUrls] = useState<Record<string, string>>({});
  const [replayTrigger, setReplayTrigger] = useState(0);
  const mergedToastFiredRef = useRef(false);

  const owners = staff.filter((s) => s.role === 'Owner');
  const developers = staff.filter((s) => s.role === 'Developer');

  // Load 2D head avatars & 3D skins
  useEffect(() => {
    let active = true;
    staff.forEach(async (member) => {
      const customUrl = member.skinSource !== 'auto' ? member.customSkinUrl : undefined;
      const loaded = await loadStaffSkin(member.name, customUrl, member.slimOverride);
      if (!active) return;

      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = 64;
      faceCanvas.height = 64;
      const fctx = faceCanvas.getContext('2d')!;
      fctx.imageSmoothingEnabled = false;
      fctx.drawImage(loaded.canvas, 8, 8, 8, 8, 0, 0, 64, 64);
      fctx.drawImage(loaded.canvas, 40, 8, 8, 8, 0, 0, 64, 64);

      setSkinHeadUrls((prev) => ({ ...prev, [member.id]: faceCanvas.toDataURL('image/png') }));
    });
    return () => {
      active = false;
    };
  }, [staff]);

  // Mount Non-Draggable 3D Stage (Owners + Developers)
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090514');
    scene.fog = new THREE.FogExp2('#090514', 0.035);

    const width = host.clientWidth || 960;
    const height = host.clientHeight || 460;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(0, 2.2, 8.8);
    camera.lookAt(0, 1.0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    const gl = renderer.getContext();
    const rendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const unmaskedRenderer = rendererInfo
      ? String(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL))
      : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(unmaskedRenderer);

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 0.7 : Math.min(window.devicePixelRatio, 1.5));
    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight('#493870', 1.7);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight('#ffffff', 2.4);
    keyLight.position.set(5, 10, 8);
    scene.add(keyLight);

    const ownerLight = new THREE.PointLight('#ff2a1f', 3.5, 10);
    ownerLight.position.set(-2.5, 3, 2);
    scene.add(ownerLight);

    const devLight = new THREE.PointLight('#25FF57', 3.5, 10);
    devLight.position.set(2.5, 3, 2);
    scene.add(devLight);

    // Wing Groups (Left = Owners at x=-2.4, Right = Developers at x=+2.4)
    const ownersGroup = new THREE.Group();
    ownersGroup.position.set(-2.4, 0, 0);
    scene.add(ownersGroup);

    const devsGroup = new THREE.Group();
    devsGroup.position.set(2.4, 0, 0);
    scene.add(devsGroup);

    // Pedestal blocks under characters
    const pedGeo = new THREE.BoxGeometry(3.2, 0.5, 2.2);
    const ownerPedMat = new THREE.MeshStandardMaterial({
      color: '#1b122c',
      emissive: '#ff2a1f',
      emissiveIntensity: 0.18,
      roughness: 0.5,
    });
    const devPedMat = new THREE.MeshStandardMaterial({
      color: '#122229',
      emissive: '#25FF57',
      emissiveIntensity: 0.18,
      roughness: 0.5,
    });

    const ownerPedestal = new THREE.Mesh(pedGeo, ownerPedMat);
    ownerPedestal.position.set(0, -0.25, 0);
    ownersGroup.add(ownerPedestal);

    const devPedestal = new THREE.Mesh(pedGeo, devPedMat);
    devPedestal.position.set(0, -0.25, 0);
    devsGroup.add(devPedestal);

    // Command block seat for Jajo_1121 + Floating Code Cube for godkissed
    const cmdSeat = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.75, 0.75),
      new THREE.MeshStandardMaterial({
        color: '#c77d48',
        emissive: '#ff5500',
        emissiveIntensity: 0.35,
      })
    );
    cmdSeat.position.set(-1.15, 0.38, -0.1);
    devsGroup.add(cmdSeat);

    const codeCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.42, 0.42),
      new THREE.MeshStandardMaterial({
        color: '#8C6CFF',
        emissive: '#25FF57',
        emissiveIntensity: 0.9,
      })
    );
    codeCube.position.set(0.85, 1.55, 0.55);
    devsGroup.add(codeCube);

    const rigs: {
      sa?: PlayerJoints;
      ch?: PlayerJoints;
      ja?: PlayerJoints;
      gk?: PlayerJoints;
    } = {};

    let disposed = false;

    const setupRig = async (
      parentGroup: THREE.Group,
      username: string,
      customUrl?: string,
      slimOverride?: 'auto' | 'classic' | 'slim'
    ): Promise<PlayerJoints | undefined> => {
      const skin = await loadStaffSkin(username, customUrl, slimOverride);
      if (disposed) return undefined;
      const rig = createMinecraftPlayerRig(skin.canvas, skin.isSlim);
      parentGroup.add(rig.joints.root);
      return rig.joints;
    };

    const saitoMember = staff.find((s) => s.name.toLowerCase() === 'saito') || owners[0];
    const chabMember = staff.find((s) => s.name.toLowerCase() === 'chabskeyyy') || owners[1];
    const jajoMember = staff.find((s) => s.name.toLowerCase() === 'jajo_1121') || developers[0];
    const godMember = staff.find((s) => s.name.toLowerCase() === 'godkissed') || developers[1];

    Promise.all([
      saitoMember
        ? setupRig(
            ownersGroup,
            saitoMember.name,
            saitoMember.skinSource !== 'auto' ? saitoMember.customSkinUrl : undefined,
            saitoMember.slimOverride
          )
        : Promise.resolve(undefined),
      chabMember
        ? setupRig(
            ownersGroup,
            chabMember.name,
            chabMember.skinSource !== 'auto' ? chabMember.customSkinUrl : undefined,
            chabMember.slimOverride
          )
        : Promise.resolve(undefined),
      jajoMember
        ? setupRig(
            devsGroup,
            jajoMember.name,
            jajoMember.skinSource !== 'auto' ? jajoMember.customSkinUrl : undefined,
            jajoMember.slimOverride
          )
        : Promise.resolve(undefined),
      godMember
        ? setupRig(
            devsGroup,
            godMember.name,
            godMember.skinSource !== 'auto' ? godMember.customSkinUrl : undefined,
            godMember.slimOverride
          )
        : Promise.resolve(undefined),
    ]).then(([sa, ch, ja, gk]) => {
      rigs.sa = sa;
      rigs.ch = ch;
      rigs.ja = ja;
      rigs.gk = gk;
    });

    const onResize = () => {
      if (!host) return;
      const w = host.clientWidth || 960;
      const h = host.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let timeoutId = 0;

    const scheduleNext = (cb: () => void) => {
      if (isSoftwareGl) {
        timeoutId = window.setTimeout(cb, 250);
      } else {
        frameId = requestAnimationFrame(cb);
      }
    };

    const animate = () => {
      if (disposed) return;
      const dt = Math.min(0.1, clock.getDelta());
      const elapsed = clock.getElapsedTime();

      const cycleDuration = 4.2;
      const idx = Math.floor((elapsed / cycleDuration) % 4);
      const poseKey = POSE_KEYS[idx];
      setActivePoseIndex((prev) => (prev !== idx ? idx : prev));

      if (rigs.sa) {
        applyBlendedPose(rigs.sa, OWNER_LEFT_POSES[poseKey], elapsed, dt, { phaseOffset: 0 });
      }
      if (rigs.ch) {
        applyBlendedPose(rigs.ch, OWNER_RIGHT_POSES[poseKey], elapsed, dt, { phaseOffset: 1.2 });
      }
      if (rigs.ja) {
        applyBlendedPose(rigs.ja, DEV_JAJO_POSE, elapsed, dt, { isTyping: true });
      }
      if (rigs.gk) {
        applyBlendedPose(rigs.gk, DEV_GODKISSED_POSE, elapsed, dt, { isCodeCaster: true });
      }

      codeCube.rotation.x = elapsed * 1.6;
      codeCube.rotation.y = elapsed * 2.1;
      codeCube.position.y = 1.55 + Math.sin(elapsed * 3) * 0.12;

      camera.position.x = Math.sin(elapsed * 0.35) * 0.45;
      camera.position.y = 2.15 + Math.cos(elapsed * 0.5) * 0.1;
      camera.lookAt(0, 1.05, 0);

      renderer.render(scene, camera);
      scheduleNext(animate);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [staff, replayTrigger]);

  const handleReplaySequence = () => {
    audioEngine.playLevelUpDing();
    setReplayTrigger((c) => c + 1);
    if (!mergedToastFiredRef.current) {
      mergedToastFiredRef.current = true;
      addAdvancementToast(
        t.toasts.challengeComplete,
        t.toasts.prMergedTitle,
        t.toasts.prMergedSub,
        'command'
      );
    }
  };

  return (
    <section
      id="staff"
      ref={stageRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mc-panel-dark text-[#ff2a1f] text-xs font-mono uppercase tracking-widest mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>{t.staff.sectionTag}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-wider uppercase">
            {t.staff.sectionTitle}
          </h2>
          <p className="text-zinc-300 mt-2 max-w-2xl text-base sm:text-lg">
            {t.staff.sectionDesc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="mc-panel-dark px-3 py-2 text-xs font-mono text-emerald-400">
            <span className="text-zinc-400 mr-2">{t.staff.poseTimeline}:</span>
            <span className="font-bold">{POSE_NAMES[activePoseIndex]}</span>
          </div>
          <button
            type="button"
            onClick={handleReplaySequence}
            className="mc-btn px-4 py-2.5 text-xs font-display uppercase tracking-wider text-white flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#ffb000]" />
            <span>{t.staff.replayPose}</span>
          </button>
        </div>
      </div>

      {/* Cinematic Non-Draggable 3D Stage */}
      <div className="mc-panel-dark p-3 sm:p-5 relative overflow-hidden mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-black/60 border border-[#ff2a1f]/40 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff2a1f] font-bold">
              <Crown className="w-4 h-4" />
              <span>{t.staff.ownersWing}</span>
            </div>
            <span className="text-[11px] font-mono text-amber-300">Saito &amp; CHABSKEYYY</span>
          </div>

          <div className="bg-black/60 border border-[#25FF57]/40 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#25FF57] font-bold">
              <Terminal className="w-4 h-4" />
              <span>{t.staff.devsWing}</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-300">
              Jajo_1121 &amp; godkissed • BUILD SUCCESS [OK]
            </span>
          </div>
        </div>

        <div className="relative w-full h-[360px] sm:h-[440px] bg-[#090514] border-2 border-[#2a223a] overflow-hidden select-none">
          <div
            ref={canvasHostRef}
            className="w-full h-full pointer-events-none"
            aria-label="3D Minecraft Staff Showcase"
          />

          {/* Floating Minecraft Nametags Overlay */}
          <div className="absolute inset-x-0 top-4 px-4 sm:px-10 grid grid-cols-2 md:grid-cols-4 gap-2 pointer-events-none">
            {staff.slice(0, 4).map((member) => (
              <div
                key={member.id}
                className="bg-black/75 border border-white/20 px-2.5 py-1.5 text-center mx-auto backdrop-blur-xs"
              >
                <div
                  className="text-[11px] font-mono uppercase tracking-wider font-bold"
                  style={{ color: member.color }}
                >
                  [{member.role.toUpperCase()}]
                </div>
                <div className="text-sm font-display text-white tracking-wide">{member.name}</div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-black/80 border border-white/15 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-[#ffb000]" />
              <span>SCRIPTED 3D CHOREOGRAPHY • LIVE MINECRAFT SKINS</span>
            </div>
            <div className="flex items-center gap-1.5">
              {POSE_NAMES.map((poseLabel, idx) => (
                <button
                  key={poseLabel}
                  type="button"
                  onClick={handleReplaySequence}
                  className={`px-2 py-1 text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                    activePoseIndex === idx
                      ? 'bg-[#ff2a1f] text-white font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Holographic STAFF PASS Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {staff.map((member) => {
          const headUrl = skinHeadUrls[member.id];
          const favBlockUrl = getBlockDataUrl(
            (member.favoriteBlock as 'obsidian' | 'ruby_block' | 'command_block' | 'amethyst_block') ||
              'obsidian'
          );

          return (
            <div
              key={member.id}
              className="mc-panel-dark p-5 flex flex-col justify-between relative group hover:border-white/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    {t.staff.staffPass}
                  </span>
                  <span
                    className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase"
                    style={{
                      backgroundColor: `${member.color}22`,
                      color: member.color,
                      border: `1px solid ${member.color}`,
                    }}
                  >
                    {member.roleLocalized[language]}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 mb-4">
                  <div
                    className="w-14 h-14 mc-slot flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ borderColor: member.color }}
                  >
                    {headUrl ? (
                      <img
                        src={headUrl}
                        alt={member.name}
                        className="w-12 h-12 pixelated object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-zinc-800 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-white tracking-wide">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.staff.skinLiveBadge}</span>
                    </div>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed mb-5">
                  {member.bio[language]}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <img
                    src={favBlockUrl}
                    alt={member.favoriteBlock}
                    className="w-5 h-5 pixelated"
                  />
                  <span className="text-zinc-400">{member.favoriteBlock.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-300">
                  <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>@{member.discordTag}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
