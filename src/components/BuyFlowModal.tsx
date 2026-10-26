import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Tag, Sparkles, Terminal, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../i18n/translations';
import {
  calculateCheckoutPrice,
  generateLuckPermsCommand,
  validateMinecraftUsername,
} from '../lib/pricing';
import { getBlockDataUrl } from '../lib/textures';
import { loadStaffSkin } from '../lib/skinLoader';
import { audioEngine } from '../lib/audio';

export const BuyFlowModal: React.FC = () => {
  const db = useAppStore((s) => s.db);
  const language = useAppStore((s) => s.language);
  const currency = useAppStore((s) => s.currency);
  const checkoutRankId = useAppStore((s) => s.checkoutRankId);
  const checkoutUpgradeFromId = useAppStore((s) => s.checkoutUpgradeFromId);
  const closeCheckout = useAppStore((s) => s.closeCheckout);
  const recordOrder = useAppStore((s) => s.recordOrder);
  const addAdvancementToast = useAppStore((s) => s.addAdvancementToast);
  const t = TRANSLATIONS[language];

  const [username, setUsername] = useState('Saito');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [currentRankId, setCurrentRankId] = useState<string>('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState(false);
  const [completedOrderCmd, setCompletedOrderCmd] = useState<string | null>(null);

  const sortedRanks = [...db.ranks].sort((a, b) => a.order - b.order);
  const targetRank = sortedRanks.find((r) => r.id === checkoutRankId);
  const lowerRanks = targetRank
    ? sortedRanks.filter((r) => r.order < targetRank.order)
    : [];

  useEffect(() => {
    if (checkoutUpgradeFromId) {
      setIsUpgrade(true);
      setCurrentRankId(checkoutUpgradeFromId);
    } else {
      setIsUpgrade(false);
      setCurrentRankId(lowerRanks[0]?.id || '');
    }
    setCompletedOrderCmd(null);
    setCouponError(false);
  }, [checkoutRankId, checkoutUpgradeFromId]);

  // Live preview player face when typing Java username
  useEffect(() => {
    if (!checkoutRankId) return;
    const clean = username.trim();
    if (!validateMinecraftUsername(clean)) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      const loaded = await loadStaffSkin(clean);
      if (!active) return;
      const face = document.createElement('canvas');
      face.width = 64;
      face.height = 64;
      const ctx = face.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(loaded.canvas, 8, 8, 8, 8, 0, 0, 64, 64);
      ctx.drawImage(loaded.canvas, 40, 8, 8, 8, 0, 0, 64, 64);
      setAvatarUrl(face.toDataURL('image/png'));
    }, 280);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [username, checkoutRankId]);

  if (!checkoutRankId || !targetRank) return null;

  const fromRank = isUpgrade
    ? lowerRanks.find((r) => r.id === currentRankId) || null
    : null;

  const matchedCoupon = appliedCouponCode
    ? db.coupons.find(
        (c) => c.active && c.code.toUpperCase() === appliedCouponCode.toUpperCase()
      ) || null
    : null;

  const breakdown = calculateCheckoutPrice(
    targetRank,
    currency,
    db.settings.gelToUsdRate,
    db.settings.globalSalePercent,
    matchedCoupon,
    fromRank
  );

  const isUsernameValid = validateMinecraftUsername(username);

  const handleApplyCoupon = () => {
    const clean = couponInput.trim().toUpperCase();
    const found = db.coupons.find((c) => c.active && c.code.toUpperCase() === clean);
    if (found) {
      audioEngine.playXpOrbPickup();
      setAppliedCouponCode(found.code);
      setCouponError(false);
    } else {
      setAppliedCouponCode(null);
      setCouponError(true);
    }
  };

  const handleCompletePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUsernameValid) return;

    const lpCmd = generateLuckPermsCommand(username, targetRank.luckPermsGroup);
    recordOrder({
      mcUsername: username.trim(),
      edition: 'Java',
      rankId: targetRank.id,
      rankName: targetRank.name,
      luckPermsGroup: targetRank.luckPermsGroup,
      upgradeFromRankId: fromRank?.id,
      couponCode: matchedCoupon?.code,
      amountGEL: breakdown.finalGEL,
      amountUSD: breakdown.finalUSD,
      currencyUsed: currency,
      luckPermsCommand: lpCmd,
    });

    setCompletedOrderCmd(lpCmd);
    addAdvancementToast(
      t.toasts.challengeComplete,
      `${targetRank.name} RANK UNLOCKED!`,
      `${username.trim()} • ${breakdown.formattedPrimary}`,
      'emerald'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="max-w-lg w-full mc-panel-dark p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeCheckout}
          className="absolute top-4 right-4 mc-slot p-1.5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header with Chest + Rank Block */}
        <div className="flex items-center gap-3 mb-6 border-b border-white/15 pb-4">
          <img
            src={getBlockDataUrl('chest')}
            alt="Chest"
            className="w-10 h-10 pixelated"
          />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
              {t.checkout.modalTitle}
            </div>
            <h3
              className="text-2xl font-display font-bold uppercase"
              style={{ color: targetRank.colorPrimary }}
            >
              {targetRank.name} RANK ({breakdown.formattedPrimary})
            </h3>
          </div>
        </div>

        {completedOrderCmd ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 mc-slot-active mx-auto flex items-center justify-center text-[#25FF57]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h4 className="text-xl font-display font-bold text-[#25FF57] uppercase mb-1">
                {t.checkout.orderSuccessTitle}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300">
                {t.checkout.orderSuccessDesc}
              </p>
            </div>

            <div className="mc-slot p-4 text-left">
              <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#25FF57]" />
                <span>{t.checkout.luckPermsLabel}</span>
              </div>
              <code className="block font-mono text-xs sm:text-sm text-[#25FF57] bg-black/80 p-2.5 border border-white/10">
                /{completedOrderCmd}
              </code>
            </div>

            <button
              type="button"
              onClick={closeCheckout}
              className="w-full mc-btn py-3 font-display font-bold text-sm uppercase text-white cursor-pointer"
            >
              {t.checkout.closeModal}
            </button>
          </div>
        ) : (
          <form onSubmit={handleCompletePurchase} className="space-y-5">
            {/* Step 1: Java Username + Live Skin Head Preview */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-2">
                {t.checkout.mcUsernameLabel}
              </label>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 mc-slot flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="w-9 h-9 pixelated"
                    />
                  ) : (
                    <img
                      src={getBlockDataUrl(targetRank.blockTexture)}
                      alt=""
                      className="w-7 h-7 pixelated"
                    />
                  )}
                </div>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.checkout.mcUsernamePlaceholder}
                  className="flex-1 bg-black border-2 border-[#3c344f] px-3.5 py-2.5 text-sm font-mono text-white focus:border-[#25FF57] outline-none"
                />
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-1.5">
                {t.checkout.usernameHint}
              </p>
            </div>

            {/* Step 2: Optional Rank Upgrade Toggle */}
            {lowerRanks.length > 0 && db.settings.enableUpgradeCalculator && (
              <div className="mc-slot p-3.5">
                <label className="flex items-center gap-2.5 text-xs font-mono text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUpgrade}
                    onChange={(e) => setIsUpgrade(e.target.checked)}
                    className="accent-[#25FF57]"
                  />
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{t.checkout.upgradeToggleLabel}</span>
                </label>

                {isUpgrade && (
                  <div className="mt-3">
                    <select
                      value={currentRankId}
                      onChange={(e) => setCurrentRankId(e.target.value)}
                      className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white"
                    >
                      {lowerRanks.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.priceGEL.toFixed(2)} ₾)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Promo Code */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">
                {t.checkout.couponLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t.checkout.couponPlaceholder}
                  className="flex-1 bg-black border-2 border-[#3c344f] px-3 py-2 text-xs font-mono text-white uppercase outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="mc-btn px-4 py-2 text-xs font-mono font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t.checkout.applyCoupon}</span>
                </button>
              </div>
              {matchedCoupon && (
                <p className="text-xs font-mono text-[#25FF57] mt-1">
                  ✓ {t.checkout.couponApplied} (-{matchedCoupon.discountPercent}%)
                </p>
              )}
              {couponError && (
                <p className="text-xs font-mono text-[#ff2a1f] mt-1">
                  ✕ {t.checkout.couponInvalid}
                </p>
              )}
            </div>

            {/* Order Breakdown */}
            <div className="mc-slot p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span>{t.checkout.summarySubtotal}:</span>
                <span>{breakdown.baseGEL.toFixed(2)} ₾</span>
              </div>

              {breakdown.upgradeCreditGEL > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>
                    {t.checkout.summaryUpgradeCredit} ({fromRank?.name}):
                  </span>
                  <span>-{breakdown.upgradeCreditGEL.toFixed(2)} ₾</span>
                </div>
              )}

              {breakdown.couponDiscountPercent > 0 && (
                <div className="flex justify-between text-[#25FF57]">
                  <span>
                    {t.checkout.summaryDiscount} ({matchedCoupon?.code}):
                  </span>
                  <span>-{breakdown.couponDiscountPercent}%</span>
                </div>
              )}

              <div className="border-t border-white/15 pt-2 flex justify-between items-baseline text-sm font-bold text-white">
                <span>{t.checkout.summaryTotal}:</span>
                <div className="text-right">
                  <span className="text-lg text-[#25FF57]">{breakdown.formattedPrimary}</span>
                  <span className="block text-[10px] text-zinc-400">
                    ≈ {breakdown.formattedSecondary}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isUsernameValid}
              className="w-full mc-btn py-3.5 font-display font-bold text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#25FF57]" />
              <span>
                {t.checkout.completePurchase} — {breakdown.formattedPrimary}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
