/**
 * StorytellerPanel Component
 * UI for creating and running story scripts
 */

import { useState, useCallback } from 'react';
import type { Story, StoryScene } from '../types';
import { createScene, createEmptyStory } from '../types/story';

interface StorytellerPanelProps {
    story: Story | null;
    onLoadStory: (story: Story) => void;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    isRunning: boolean;
    isPaused: boolean;
}

export function StorytellerPanel({
    story,
    onLoadStory,
    onStart,
    onPause,
    onResume,
    onStop,
    isRunning,
    isPaused
}: StorytellerPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [storyTitle, setStoryTitle] = useState('');
    const [scenes, setScenes] = useState<{ scenePrompt: string; directionPrompt: string; duration: number }[]>([
        { scenePrompt: '', directionPrompt: '', duration: 5 }
    ]);

    const addScene = useCallback(() => {
        setScenes(prev => [...prev, { scenePrompt: '', directionPrompt: '', duration: 5 }]);
    }, []);

    const removeScene = useCallback((index: number) => {
        setScenes(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateScene = useCallback((index: number, field: string, value: string | number) => {
        setScenes(prev => prev.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
        ));
    }, []);

    const handleLoad = useCallback(() => {
        const storyScenes: StoryScene[] = scenes
            .filter(s => s.scenePrompt.trim())
            .map(s => createScene(
                s.scenePrompt.trim(),
                s.directionPrompt.trim() || undefined,
                s.duration
            ));

        if (storyScenes.length === 0) return;

        const newStory = createEmptyStory(storyTitle || 'My Story');
        newStory.scenes = storyScenes;

        onLoadStory(newStory);
    }, [scenes, storyTitle, onLoadStory]);

    const getSceneStatus = useCallback((scene: StoryScene) => {
        const statusIcons: Record<string, string> = {
            pending: '⏳',
            generating: '🎨',
            directing: '🎬',
            recording: '⏺️',
            completed: '✅',
            failed: '❌'
        };
        return statusIcons[scene.status] || '⏳';
    }, []);

    return (
        <div className="absolute top-20 right-6 z-20">
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="backdrop-blur-lg bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2 text-white/80 hover:text-white font-medium transition-all flex items-center gap-2"
            >
                📖 ストーリーテラー
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="mt-2 backdrop-blur-xl bg-black/60 border border-white/10 rounded-xl p-4 w-96 max-h-[70vh] overflow-y-auto">
                    <h3 className="text-white font-medium mb-4">ストーリーテラー</h3>

                    {/* Story info */}
                    {story ? (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white/80 text-sm">{story.title}</span>
                                <span className="text-xs text-white/40">
                                    {story.currentSceneIndex + 1}/{story.scenes.length}
                                </span>
                            </div>

                            {/* Scene list */}
                            <div className="space-y-1 mb-4">
                                {story.scenes.map((scene, i) => (
                                    <div
                                        key={scene.id}
                                        className={`text-xs px-2 py-1 rounded ${i === story.currentSceneIndex
                                            ? 'bg-purple-500/30 text-purple-300'
                                            : 'bg-white/5 text-white/60'
                                            }`}
                                    >
                                        {getSceneStatus(scene)} Scene {i + 1}: {scene.scenePrompt.slice(0, 30)}...
                                    </div>
                                ))}
                            </div>

                            {/* Controls */}
                            <div className="flex gap-2">
                                {!isRunning && (
                                    <button
                                        onClick={onStart}
                                        className="flex-1 bg-green-500/30 hover:bg-green-500/50 text-green-300 rounded-lg py-2 text-sm"
                                    >
                                        ▶ 開始
                                    </button>
                                )}
                                {isRunning && !isPaused && (
                                    <button
                                        onClick={onPause}
                                        className="flex-1 bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-300 rounded-lg py-2 text-sm"
                                    >
                                        ⏸ 一時停止
                                    </button>
                                )}
                                {isPaused && (
                                    <button
                                        onClick={onResume}
                                        className="flex-1 bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 rounded-lg py-2 text-sm"
                                    >
                                        ▶ 再開
                                    </button>
                                )}
                                {isRunning && (
                                    <button
                                        onClick={onStop}
                                        className="flex-1 bg-red-500/30 hover:bg-red-500/50 text-red-300 rounded-lg py-2 text-sm"
                                    >
                                        ⏹ 停止
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Story title */}
                            <input
                                type="text"
                                value={storyTitle}
                                onChange={(e) => setStoryTitle(e.target.value)}
                                placeholder="ストーリータイトル"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm mb-3"
                            />

                            {/* Scene inputs */}
                            <div className="space-y-3 mb-4">
                                {scenes.map((scene, i) => (
                                    <div key={i} className="bg-white/5 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/60 text-xs">Scene {i + 1}</span>
                                            {scenes.length > 1 && (
                                                <button
                                                    onClick={() => removeScene(i)}
                                                    className="text-red-400 text-xs hover:text-red-300"
                                                >
                                                    削除
                                                </button>
                                            )}
                                        </div>

                                        <input
                                            type="text"
                                            value={scene.scenePrompt}
                                            onChange={(e) => updateScene(i, 'scenePrompt', e.target.value)}
                                            placeholder="シーン生成プロンプト (例: 赤い車)"
                                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white placeholder-white/30 text-xs mb-2"
                                        />

                                        <input
                                            type="text"
                                            value={scene.directionPrompt}
                                            onChange={(e) => updateScene(i, 'directionPrompt', e.target.value)}
                                            placeholder="演出プロンプト (例: 光って爆発) - 任意"
                                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white placeholder-white/30 text-xs mb-2"
                                        />

                                        <div className="flex items-center gap-2">
                                            <span className="text-white/40 text-xs">録画時間:</span>
                                            <input
                                                type="number"
                                                value={scene.duration}
                                                onChange={(e) => updateScene(i, 'duration', parseInt(e.target.value) || 5)}
                                                min={1}
                                                max={60}
                                                className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                            />
                                            <span className="text-white/40 text-xs">秒</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add scene button */}
                            <button
                                onClick={addScene}
                                className="w-full bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-lg py-2 text-white/60 hover:text-white/80 text-sm mb-3"
                            >
                                + シーンを追加
                            </button>

                            {/* Load button */}
                            <button
                                onClick={handleLoad}
                                disabled={!scenes.some(s => s.scenePrompt.trim())}
                                className="w-full bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 rounded-lg py-2 text-sm disabled:opacity-50"
                            >
                                ストーリーを読み込む
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
