import React, { useEffect, useState } from 'react';
import { Copy, Sparkles, ChevronDown, Terminal } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../i18n/translations';
import { generateServerIconDataUrl } from '../lib/textures';
import { parseMinecraftText } from '../lib/mcParser';

export const HeroSection: React.FC = () => {
  const db = useAppStore((s) => s.db);
  const language = useAppStore((s) => s.language);
  const currentBpm = useAppStore((s) => s.currentBpm);
  const livePlayersOnline = useAppStore((s) => s.livePlayersOnline);
  const liveMaxPlayers = useAppStore((s) => s.liveMaxPlayers);
  const liveServerOnline = useAppStore((s) => s.liveServerOnline);
  const setLiveStatus = useAppStore((s) => s.setLiveStatus);
  const copyIpWithFeedback = useAppStore((s) => s.copyIpWithFeedback);

  const t = TRANSLATIONS[language];
  const [splashIdx, setSplashIdx] = useState(0);
  const serverIconUrl = generateServerIconDataUrl();

  // Rotate yellow splash text every 4.5s
  useEffect(() => {
    const id = window.setInterval(() => {
      setSplashIdx((prev) => (prev + 1) % t.hero.splashes.length);
    }, 4500);
    return () => clearInterval(id);
  }, [t.hero.splashes.length]);

  // Poll mcsrvstat.us for live Java server status with graceful fallback
  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const res = await fetch(`https://api.mcsrvstat.us/3/${db.settings.serverIp}`);
        if (!res.ok) return;
        const data = await res.json();
        if (active && data && typeof data.online === 'boolean') {
          const onlineCount =
            data.online && data.players?.online > 0
              ? data.players.online
              : db.settings.fallbackPlayersOnline;
          const maxCount = data.players?.max || db.settings.fallbackMaxPlayers;
          setLiveStatus(true, onlineCount, maxCount);
        }
      } catch {
        // Keep seeded fallback counts
      }
    };
    checkStatus();
    return () => {
      active = false;
    };
  }, [
    db.settings.serverIp,
    db.settings.fallbackPlayersOnline,
    db.settings.fallbackMaxPlayers,
    setLiveStatus,
  ]);

  const motdSpans1 = parseMinecraftText(db.settings.motdLine1);
  const motdSpans2 = parseMinecraftText(db.settings.motdLine2);

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32 px-4 sm:px-6 lg:px-8 z-10"
    >
      <div className="max-w-4xl w-full text-center flex flex-col items-center">
        {/* Java Edition Badge */}
        <div className="mc-panel-dark px-4 py-1.5 mb-6 inline-flex items-center gap-2 text-xs font-mono text-[#25FF57] uppercase tracking-widest">
          <Terminal className="w-3.5 h-3.5" />
          <span>{t.hero.javaBadge}</span>
        </div>

        {/* Blocky Minecraft Title + Yellow Pulsing Splash Text */}
        <div className="relative inline-block mb-6">
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-display font-bold tracking-wider text-white uppercase select-none"
            style={{
              textShadow:
                '0 4px 0 #3d0909, 0 8px 0 #1a0305, 0 0 36px rgba(255, 42, 31, 0.55)',
            }}
          >
            {db.settings.serverName}
          </h1>

          {/* Classic Yellow Tilted Splash Text */}
          <div className="hidden sm:block absolute -right-10 -bottom-3 mc-splash font-pixel text-lg md:text-2xl font-bold pointer-events-none whitespace-nowrap">
            {t.hero.splashes[splashIdx]}
          </div>
        </div>

        {/* Tagline & Subtitle */}
        <p className="text-lg sm:text-xl font-display text-[#ffb000] uppercase tracking-widest mb-2">
          {db.settings.tagline[language]}
        </p>
        <p className="text-zinc-300 max-w-2xl text-sm sm:text-base mb-8">
          {t.hero.subtitle}
        </p>

        {/* Authentic Minecraft Multiplayer Server-List Slot Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={(e) =>
            copyIpWithFeedback(
              t.toasts.advancementMade,
              t.toasts.ipCopiedTitle,
              t.toasts.ipCopiedSub,
              e.clientX,
              e.clientY
            )
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              copyIpWithFeedback(
                t.toasts.advancementMade,
                t.toasts.ipCopiedTitle,
                t.toasts.ipCopiedSub
              );
            }
          }}
          className="w-full max-w-2xl mc-panel-dark p-3 sm:p-4 mb-8 text-left cursor-pointer group hover:border-[#25FF57] transition-all"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2 border-b border-white/10 pb-1.5">
            <span>{t.hero.serverStatus} — {db.settings.javaVersion}</span>
            <span className="text-[#25FF57] group-hover:underline">{t.hero.clickToCopy}</span>
          </div>

          <div className="flex items-start gap-3.5 bg-black/75 border-2 border-[#2b2638] p-2.5">
            {/* 64x64 Procedural Server Icon */}
            <img
              src={serverIconUrl}
              alt="Server Icon"
              className="w-14 h-14 sm:w-16 sm:h-16 pixelated shrink-0 border border-white/20"
            />

            {/* Server Entry Header + 2-Line Color-Coded MOTD */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="font-display font-bold text-white text-sm sm:text-base truncate">
                  {db.settings.serverName} Network ({db.settings.serverIp})
                </div>

                {/* Player Count + 5 Green Signal Bars */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs sm:text-sm text-zinc-200">
                    {livePlayersOnline}
                    <span className="text-zinc-500">/</span>
                    {liveMaxPlayers}
                  </span>
                  <div
                    className="flex items-end gap-0.5 h-3.5"
                    title={liveServerOnline ? t.hero.pingLabel : 'Offline'}
                  >
                    {[4, 6, 9, 12, 14].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: `${h}px` }}
                        className="w-1 bg-[#25FF57] inline-block"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* MOTD Line 1 */}
              <div className="font-pixel text-sm sm:text-base leading-snug truncate">
                {motdSpans1.map((span, idx) => (
                  <span
                    key={idx}
                    style={{
                      color: span.color,
                      fontWeight: span.bold ? 700 : 400,
                      fontStyle: span.italic ? 'italic' : 'normal',
                      textDecoration: [
                        span.underlined ? 'underline' : '',
                        span.strikethrough ? 'line-through' : '',
                      ]
                        .filter(Boolean)
                        .join(' '),
                    }}
                  >
                    {span.text}
                  </span>
                ))}
              </div>

              {/* MOTD Line 2 */}
              <div className="font-pixel text-sm sm:text-base leading-snug truncate">
                {motdSpans2.map((span, idx) => (
                  <span
                    key={idx}
                    style={{
                      color: span.color,
                      fontWeight: span.bold ? 700 : 400,
                      fontStyle: span.italic ? 'italic' : 'normal',
                    }}
                  >
                    {span.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
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
            className="mc-btn px-6 py-3.5 text-sm sm:text-base font-display font-bold text-white uppercase tracking-wider flex items-center gap-2.5 cursor-pointer border border-[#ff2a1f]"
          >
            <Copy className="w-4 h-4 text-[#25FF57]" />
            <span>{t.hero.copyIpCta}</span>
          </button>

          <a
            href="#ranks"
            className="mc-panel-dark px-6 py-3.5 text-sm sm:text-base font-display font-bold text-[#25FF57] hover:text-white uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.hero.exploreRanksCta}</span>
          </a>
        </div>

        {/* Scroll Indicator + Heart Rate */}
        <div className="mt-10 flex items-center gap-3 text-xs font-mono text-zinc-400">
          <span className="text-[#ff2a1f] font-bold">♥ {currentBpm} BPM</span>
          <span>•</span>
          <span>{t.hero.scrollPrompt}</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#25FF57]" />
        </div>
      </div>
    </section>
  );
};
