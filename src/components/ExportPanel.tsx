/**
 * ExportPanel Component
 * Clean export buttons with SVG icons
 */

import { useState } from 'react';
import { useUser } from '../contexts';
import { ProLockModal } from './ProLockModal';

interface ExportPanelProps {
    onExportGLB: () => void;
    onExportSTL: () => void;
    disabled: boolean;
}

const AFFILIATE_URL = 'https://make.dmm.com/print/';

// Lock icon
function LockIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
        </svg>
    );
}

export function ExportPanel({ onExportGLB, onExportSTL, disabled }: ExportPanelProps) {
    const { isPro } = useUser();
    const [showProLock, setShowProLock] = useState(false);
    const [showAffiliateMenu, setShowAffiliateMenu] = useState(false);

    const handleExportClick = (exportFn: () => void) => {
        if (!isPro) {
            setShowProLock(true);
            return;
        }
        exportFn();
    };

    const openAffiliate = () => {
        window.open(AFFILIATE_URL, '_blank', 'noopener,noreferrer');
        setShowAffiliateMenu(false);
    };

    return (
        <>
            <div className="flex items-center gap-2">
                {/* GLB Export */}
                <button
                    onClick={() => handleExportClick(onExportGLB)}
                    disabled={disabled}
                    className={`backdrop-blur-xl border rounded-xl px-3 py-2 font-medium transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 ${isPro
                            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                >
                    {!isPro && <LockIcon className="w-3 h-3" />}
                    GLB
                </button>

                {/* STL Export */}
                <button
                    onClick={() => handleExportClick(onExportSTL)}
                    disabled={disabled}
                    className={`backdrop-blur-xl border rounded-xl px-3 py-2 font-medium transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 ${isPro
                            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                >
                    {!isPro && <LockIcon className="w-3 h-3" />}
                    STL
                </button>

                {/* 3D Print Order Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowAffiliateMenu(!showAffiliateMenu)}
                        disabled={disabled}
                        className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white/70 hover:text-white font-medium transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Order
                    </button>

                    {showAffiliateMenu && (
                        <div
                            className="absolute top-full right-0 mt-2 w-56 backdrop-blur-xl bg-black/90 border border-white/10 rounded-xl p-3 shadow-xl z-30"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-white font-medium text-sm mb-2">3D Print Order</h3>
                            <p className="text-white/50 text-xs mb-3">
                                Order this model as a physical 3D print.
                            </p>
                            <button
                                onClick={openAffiliate}
                                className="w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-all"
                            >
                                Order via DMM.make
                            </button>
                            <p className="text-white/30 text-xs mt-2 text-center">
                                Opens external site
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ProLockModal
                isOpen={showProLock}
                onClose={() => setShowProLock(false)}
                feature="Export"
                description="Pro plan is required to export models in GLB/STL format."
            />

            {showAffiliateMenu && (
                <div className="fixed inset-0 z-20" onClick={() => setShowAffiliateMenu(false)} />
            )}
        </>
    );
}
