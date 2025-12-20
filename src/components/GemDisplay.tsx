/**
 * GemDisplay Component
 * Minimal gem balance display with SVG icon
 */

import { useUser } from '../contexts';

// Diamond SVG icon
function DiamondIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3L1 9l11 12L23 9l-5-6H6z" />
            <path d="M1 9h22" />
            <path d="M12 21L7.5 9 12 3l4.5 6L12 21z" />
        </svg>
    );
}

export function GemDisplay() {
    const { user, isPro, setShowPurchaseModal } = useUser();

    return (
        <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center gap-2 backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl px-3 py-2 transition-all duration-200"
        >
            <DiamondIcon className="w-4 h-4 text-purple-400" />

            {isPro ? (
                <span className="text-purple-300 font-medium text-sm">
                    Pro
                </span>
            ) : (
                <span className="text-white/80 font-medium text-sm">
                    {user.gems}
                </span>
            )}
        </button>
    );
}
