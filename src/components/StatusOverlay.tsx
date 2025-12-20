/**
 * StatusOverlay Component
 * Clean status notifications
 */

interface StatusOverlayProps {
    message: string | null;
    type: 'info' | 'error' | 'success';
}

export function StatusOverlay({ message, type }: StatusOverlayProps) {
    if (!message) return null;

    const styles = {
        info: 'bg-purple-500/10 border-purple-500/30 text-purple-200',
        error: 'bg-red-500/10 border-red-500/30 text-red-200',
        success: 'bg-green-500/10 border-green-500/30 text-green-200'
    };

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
            <div className={`backdrop-blur-xl ${styles[type]} border rounded-xl px-4 py-2 shadow-lg`}>
                <span className="font-medium text-sm">{message}</span>
            </div>
        </div>
    );
}
