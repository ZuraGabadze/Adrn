import { Coupon, Currency, Rank } from '../data/types';

export interface PriceBreakdown {
  baseGEL: number;
  upgradeCreditGEL: number;
  afterUpgradeGEL: number;
  globalSalePercent: number;
  couponDiscountPercent: number;
  finalGEL: number;
  finalUSD: number;
  formattedPrimary: string;
  formattedSecondary: string;
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatPrice(
  amountGEL: number,
  currency: Currency,
  gelToUsdRate: number
): string {
  const safeRate = gelToUsdRate > 0 ? gelToUsdRate : 2.7;
  if (currency === 'USD') {
    const usd = roundCurrency(amountGEL / safeRate);
    return `$${usd.toFixed(2)} USD`;
  }
  return `${roundCurrency(amountGEL).toFixed(2)} ₾`;
}

export function calculateUpgradeDifferenceGEL(
  fromRank: Rank | null | undefined,
  toRank: Rank
): number {
  if (!fromRank) return roundCurrency(toRank.priceGEL);
  if (toRank.order <= fromRank.order) return 0;
  return roundCurrency(Math.max(0, toRank.priceGEL - fromRank.priceGEL));
}

export function calculateCheckoutPrice(
  targetRank: Rank,
  currency: Currency,
  gelToUsdRate: number,
  globalSalePercent: number,
  coupon?: Coupon | null,
  fromRank?: Rank | null
): PriceBreakdown {
  const safeRate = gelToUsdRate > 0 ? gelToUsdRate : 2.7;
  const baseGEL = Math.max(0, targetRank.priceGEL);
  const upgradeCreditGEL =
    fromRank && targetRank.order > fromRank.order ? Math.min(baseGEL, fromRank.priceGEL) : 0;
  const afterUpgradeGEL = roundCurrency(Math.max(0, baseGEL - upgradeCreditGEL));

  const clampedSale = Math.min(90, Math.max(0, globalSalePercent));
  const afterGlobalSale = afterUpgradeGEL * (1 - clampedSale / 100);

  const couponPercent =
    coupon && coupon.active ? Math.min(90, Math.max(0, coupon.discountPercent)) : 0;
  const finalGEL = roundCurrency(afterGlobalSale * (1 - couponPercent / 100));
  const finalUSD = roundCurrency(finalGEL / safeRate);

  const formattedGEL = `${finalGEL.toFixed(2)} ₾`;
  const formattedUSD = `$${finalUSD.toFixed(2)} USD`;

  return {
    baseGEL,
    upgradeCreditGEL: roundCurrency(upgradeCreditGEL),
    afterUpgradeGEL,
    globalSalePercent: clampedSale,
    couponDiscountPercent: couponPercent,
    finalGEL,
    finalUSD,
    formattedPrimary: currency === 'GEL' ? formattedGEL : formattedUSD,
    formattedSecondary: currency === 'GEL' ? formattedUSD : formattedGEL,
  };
}

/**
 * Resolves cumulative commands and kits for a rank by walking the inheritance chain.
 */
export function resolveCumulativeRankPerks(
  rank: Rank,
  allRanks: Rank[]
): {
  ownCommands: string[];
  inheritedCommands: { command: string; fromRankName: string; fromRankColor: string }[];
  allCommands: string[];
  allKits: string[];
} {
  const sorted = [...allRanks].sort((a, b) => a.order - b.order);
  const ownCommands = [...rank.commands];
  const inheritedCommands: { command: string; fromRankName: string; fromRankColor: string }[] = [];

  for (const lower of sorted) {
    if (lower.order < rank.order) {
      for (const cmd of lower.commands) {
        if (!ownCommands.includes(cmd) && !inheritedCommands.some((i) => i.command === cmd)) {
          inheritedCommands.push({
            command: cmd,
            fromRankName: lower.name,
            fromRankColor: lower.colorPrimary,
          });
        }
      }
    }
  }

  return {
    ownCommands,
    inheritedCommands,
    allCommands: [...inheritedCommands.map((i) => i.command), ...ownCommands],
    allKits: [...rank.kits],
  };
}

export function validateMinecraftUsername(username: string): boolean {
  const trimmed = username.trim();
  return /^[a-zA-Z0-9_]{3,16}$/.test(trimmed);
}

export function generateLuckPermsCommand(username: string, luckPermsGroup: string): string {
  const cleanUser = username.trim();
  const cleanGroup = luckPermsGroup.trim().toLowerCase();
  return `lp user ${cleanUser} parent add ${cleanGroup}`;
}

export function interpolateBpmFromScroll(scrollProgress: number): number {
  const clamped = Math.min(1, Math.max(0, scrollProgress));
  return Math.round(72 + clamped * (190 - 72));
}
