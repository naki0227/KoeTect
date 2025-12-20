/**
 * ObjectHierarchy Component
 * Displays the hierarchy of objects in the scene
 */

import React, { useMemo } from 'react';
import type { KoeTektScene, SceneObject } from '../types';

interface ObjectHierarchyProps {
    scene: KoeTektScene | null;
    isOpen: boolean;
    onToggle: () => void;
}

function renderObject(obj: SceneObject, depth: number = 0): React.ReactNode {
    const indent = depth * 16;
    const isGroup = obj.type === 'group';

    return (
        <div key={obj.name} style={{ marginLeft: indent }}>
            <div className="flex items-center gap-2 py-1 text-sm">
                <span className="text-white/40">
                    {isGroup ? '📁' : '🔷'}
                </span>
                <span className="text-white/80">{obj.name}</span>
                <span className="text-white/30 text-xs">({obj.type})</span>
            </div>
            {isGroup && 'children' in obj && obj.children.map(child =>
                renderObject(child, depth + 1)
            )}
        </div>
    );
}

export function ObjectHierarchy({ scene, isOpen, onToggle }: ObjectHierarchyProps) {
    const content = useMemo(() => {
        if (!scene || scene.objects.length === 0) return null;
        return scene.objects.map(obj => renderObject(obj));
    }, [scene]);

    return (
        <div className="absolute top-24 left-6 z-10">
            {/* Toggle button */}
            <button
                onClick={onToggle}
                className="backdrop-blur-lg bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 px-4 py-2 text-white/80 text-sm font-medium transition-all duration-200 mb-2"
            >
                {isOpen ? '✕ 閉じる' : '📋 階層表示'}
            </button>

            {/* Hierarchy panel */}
            {isOpen && content && (
                <div className="backdrop-blur-xl bg-black/50 rounded-xl border border-white/10 p-4 max-w-xs max-h-96 overflow-auto">
                    <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">
                        Object Hierarchy
                    </h3>
                    {content}
                </div>
            )}
        </div>
    );
}
