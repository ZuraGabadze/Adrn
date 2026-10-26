import React from 'react';
import { Activity, Users, Layers, Zap, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../i18n/translations';

export const LiveStatsBar: React.FC = () => {
  const db = useAppStore((s) => s.db);
  const language = useAppStore((s) => s.language);
  const livePlayersOnline = useAppStore((s) => s.livePlayersOnline);
  const liveMaxPlayers = useAppStore((s) => s.liveMaxPlayers);
  const t = TRANSLATIONS[language];

  const recentOrders = db.orders.slice(0, 3);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-12">
      <div className="mc-panel-dark p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Stat 1: Online Players */}
        <div className="flex items-center gap-3 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-4">
          <div className="w-10 h-10 mc-slot flex items-center justify-center text-[#25FF57]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400">
              {t.stats.onlinePlayers}
            </div>
            <div className="text-lg font-display font-bold text-white">
              {livePlayersOnline} <span className="text-zinc-500 text-xs">/ {liveMaxPlayers}</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Active Gamemodes */}
        <div className="flex items-center gap-3 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-4">
          <div className="w-10 h-10 mc-slot flex items-center justify-center text-[#008DFF]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400">
              {t.stats.activeMode}
            </div>
            <div className="text-sm font-display font-bold text-white">
              ONEBLOCK <span className="text-[#25FF57]">+</span> SURVIVAL SMP
            </div>
          </div>
        </div>

        {/* Stat 3: TPS Status */}
        <div className="flex items-center gap-3 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-4">
          <div className="w-10 h-10 mc-slot flex items-center justify-center text-[#ffb000]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400">
              {t.stats.tpsStatus}
            </div>
            <div className="text-sm font-mono font-bold text-[#25FF57] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>20.0 TPS • JAVA 1.21</span>
            </div>
          </div>
        </div>

        {/* Stat 4: Recent Store Unlocks */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 mc-slot flex items-center justify-center text-[#8C6CFF] shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-mono uppercase text-zinc-400 mb-1">
              {t.stats.recentBuyers}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentOrders.map((ord) => (
                <span
                  key={ord.id}
                  className="px-2 py-0.5 bg-black/60 border border-white/15 text-[11px] font-mono text-zinc-200 truncate"
                >
                  <strong className="text-white">{ord.mcUsername}</strong> → {ord.rankName} (
                  {ord.amountGEL.toFixed(2)} ₾)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
