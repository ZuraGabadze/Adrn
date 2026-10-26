import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCheckoutPrice,
  calculateUpgradeDifferenceGEL,
  formatPrice,
  generateLuckPermsCommand,
  interpolateBpmFromScroll,
  resolveCumulativeRankPerks,
  validateMinecraftUsername,
} from './pricing.ts';
import { parseMinecraftText } from './mcParser.ts';
import { SEED_DATABASE } from '../data/seed.ts';

test('formatPrice formats GEL (₾) and USD ($)', () => {
  assert.equal(formatPrice(9.99, 'GEL', 2.7), '9.99 ₾');
  assert.equal(formatPrice(27, 'USD', 2.7), '$10.00 USD');
});

test('calculateUpgradeDifferenceGEL computes exact GEL difference across ranks', () => {
  const emerald = SEED_DATABASE.ranks.find((r) => r.name === 'EMERALD')!;
  const sapphire = SEED_DATABASE.ranks.find((r) => r.name === 'SAPPHIRE')!;
  const ruby = SEED_DATABASE.ranks.find((r) => r.name === 'RUBY')!;
  const obsidian = SEED_DATABASE.ranks.find((r) => r.name === 'OBSIDIAN')!;

  assert.equal(calculateUpgradeDifferenceGEL(emerald, sapphire), 15.0);
  assert.equal(calculateUpgradeDifferenceGEL(ruby, obsidian), 0.0);
  assert.equal(calculateUpgradeDifferenceGEL(obsidian, emerald), 0.0);
});

test('calculateCheckoutPrice applies upgrade credit and coupon discount accurately', () => {
  const emerald = SEED_DATABASE.ranks.find((r) => r.name === 'EMERALD')!;
  const sapphire = SEED_DATABASE.ranks.find((r) => r.name === 'SAPPHIRE')!;
  const coupon = SEED_DATABASE.coupons[0]; // RUSH10 (10%)

  const breakdown = calculateCheckoutPrice(sapphire, 'GEL', 2.7, 0, coupon, emerald);
  assert.equal(breakdown.baseGEL, 24.99);
  assert.equal(breakdown.upgradeCreditGEL, 9.99);
  assert.equal(breakdown.afterUpgradeGEL, 15.0);
  assert.equal(breakdown.finalGEL, 13.5);
  assert.equal(breakdown.formattedPrimary, '13.50 ₾');
});

test('resolveCumulativeRankPerks accumulates all 18 commands on OBSIDIAN', () => {
  const obsidian = SEED_DATABASE.ranks.find((r) => r.name === 'OBSIDIAN')!;
  const resolved = resolveCumulativeRankPerks(obsidian, SEED_DATABASE.ranks);
  assert.equal(resolved.ownCommands.length, 4);
  assert.equal(resolved.inheritedCommands.length, 14);
  assert.equal(resolved.allCommands.length, 18);
});

test('validateMinecraftUsername accepts Java usernames only (no Bedrock dot prefix)', () => {
  assert.equal(validateMinecraftUsername('Saito'), true);
  assert.equal(validateMinecraftUsername('Jajo_1121'), true);
  assert.equal(validateMinecraftUsername('.BedrockPlayer'), false);
  assert.equal(validateMinecraftUsername('ab'), false);
});

test('generateLuckPermsCommand generates exact lp user command', () => {
  assert.equal(generateLuckPermsCommand('Saito', 'obsidian'), 'lp user Saito parent add obsidian');
});

test('parseMinecraftText parses hex codes (#RRGGBB and &#RRGGBB) and legacy &8 codes', () => {
  const spans = parseMinecraftText('&#8C6CFF AMETHYST &8| Yourname', 'Saito');
  assert.equal(spans.length, 2);
  assert.equal(spans[0].color, '#8C6CFF');
  assert.equal(spans[0].text, ' AMETHYST ');
  assert.equal(spans[1].color, '#555555');
  assert.equal(spans[1].text, '| Saito');
});

test('interpolateBpmFromScroll scales between 72 and 190 BPM', () => {
  assert.equal(interpolateBpmFromScroll(0), 72);
  assert.equal(interpolateBpmFromScroll(1), 190);
});
