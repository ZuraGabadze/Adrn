import React, { useState } from 'react';
import { Layers, Shield, Users, Zap, Coins, Swords, Pickaxe, MapPin } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../i18n/translations';
import { getBlockDataUrl, getCrackStageDataUrl } from '../lib/textures';
import { audioEngine } from '../lib/audio';

const ONEBLOCK_DROPS = [
  'Emerald Ore x3',
  'Enchanted Golden Apple x1',
  'Diamond Pickaxe [Eff V]',
  'Netherite Scrap x2',
  'Amethyst Shard x8',
  'Shulker Shell x2',
  'Crying Obsidian x4',
  'Totem of Undying x1',
];

interface SmpChunk {
  id: string;
  x: number;
  y: number;
  label: { en: string; ka: string };
  owner: string;
  type: 'spawn' | 'claim' | 'shop' | 'warzone';
  block: 'gold_block' | 'emerald_block' | 'sapphire_block' | 'ruby_block' | 'grass_top';
  lore: { en: string; ka: string };
}

const SMP_CHUNKS: SmpChunk[] = [
  {
    id: 'c-spawn',
    x: 1,
    y: 1,
    label: { en: 'Spawn Trade Plaza', ka: 'სპაუნის სავაჭრო მოედანი' },
    owner: 'Server SafeZone',
    type: 'spawn',
    block: 'gold_block',
    lore: {
      en: '0, 0 Capital Hub • Auction House, Crates & Portal Nexus',
      ka: '0, 0 ცენტრალური ჰაბი • აუქციონი, სკივრები და პორტალები',
    },
  },
  {
    id: 'c-shop1',
    x: 0,
    y: 1,
    label: { en: 'Emerald Enchant Mall', ka: 'ზურმუხტის მაღაზია' },
    owner: 'Saito',
    type: 'shop',
    block: 'emerald_block',
    lore: {
      en: 'Player Chest Shop • Selling Mending & Unbreaking III Books',
      ka: 'მოთამაშის მაღაზია • იყიდება Mending და Unbreaking III წიგნები',
    },
  },
  {
    id: 'c-claim1',
    x: 2,
    y: 1,
    label: { en: 'Fortress Claim #14', ka: 'დაცული ბაზა #14' },
    owner: 'CHABSKEYYY',
    type: 'claim',
    block: 'sapphire_block',
    lore: {
      en: 'Protected Land Claim • Anti-Grief Shield Active • Auto-Sorter Farm',
      ka: 'დაცული ტერიტორია • გრიფისგან დაცული • ავტომატური ფერმა',
    },
  },
  {
    id: 'c-war',
    x: 1,
    y: 0,
    label: { en: 'Blood Moon Arena', ka: 'სისხლიანი მთვარის არენა' },
    owner: 'PvP Warzone',
    type: 'warzone',
    block: 'ruby_block',
    lore: {
      en: 'Active PvP Zone • Supply Crates drop every 3 hours!',
      ka: 'აქტიური PvP ზონა • საგანძურის ყუთები ყოველ 3 საათში!',
    },
  },
  {
    id: 'c-claim2',
    x: 1,
    y: 2,
    label: { en: 'Redstone Sky-Factory', ka: 'რედსტოუნ ქარხანა' },
    owner: 'Jajo_1121',
    type: 'claim',
    block: 'grass_top',
    lore: {
      en: '20.0 TPS Optimized Iron & Gold Farm • 2.00x Obsidian Sell Boost',
      ka: '20.0 TPS ოპტიმიზებული რკინისა და ოქროს ფერმა • 2.00x ბუსტი',
    },
  },
];

export const GamemodesSection: React.FC = () => {
  const gamemodes = useAppStore((s) => s.db.gamemodes);
  const language = useAppStore((s) => s.language);
  const addAdvancementToast = useAppStore((s) => s.addAdvancementToast);
  const t = TRANSLATIONS[language];

  const [activeTab, setActiveTab] = useState<'oneblock' | 'smp'>('oneblock');
  const [crackStage, setCrackStage] = useState<number>(-1);
  const [blocksMined, setBlocksMined] = useState<number>(0);
  const [phaseIdx, setPhaseIdx] = useState<number>(0);
  const [lastDrop, setLastDrop] = useState<string>('Emerald Ore x2');
  const [hoveredChunk, setHoveredChunk] = useState<SmpChunk>(SMP_CHUNKS[0]);

  const oneblock = gamemodes.find((g) => g.id === 'oneblock') || gamemodes[0];
  const smp = gamemodes.find((g) => g.id === 'smp') || gamemodes[1];
  const currentMode = activeTab === 'oneblock' ? oneblock : smp;

  const phases = oneblock.phases || [];
  const activePhase = phases[phaseIdx % Math.max(1, phases.length)];

  const handleMineClick = () => {
    const nextCrack = crackStage + 1;
    if (nextCrack < 9) {
      audioEngine.playBlockHit(nextCrack);
      setCrackStage(nextCrack);
    } else {
      // Block broken!
      audioEngine.playBlockBreak();
      const nextTotal = blocksMined + 1;
      setBlocksMined(nextTotal);
      setCrackStage(-1);
      const drop = ONEBLOCK_DROPS[nextTotal % ONEBLOCK_DROPS.length];
      setLastDrop(drop);
      const nextPhase = (phaseIdx + 1) % Math.max(1, phases.length);
      setPhaseIdx(nextPhase);

      if (nextTotal === 1 || nextTotal % 5 === 0) {
        addAdvancementToast(
          t.toasts.advancementMade,
          t.toasts.blockMinedTitle,
          `${drop} (${phases[nextPhase]?.name[language] || ''})`,
          'emerald'
        );
      }
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Coins':
        return <Coins className="w-5 h-5" />;
      default:
        return <Swords className="w-5 h-5" />;
    }
  };

  return (
    <section
      id="gamemodes"
      className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mc-panel-dark text-[#25FF57] text-xs font-mono uppercase tracking-widest mb-3">
            <Pickaxe className="w-3.5 h-3.5" />
            <span>{t.gamemodes.sectionTag}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white uppercase tracking-wider">
            {t.gamemodes.sectionTitle}
          </h2>
          <p className="text-zinc-300 mt-2 max-w-2xl text-base sm:text-lg">
            {t.gamemodes.sectionDesc}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mc-panel p-1.5 flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => {
              audioEngine.playHoverTick();
              setActiveTab('oneblock');
            }}
            className={`px-5 py-2.5 text-xs sm:text-sm font-display font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
              activeTab === 'oneblock'
                ? 'mc-btn text-white border border-[#25FF57]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <img
              src={getBlockDataUrl('grass_top')}
              alt="OneBlock"
              className="w-4 h-4 pixelated"
            />
            <span>{t.gamemodes.oneblockTab}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioEngine.playHoverTick();
              setActiveTab('smp');
            }}
            className={`px-5 py-2.5 text-xs sm:text-sm font-display font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
              activeTab === 'smp'
                ? 'mc-btn text-white border border-[#008DFF]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <img
              src={getBlockDataUrl('sapphire_block')}
              alt="SMP"
              className="w-4 h-4 pixelated"
            />
            <span>{t.gamemodes.smpTab}</span>
          </button>
        </div>
      </div>

      {/* Main Mode Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 7 Columns: Mode Description + Features + Phase Strip / World Specs */}
        <div className="lg:col-span-7 mc-panel-dark p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-3">
              <h3 className="text-2xl sm:text-4xl font-display font-bold text-white">
                {currentMode.name}
              </h3>
              <span className="px-3 py-1 bg-[#25FF57]/15 border border-[#25FF57] text-[#25FF57] text-xs font-mono font-bold">
                JAVA 1.21 • 20.0 TPS
              </span>
            </div>

            <p className="text-amber-300 font-display text-sm sm:text-base uppercase tracking-wide mb-3">
              {currentMode.subtitle[language]}
            </p>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-8">
              {currentMode.description[language]}
            </p>

            {/* 3 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {currentMode.features.map((feat, idx) => (
                <div key={idx} className="mc-slot p-4">
                  <div className="text-[#25FF57] mb-2">{renderIcon(feat.icon)}</div>
                  <h4 className="font-display font-bold text-white text-sm mb-1">
                    {feat.title[language]}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {feat.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Conditional Footer: 6 OneBlock Phases OR SMP World Specs */}
          {activeTab === 'oneblock' && phases.length > 0 ? (
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">
                {t.gamemodes.phasesTitle}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {phases.map((phase, idx) => {
                  const isCurrent = idx === phaseIdx;
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => {
                        audioEngine.playHoverTick();
                        setPhaseIdx(idx);
                        setCrackStage(-1);
                      }}
                      className={`p-2.5 text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isCurrent ? 'mc-slot-active' : 'mc-slot hover:border-white/30'
                      }`}
                    >
                      <img
                        src={getBlockDataUrl(phase.blockTexture)}
                        alt={phase.name[language]}
                        className="w-7 h-7 pixelated shrink-0 mt-0.5"
                      />
                      <div className="min-w-0">
                        <div
                          className="text-xs font-display font-bold truncate"
                          style={{ color: phase.color }}
                        >
                          {phase.name[language]}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {phase.blocksRange} blocks
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            smp.worldSpecs && (
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">
                  {t.gamemodes.worldSpecsTitle}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="mc-slot p-3">
                    <div className="text-[10px] font-mono uppercase text-zinc-400">
                      {t.gamemodes.worldSize}
                    </div>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">
                      {smp.worldSpecs.worldSize}
                    </div>
                  </div>
                  <div className="mc-slot p-3">
                    <div className="text-[10px] font-mono uppercase text-zinc-400">
                      {t.gamemodes.pvpRules}
                    </div>
                    <div className="text-sm font-mono font-bold text-[#ff2a1f] mt-0.5">
                      {smp.worldSpecs.pvpStatus[language]}
                    </div>
                  </div>
                  <div className="mc-slot p-3">
                    <div className="text-[10px] font-mono uppercase text-zinc-400">
                      {t.gamemodes.economy}
                    </div>
                    <div className="text-sm font-mono font-bold text-[#25FF57] mt-0.5">
                      {smp.worldSpecs.economyType[language]}
                    </div>
                  </div>
                  <div className="mc-slot p-3">
                    <div className="text-[10px] font-mono uppercase text-zinc-400">
                      {t.gamemodes.raiding}
                    </div>
                    <div className="text-sm font-mono font-bold text-[#008DFF] mt-0.5">
                      {smp.worldSpecs.raidRules[language]}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Right 5 Columns: Interactive OneBlock Miner OR Isometric SMP Chunk Map */}
        <div className="lg:col-span-5 mc-panel-dark p-6 sm:p-8 flex flex-col justify-between">
          {activeTab === 'oneblock' ? (
            <div className="flex flex-col items-center text-center h-full justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#25FF57] mb-1">
                  {t.gamemodes.mineInteractiveTitle}
                </div>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-6">
                  {t.gamemodes.mineInteractiveHint}
                </p>
              </div>

              {/* Interactive Block with Crack Overlay */}
              <div className="my-4 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleMineClick}
                  className="relative w-36 h-36 sm:w-44 sm:h-44 mc-slot flex items-center justify-center cursor-pointer active:scale-95 transition-transform group shadow-2xl"
                  style={{
                    borderColor: activePhase?.color || '#25FF57',
                    boxShadow: `0 0 35px ${activePhase?.color || '#25FF57'}33`,
                  }}
                >
                  <img
                    src={getBlockDataUrl(activePhase?.blockTexture || 'grass_top')}
                    alt="Mineable OneBlock"
                    className="w-28 h-28 sm:w-36 sm:h-36 pixelated select-none"
                  />
                  {crackStage >= 0 && (
                    <img
                      src={getCrackStageDataUrl(crackStage)}
                      alt={`Crack stage ${crackStage}`}
                      className="absolute inset-3 w-28 h-28 sm:w-36 sm:h-36 pixelated pointer-events-none"
                    />
                  )}
                  <span className="absolute bottom-1.5 right-2 text-[10px] font-mono bg-black/80 px-1.5 py-0.5 text-amber-300">
                    {crackStage < 0 ? 'CLICK TO MINE' : `${Math.round(((crackStage + 1) / 10) * 100)}%`}
                  </span>
                </button>

                {/* Block Health Bar */}
                <div className="w-44 h-2.5 bg-black border border-white/20 mt-4 overflow-hidden">
                  <div
                    className="h-full bg-[#ff2a1f] transition-all duration-75"
                    style={{
                      width: `${crackStage < 0 ? 100 : Math.max(5, 100 - (crackStage + 1) * 10)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Mining Telemetry Readout */}
              <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-left">
                <div className="mc-slot p-2.5">
                  <div className="text-[10px] font-mono text-zinc-400">
                    {t.gamemodes.blocksMined}
                  </div>
                  <div className="text-base font-mono font-bold text-white">{blocksMined}</div>
                </div>
                <div className="mc-slot p-2.5">
                  <div className="text-[10px] font-mono text-zinc-400">
                    {t.gamemodes.currentPhase}
                  </div>
                  <div
                    className="text-xs font-display font-bold truncate"
                    style={{ color: activePhase?.color || '#25FF57' }}
                  >
                    {activePhase?.name[language]}
                  </div>
                </div>
                <div className="mc-slot p-2.5">
                  <div className="text-[10px] font-mono text-zinc-400">
                    {t.gamemodes.lastDrop}
                  </div>
                  <div className="text-xs font-pixel text-emerald-400 truncate">{lastDrop}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#008DFF] mb-1">
                  {t.gamemodes.smpMapTitle}
                </div>
                <p className="text-xs text-zinc-400 mb-6">{t.gamemodes.smpMapHint}</p>

                {/* 3x3 Isometric-Style Chunk Grid */}
                <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto my-4">
                  {[0, 1, 2].map((row) =>
                    [0, 1, 2].map((col) => {
                      const chunk = SMP_CHUNKS.find((c) => c.x === col && c.y === row);
                      const isSelected = chunk && hoveredChunk.id === chunk.id;
                      return (
                        <button
                          key={`${row}-${col}`}
                          type="button"
                          onMouseEnter={() => chunk && setHoveredChunk(chunk)}
                          onClick={() => {
                            if (chunk) {
                              audioEngine.playHoverTick();
                              setHoveredChunk(chunk);
                            }
                          }}
                          className={`aspect-square flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'mc-slot-active scale-105'
                              : 'mc-slot hover:border-white/30'
                          }`}
                        >
                          <img
                            src={getBlockDataUrl(chunk ? chunk.block : 'grass_top')}
                            alt="Chunk"
                            className="w-10 h-10 pixelated mb-1"
                          />
                          <span className="text-[9px] font-mono text-zinc-300 truncate max-w-full">
                            {chunk ? chunk.type.toUpperCase() : 'WILD'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Item-Lore Chunk Inspector Box */}
              <div className="mc-lore-tooltip p-4 mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-sm text-[#25FF57] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{hoveredChunk.label[language]}</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-300">
                    Owner: {hoveredChunk.owner}
                  </span>
                </div>
                <p className="text-xs font-pixel text-purple-200">{hoveredChunk.lore[language]}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
