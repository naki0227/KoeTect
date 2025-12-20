/**
 * Economy Types
 * Type definitions for monetization system
 */

/**
 * User subscription tier
 */
export type UserTier = 'free' | 'pro';

/**
 * User state including subscription and gems
 */
export interface UserState {
    /** User subscription tier */
    tier: UserTier;

    /** Voice Gem balance */
    gems: number;

    /** Max gems for free users */
    maxGems: number;

    /** Last gem refresh timestamp */
    lastRefresh: string;

    /** RevenueCat customer ID (for future use) */
    customerId?: string;

    /** Active subscription product ID */
    activeSubscription?: string;
}

/**
 * Gem cost for actions
 */
export const GEM_COSTS = {
    /** Cost for model generation */
    GENERATE: 1,

    /** Cost for director mode */
    DIRECTION: 3,

    /** Cost for refinement */
    REFINE: 1,

    /** Cost for storyteller (per scene) */
    STORYTELLER: 2
} as const;

/**
 * Free tier limits
 */
export const FREE_TIER_LIMITS = {
    /** Max gems for free users */
    MAX_GEMS: 5,

    /** Daily refresh amount */
    DAILY_REFRESH: 5,

    /** Recording quality limit (720p) */
    MAX_RECORDING_HEIGHT: 720,

    /** Export locked */
    EXPORT_LOCKED: true,

    /** Watermark required */
    WATERMARK: true
} as const;

/**
 * Pro tier benefits
 */
export const PRO_TIER_BENEFITS = {
    /** Unlimited gems */
    UNLIMITED_GEMS: true,

    /** 4K recording */
    MAX_RECORDING_HEIGHT: 2160,

    /** Export unlocked */
    EXPORT_LOCKED: false,

    /** No watermark */
    WATERMARK: false
} as const;

/**
 * Purchase product types
 */
export interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    type: 'subscription' | 'consumable';
}

/**
 * Available products
 */
export const PRODUCTS: Product[] = [
    {
        id: 'koetekt_pro_monthly',
        name: 'Pro Monthly',
        description: '無制限のGem・エクスポート・4K録画',
        price: '¥980/月',
        type: 'subscription'
    },
    {
        id: 'koetekt_pro_yearly',
        name: 'Pro Yearly',
        description: '年間プラン（2ヶ月分お得）',
        price: '¥9,800/年',
        type: 'subscription'
    },
    {
        id: 'koetekt_gems_10',
        name: '10 Voice Gems',
        description: '10個のGemを追加',
        price: '¥120',
        type: 'consumable'
    },
    {
        id: 'koetekt_gems_50',
        name: '50 Voice Gems',
        description: '50個のGem（+10ボーナス）',
        price: '¥480',
        type: 'consumable'
    }
];

/**
 * Create default user state
 * NOTE: Temporarily set to 'pro' for development/testing
 */
export function createDefaultUserState(): UserState {
    return {
        tier: 'pro', // Temporarily unlimited
        gems: FREE_TIER_LIMITS.MAX_GEMS,
        maxGems: FREE_TIER_LIMITS.MAX_GEMS,
        lastRefresh: new Date().toISOString().split('T')[0]
    };
}

/**
 * Check if user can afford an action
 */
export function canAfford(state: UserState, cost: number): boolean {
    if (state.tier === 'pro') return true;
    return state.gems >= cost;
}

/**
 * Consume gems for an action
 */
export function consumeGems(state: UserState, cost: number): UserState {
    if (state.tier === 'pro') return state;
    return {
        ...state,
        gems: Math.max(0, state.gems - cost)
    };
}

/**
 * Check and perform daily gem refresh
 */
export function refreshGemsIfNeeded(state: UserState): UserState {
    if (state.tier === 'pro') return state;

    const today = new Date().toISOString().split('T')[0];

    if (state.lastRefresh !== today) {
        return {
            ...state,
            gems: Math.min(state.gems + FREE_TIER_LIMITS.DAILY_REFRESH, FREE_TIER_LIMITS.MAX_GEMS),
            lastRefresh: today
        };
    }

    return state;
}
