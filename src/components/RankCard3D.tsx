import React, { useState } from 'react';
import { Copy, ChevronDown, ChevronUp, Sparkles, Package, Terminal, TrendingUp } from 'lucide-react';
import { Rank } from '../data/types';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../i18n/translations';
import { formatPrice, resolveCumulativeRankPerks } from '../lib/pricing';
import { getBlockDataUrl } from '../lib/textures';
import { parseMinecraftText } from '../lib/mcParser';
import { audioEngine } from '../lib/audio';

interface RankCard3DProps {
  rank: Rank;
  isSelected: boolean;
  onSelect: () => void;
}

export const RankCard3D: React.FC<RankCard3DProps> = ({ rank, isSelected, onSelect }) => {
  const db = useAppStore((s) => s.db);
  const language = useAppStore((s) => s.language);
  const currency = useAppStore((s) => s.currency);
  const openCheckout = useAppStore((s) => s.openCheckout);
  const addAdvancementToast = useAppStore((s) => s.addAdvancementToast);
  const t = TRANSLATIONS[language];

  const [showInherited, setShowInherited] = useState(false);
  const [hoveredCmd, setHoveredCmd] = useState<string | null>(null);

  const resolved = resolveCumulativeRankPerks(rank, db.ranks);
  const blockIconUrl = getBlockDataUrl(rank.blockTexture);
  const chestIconUrl = getBlockDataUrl('chest');
  const cmdBlockUrl = getBlockDataUrl('command_block');

  const prefixSpans = parseMinecraftText(rank.chatPrefixRaw, 'Yourname');
  const boostPercent = Math.round((rank.incomeBoost - 1) * 100);
  const boostSegments = Math.min(10, Math.max(1, Math.round(boostPercent / 10)));

  const handleCopyCommand = (e: React.MouseEvent, cmd: string) => {
    e.stopPropagation();
    try {
      navigator.clipboard?.writeText(cmd);
    } catch {
      // ignore
    }
    audioEngine.playCopyBlip();
    addAdvancementToast(
      t.toasts.advancementMade,
      `${t.ranks.commandCopied}: ${cmd}`,
      rank.name,
      'command'
    );
  };

  return (
    <div
      id={rank.id}
      onClick={onSelect}
      className={`mc-panel-dark enchant-glint relative flex flex-col justify-between p-5 sm:p-6 transition-all cursor-pointer ${
        isSelected ? 'ring-2 scale-[1.01]' : 'hover:border-white/30'
      }`}
      style={{
        borderColor: isSelected ? rank.colorPrimary : undefined,
        boxShadow: isSelected ? `0 0 32px ${rank.colorPrimary}33` : undefined,
      }}
    >
      {/* Top Badge + Works On OneBlock & SMP Pill */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            {rank.worksOn.map((mode) => (
              <span
                key={mode}
                className="px-2 py-0.5 bg-black/70 border border-white/15 text-[10px] font-mono text-zinc-300 uppercase"
              >
                {mode}
              </span>
            ))}
          </div>

          {rank.badgeText && (
            <span
              className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${rank.colorPrimary}25`,
                color: rank.colorPrimary,
                border: `1px solid ${rank.colorPrimary}`,
              }}
            >
              {rank.badgeText}
            </span>
          )}
        </div>

        {/* Rank Gem Emblem + Title + Price in GEL (₾) */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 mc-slot flex items-center justify-center shrink-0 relative"
              style={{ borderColor: rank.colorPrimary }}
            >
              <img
                src={blockIconUrl}
                alt={rank.name}
                className="w-10 h-10 pixelated"
              />
              {rank.name === 'OBSIDIAN' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#9b59ff] animate-ping" />
              )}
            </div>
            <div>
              <h3
                className="text-2xl sm:text-3xl font-display font-bold tracking-wider uppercase"
                style={{ color: rank.colorPrimary }}
              >
                {rank.name}
              </h3>
              <p className="text-xs text-zinc-300 line-clamp-1">{rank.tagline[language]}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] font-mono uppercase text-zinc-400">
              {t.ranks.priceLabel}
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {formatPrice(rank.priceGEL, currency, db.settings.gelToUsdRate)}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 uppercase">
              {t.ranks.lifetimeBadge}
            </div>
          </div>
        </div>

        {/* Live Chat Prefix Box */}
        <div className="mb-4">
          <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">
            {t.ranks.chatPrefixLabel}
          </div>
          <div className="bg-black/85 border border-white/15 px-3 py-2 font-pixel text-sm sm:text-base truncate">
            {prefixSpans.map((s, i) => (
              <span
                key={i}
                style={{
                  color: s.color,
                  fontWeight: s.bold ? 700 : 400,
                }}
              >
                {s.text}
              </span>
            ))}
          </div>
        </div>

        {/* Income Boost XP-Style Segmented Gauge */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#37ff2f]" />
              <span>{t.ranks.incomeBoostLabel}</span>
            </span>
            <span className="font-bold text-[#37ff2f]">
              {rank.incomeBoost.toFixed(2)}x (+{boostPercent}%)
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1 bg-black/80 p-1 border border-white/15">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 ${
                  idx < boostSegments ? 'bg-[#37ff2f]' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Inheritance Banner (if rank inherits from lower rank) */}
        {rank.inheritsFrom && (
          <div className="mb-4 bg-white/5 border border-white/10 px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-amber-300">
              [+] {t.ranks.includesTemplate.replace('{rank}', rank.inheritsFrom)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowInherited((prev) => !prev);
              }}
              className="text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1 underline cursor-pointer shrink-0"
            >
              {showInherited ? (
                <>
                  <span>{t.ranks.hideInherited}</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>
                    {t.ranks.showInherited.replace(
                      '{count}',
                      String(resolved.inheritedCommands.length)
                    )}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Rank Commands (Command-Block Chips with Item-Lore Hover Tooltip & Click-to-Copy) */}
        <div className="mb-5">
          <div className="text-xs font-mono uppercase text-zinc-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#ffaa00]" />
              <span>{t.ranks.commandsLabel}</span>
            </span>
            <span className="text-[10px] text-zinc-500">
              {resolved.allCommands.length} total
            </span>
          </div>

          {/* New Commands in this Tier */}
          <div className="flex flex-wrap gap-1.5">
            {resolved.ownCommands.map((cmd) => {
              const meta = db.commandRegistry[cmd];
              return (
                <div key={cmd} className="relative">
                  <button
                    type="button"
                    onClick={(e) => handleCopyCommand(e, cmd)}
                    onMouseEnter={() => setHoveredCmd(cmd)}
                    onMouseLeave={() => setHoveredCmd(null)}
                    className="mc-slot px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-mono text-white hover:border-[#25FF57] cursor-pointer"
                  >
                    <img src={cmdBlockUrl} alt="" className="w-3.5 h-3.5 pixelated" />
                    <span className="font-bold" style={{ color: rank.colorPrimary }}>
                      {cmd}
                    </span>
                    <Copy className="w-3 h-3 text-zinc-500" />
                  </button>

                  {hoveredCmd === cmd && meta && (
                    <div className="absolute bottom-full left-0 mb-2 w-60 mc-lore-tooltip p-2.5 z-30 pointer-events-none">
                      <div className="text-xs font-mono font-bold text-[#25FF57] mb-0.5">
                        {cmd} <span className="text-zinc-400">({ rank.name })</span>
                      </div>
                      <p className="text-xs font-pixel text-purple-200 leading-snug">
                        {meta.description[language]}
                      </p>
                      <div className="text-[10px] font-mono text-amber-300 mt-1">
                        {t.ranks.CopyCommandHint}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expandable Inherited Commands from Lower Ranks */}
          {showInherited && resolved.inheritedCommands.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-wrap gap-1.5">
              {resolved.inheritedCommands.map((item) => (
                <button
                  key={item.command}
                  type="button"
                  onClick={(e) => handleCopyCommand(e, item.command)}
                  className="px-2 py-1 bg-black/60 border border-white/10 text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  title={`${item.fromRankName}: ${
                    db.commandRegistry[item.command]?.description[language] || ''
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 inline-block"
                    style={{ backgroundColor: item.fromRankColor }}
                  />
                  <span>{item.command}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rank Kits (Chest-GUI Tiles; hides empty item list automatically) */}
        <div className="mb-6">
          <div className="text-xs font-mono uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.ranks.kitsLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {rank.kits.map((kitName) => {
              const kitMeta = db.kitRegistry[kitName];
              return (
                <div
                  key={kitName}
                  className="mc-slot px-2.5 py-2 flex items-center gap-2"
                >
                  <img src={chestIconUrl} alt={kitName} className="w-5 h-5 pixelated shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-display font-bold text-white truncate">
                      {kitName} Kit
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 truncate">
                      /kit {kitName.toLowerCase()}
                    </div>
                    {kitMeta && kitMeta.items && kitMeta.items.length > 0 && (
                      <div className="text-[10px] font-pixel text-amber-300 truncate">
                        {kitMeta.items.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Buy / Unlock Rank CTA Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openCheckout(rank.id);
        }}
        className="w-full mc-btn py-3 px-4 font-display font-bold text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer"
        style={{
          borderColor: rank.colorPrimary,
        }}
      >
        <Sparkles className="w-4 h-4" style={{ color: rank.colorPrimary }} />
        <span>
          {t.ranks.buyRankCta} — {formatPrice(rank.priceGEL, currency, db.settings.gelToUsdRate)}
        </span>
      </button>
    </div>
  );
};
