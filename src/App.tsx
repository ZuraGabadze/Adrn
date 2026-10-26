import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { TRANSLATIONS } from './i18n/translations';
import { interpolateBpmFromScroll } from './lib/pricing';
import { getBlockDataUrl } from './lib/textures';
import { GlobalVoxelCanvas } from './scenes/GlobalVoxelCanvas';
import { IntroLoader } from './components/IntroLoader';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LiveStatsBar } from './components/LiveStatsBar';
import { GamemodesSection } from './components/GamemodesSection';
import { RanksSection } from './components/RanksSection';
import { StaffShowcase3D } from './components/StaffShowcase3D';
import { WhyAndJoinSections } from './components/WhyAndJoinSections';
import { BuyFlowModal } from './components/BuyFlowModal';
import { AdminPanel } from './admin/AdminPanel';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export default function App() {
  const db = useAppStore((s) => s.db);
  const language = useAppStore((s) => s.language);
  const toasts = useAppStore((s) => s.toasts);
  const confettiBursts = useAppStore((s) => s.confettiBursts);
  const setScrollProgress = useAppStore((s) => s.setScrollProgress);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const setActiveRankId = useAppStore((s) => s.setActiveRankId);
  const setAdminOpen = useAppStore((s) => s.setAdminOpen);
  const triggerOverdrive = useAppStore((s) => s.triggerOverdrive);
  const addAdvancementToast = useAppStore((s) => s.addAdvancementToast);
  const t = TRANSLATIONS[language];

  const [introDone, setIntroDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return true;
    return window.sessionStorage.getItem('adrenalinee_intro_done') === '1';
  });

  const handleIntroComplete = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('adrenalinee_intro_done', '1');
    }
    setIntroDone(true);
  };

  // Scroll progress -> BPM & Active Section tracking
  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      const bpm = interpolateBpmFromScroll(progress);
      setScrollProgress(progress, bpm);

      const sections = ['home', 'gamemodes', 'ranks', 'staff', 'join', 'faq'];
      let current = 'home';
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            current = sec;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [setScrollProgress, setActiveSection]);

  // Deep-link hash routing (#rank-emerald..#rank-obsidian, #admin, #staff, etc.)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      if (hash === 'admin') {
        setAdminOpen(true);
        return;
      }
      const matchedRank = db.ranks.find((r) => r.id === hash || `rank-${r.slug}` === hash);
      if (matchedRank) {
        setActiveRankId(matchedRank.id);
        const el = document.getElementById(matchedRank.id) || document.getElementById('ranks');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const secEl = document.getElementById(hash);
      if (secEl) secEl.scrollIntoView({ behavior: 'smooth' });
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [db.ranks, setActiveRankId, setAdminOpen]);

  // Ctrl+Shift+A Admin Shortcut + Konami Code Overdrive
  useEffect(() => {
    let konamiIdx = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setAdminOpen(true);
        return;
      }
      if (e.key === KONAMI_CODE[konamiIdx]) {
        konamiIdx += 1;
        if (konamiIdx === KONAMI_CODE.length) {
          konamiIdx = 0;
          triggerOverdrive();
          addAdvancementToast(
            t.toasts.challengeComplete,
            t.toasts.konamiTitle,
            t.toasts.konamiSub,
            'obsidian'
          );
        }
      } else {
        konamiIdx = 0;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setAdminOpen, triggerOverdrive, addAdvancementToast, t.toasts]);

  const getToastIconUrl = (icon: string) => {
    switch (icon) {
      case 'amethyst':
        return getBlockDataUrl('amethyst_block');
      case 'sapphire':
        return getBlockDataUrl('sapphire_block');
      case 'ruby':
        return getBlockDataUrl('ruby_block');
      case 'obsidian':
        return getBlockDataUrl('crying_obsidian');
      case 'command':
        return getBlockDataUrl('command_block');
      default:
        return getBlockDataUrl('emerald_block');
    }
  };

  return (
    <div className="min-h-screen bg-[#05030b] text-white relative selection:bg-[#25FF57] selection:text-black">
      {!introDone && <IntroLoader onComplete={handleIntroComplete} />}

      {/* Persistent 3D Minecraft Panorama & Beating Pixel Heart */}
      <GlobalVoxelCanvas />

      {/* Top Bar + Bottom 9-Slot Minecraft Hotbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <LiveStatsBar />
        <GamemodesSection />
        <RanksSection />
        <StaffShowcase3D />
        <WhyAndJoinSections />
      </main>

      {/* Modals */}
      <BuyFlowModal />
      <AdminPanel />

      {/* Top-Right Slide-In Minecraft Advancement Toasts */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2.5 pointer-events-none max-w-xs w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="mc-panel-dark p-3 flex items-center gap-3 shadow-2xl border-2 border-[#ffb000] animate-in fade-in slide-in-from-right-5 duration-200"
          >
            <div className="w-10 h-10 mc-slot flex items-center justify-center shrink-0">
              <img
                src={getToastIconUrl(toast.icon)}
                alt=""
                className="w-7 h-7 pixelated"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-display font-bold text-[#ffff55] leading-tight">
                {toast.header}
              </div>
              <div className="text-xs font-mono font-bold text-white truncate">
                {toast.title}
              </div>
              {toast.subtitle && (
                <div className="text-[11px] font-pixel text-emerald-300 truncate">
                  {toast.subtitle}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Green/Yellow XP Orb Particle Bursts on IP Copy */}
      {confettiBursts.map((burst) => (
        <div
          key={burst.id}
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        >
          {Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            const dist = 45 + (i % 4) * 24;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist - 30;
            return (
              <span
                key={i}
                style={{
                  left: burst.x,
                  top: burst.y,
                  transform: `translate(${tx}px, ${ty}px)`,
                }}
                className={`absolute w-3 h-3 border border-black transition-all duration-700 opacity-0 animate-ping ${
                  i % 2 === 0 ? 'bg-[#37ff2f]' : 'bg-[#ffff55]'
                }`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
