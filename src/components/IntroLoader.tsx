import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../i18n/translations';
import { getBlockDataUrl } from '../lib/textures';
import { audioEngine } from '../lib/audio';

interface IntroLoaderProps {
  onComplete: () => void;
}

export const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
  const language = useAppStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const dirtUrl = getBlockDataUrl('dirt');

  useEffect(() => {
    const tipTimer = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % t.loader.tips.length);
    }, 850);

    const start = performance.now();
    const duration = 1750;
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        frameId = requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 180);
      }
    };

    frameId = requestAnimationFrame(tick);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onComplete();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearInterval(tipTimer);
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onComplete, t.loader.tips.length]);

  const currentBpm = Math.round(70 + (progress / 100) * 110);
  const filledHearts = Math.max(1, Math.ceil((progress / 100) * 10));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 select-none"
      style={{
        backgroundImage: `linear-gradient(rgba(5, 3, 11, 0.78), rgba(5, 3, 11, 0.86)), url(${dirtUrl})`,
        backgroundSize: '64px 64px',
        imageRendering: 'pixelated',
      }}
    >
      <div className="max-w-lg w-full mc-panel-dark p-6 sm:p-8 text-center">
        {/* Server Title */}
        <div className="text-xs font-mono text-[#25FF57] uppercase tracking-widest mb-2">
          ADRENALINEE.RUN • JAVA 1.21
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white uppercase tracking-wider mb-1">
          {t.loader.buildingTerrain}
        </h1>
        <p className="text-sm font-mono text-zinc-400 mb-6">
          {t.loader.loadingChunks} ({progress}%)
        </p>

        {/* 10 Beating Pixel Hearts + BPM Counter */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {Array.from({ length: 10 }).map((_, i) => {
            const active = i < filledHearts;
            return (
              <span
                key={i}
                className={`text-lg transition-transform duration-150 ${
                  active ? 'text-[#ff2a1f] scale-110' : 'text-zinc-700 scale-95'
                }`}
              >
                ♥
              </span>
            );
          })}
          <span className="ml-3 text-xs font-mono font-bold text-[#ff2a1f]">
            {currentBpm} BPM
          </span>
        </div>

        {/* Classic Stepped Minecraft Green Loading Bar */}
        <div className="w-full h-5 bg-[#120d1d] border-2 border-[#3c344f] p-0.5 mb-5">
          <div
            className="h-full bg-[#25FF57] transition-all duration-75"
            style={{
              width: `${progress}%`,
              boxShadow: 'inset 0 2px 0 #7dff9b, inset 0 -2px 0 #0e872b',
            }}
          />
        </div>

        {/* Rotating Minecraft Tip */}
        <p className="text-xs sm:text-sm font-pixel text-amber-300 min-h-[2.5rem] flex items-center justify-center px-2">
          {t.loader.tips[tipIndex]}
        </p>

        {/* Skip Button */}
        <button
          type="button"
          onClick={() => {
            audioEngine.playHoverTick();
            onComplete();
          }}
          className="mt-4 mc-btn px-5 py-2 text-xs font-mono uppercase tracking-wider text-white cursor-pointer"
        >
          {t.loader.skip}
        </button>
      </div>
    </div>
  );
};
