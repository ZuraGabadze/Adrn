import React, { useState } from 'react';
import {
  X,
  Lock,
  Crown,
  Users,
  Settings,
  AlertTriangle,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Rank, StaffMember } from '../data/types';
import { parseMinecraftText } from '../lib/mcParser';
import { dbProvider } from '../data/provider';

export const AdminPanel: React.FC = () => {
  const db = useAppStore((s) => s.db);
  const isAdminOpen = useAppStore((s) => s.isAdminOpen);
  const isAdminAuthenticated = useAppStore((s) => s.isAdminAuthenticated);
  const setAdminOpen = useAppStore((s) => s.setAdminOpen);
  const setAdminAuthenticated = useAppStore((s) => s.setAdminAuthenticated);

  const updateSettings = useAppStore((s) => s.updateSettings);
  const upsertRank = useAppStore((s) => s.upsertRank);
  const upsertStaff = useAppStore((s) => s.upsertStaff);
  const deleteStaff = useAppStore((s) => s.deleteStaff);
  const resetDatabase = useAppStore((s) => s.resetDatabase);

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'ranks' | 'staff' | 'settings' | 'orders'>('ranks');
  const [editingRankId, setEditingRankId] = useState<string>(db.ranks[0]?.id || 'rank-emerald');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  if (!isAdminOpen) return null;

  const notifySaved = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === 'admin') {
      setAdminAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Detect duplicate GEL prices (e.g., RUBY and OBSIDIAN both at 36.99 GEL)
  const priceCounts = db.ranks.reduce<Record<string, string[]>>((acc, r) => {
    const key = r.priceGEL.toFixed(2);
    acc[key] = acc[key] ? [...acc[key], r.name] : [r.name];
    return acc;
  }, {});
  const duplicatePriceGroups = Object.entries(priceCounts).filter(
    ([, names]) => names.length > 1
  );

  const currentRank: Rank =
    db.ranks.find((r) => r.id === editingRankId) || db.ranks[0];

  const handleSkinFileUpload = (member: StaffMember, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        upsertStaff({
          ...member,
          skinSource: 'upload',
          customSkinUrl: reader.result,
        });
        notifySaved(`Uploaded skin PNG for ${member.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="max-w-5xl w-full mc-panel-dark p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-[#ff2a1f]" />
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase">
              ADRENALINEE // ADMIN COMMAND CENTER (v2)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="text-xs font-mono text-[#25FF57] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{savedNotice}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => setAdminOpen(false)}
              className="mc-slot p-1.5 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAdminAuthenticated ? (
          <form onSubmit={handlePinSubmit} className="max-w-sm mx-auto py-12 text-center space-y-4">
            <div className="text-xs font-mono text-zinc-400 uppercase">
              Enter Staff PIN (Default: <strong className="text-white">1234</strong>)
            </div>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full bg-black border-2 border-[#3c344f] px-4 py-3 text-center text-xl font-mono text-white tracking-widest outline-none focus:border-[#25FF57]"
            />
            {pinError && (
              <div className="text-xs font-mono text-[#ff2a1f]">Invalid PIN. Try 1234.</div>
            )}
            <button
              type="submit"
              className="w-full mc-btn py-3 font-display font-bold text-sm uppercase text-white cursor-pointer"
            >
              UNLOCK CONSOLE
            </button>
          </form>
        ) : (
          <div>
            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('ranks')}
                  className={`px-4 py-2 text-xs font-mono uppercase cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ranks' ? 'mc-slot-active text-white' : 'mc-slot text-zinc-400'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-[#ffb000]" />
                  <span>Ranks ({db.ranks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('staff')}
                  className={`px-4 py-2 text-xs font-mono uppercase cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'staff' ? 'mc-slot-active text-white' : 'mc-slot text-zinc-400'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-[#25FF57]" />
                  <span>3D Staff ({db.staff.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 text-xs font-mono uppercase cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'settings'
                      ? 'mc-slot-active text-white'
                      : 'mc-slot text-zinc-400'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-[#008DFF]" />
                  <span>Java &amp; MOTD Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 text-xs font-mono uppercase cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'orders' ? 'mc-slot-active text-white' : 'mc-slot text-zinc-400'
                  }`}
                >
                  <span>Orders ({db.orders.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([dbProvider.exportJson(db)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'adrenalinee-v2-db.json';
                    a.click();
                  }}
                  className="mc-slot px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetDatabase();
                    notifySaved('Reset database to v2 seed data');
                  }}
                  className="mc-slot px-3 py-1.5 text-xs font-mono text-[#ff2a1f] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Seed</span>
                </button>
              </div>
            </div>

            {/* TAB 1: RANKS MANAGER */}
            {activeTab === 'ranks' && currentRank && (
              <div className="space-y-6">
                {/* Inline Warning if two ranks share the exact same GEL price */}
                {duplicatePriceGroups.map(([price, names]) => (
                  <div
                    key={price}
                    className="bg-amber-500/10 border border-amber-400/50 p-3.5 flex items-center gap-3 text-xs font-mono text-amber-200"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Note: <strong>{names.join(' & ')}</strong> are currently both priced at{' '}
                      <strong>{price} ₾</strong>. You can adjust either rank price below if you want
                      tiered pricing.
                    </span>
                  </div>
                ))}

                {/* Rank Selector */}
                <div className="flex flex-wrap gap-2">
                  {db.ranks.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setEditingRankId(r.id)}
                      className={`px-3 py-1.5 text-xs font-display font-bold uppercase cursor-pointer ${
                        editingRankId === r.id ? 'mc-slot-active' : 'mc-slot opacity-75'
                      }`}
                      style={{ color: r.colorPrimary }}
                    >
                      {r.name} ({r.priceGEL.toFixed(2)} ₾)
                    </button>
                  ))}
                </div>

                {/* Rank Editor Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mc-slot p-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Rank Name
                    </label>
                    <input
                      type="text"
                      value={currentRank.name}
                      onChange={(e) => {
                        upsertRank({ ...currentRank, name: e.target.value });
                        notifySaved('Updated rank name');
                      }}
                      className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Price in GEL (₾)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentRank.priceGEL}
                      onChange={(e) => {
                        upsertRank({
                          ...currentRank,
                          priceGEL: parseFloat(e.target.value) || 0,
                        });
                        notifySaved('Updated GEL price');
                      }}
                      className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-[#25FF57]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Income Boost Multiplier (e.g. 1.50)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={currentRank.incomeBoost}
                      onChange={(e) => {
                        upsertRank({
                          ...currentRank,
                          incomeBoost: parseFloat(e.target.value) || 1.0,
                        });
                        notifySaved('Updated income boost');
                      }}
                      className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Raw Minecraft Chat Prefix (Supports #RRGGBB, &amp;#RRGGBB, &amp;0-&amp;f)
                    </label>
                    <input
                      type="text"
                      value={currentRank.chatPrefixRaw}
                      onChange={(e) => {
                        upsertRank({ ...currentRank, chatPrefixRaw: e.target.value });
                        notifySaved('Updated chat prefix');
                      }}
                      className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white"
                    />
                    <div className="mt-2 bg-black/90 p-2 border border-white/10 font-pixel text-sm">
                      {parseMinecraftText(currentRank.chatPrefixRaw, 'Saito').map((s, i) => (
                        <span key={i} style={{ color: s.color }}>
                          {s.text}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      LuckPerms Group ID
                    </label>
                    <input
                      type="text"
                      value={currentRank.luckPermsGroup}
                      onChange={(e) => {
                        upsertRank({ ...currentRank, luckPermsGroup: e.target.value });
                        notifySaved('Updated LuckPerms group');
                      }}
                      className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-amber-300"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Commands (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={currentRank.commands.join(', ')}
                      onChange={(e) => {
                        const cmds = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        upsertRank({ ...currentRank, commands: cmds });
                        notifySaved('Updated rank commands');
                      }}
                      className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 3D STAFF MANAGER */}
            {activeTab === 'staff' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      upsertStaff({
                        id: `staff-${Date.now()}`,
                        name: 'NewStaff',
                        role: 'Developer',
                        roleLocalized: { en: 'Developer', ka: 'დეველოპერი' },
                        bio: {
                          en: 'ADRENALINEE Staff Member.',
                          ka: 'ADRENALINEE-ს გუნდის წევრი.',
                        },
                        color: '#25FF57',
                        discordTag: 'staff.mc',
                        favoriteBlock: 'command_block',
                        skinSource: 'auto',
                        slimOverride: 'auto',
                        posePreset: 'dev_caster',
                        showIn3DShowcase: true,
                      });
                      notifySaved('Added staff member');
                    }}
                    className="mc-btn px-3 py-1.5 text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Staff Member</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {db.staff.map((member) => (
                    <div key={member.id} className="mc-slot p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            upsertStaff({ ...member, name: e.target.value });
                            notifySaved(`Updated ${e.target.value}`);
                          }}
                          className="bg-black border border-white/20 px-2.5 py-1 text-sm font-display font-bold text-white"
                        />
                        <button
                          type="button"
                          onClick={() => deleteStaff(member.id)}
                          className="text-zinc-500 hover:text-[#ff2a1f] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <label className="block text-[10px] text-zinc-400">Role</label>
                          <select
                            value={member.role}
                            onChange={(e) =>
                              upsertStaff({
                                ...member,
                                role: e.target.value as StaffMember['role'],
                              })
                            }
                            className="w-full bg-black border border-white/20 px-2 py-1 text-white"
                          >
                            <option value="Owner">Owner</option>
                            <option value="Developer">Developer</option>
                            <option value="Admin">Admin</option>
                            <option value="Moderator">Moderator</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-zinc-400">3D Pose Preset</label>
                          <select
                            value={member.posePreset}
                            onChange={(e) =>
                              upsertStaff({
                                ...member,
                                posePreset: e.target.value as StaffMember['posePreset'],
                              })
                            }
                            className="w-full bg-black border border-white/20 px-2 py-1 text-white"
                          >
                            <option value="owner_duo_a">Owner Duo A (Saito)</option>
                            <option value="owner_duo_b">Owner Duo B (CHABSKEYYY)</option>
                            <option value="dev_terminal">Dev Terminal Sit</option>
                            <option value="dev_caster">Dev Code Caster</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-xs font-mono">
                        <label className="block text-[10px] text-zinc-400 mb-1">
                          Skin Override (Auto by Username or Upload 64x64 PNG)
                        </label>
                        <input
                          type="file"
                          accept="image/png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSkinFileUpload(member, file);
                          }}
                          className="text-[11px] text-zinc-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: JAVA & MOTD SETTINGS */}
            {activeTab === 'settings' && (
              <div className="mc-slot p-5 space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Java Server IP</label>
                    <input
                      type="text"
                      value={db.settings.serverIp}
                      onChange={(e) => {
                        updateSettings({ serverIp: e.target.value });
                        notifySaved('Updated Server IP');
                      }}
                      className="w-full bg-black border border-white/20 px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Java Version String</label>
                    <input
                      type="text"
                      value={db.settings.javaVersion}
                      onChange={(e) => {
                        updateSettings({ javaVersion: e.target.value });
                        notifySaved('Updated Java Version');
                      }}
                      className="w-full bg-black border border-white/20 px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">GEL to USD Rate</label>
                    <input
                      type="number"
                      step="0.05"
                      value={db.settings.gelToUsdRate}
                      onChange={(e) => {
                        updateSettings({ gelToUsdRate: parseFloat(e.target.value) || 2.7 });
                        notifySaved('Updated GEL rate');
                      }}
                      className="w-full bg-black border border-white/20 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">MOTD Line 1</label>
                  <input
                    type="text"
                    value={db.settings.motdLine1}
                    onChange={(e) => updateSettings({ motdLine1: e.target.value })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">MOTD Line 2</label>
                  <input
                    type="text"
                    value={db.settings.motdLine2}
                    onChange={(e) => updateSettings({ motdLine2: e.target.value })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={db.settings.showUsdToggle}
                      onChange={(e) => updateSettings({ showUsdToggle: e.target.checked })}
                    />
                    <span>Show USD ($) Currency Toggle in Navbar</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: SIMULATED ORDERS LOG */}
            {activeTab === 'orders' && (
              <div className="space-y-2.5 text-xs font-mono">
                {db.orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="mc-slot p-3 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-[#25FF57] font-bold">{ord.id}</span> •{' '}
                      <strong className="text-white">{ord.mcUsername}</strong> → {ord.rankName} (
                      {ord.amountGEL.toFixed(2)} ₾)
                    </div>
                    <code className="text-amber-300 bg-black px-2 py-0.5">
                      /{ord.luckPermsCommand}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
