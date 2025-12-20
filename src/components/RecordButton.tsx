/**
 * RecordButton Component
 * Clean recording control with SVG icons
 */

import type { RecorderState } from '../hooks';

interface RecordButtonProps {
    state: RecorderState;
    onStart: () => void;
    onStop: () => void;
    onDownload: () => void;
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function RecordButton({ state, onStart, onStop, onDownload }: RecordButtonProps) {
    const { isRecording, duration } = state;

    if (isRecording) {
        return (
            <div className="flex items-center gap-2">
                {/* Recording indicator */}
                <div className="flex items-center gap-2 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-300 text-sm font-mono">
                        {formatDuration(duration)}
                    </span>
                </div>

                {/* Stop button */}
                <button
                    onClick={onStop}
                    className="backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl px-4 py-2 text-white font-medium transition-all flex items-center gap-2"
                >
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                        <rect width="12" height="12" rx="1" />
                    </svg>
                    Stop
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* REC button */}
            <button
                onClick={onStart}
                className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 text-white/70 hover:text-white font-medium transition-all flex items-center gap-2"
            >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                REC
            </button>

            {/* Download button */}
            <button
                onClick={onDownload}
                className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-2 text-white/50 hover:text-white transition-all"
                title="Download recording"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
            </button>
        </div>
    );
}
