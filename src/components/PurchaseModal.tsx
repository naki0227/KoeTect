/**
 * PurchaseModal Component
 * Clean modal for purchasing gems or Pro subscription
 */

import { useUser } from '../contexts';
import { PRODUCTS } from '../types/economy';

// Diamond SVG icon
function DiamondIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 3L1 9l11 12L23 9l-5-6H6z" />
            <path d="M1 9h22" />
            <path d="M12 21L7.5 9 12 3l4.5 6L12 21z" />
        </svg>
    );
}

export function PurchaseModal() {
    const {
        user,
        isPro,
        showPurchaseModal,
        setShowPurchaseModal,
        upgradeToPro,
        addGems
    } = useUser();

    if (!showPurchaseModal) return null;

    const handlePurchase = (productId: string) => {
        if (productId.includes('pro')) {
            upgradeToPro();
            setShowPurchaseModal(false);
        } else if (productId === 'koetekt_gems_10') {
            addGems(10);
            setShowPurchaseModal(false);
        } else if (productId === 'koetekt_gems_50') {
            addGems(60);
            setShowPurchaseModal(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPurchaseModal(false)}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                        <DiamondIcon className="w-7 h-7 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-1">
                        Voice Gem
                    </h2>
                    <p className="text-white/50 text-sm">
                        {isPro ? 'Pro plan active' : `Balance: ${user.gems} Gems`}
                    </p>
                </div>

                {/* Products */}
                <div className="space-y-2 mb-6">
                    {PRODUCTS.map(product => (
                        <button
                            key={product.id}
                            onClick={() => handlePurchase(product.id)}
                            disabled={isPro && product.type === 'subscription'}
                            className={`w-full p-4 rounded-xl border transition-all text-left ${product.type === 'subscription'
                                    ? 'bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                } ${isPro && product.type === 'subscription' ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium text-sm">{product.name}</h3>
                                    <p className="text-white/40 text-xs mt-0.5">{product.description}</p>
                                </div>
                                <span className={`font-semibold text-sm ${product.type === 'subscription' ? 'text-purple-400' : 'text-white/80'
                                    }`}>
                                    {product.price}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Info */}
                <p className="text-center text-white/30 text-xs mb-4">
                    Demo only. In-app purchases will be enabled on iOS.
                </p>

                {/* Close button */}
                <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-sm font-medium"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
