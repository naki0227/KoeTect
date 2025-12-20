/**
 * DirectorPanel Component
 * Compact UI panel for AI Director controls
 */

import { useState, useCallback, useRef } from 'react';
import type { DirectorTask } from '../types';

interface DirectorPanelProps {
    onSubmit: (prompt: string) => void;
    onDemoClick: () => void;
    isExecuting: boolean;
    isDirectorMode: boolean;
    onToggleDirectorMode: () => void;
    taskQueue: DirectorTask[];
    currentTaskIndex: number;
    history: { role: 'user' | 'assistant'; content: string }[];
}

export function DirectorPanel({
    onSubmit,
    onDemoClick,
    isExecuting,
    isDirectorMode,
    onToggleDirectorMode,
    taskQueue,
    currentTaskIndex,
    history
}: DirectorPanelProps) {
    const [prompt, setPrompt] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isExecuting) {
            onSubmit(prompt.trim());
            setPrompt('');
        }
    }, [prompt, isExecuting, onSubmit]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    // Compact mode button (right side)
    if (!isExpanded) {
        return (
            <div className="absolute bottom-6 right-6 z-20">
                <button
                    onClick={() => setIsExpanded(true)}
                    className={`flex items-center gap-2 backdrop-blur-xl border rounded-xl px-4 py-2.5 transition-all ${isDirectorMode
                            ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
                            : 'bg-black/60 border-white/10 text-white/70 hover:text-white hover:bg-black/70'
                        }`}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-sm">Director</span>
                    {isExecuting && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    )}
                </button>
            </div>
        );
    }

    // Expanded panel (right side, above the compact button position)
    return (
        <div className="absolute bottom-6 right-6 z-20 w-96">
            <div className="backdrop-blur-xl bg-black/80 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 border-b border-white/10 cursor-pointer"
                    onClick={() => setIsExpanded(false)}
                >
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-white font-medium text-sm">Director Mode</h3>

                        {/* Toggle */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleDirectorMode();
                            }}
                            className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${isDirectorMode
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                                }`}
                        >
                            {isDirectorMode ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {isExecuting && (
                            <span className="text-xs text-purple-400">
                                {currentTaskIndex + 1}/{taskQueue.length}
                            </span>
                        )}
                        <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>

                {/* Chat history */}
                {history.length > 0 && (
                    <div className="max-h-32 overflow-y-auto px-4 py-2 space-y-2 border-b border-white/10">
                        {history.slice(-4).map((msg, i) => (
                            <div
                                key={i}
                                className={`text-xs ${msg.role === 'user' ? 'text-blue-300' : 'text-green-300'}`}
                            >
                                <span className="text-white/30 mr-1">
                                    {msg.role === 'user' ? '>' : '<'}
                                </span>
                                {msg.content.slice(0, 60)}
                                {msg.content.length > 60 && '...'}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}

                {/* Task progress */}
                {taskQueue.length > 0 && (
                    <div className="px-4 py-2 border-b border-white/10">
                        <div className="flex flex-wrap gap-1">
                            {taskQueue.map((task, i) => (
                                <span
                                    key={task.id}
                                    className={`px-1.5 py-0.5 rounded text-xs ${task.status === 'completed'
                                            ? 'bg-green-500/20 text-green-300'
                                            : task.status === 'running'
                                                ? 'bg-purple-500/20 text-purple-300 animate-pulse'
                                                : task.status === 'failed'
                                                    ? 'bg-red-500/20 text-red-300'
                                                    : 'bg-white/5 text-white/30'
                                        }`}
                                >
                                    {i + 1}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input area */}
                <form onSubmit={handleSubmit} className="p-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Direction... (e.g., zoom and explode)"
                            disabled={isExecuting}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-purple-500/50 transition-all"
                        />

                        <button
                            type="button"
                            onClick={onDemoClick}
                            disabled={isExecuting}
                            className="px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all text-xs disabled:opacity-40"
                        >
                            Demo
                        </button>

                        <button
                            type="submit"
                            disabled={isExecuting || !prompt.trim()}
                            className="px-3 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-all disabled:opacity-40"
                        >
                            {isExecuting ? (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                'Go'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
