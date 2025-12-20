/**
 * User Context
 * React context for user state management (subscription, gems)
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserState } from '../types';
import {
    createDefaultUserState,
    canAfford,
    consumeGems,
    refreshGemsIfNeeded,
    GEM_COSTS
} from '../types/economy';

interface UserContextValue {
    user: UserState;
    isPro: boolean;
    canAffordAction: (action: keyof typeof GEM_COSTS) => boolean;
    consumeGemsForAction: (action: keyof typeof GEM_COSTS) => boolean;
    addGems: (amount: number) => void;
    upgradeToPro: () => void;
    downgradeToFree: () => void;
    showPurchaseModal: boolean;
    setShowPurchaseModal: (show: boolean) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = 'koetekt_user_state';

/**
 * Load user state from localStorage
 */
function loadUserState(): UserState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as UserState;
            // Refresh gems if new day
            return refreshGemsIfNeeded(parsed);
        }
    } catch (error) {
        console.warn('Failed to load user state:', error);
    }
    return createDefaultUserState();
}

/**
 * Save user state to localStorage
 */
function saveUserState(state: UserState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn('Failed to save user state:', error);
    }
}

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<UserState>(loadUserState);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

    // Save state on change
    useEffect(() => {
        saveUserState(user);
    }, [user]);

    // Check for daily refresh periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setUser(prev => refreshGemsIfNeeded(prev));
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    const isPro = user.tier === 'pro';

    const canAffordAction = useCallback((action: keyof typeof GEM_COSTS): boolean => {
        return canAfford(user, GEM_COSTS[action]);
    }, [user]);

    const consumeGemsForAction = useCallback((action: keyof typeof GEM_COSTS): boolean => {
        if (!canAfford(user, GEM_COSTS[action])) {
            setShowPurchaseModal(true);
            return false;
        }
        setUser(prev => consumeGems(prev, GEM_COSTS[action]));
        return true;
    }, [user]);

    const addGems = useCallback((amount: number) => {
        setUser(prev => ({
            ...prev,
            gems: prev.gems + amount
        }));
    }, []);

    const upgradeToPro = useCallback(() => {
        setUser(prev => ({
            ...prev,
            tier: 'pro',
            activeSubscription: 'koetekt_pro_monthly'
        }));
    }, []);

    const downgradeToFree = useCallback(() => {
        setUser(prev => ({
            ...prev,
            tier: 'free',
            activeSubscription: undefined,
            gems: Math.min(prev.gems, prev.maxGems)
        }));
    }, []);

    const value: UserContextValue = {
        user,
        isPro,
        canAffordAction,
        consumeGemsForAction,
        addGems,
        upgradeToPro,
        downgradeToFree,
        showPurchaseModal,
        setShowPurchaseModal
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Hook to access user context
 */
export function useUser(): UserContextValue {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

// RevenueCat placeholder for future iOS integration
export const RevenueCat = {
    /**
     * Initialize RevenueCat SDK (placeholder)
     * In production, this would initialize react-native-purchases
     */
    async initialize(): Promise<void> {
        console.log('[RevenueCat] SDK initialization placeholder');
        // In production:
        // await Purchases.configure({ apiKey: 'YOUR_REVENUE_CAT_API_KEY' });
    },

    /**
     * Get customer info (placeholder)
     */
    async getCustomerInfo(): Promise<{ isPro: boolean }> {
        console.log('[RevenueCat] Getting customer info (placeholder)');
        // In production: return Purchases.getCustomerInfo();
        return { isPro: false };
    },

    /**
     * Purchase a product (placeholder)
     */
    async purchaseProduct(_productId: string): Promise<boolean> {
        console.log('[RevenueCat] Purchase placeholder for:', _productId);
        // In production: return Purchases.purchaseProduct(productId);
        return false;
    },

    /**
     * Restore purchases (placeholder)
     */
    async restorePurchases(): Promise<boolean> {
        console.log('[RevenueCat] Restore purchases placeholder');
        // In production: return Purchases.restorePurchases();
        return false;
    }
};
