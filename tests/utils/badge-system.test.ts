// Tests for src/utils/badge-system.ts.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BadgeUtils, type badgeSystem as staticSystem, type Badge, type BadgeUnlockEvent, type UserProgress } from '@/utils/badge-system';

type System = typeof staticSystem;

async function freshSystem(): Promise<System> {
  vi.resetModules();
  const mod = await import('@/utils/badge-system');
  return mod.badgeSystem;
}

type Stats = UserProgress['stats'];

function progress(stats: Partial<Stats> = {}, skillProgress: UserProgress['skillProgress'] = {}): UserProgress {
  return {
    userId: 'u1',
    stats: {
      lessonsCompleted: 0,
      quizzesCompleted: 0,
      perfectScores: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalTimeSpent: 0,
      projectsCompleted: 0,
      linesOfCode: 0,
      errorFreeSessions: 0,
      lastActiveDate: new Date('2026-01-01T00:00:00Z'),
      ...stats,
    },
    skillProgress,
  };
}

const ids = (events: BadgeUnlockEvent[]) => events.map(e => e.badgeId).sort();

let system: System;

beforeEach(async () => {
  system = await freshSystem();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('catalogue', () => {
  it('ships a default catalogue with unique ids and positive rewards', () => {
    const all = system.getAllBadges();
    expect(all.length).toBeGreaterThanOrEqual(20);
    expect(new Set(all.map(b => b.id)).size).toBe(all.length);
    expect(all.every(b => b.xpReward > 0 && b.requirement.target > 0)).toBe(true);
  });

  it('filters by category and rarity', () => {
    const community = system.getBadgesByCategory('community');
    expect(community.map(b => b.id).sort()).toEqual(['helper', 'mentor']);
    expect(system.getBadgesByRarity('legendary').map(b => b.id).sort()).toEqual(['typescript-master', 'unstoppable']);

    const categories: Badge['category'][] = ['learning', 'achievement', 'milestone', 'special', 'community'];
    const total = categories.reduce((n, c) => n + system.getBadgesByCategory(c).length, 0);
    expect(total).toBe(system.getAllBadges().length);
  });

  it('addBadge registers a new badge (and replaces one with the same id)', () => {
    const custom: Badge = {
      id: 'polyglot',
      name: 'Polyglot',
      description: 'Write 10 lines',
      icon: 'P',
      rarity: 'rare',
      category: 'special',
      requirement: { type: 'code_lines', target: 10 },
      xpReward: 42,
    };
    const before = system.getAllBadges().length;
    system.addBadge(custom);
    system.addBadge({ ...custom, xpReward: 43 });

    expect(system.getAllBadges()).toHaveLength(before + 1);
    expect(system.getAllBadges().find(b => b.id === 'polyglot')?.xpReward).toBe(43);
    expect(ids(system.checkBadgeUnlocks('u1', progress({ linesOfCode: 10 })))).toContain('polyglot');
  });
});

describe('checkBadgeUnlocks', () => {
  it('unlocks nothing for a brand new user', () => {
    expect(system.checkBadgeUnlocks('u1', progress())).toEqual([]);
    expect(system.getUserBadges('u1')).toEqual([]);
  });

  it('unlocks every lesson badge whose threshold is met, and only those', () => {
    const events = system.checkBadgeUnlocks('u1', progress({ lessonsCompleted: 10 }));
    expect(ids(events)).toEqual(['dedicated-learner', 'early-bird', 'first-lesson', 'night-owl']);
    expect(events.every(e => e.userId === 'u1')).toBe(true);
  });

  it('thresholds are inclusive and exact', () => {
    expect(ids(system.checkBadgeUnlocks('u1', progress({ lessonsCompleted: 49 })))).not.toContain('knowledge-seeker');
    expect(ids(system.checkBadgeUnlocks('u1', progress({ lessonsCompleted: 50 })))).toContain('knowledge-seeker');
  });

  it('covers each requirement type that is backed by stats', () => {
    const cases: Array<[Partial<Stats>, string]> = [
      [{ perfectScores: 1 }, 'quiz-novice'],
      [{ currentStreak: 7 }, 'consistent-learner'],
      [{ totalTimeSpent: 5 }, 'speed-runner'],
      [{ projectsCompleted: 5 }, 'architect'],
      [{ linesOfCode: 1000 }, 'clean-coder'],
      [{ errorFreeSessions: 10 }, 'error-free'],
    ];
    for (const [stats, badgeId] of cases) {
      expect(ids(system.checkBadgeUnlocks(`user-${badgeId}`, progress(stats)))).toContain(badgeId);
    }
  });

  it('skill mastery uses the average skill level and needs at least one skill', () => {
    expect(ids(system.checkBadgeUnlocks('a', progress({}, {})))).not.toContain('typescript-master');
    const half = { generics: { level: 100, xp: 0, lessonsCompleted: 0 }, enums: { level: 50, xp: 0, lessonsCompleted: 0 } };
    expect(ids(system.checkBadgeUnlocks('b', progress({}, half)))).not.toContain('typescript-master');
    const full = { generics: { level: 100, xp: 0, lessonsCompleted: 0 }, enums: { level: 100, xp: 0, lessonsCompleted: 0 } };
    expect(ids(system.checkBadgeUnlocks('c', progress({}, full)))).toContain('typescript-master');
  });

  it('community badges are not unlockable from stats (tracked elsewhere)', () => {
    const maxed = progress({
      lessonsCompleted: 1e6,
      perfectScores: 1e6,
      currentStreak: 1e6,
      totalTimeSpent: 1e6,
      projectsCompleted: 1e6,
      linesOfCode: 1e6,
      errorFreeSessions: 1e6,
    });
    const unlocked = ids(system.checkBadgeUnlocks('u1', maxed));
    expect(unlocked).not.toContain('helper');
    expect(unlocked).not.toContain('mentor');
  });

  it('is idempotent: a second check with the same progress unlocks nothing', () => {
    const p = progress({ lessonsCompleted: 10 });
    expect(system.checkBadgeUnlocks('u1', p).length).toBeGreaterThan(0);
    expect(system.checkBadgeUnlocks('u1', p)).toEqual([]);
  });

  it('keeps users independent', () => {
    system.checkBadgeUnlocks('alice', progress({ lessonsCompleted: 1 }));
    expect(system.hasUserBadge('alice', 'first-lesson')).toBe(true);
    expect(system.hasUserBadge('bob', 'first-lesson')).toBe(false);
  });
});

describe('awardBadge and listeners', () => {
  it('awards once, timestamps the unlock and reports the XP', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-05T12:00:00Z'));
    const p = progress();

    const event = system.awardBadge('u1', 'builder', p);

    expect(event).toEqual({
      badgeId: 'builder',
      userId: 'u1',
      unlockedAt: new Date('2026-05-05T12:00:00Z'),
      progress: p,
      xpGained: 200,
    });
    expect(system.awardBadge('u1', 'builder', p)).toBeNull();
    expect(system.getUserBadges('u1')).toEqual(['builder']);
  });

  it('throws for an unknown badge', () => {
    expect(() => system.awardBadge('u1', 'nope', progress())).toThrow('Badge with id nope not found');
  });

  it('notifies listeners for each unlock until removed', () => {
    const listener = vi.fn();
    const other = vi.fn();
    system.onBadgeUnlock(listener);
    system.onBadgeUnlock(other);

    system.checkBadgeUnlocks('u1', progress({ projectsCompleted: 1 }));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]![0]).toMatchObject({ badgeId: 'builder', userId: 'u1' });

    system.removeEventListener(listener);
    system.removeEventListener(vi.fn()); // removing an unknown listener is a no-op
    system.awardBadge('u1', 'helper', progress());

    expect(listener).toHaveBeenCalledTimes(1);
    expect(other).toHaveBeenCalledTimes(2);
  });
});

describe('calculateBadgeProgress', () => {
  it('reports partial progress as a rounded percentage', () => {
    expect(system.calculateBadgeProgress('u1', 'knowledge-seeker', progress({ lessonsCompleted: 25 }))).toEqual({
      current: 25,
      total: 50,
      percentage: 50,
      isUnlocked: false,
    });
    expect(system.calculateBadgeProgress('u1', 'dedicated-learner', progress({ lessonsCompleted: 1 })).percentage).toBe(10);
  });

  it('clamps the percentage at 100 for not-yet-awarded badges', () => {
    const result = system.calculateBadgeProgress('u1', 'first-lesson', progress({ lessonsCompleted: 7 }));
    expect(result).toMatchObject({ current: 7, percentage: 100, isUnlocked: false });
  });

  it('reports a full bar once the badge is awarded, regardless of current stats', () => {
    system.awardBadge('u1', 'clean-coder', progress());
    expect(system.calculateBadgeProgress('u1', 'clean-coder', progress())).toEqual({
      current: 1000,
      total: 1000,
      percentage: 100,
      isUnlocked: true,
    });
  });

  it('maps every requirement type onto the matching statistic', () => {
    const p = progress(
      {
        lessonsCompleted: 1,
        perfectScores: 2,
        currentStreak: 3,
        totalTimeSpent: 4,
        projectsCompleted: 5,
        linesOfCode: 6,
        errorFreeSessions: 7,
      },
      { a: { level: 30, xp: 0, lessonsCompleted: 0 }, b: { level: 10, xp: 0, lessonsCompleted: 0 } }
    );
    const current = (badgeId: string) => system.calculateBadgeProgress('u1', badgeId, p).current;

    expect(current('typescript-scholar')).toBe(1);
    expect(current('quiz-master')).toBe(2);
    expect(current('perfectionist')).toBe(3);
    expect(current('unstoppable')).toBe(3);
    expect(current('speed-runner')).toBe(4);
    expect(current('architect')).toBe(5);
    expect(current('clean-coder')).toBe(6);
    expect(current('error-free')).toBe(7);
    expect(current('typescript-master')).toBe(20);
    expect(current('mentor')).toBe(0);
  });

  it('skill mastery progress is zero with no skills', () => {
    expect(system.calculateBadgeProgress('u1', 'typescript-master', progress()).current).toBe(0);
  });

  it('throws for an unknown badge', () => {
    expect(() => system.calculateBadgeProgress('u1', 'nope', progress())).toThrow('not found');
  });
});

describe('user statistics and persistence', () => {
  it('aggregates unlocked badges by rarity, category and XP', () => {
    system.checkBadgeUnlocks('u1', progress({ lessonsCompleted: 10 }));
    const stats = system.getUserBadgeStats('u1');

    expect(stats.total).toBe(system.getAllBadges().length);
    expect(stats.unlocked).toBe(4);
    expect(stats.byRarity).toEqual({ common: 2, uncommon: 2, rare: 0, epic: 0, legendary: 0 });
    expect(stats.byCategory).toMatchObject({ learning: 2, special: 2 });
    expect(stats.totalXpFromBadges).toBe(50 + 100 + 150 + 150);
  });

  it('reports zeros for a user with no badges', () => {
    const stats = system.getUserBadgeStats('ghost');
    expect(stats.unlocked).toBe(0);
    expect(stats.totalXpFromBadges).toBe(0);
    expect(Object.values(stats.byRarity).every(n => n === 0)).toBe(true);
  });

  it('round-trips through export/import and ignores unknown ids in stats', () => {
    system.checkBadgeUnlocks('u1', progress({ projectsCompleted: 1 }));
    const exported = system.exportUserData('u1');
    expect(exported.badges).toEqual(['builder']);
    expect(exported.stats.totalXpFromBadges).toBe(200);

    system.importUserData('u2', { badges: [...exported.badges, 'retired-badge'] });
    expect(system.hasUserBadge('u2', 'builder')).toBe(true);
    expect(system.getUserBadgeStats('u2').unlocked).toBe(1);
  });

  it('resetUserBadges forgets a user so badges can be earned again', () => {
    const p = progress({ lessonsCompleted: 1 });
    system.checkBadgeUnlocks('u1', p);
    system.resetUserBadges('u1');

    expect(system.getUserBadges('u1')).toEqual([]);
    expect(ids(system.checkBadgeUnlocks('u1', p))).toContain('first-lesson');
  });
});

describe('BadgeUtils', () => {
  it('formats minutes as hours and minutes', () => {
    expect(BadgeUtils.formatTime(0)).toBe('0m');
    expect(BadgeUtils.formatTime(45)).toBe('45m');
    expect(BadgeUtils.formatTime(60)).toBe('1h');
    expect(BadgeUtils.formatTime(125)).toBe('2h 5m');
  });

  it('orders rarities by strictly increasing weight', () => {
    const order: Badge['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const weights = order.map(BadgeUtils.getRarityWeight);
    expect(weights).toEqual([...weights].sort((a, b) => a - b));
    expect(new Set(weights).size).toBe(order.length);
    expect(BadgeUtils.getRarityWeight('mythic' as Badge['rarity'])).toBe(0);
  });

  it('maps rarities and categories to colour classes with sensible fallbacks', () => {
    expect(BadgeUtils.getRarityColor('legendary')).toContain('yellow');
    expect(BadgeUtils.getRarityColor('mythic' as Badge['rarity'])).toBe(BadgeUtils.getRarityColor('common'));
    expect(BadgeUtils.getCategoryColor('community')).toContain('pink');
    expect(BadgeUtils.getCategoryColor('other' as Badge['category'])).toBe(BadgeUtils.getCategoryColor('learning'));
  });
});

describe('module exports', () => {
  it('default export is the singleton', async () => {
    const mod = await import('@/utils/badge-system');
    expect(mod.default).toBe(mod.badgeSystem);
  });
});
