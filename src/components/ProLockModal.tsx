/**
 * ProLockModal Component
 * Clean modal for Pro-only features
 */

import { useUser } from '../contexts';

interface ProLockModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
    description?: string;
}

export function ProLockModal({ isOpen, onClose, feature, description }: ProLockModalProps) {
    const { setShowPurchaseModal } = useUser();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        onClose();
        setShowPurchaseModal(true);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-gray-900 border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-1">Pro Feature</h2>
                    <p className="text-white/50 text-sm">{feature}</p>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-white/40 text-sm text-center mb-4">
                        {description}
                    </p>
                )}

                {/* Benefits */}
                <div className="bg-white/5 rounded-xl p-3 mb-4 space-y-2">
                    {['Unlimited Voice Gems', 'GLB/STL Export', '4K Recording', 'No Watermark'].map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2 text-sm text-white/60">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{benefit}</span>
                        </div>
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpgrade}
                        className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-all text-sm"
                    >
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        </div>
    );
}
