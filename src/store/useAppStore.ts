import { useSyncExternalStore } from 'react';
import {
  Announcement,
  AppDatabase,
  CommandMeta,
  Coupon,
  Currency,
  FAQItem,
  Gamemode,
  KitMeta,
  Language,
  QualityMode,
  Rank,
  ServerSettings,
  SimulatedOrder,
  StaffMember,
} from '../data/types';
import { dbProvider } from '../data/provider';
import { audioEngine } from '../lib/audio';

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
type GetState<T> = () => T;

function create<T>(createState: (set: SetState<T>, get: GetState<T>) => T) {
  let state: T;
  const listeners = new Set<() => void>();

  const set: SetState<T> = (partial) => {
    const nextState = typeof partial === 'function' ? (partial as (s: T) => Partial<T>)(state) : partial;
    state = Object.assign({}, state, nextState);
    listeners.forEach((listener) => listener());
  };

  const get: GetState<T> = () => state;
  state = createState(set, get);

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  function useStore(): T;
  function useStore<U>(selector: (s: T) => U): U;
  function useStore<U>(selector?: (s: T) => U): T | U {
    return useSyncExternalStore(
      subscribe,
      () => (selector ? selector(state) : state),
      () => (selector ? selector(state) : state)
    );
  }

  return Object.assign(useStore, { getState: get, setState: set, subscribe });
}

export interface AdvancementToast {
  id: string;
  header: string;
  title: string;
  subtitle?: string;
  icon: 'emerald' | 'amethyst' | 'sapphire' | 'ruby' | 'obsidian' | 'command' | 'heart' | 'xp';
}

export interface ConfettiBurst {
  id: number;
  x: number;
  y: number;
}

interface AppStoreState {
  db: AppDatabase;
  language: Language;
  currency: Currency;
  soundEnabled: boolean;
  qualityMode: QualityMode;
  scrollProgress: number;
  currentBpm: number;
  activeSection: string;
  activeRankId: string;
  checkoutRankId: string | null;
  checkoutUpgradeFromId: string | null;
  isAdminOpen: boolean;
  isAdminAuthenticated: boolean;
  overdriveUnlocked: boolean;
  livePlayersOnline: number;
  liveMaxPlayers: number;
  liveServerOnline: boolean;
  toasts: AdvancementToast[];
  confettiBursts: ConfettiBurst[];

  // Actions
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  toggleSound: () => void;
  setQualityMode: (mode: QualityMode) => void;
  setScrollProgress: (progress: number, bpm: number) => void;
  setActiveSection: (section: string) => void;
  setActiveRankId: (rankId: string) => void;
  openCheckout: (rankId: string, upgradeFromRankId?: string | null) => void;
  closeCheckout: () => void;
  setAdminOpen: (open: boolean) => void;
  setAdminAuthenticated: (auth: boolean) => void;
  triggerOverdrive: () => void;
  setLiveStatus: (online: boolean, players: number, maxPlayers: number) => void;
  addAdvancementToast: (
    header: string,
    title: string,
    subtitle?: string,
    icon?: AdvancementToast['icon']
  ) => void;
  copyIpWithFeedback: (
    headerText: string,
    titleText: string,
    subText: string,
    clientX?: number,
    clientY?: number
  ) => Promise<void>;

  // Admin CRUD actions
  updateSettings: (settings: Partial<ServerSettings>) => void;
  upsertRank: (rank: Rank) => void;
  deleteRank: (rankId: string) => void;
  reorderRanks: (ranks: Rank[]) => void;
  upsertCommandMeta: (cmd: CommandMeta) => void;
  upsertKitMeta: (kit: KitMeta) => void;
  updateGamemode: (gamemode: Gamemode) => void;
  upsertStaff: (member: StaffMember) => void;
  deleteStaff: (id: string) => void;
  upsertFaq: (item: FAQItem) => void;
  deleteFaq: (id: string) => void;
  upsertAnnouncement: (ann: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  upsertCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  recordOrder: (order: Omit<SimulatedOrder, 'id' | 'timestamp'>) => SimulatedOrder;
  importDatabase: (newDb: AppDatabase) => void;
  resetDatabase: () => void;
}

const getInitialLang = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem('adrenalinee_lang');
  return saved === 'ka' ? 'ka' : 'en';
};

const initialDb = dbProvider.load();

export const useAppStore = create<AppStoreState>((set, get) => ({
  db: initialDb,
  language: getInitialLang(),
  currency: 'GEL',
  soundEnabled: false,
  qualityMode: 'auto',
  scrollProgress: 0,
  currentBpm: 80,
  activeSection: 'home',
  activeRankId: initialDb.ranks[2]?.id || initialDb.ranks[0]?.id || 'rank-sapphire',
  checkoutRankId: null,
  checkoutUpgradeFromId: null,
  isAdminOpen: false,
  isAdminAuthenticated: false,
  overdriveUnlocked: false,
  livePlayersOnline: initialDb.settings.fallbackPlayersOnline,
  liveMaxPlayers: initialDb.settings.fallbackMaxPlayers,
  liveServerOnline: true,
  toasts: [],
  confettiBursts: [],

  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('adrenalinee_lang', language);
    }
    set({ language });
  },

  setCurrency: (currency) => {
    set({ currency });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    audioEngine.setEnabled(next);
    set({ soundEnabled: next });
  },

  setQualityMode: (qualityMode) => set({ qualityMode }),

  setScrollProgress: (scrollProgress, currentBpm) => {
    const finalBpm = get().overdriveUnlocked ? 240 : currentBpm;
    audioEngine.setBpm(finalBpm);
    set({ scrollProgress, currentBpm: finalBpm });
  },

  setActiveSection: (activeSection) => set({ activeSection }),

  setActiveRankId: (activeRankId) => set({ activeRankId }),

  openCheckout: (rankId, upgradeFromRankId = null) => {
    audioEngine.playChestOpen();
    set({ checkoutRankId: rankId, checkoutUpgradeFromId: upgradeFromRankId });
  },

  closeCheckout: () => set({ checkoutRankId: null, checkoutUpgradeFromId: null }),

  setAdminOpen: (isAdminOpen) => set({ isAdminOpen }),

  setAdminAuthenticated: (isAdminAuthenticated) => set({ isAdminAuthenticated }),

  triggerOverdrive: () => {
    audioEngine.playLevelUpDing();
    audioEngine.setBpm(240);
    set({ overdriveUnlocked: true, currentBpm: 240 });
  },

  setLiveStatus: (liveServerOnline, livePlayersOnline, liveMaxPlayers) =>
    set({ liveServerOnline, livePlayersOnline, liveMaxPlayers }),

  addAdvancementToast: (header, title, subtitle, icon = 'emerald') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-3), { id, header, title, subtitle, icon }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3800);
  },

  copyIpWithFeedback: async (headerText, titleText, subText, clientX, clientY) => {
    const ip = get().db.settings.serverIp;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(ip);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = ip;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      // Fallback handled
    }

    audioEngine.playCopyBlip();
    get().addAdvancementToast(headerText, titleText, subText, 'xp');

    const x = clientX ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    const y = clientY ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);
    const burstId = Date.now() + Math.random();

    set((state) => ({
      confettiBursts: [...state.confettiBursts, { id: burstId, x, y }],
    }));

    setTimeout(() => {
      set((state) => ({
        confettiBursts: state.confettiBursts.filter((b) => b.id !== burstId),
      }));
    }, 1400);
  },

  updateSettings: (partial) => {
    const db = structuredClone(get().db);
    db.settings = { ...db.settings, ...partial };
    db.auditLog.unshift({
      id: `aud-${Date.now()}`,
      action: 'SETTINGS_UPDATE',
      details: `Updated server settings (${Object.keys(partial).join(', ')})`,
      timestamp: new Date().toISOString(),
    });
    dbProvider.save(db);
    set({ db });
  },

  upsertRank: (rank) => {
    const db = structuredClone(get().db);
    const idx = db.ranks.findIndex((r) => r.id === rank.id);
    if (idx >= 0) {
      db.ranks[idx] = rank;
    } else {
      db.ranks.push(rank);
    }
    db.ranks.sort((a, b) => a.order - b.order);
    db.auditLog.unshift({
      id: `aud-${Date.now()}`,
      action: 'RANK_UPSERT',
      details: `Saved rank ${rank.name} (${rank.priceGEL} GEL)`,
      timestamp: new Date().toISOString(),
    });
    dbProvider.save(db);
    set({ db });
  },

  deleteRank: (rankId) => {
    const db = structuredClone(get().db);
    const target = db.ranks.find((r) => r.id === rankId);
    db.ranks = db.ranks.filter((r) => r.id !== rankId);
    db.auditLog.unshift({
      id: `aud-${Date.now()}`,
      action: 'RANK_DELETE',
      details: `Deleted rank ${target?.name || rankId}`,
      timestamp: new Date().toISOString(),
    });
    dbProvider.save(db);
    set({ db });
  },

  reorderRanks: (ranks) => {
    const db = structuredClone(get().db);
    db.ranks = ranks.map((r, i) => ({ ...r, order: i + 1 }));
    dbProvider.save(db);
    set({ db });
  },

  upsertCommandMeta: (cmd) => {
    const db = structuredClone(get().db);
    db.commandRegistry[cmd.command] = cmd;
    dbProvider.save(db);
    set({ db });
  },

  upsertKitMeta: (kit) => {
    const db = structuredClone(get().db);
    db.kitRegistry[kit.name] = kit;
    dbProvider.save(db);
    set({ db });
  },

  updateGamemode: (gamemode) => {
    const db = structuredClone(get().db);
    const idx = db.gamemodes.findIndex((g) => g.id === gamemode.id);
    if (idx >= 0) {
      db.gamemodes[idx] = gamemode;
    }
    db.auditLog.unshift({
      id: `aud-${Date.now()}`,
      action: 'GAMEMODE_UPDATE',
      details: `Updated gamemode ${gamemode.name}`,
      timestamp: new Date().toISOString(),
    });
    dbProvider.save(db);
    set({ db });
  },

  upsertStaff: (member) => {
    const db = structuredClone(get().db);
    const idx = db.staff.findIndex((s) => s.id === member.id);
    if (idx >= 0) db.staff[idx] = member;
    else db.staff.push(member);
    db.auditLog.unshift({
      id: `aud-${Date.now()}`,
      action: 'STAFF_UPSERT',
      details: `Updated staff member ${member.name} (${member.role})`,
      timestamp: new Date().toISOString(),
    });
    dbProvider.save(db);
    set({ db });
  },

  deleteStaff: (id) => {
    const db = structuredClone(get().db);
    db.staff = db.staff.filter((s) => s.id !== id);
    dbProvider.save(db);
    set({ db });
  },

  upsertFaq: (item) => {
    const db = structuredClone(get().db);
    const idx = db.faq.findIndex((f) => f.id === item.id);
    if (idx >= 0) db.faq[idx] = item;
    else db.faq.push(item);
    dbProvider.save(db);
    set({ db });
  },

  deleteFaq: (id) => {
    const db = structuredClone(get().db);
    db.faq = db.faq.filter((f) => f.id !== id);
    dbProvider.save(db);
    set({ db });
  },

  upsertAnnouncement: (ann) => {
    const db = structuredClone(get().db);
    const idx = db.announcements.findIndex((a) => a.id === ann.id);
    if (idx >= 0) db.announcements[idx] = ann;
    else db.announcements.push(ann);
    dbProvider.save(db);
    set({ db });
  },

  deleteAnnouncement: (id) => {
    const db = structuredClone(get().db);
    db.announcements = db.announcements.filter((a) => a.id !== id);
    dbProvider.save(db);
    set({ db });
  },

  upsertCoupon: (coupon) => {
    const db = structuredClone(get().db);
    const idx = db.coupons.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) db.coupons[idx] = coupon;
    else db.coupons.push(coupon);
    dbProvider.save(db);
    set({ db });
  },

  deleteCoupon: (id) => {
    const db = structuredClone(get().db);
    db.coupons = db.coupons.filter((c) => c.id !== id);
    dbProvider.save(db);
    set({ db });
  },

  recordOrder: (orderData) => {
    const db = structuredClone(get().db);
    const newOrder: SimulatedOrder = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
    };
    db.orders.unshift(newOrder);
    if (orderData.couponCode) {
      const c = db.coupons.find((cp) => cp.code.toUpperCase() === orderData.couponCode?.toUpperCase());
      if (c) c.usageCount += 1;
    }
    db.auditLog.unshift({
      id: `aud-${Date.now()}`,
      action: 'ORDER_CREATED',
      details: `Order ${newOrder.id} by ${newOrder.mcUsername} for ${newOrder.rankName} (${newOrder.amountGEL} GEL)`,
      timestamp: new Date().toISOString(),
    });
    dbProvider.save(db);
    audioEngine.playUnlockFanfare();
    set({ db });
    return newOrder;
  },

  importDatabase: (newDb) => {
    dbProvider.save(newDb);
    set({ db: newDb });
  },

  resetDatabase: () => {
    const fresh = dbProvider.resetToSeed();
    set({ db: fresh });
  },
}));
