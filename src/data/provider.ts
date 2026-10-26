import { AppDatabase } from './types';
import { SEED_DATABASE } from './seed';

const STORAGE_KEY = 'adrenalinee_db_v5_mc';

export class LocalStorageDatabaseProvider {
  public load(): AppDatabase {
    if (typeof window === 'undefined') {
      return structuredClone(SEED_DATABASE);
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = structuredClone(SEED_DATABASE);
        this.save(initial);
        return initial;
      }
      const parsed = JSON.parse(raw) as Partial<AppDatabase>;
      return {
        settings: { ...SEED_DATABASE.settings, ...(parsed.settings || {}) },
        commandRegistry: { ...SEED_DATABASE.commandRegistry, ...(parsed.commandRegistry || {}) },
        kitRegistry: { ...SEED_DATABASE.kitRegistry, ...(parsed.kitRegistry || {}) },
        ranks: Array.isArray(parsed.ranks) && parsed.ranks.length > 0 ? parsed.ranks : SEED_DATABASE.ranks,
        gamemodes:
          Array.isArray(parsed.gamemodes) && parsed.gamemodes.length > 0
            ? parsed.gamemodes
            : SEED_DATABASE.gamemodes,
        staff: Array.isArray(parsed.staff) && parsed.staff.length > 0 ? parsed.staff : SEED_DATABASE.staff,
        faq: Array.isArray(parsed.faq) && parsed.faq.length > 0 ? parsed.faq : SEED_DATABASE.faq,
        announcements: Array.isArray(parsed.announcements) ? parsed.announcements : SEED_DATABASE.announcements,
        coupons: Array.isArray(parsed.coupons) ? parsed.coupons : SEED_DATABASE.coupons,
        orders: Array.isArray(parsed.orders) ? parsed.orders : SEED_DATABASE.orders,
        auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : SEED_DATABASE.auditLog,
      };
    } catch {
      return structuredClone(SEED_DATABASE);
    }
  }

  public save(db: AppDatabase): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (err) {
      console.error('Failed to persist ADRENALINEE DB:', err);
    }
  }

  public resetToSeed(): AppDatabase {
    const fresh = structuredClone(SEED_DATABASE);
    this.save(fresh);
    return fresh;
  }

  public exportJson(db: AppDatabase): string {
    return JSON.stringify(db, null, 2);
  }
}

export const dbProvider = new LocalStorageDatabaseProvider();
