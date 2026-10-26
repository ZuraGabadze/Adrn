import React, { useState } from 'react';
import {
  Crown,
  Calculator,
  MessageSquare,
  ArrowUpRight,
  Search,
  Table,
  Copy,
  Check,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../i18n/translations';
import { RankCard3D } from './RankCard3D';
import {
  calculateUpgradeDifferenceGEL,
  formatPrice,
  resolveCumulativeRankPerks,
} from '../lib/pricing';
import { parseMinecraftText } from '../lib/mcParser';
import { getBlockDataUrl } from '../lib/textures';
import { audioEngine } from '../lib/audio';

export const RanksSection: React.FC = () => {
  const db = useAppStore((s) => s.db);
  const language = useAppStore((s) => s.language);
  const currency = useAppStore((s) => s.currency);
  const activeRankId = useAppStore((s) => s.activeRankId);
  const setActiveRankId = useAppStore((s) => s.setActiveRankId);
  const openCheckout = useAppStore((s) => s.openCheckout);
  const addAdvancementToast = useAppStore((s) => s.addAdvancementToast);
  const t = TRANSLATIONS[language];

  const sortedRanks = [...db.ranks].sort((a, b) => a.order - b.order);
  const activeRank = sortedRanks.find((r) => r.id === activeRankId) || sortedRanks[0];

  // Interactive Tools State
  const [baseHourlyCoins, setBaseHourlyCoins] = useState<number>(1000);
  const [previewUsername, setPreviewUsername] = useState<string>('Saito');
  const [showAllChatRanks, setShowAllChatRanks] = useState<boolean>(true);
  const [upgradeFromId, setUpgradeFromId] = useState<string>(sortedRanks[0]?.id || 'rank-emerald');
  const [upgradeToId, setUpgradeToId] = useState<string>(
    sortedRanks[sortedRanks.length - 1]?.id || 'rank-obsidian'
  );
  const [cmdSearch, setCmdSearch] = useState<string>('');
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  const fromRank = sortedRanks.find((r) => r.id === upgradeFromId) || sortedRanks[0];
  const toRank =
    sortedRanks.find((r) => r.id === upgradeToId) || sortedRanks[sortedRanks.length - 1];
  const upgradeDiffGEL =
    fromRank && toRank ? calculateUpgradeDifferenceGEL(fromRank, toRank) : 0;

  // Build searchable list of all 18 commands mapped to their lowest unlocking rank
  const allCommandEntries = Object.values(db.commandRegistry).map((meta) => {
    const unlockRank =
      sortedRanks.find((r) => r.commands.includes(meta.command)) || sortedRanks[0];
    return {
      ...meta,
      unlockRank,
    };
  });

  const filteredCommands = allCommandEntries.filter((entry) => {
    const q = cmdSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      entry.command.toLowerCase().includes(q) ||
      entry.description.en.toLowerCase().includes(q) ||
      entry.description.ka.toLowerCase().includes(q) ||
      entry.unlockRank.name.toLowerCase().includes(q)
    );
  });

  return (
    <section
      id="ranks"
      className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mc-panel-dark text-[#ffb000] text-xs font-mono uppercase tracking-widest mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>{t.ranks.sectionTag}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white uppercase tracking-wider">
            {t.ranks.sectionTitle}
          </h2>
          <p className="text-zinc-300 mt-2 max-w-2xl text-base sm:text-lg">
            {t.ranks.sectionDesc}
          </p>
        </div>

        {/* Quick Rank Jump Pills */}
        <div className="flex flex-wrap gap-2">
          {sortedRanks.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                audioEngine.playHoverTick();
                setActiveRankId(r.id);
                window.history.replaceState(null, '', `#${r.id}`);
              }}
              className={`px-3 py-1.5 text-xs font-display font-bold uppercase cursor-pointer transition-all flex items-center gap-1.5 ${
                activeRank?.id === r.id ? 'mc-slot-active' : 'mc-slot opacity-80 hover:opacity-100'
              }`}
              style={{ color: r.colorPrimary }}
            >
              <img
                src={getBlockDataUrl(r.blockTexture)}
                alt={r.name}
                className="w-3.5 h-3.5 pixelated"
              />
              <span>{r.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5 Rank Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
        {sortedRanks.map((rank) => (
          <RankCard3D
            key={rank.id}
            rank={rank}
            isSelected={activeRank?.id === rank.id}
            onSelect={() => {
              audioEngine.playHoverTick();
              setActiveRankId(rank.id);
              window.history.replaceState(null, '', `#${rank.id}`);
            }}
          />
        ))}
      </div>

      {/* Interactive Minecraft Rank Lab: Chat Preview + Income Boost Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 1. Authentic Minecraft Chat Box Replica */}
        <div className="mc-panel-dark p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-white uppercase">
              <MessageSquare className="w-4 h-4 text-[#25FF57]" />
              <span>{t.ranks.chatPreviewTitle}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowAllChatRanks((prev) => !prev)}
              className="mc-slot px-2.5 py-1 text-[11px] font-mono text-amber-300 hover:text-white cursor-pointer"
            >
              {showAllChatRanks ? t.ranks.chatPreviewSingle : t.ranks.chatPreviewShowAll}
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              maxLength={16}
              value={previewUsername}
              onChange={(e) => setPreviewUsername(e.target.value)}
              placeholder={t.ranks.chatPreviewInputPlaceholder}
              className="w-full bg-black/80 border-2 border-[#3c344f] px-3 py-2 text-sm font-mono text-white focus:border-[#25FF57] outline-none"
            />
          </div>

          {/* Semi-transparent black Minecraft chat window */}
          <div className="bg-black/85 border-2 border-[#241c35] p-4 space-y-2 font-pixel text-base sm:text-lg">
            {(showAllChatRanks ? sortedRanks : activeRank ? [activeRank] : []).map((r) => {
              const spans = parseMinecraftText(
                r.chatPrefixRaw,
                previewUsername.trim() || 'Yourname'
              );
              return (
                <div key={r.id} className="leading-snug truncate">
                  {spans.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        color: s.color,
                        fontWeight: s.bold ? 700 : 400,
                      }}
                    >
                      {s.text}
                    </span>
                  ))}
                  <span className="text-zinc-400"> » </span>
                  <span className="text-white">GG! Joining OneBlock &amp; SMP!</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Interactive Income Boost Calculator */}
        <div className="mc-panel-dark p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm font-display font-bold text-white uppercase">
                <Calculator className="w-4 h-4 text-[#37ff2f]" />
                <span>{t.ranks.incomeCalcTitle}</span>
              </div>
              <span className="text-xs font-mono text-[#37ff2f] font-bold">
                1.10x → 2.00x
              </span>
            </div>

            <label className="block text-xs font-mono text-zinc-400 mb-2">
              {t.ranks.incomeCalcBaseLabel}:{' '}
              <strong className="text-white">{baseHourlyCoins.toLocaleString()}</strong>{' '}
              {t.ranks.incomeCalcPerHour}
            </label>
            <input
              type="range"
              min={200}
              max={10000}
              step={100}
              value={baseHourlyCoins}
              onChange={(e) => setBaseHourlyCoins(Number(e.target.value))}
              className="w-full accent-[#25FF57] cursor-pointer mb-5"
            />

            <div className="space-y-2.5">
              {sortedRanks.map((r) => {
                const boosted = Math.round(baseHourlyCoins * r.incomeBoost);
                const bonus = boosted - baseHourlyCoins;
                return (
                  <div
                    key={r.id}
                    className="mc-slot px-3 py-2 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={getBlockDataUrl(r.blockTexture)}
                        alt={r.name}
                        className="w-4 h-4 pixelated"
                      />
                      <span className="font-bold" style={{ color: r.colorPrimary }}>
                        {r.name}
                      </span>
                      <span className="text-zinc-400">({r.incomeBoost.toFixed(2)}x)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">
                        {boosted.toLocaleString()} {t.ranks.incomeCalcPerHour}
                      </span>
                      <span className="text-[#37ff2f] ml-2">
                        (+{bonus.toLocaleString()})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Rank Upgrade Calculator + Command Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Upgrade Calculator (5 cols) */}
        {db.settings.enableUpgradeCalculator && (
          <div className="lg:col-span-5 mc-panel-dark p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-display font-bold text-white uppercase mb-4">
                <ArrowUpRight className="w-4 h-4 text-[#ffb000]" />
                <span>{t.ranks.upgradeCalcTitle}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    {t.ranks.upgradeFromLabel}
                  </label>
                  <select
                    value={upgradeFromId}
                    onChange={(e) => setUpgradeFromId(e.target.value)}
                    className="w-full bg-black border-2 border-[#3c344f] px-3 py-2 text-xs font-mono text-white"
                  >
                    {sortedRanks.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.priceGEL.toFixed(2)} ₾)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    {t.ranks.upgradeToLabel}
                  </label>
                  <select
                    value={upgradeToId}
                    onChange={(e) => setUpgradeToId(e.target.value)}
                    className="w-full bg-black border-2 border-[#3c344f] px-3 py-2 text-xs font-mono text-white"
                  >
                    {sortedRanks.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.priceGEL.toFixed(2)} ₾)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mc-slot p-4 mb-5 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    {t.ranks.upgradePayDiff}
                  </div>
                  <div className="text-xs font-mono text-zinc-300 mt-0.5">
                    {fromRank?.name} → {toRank?.name}
                  </div>
                </div>
                <div className="text-2xl font-mono font-bold text-[#25FF57]">
                  {formatPrice(upgradeDiffGEL, currency, db.settings.gelToUsdRate)}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={!toRank || !fromRank || toRank.order <= fromRank.order}
              onClick={() => toRank && fromRank && openCheckout(toRank.id, fromRank.id)}
              className="w-full mc-btn py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-white disabled:opacity-40 cursor-pointer"
            >
              {t.ranks.upgradeNowCta} ({formatPrice(upgradeDiffGEL, currency, db.settings.gelToUsdRate)})
            </button>
          </div>
        )}

        {/* Command Explorer (7 cols) */}
        <div
          className={`${
            db.settings.enableUpgradeCalculator ? 'lg:col-span-7' : 'lg:col-span-12'
          } mc-panel-dark p-6`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-white uppercase">
              <Search className="w-4 h-4 text-[#008DFF]" />
              <span>{t.ranks.commandExplorerTitle}</span>
            </div>

            <input
              type="text"
              value={cmdSearch}
              onChange={(e) => setCmdSearch(e.target.value)}
              placeholder={t.ranks.commandExplorerSearch}
              className="bg-black/80 border-2 border-[#3c344f] px-3 py-1.5 text-xs font-mono text-white focus:border-[#008DFF] outline-none sm:w-64"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {filteredCommands.map((item) => (
              <button
                key={item.command}
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(item.command);
                  audioEngine.playCopyBlip();
                  addAdvancementToast(
                    t.toasts.advancementMade,
                    `${t.ranks.commandCopied}: ${item.command}`,
                    item.unlockRank.name,
                    'command'
                  );
                }}
                className="mc-slot p-2.5 text-left hover:border-white/30 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="font-mono font-bold text-xs"
                    style={{ color: item.unlockRank.colorPrimary }}
                  >
                    {item.command}
                  </span>
                  <span
                    className="px-1.5 py-0.5 text-[9px] font-mono uppercase"
                    style={{
                      backgroundColor: `${item.unlockRank.colorPrimary}20`,
                      color: item.unlockRank.colorPrimary,
                    }}
                  >
                    {item.unlockRank.name}+
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-snug">
                  {item.description[language]}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable Full Comparison Matrix */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            audioEngine.playHoverTick();
            setShowMatrix((prev) => !prev);
          }}
          className="mc-btn px-6 py-3 text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-white inline-flex items-center gap-2 cursor-pointer"
        >
          <Table className="w-4 h-4 text-[#25FF57]" />
          <span>{showMatrix ? t.ranks.hideCompareCta : t.ranks.compareAllCta}</span>
        </button>
      </div>

      {showMatrix && (
        <div className="mt-8 mc-panel-dark p-4 sm:p-6 overflow-x-auto">
          <h3 className="text-lg font-display font-bold text-white uppercase mb-4">
            {t.ranks.featureMatrix}
          </h3>
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-white/15 text-xs font-mono">
                <th className="py-3 px-3 text-zinc-400">COMMAND / PERK</th>
                {sortedRanks.map((r) => (
                  <th
                    key={r.id}
                    className="py-3 px-3 text-center font-bold"
                    style={{ color: r.colorPrimary }}
                  >
                    <div>{r.name}</div>
                    <div className="text-[11px] text-white font-normal">
                      {formatPrice(r.priceGEL, currency, db.settings.gelToUsdRate)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs font-mono">
              <tr>
                <td className="py-2.5 px-3 text-zinc-300 font-bold">
                  {t.ranks.incomeBoostLabel}
                </td>
                {sortedRanks.map((r) => (
                  <td key={r.id} className="py-2.5 px-3 text-center text-[#37ff2f] font-bold">
                    {r.incomeBoost.toFixed(2)}x
                  </td>
                ))}
              </tr>
              {allCommandEntries.map((cmdItem) => (
                <tr key={cmdItem.command} className="hover:bg-white/5">
                  <td className="py-2 px-3 text-white">
                    <span className="font-bold text-amber-300">{cmdItem.command}</span>
                    <span className="block text-[10px] text-zinc-400">
                      {cmdItem.description[language]}
                    </span>
                  </td>
                  {sortedRanks.map((r) => {
                    const resolved = resolveCumulativeRankPerks(r, sortedRanks);
                    const hasCmd = resolved.allCommands.includes(cmdItem.command);
                    return (
                      <td key={r.id} className="py-2 px-3 text-center">
                        {hasCmd ? (
                          <Check
                            className="w-4 h-4 mx-auto"
                            style={{ color: r.colorPrimary }}
                          />
                        ) : (
                          <span className="text-zinc-700">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
