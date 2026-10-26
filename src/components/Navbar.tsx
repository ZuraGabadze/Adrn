import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Copy,
  Shield,
  HelpCircle,
  MessageSquare,
  Globe,
  Home,
  Compass,
  Crown,
  LogIn,
  Users,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../i18n/translations';
import { getBlockDataUrl } from '../lib/textures';
import { audioEngine } from '../lib/audio';

const SECTION_XP_LEVELS: Record<string, number> = {
  home: 1,
  gamemodes: 12,
  ranks: 30,
  staff: 45,
  join: 60,
  faq: 75,
};

export const Navbar: React.FC = () => {
  const db = useAppStore((s) => s.db);
  const language = useAppStore((s) => s.language);
  const currency = useAppStore((s) => s.currency);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const scrollProgress = useAppStore((s) => s.scrollProgress);
  const currentBpm = useAppStore((s) => s.currentBpm);
  const activeSection = useAppStore((s) => s.activeSection);
  const livePlayersOnline = useAppStore((s) => s.livePlayersOnline);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const copyIpWithFeedback = useAppStore((s) => s.copyIpWithFeedback);
  const setAdminOpen = useAppStore((s) => s.setAdminOpen);

  const t = TRANSLATIONS[language];
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const activeAnnouncement = db.announcements.find((a) => a.active);
  const xpLevel = SECTION_XP_LEVELS[activeSection] || Math.max(1, Math.round(scrollProgress * 80));

  const scrollToSection = (id: string) => {
    audioEngine.playHoverTick();
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '#home');
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const hotbarSlots = [
    {
      slot: 1,
      key: 'home',
      label: t.nav.home,
      lore: 'Spawn Hub & Panorama',
      blockIcon: getBlockDataUrl('grass_top'),
      icon: Home,
      onClick: () => scrollToSection('home'),
      isActive: activeSection === 'home',
    },
    {
      slot: 2,
      key: 'gamemodes',
      label: t.nav.gamemodes,
      lore: 'OneBlock & Survival SMP',
      blockIcon: getBlockDataUrl('prismarine'),
      icon: Compass,
      onClick: () => scrollToSection('gamemodes'),
      isActive: activeSection === 'gamemodes',
    },
    {
      slot: 3,
      key: 'ranks',
      label: t.nav.ranks,
      lore: '5 Ranks in GEL (₾)',
      blockIcon: getBlockDataUrl('emerald_block'),
      icon: Crown,
      onClick: () => scrollToSection('ranks'),
      isActive: activeSection === 'ranks',
    },
    {
      slot: 4,
      key: 'join',
      label: t.nav.join,
      lore: 'Java 1.20.4 - 1.21.x Guide',
      blockIcon: getBlockDataUrl('obsidian'),
      icon: LogIn,
      onClick: () => scrollToSection('join'),
      isActive: activeSection === 'join',
    },
    {
      slot: 5,
      key: 'staff',
      label: t.nav.staff,
      lore: '3D Staff Showcase',
      blockIcon: getBlockDataUrl('command_block'),
      icon: Users,
      onClick: () => scrollToSection('staff'),
      isActive: activeSection === 'staff',
    },
    {
      slot: 6,
      key: 'faq',
      label: t.nav.faq,
      lore: 'Frequently Asked Questions',
      blockIcon: getBlockDataUrl('amethyst_block'),
      icon: HelpCircle,
      onClick: () => scrollToSection('faq'),
      isActive: activeSection === 'faq',
    },
    {
      slot: 7,
      key: 'discord',
      label: t.nav.discord,
      lore: 'Join Official Discord',
      blockIcon: getBlockDataUrl('sapphire_block'),
      icon: MessageSquare,
      onClick: () => {
        audioEngine.playHoverTick();
        const el = document.getElementById('footer-discord');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
      isActive: false,
    },
    {
      slot: 8,
      key: 'language',
      label: language === 'en' ? 'EN / KA' : 'KA / EN',
      lore: language === 'en' ? 'Switch to ქართული (KA)' : 'Switch to English (EN)',
      blockIcon: getBlockDataUrl('gold_block'),
      icon: Globe,
      onClick: () => {
        audioEngine.playHoverTick();
        setLanguage(language === 'en' ? 'ka' : 'en');
      },
      isActive: false,
    },
    {
      slot: 9,
      key: 'sound',
      label: soundEnabled ? 'SFX ON' : 'SFX OFF',
      lore: 'Toggle WebAudio Synth SFX',
      blockIcon: getBlockDataUrl('ruby_block'),
      icon: soundEnabled ? Volume2 : VolumeX,
      onClick: () => toggleSound(),
      isActive: soundEnabled,
    },
  ];

  // Number keys 1-9 jump to hotbar slots (unless typing in an input)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        const slotItem = hotbarSlots[num - 1];
        if (slotItem) slotItem.onClick();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <>
      {/* Top Minimal Header Bar + Minecraft Chat Announcement Ticker */}
      <header className="fixed top-0 inset-x-0 z-40 pointer-events-none">
        {activeAnnouncement && (
          <div className="bg-black/85 border-b border-white/15 px-4 py-1.5 text-center pointer-events-auto">
            <a
              href={activeAnnouncement.linkHash || '#ranks'}
              className="text-xs sm:text-sm font-pixel text-emerald-400 hover:text-emerald-300 tracking-wide"
            >
              {activeAnnouncement.text[language]}
            </a>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Top-Left Brand + BPM */}
          <button
            type="button"
            onClick={() => scrollToSection('home')}
            className="pointer-events-auto mc-panel-dark px-3 py-1.5 flex items-center gap-2.5 cursor-pointer group"
          >
            <img
              src={getBlockDataUrl('ruby_block')}
              alt="ADRENALINEE"
              className="w-5 h-5 pixelated"
            />
            <span className="font-display font-bold text-sm sm:text-base tracking-wider text-white group-hover:text-[#ff2a1f] transition-colors">
              ADRENALINEE
            </span>
            <span className="text-[11px] font-mono text-[#ff2a1f] border-l border-white/15 pl-2 flex items-center gap-1">
              <span>♥</span>
              <span>{currentBpm} BPM</span>
            </span>
          </button>

          {/* Top-Right IP Pill + Optional USD Toggle + Admin Button */}
          <div className="pointer-events-auto flex items-center gap-2">
            {db.settings.showUsdToggle && (
              <button
                type="button"
                onClick={() => setCurrency(currency === 'GEL' ? 'USD' : 'GEL')}
                className="mc-panel-dark px-2.5 py-1.5 text-xs font-mono text-amber-300 hover:text-white cursor-pointer"
              >
                {currency === 'GEL' ? '₾ GEL' : '$ USD'}
              </button>
            )}

            <button
              type="button"
              onClick={(e) =>
                copyIpWithFeedback(
                  t.toasts.advancementMade,
                  t.toasts.ipCopiedTitle,
                  t.toasts.ipCopiedSub,
                  e.clientX,
                  e.clientY
                )
              }
              className="mc-btn px-3 py-1.5 text-xs font-mono text-white flex items-center gap-2 cursor-pointer"
            >
              <span className="w-2 h-2 bg-[#25FF57] inline-block" />
              <span className="font-bold">{db.settings.serverIp}</span>
              <Copy className="w-3.5 h-3.5 text-zinc-300" />
            </button>

            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              title="Staff Admin Panel"
              className="mc-panel-dark p-1.5 text-zinc-400 hover:text-white cursor-pointer"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Fixed 9-Slot Minecraft Hotbar + HUD Hearts/Hunger + XP Bar */}
      <nav
        aria-label="Minecraft Hotbar Navigation"
        className="fixed bottom-3 inset-x-0 z-40 flex flex-col items-center pointer-events-none px-2"
      >
        {/* Hover Item-Lore Tooltip above the Hotbar */}
        {hoveredSlot !== null && hotbarSlots[hoveredSlot] && (
          <div className="mc-lore-tooltip px-3 py-1.5 mb-2 text-center pointer-events-none">
            <div className="text-xs font-display font-bold text-[#25FF57]">
              {hotbarSlots[hoveredSlot].label}
            </div>
            <div className="text-[11px] font-pixel text-purple-300">
              {hotbarSlots[hoveredSlot].lore}
            </div>
          </div>
        )}

        {/* HUD Row: 10 Hearts (Left) + XP Level Number (Center) + 10 Hunger Icons (Right) */}
        <div className="w-full max-w-[468px] flex items-end justify-between px-1 mb-1 text-xs font-mono">
          {/* Hearts = Server Uptime / BPM */}
          <div className="flex items-center gap-0.5 text-[#ff2a1f]" title="Server Health: 20.0 TPS">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="text-xs leading-none drop-shadow">
                ♥
              </span>
            ))}
          </div>

          {/* Green XP Level Number */}
          <div
            className="text-sm sm:text-base font-display font-bold text-[#37ff2f] px-2 leading-none"
            style={{ textShadow: '2px 2px 0 #072905, -1px -1px 0 #072905' }}
          >
            {xpLevel}
          </div>

          {/* Hunger Bar = Online Players */}
          <div
            className="flex items-center gap-1 text-amber-400 text-[11px]"
            title="Players Online"
          >
            <span>🍗</span>
            <span className="font-mono font-bold">{livePlayersOnline}</span>
          </div>
        </div>

        {/* Green XP Bar (Scroll Progress) */}
        <div className="w-full max-w-[468px] h-2 bg-[#111c0d] border border-[#070a06] mb-1.5 overflow-hidden">
          <div
            className="h-full bg-[#37ff2f] transition-all duration-100"
            style={{
              width: `${Math.max(4, Math.round(scrollProgress * 100))}%`,
              boxShadow: 'inset 0 1px 0 #a3ff9e',
            }}
          />
        </div>

        {/* 9-Slot Hotbar Frame */}
        <div className="pointer-events-auto mc-panel p-1 flex items-center gap-1 shadow-2xl">
          {hotbarSlots.map((item, idx) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              onMouseEnter={() => setHoveredSlot(idx)}
              onMouseLeave={() => setHoveredSlot(null)}
              className={`relative w-10 h-10 sm:w-12 sm:h-12 flex flex-col items-center justify-center cursor-pointer transition-transform ${
                item.isActive ? 'mc-slot-active -translate-y-0.5' : 'mc-slot hover:bg-[#322d42]'
              }`}
            >
              {/* Top-left slot key number 1-9 */}
              <span className="absolute top-0.5 left-1 text-[9px] font-mono text-zinc-400 leading-none">
                {item.slot}
              </span>

              {/* Pixel Block Icon */}
              <img
                src={item.blockIcon}
                alt={item.label}
                className="w-4 h-4 sm:w-5 sm:h-5 pixelated mb-0.5"
              />

              {/* Short Slot Label */}
              <span className="text-[9px] sm:text-[10px] font-display text-white tracking-tight leading-none truncate max-w-[42px]">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};
