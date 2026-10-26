export type Language = 'en' | 'ka';
export type Currency = 'GEL' | 'USD';
export type QualityMode = 'auto' | 'high' | 'low';

export interface LocalizedString {
  en: string;
  ka: string;
}

export interface CommandMeta {
  command: string;
  description: LocalizedString;
  cooldown?: string;
}

export interface KitMeta {
  name: string;
  cooldown: string;
  items: string[];
  description?: LocalizedString;
}

export interface Rank {
  id: string;
  slug: string;
  order: number;
  name: string;
  luckPermsGroup: string;
  tagline: LocalizedString;
  lore: LocalizedString;
  priceGEL: number;
  billingType: 'lifetime';
  colorPrimary: string;
  colorSecondary: string;
  bpm: number;
  inheritsFrom?: string;
  chatPrefixRaw: string;
  commands: string[];
  kits: string[];
  incomeBoost: number; // e.g., 1.10, 1.25, 1.50, 1.75, 2.00
  worksOn: ('OneBlock' | 'SMP')[];
  badgeText?: string;
  featured: boolean;
  blockTexture: 'emerald_block' | 'amethyst_block' | 'sapphire_block' | 'ruby_block' | 'obsidian';
}

export interface GamemodePhase {
  id: string;
  name: LocalizedString;
  blocksRange: string;
  color: string;
  blockTexture: 'grass_top' | 'stone' | 'prismarine' | 'nether_bricks' | 'end_stone' | 'crying_obsidian';
  description: LocalizedString;
}

export interface Gamemode {
  id: 'oneblock' | 'smp';
  name: string;
  subtitle: LocalizedString;
  description: LocalizedString;
  features: {
    title: LocalizedString;
    description: LocalizedString;
    icon: string;
  }[];
  phases?: GamemodePhase[];
  worldSpecs?: {
    worldSize: string;
    pvpStatus: LocalizedString;
    economyType: LocalizedString;
    raidRules: LocalizedString;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Owner' | 'Developer' | 'Admin' | 'Moderator' | 'Helper';
  roleLocalized: LocalizedString;
  bio: LocalizedString;
  color: string;
  discordTag: string;
  favoriteBlock: string;
  skinSource: 'auto' | 'url' | 'upload';
  customSkinUrl?: string;
  slimOverride?: 'auto' | 'classic' | 'slim';
  posePreset: 'owner_duo_a' | 'owner_duo_b' | 'dev_terminal' | 'dev_caster';
  showIn3DShowcase: boolean;
}

export interface FAQItem {
  id: string;
  question: LocalizedString;
  answer: LocalizedString;
  category: 'general' | 'ranks' | 'gameplay';
}

export interface Announcement {
  id: string;
  text: LocalizedString;
  active: boolean;
  type: 'info' | 'sale' | 'event' | 'alert';
  linkHash?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAt: string;
  usageCount: number;
}

export interface SimulatedOrder {
  id: string;
  mcUsername: string;
  edition: 'Java';
  rankId: string;
  rankName: string;
  luckPermsGroup: string;
  upgradeFromRankId?: string;
  couponCode?: string;
  amountGEL: number;
  amountUSD: number;
  currencyUsed: Currency;
  luckPermsCommand: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ServerSettings {
  serverName: string;
  tagline: LocalizedString;
  serverIp: string;
  javaVersion: string;
  discordInvite: string;
  storeEnabled: boolean;
  gelToUsdRate: number; // e.g., 2.70 GEL = 1 USD
  showUsdToggle: boolean; // OFF by default in v2
  enableUpgradeCalculator: boolean;
  globalSalePercent: number;
  maintenanceMode: boolean;
  fallbackPlayersOnline: number;
  fallbackMaxPlayers: number;
  motdLine1: string;
  motdLine2: string;
  adminPinHash: string;
}

export interface AppDatabase {
  settings: ServerSettings;
  ranks: Rank[];
  commandRegistry: Record<string, CommandMeta>;
  kitRegistry: Record<string, KitMeta>;
  gamemodes: Gamemode[];
  staff: StaffMember[];
  faq: FAQItem[];
  announcements: Announcement[];
  coupons: Coupon[];
  orders: SimulatedOrder[];
  auditLog: AuditLogEntry[];
}
