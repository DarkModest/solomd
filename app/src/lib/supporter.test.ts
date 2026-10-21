import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TIP_TIERS,
  tierFromProductId,
  highestSupporterTier,
  badgeInfoForTier,
  mergeSupporterRecord,
  type SupporterRecord,
} from './supporter.ts';

describe('supporter badge & 3-tier IAP helpers', () => {
  it('defines three tip tiers with canonical product IDs', () => {
    assert.equal(TIP_TIERS.length, 3);
    assert.deepEqual(
      TIP_TIERS.map((t) => t.productId),
      [
        'app.solomd.tip.coffee',
        'app.solomd.tip.meal',
        'app.solomd.tip.feast',
      ],
    );
  });

  it('maps product IDs and tier keys to SupporterTier', () => {
    assert.equal(tierFromProductId('app.solomd.tip.coffee'), 'coffee');
    assert.equal(tierFromProductId('app.solomd.tip.meal'), 'meal');
    assert.equal(tierFromProductId('app.solomd.tip.feast'), 'feast');
    assert.equal(tierFromProductId('unknown.product'), null);
  });

  it('computes the highest unlocked supporter tier', () => {
    assert.equal(highestSupporterTier([]), null);
    assert.equal(highestSupporterTier(['app.solomd.tip.coffee']), 'coffee');
    assert.equal(
      highestSupporterTier(['app.solomd.tip.coffee', 'app.solomd.tip.meal']),
      'meal',
    );
    assert.equal(
      highestSupporterTier([
        'app.solomd.tip.coffee',
        'app.solomd.tip.feast',
        'app.solomd.tip.meal',
      ]),
      'feast',
    );
  });

  it('returns localized badge info for each tier', () => {
    const zhCoffee = badgeInfoForTier('coffee', true);
    assert.deepEqual(zhCoffee, { icon: '☕', label: '支持者', isSuper: false });

    const zhFeast = badgeInfoForTier('feast', true);
    assert.deepEqual(zhFeast, { icon: '🚀', label: '超级支持者', isSuper: true });

    const enMeal = badgeInfoForTier('meal', false);
    assert.deepEqual(enMeal, { icon: '🍜', label: 'Kind Supporter', isSuper: false });

    assert.equal(badgeInfoForTier(null, true), null);
  });

  it('merges incoming purchases and upgrades supporter tier', () => {
    const empty: SupporterRecord = {
      active: false,
      tier: null,
      purchasedIds: [],
      count: 0,
      updatedAt: 0,
    };

    const afterCoffee = mergeSupporterRecord(empty, ['app.solomd.tip.coffee'], true);
    assert.equal(afterCoffee.active, true);
    assert.equal(afterCoffee.tier, 'coffee');
    assert.equal(afterCoffee.count, 1);
    assert.deepEqual(afterCoffee.purchasedIds, ['app.solomd.tip.coffee']);

    const afterFeast = mergeSupporterRecord(afterCoffee, ['app.solomd.tip.feast'], true);
    assert.equal(afterFeast.active, true);
    assert.equal(afterFeast.tier, 'feast');
    assert.equal(afterFeast.count, 2);
    assert.deepEqual(afterFeast.purchasedIds, [
      'app.solomd.tip.coffee',
      'app.solomd.tip.feast',
    ]);
  });
});
