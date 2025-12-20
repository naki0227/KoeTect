/**
 * Storyteller Engine
 * Automated scene generation and recording loop
 */

import type { Story, StoryScene, KoeTektScene } from '../types';
import { generateSceneFromText } from './gemini';
import { generateDirection, prepareTaskQueue, getDirectionEngine, type DirectionContext } from '../director';
import { disposeScene } from './sceneBuilder';
import * as THREE from 'three';

export interface StorytellerCallbacks {
    onSceneStart: (scene: StoryScene, index: number) => void;
    onSceneGenerated: (koetektScene: KoeTektScene, scene: StoryScene) => void;
    onDirectionStart: (scene: StoryScene) => void;
    onRecordingStart: (scene: StoryScene) => void;
    onSceneComplete: (scene: StoryScene, recording: Blob | null) => void;
    onStoryComplete: (recordings: Blob[]) => void;
    onError: (error: Error, scene: StoryScene) => void;

    // Recording controls
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<Blob | null>;

    // Scene controls
    setScene: (scene: KoeTektScene) => void;
    getSceneRoot: () => THREE.Object3D | null;

    // Direction context
    getDirectionContext: () => DirectionContext;
}

/**
 * Storyteller Engine class
 */
export class StorytellerEngine {
    private story: Story | null = null;
    private isRunning = false;
    private isPaused = false;
    private recordings: Blob[] = [];
    private callbacks: StorytellerCallbacks | null = null;
    private abortController: AbortController | null = null;

    /**
     * Set callbacks for storyteller events
     */
    setCallbacks(callbacks: StorytellerCallbacks): void {
        this.callbacks = callbacks;
    }

    /**
     * Load a story script
     */
    loadStory(story: Story): void {
        this.story = { ...story, status: 'idle', currentSceneIndex: 0 };
        this.recordings = [];
    }

    /**
     * Get current state
     */
    getState(): { story: Story | null; isRunning: boolean; recordings: Blob[] } {
        return {
            story: this.story,
            isRunning: this.isRunning,
            recordings: [...this.recordings]
        };
    }

    /**
     * Start the story
     */
    async start(): Promise<void> {
        if (!this.story || !this.callbacks) {
            throw new Error('Story or callbacks not set');
        }

        if (this.isRunning) {
            console.warn('Storyteller already running');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.abortController = new AbortController();
        this.story.status = 'running';

        try {
            for (let i = this.story.currentSceneIndex; i < this.story.scenes.length; i++) {
                if (this.abortController.signal.aborted) break;

                while (this.isPaused) {
                    await this.sleep(100);
                }

                this.story.currentSceneIndex = i;
                const scene = this.story.scenes[i];

                try {
                    await this.processScene(scene, i);
                } catch (error) {
                    scene.status = 'failed';
                    scene.error = error instanceof Error ? error.message : 'Unknown error';
                    this.callbacks.onError(error instanceof Error ? error : new Error('Unknown error'), scene);
                }
            }

            this.story.status = 'completed';
            this.callbacks.onStoryComplete(this.recordings);

        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Process a single scene
     */
    private async processScene(scene: StoryScene, index: number): Promise<void> {
        if (!this.callbacks) return;

        // 1. Start scene
        scene.status = 'generating';
        this.callbacks.onSceneStart(scene, index);

        // 2. Generate 3D scene
        const result = await generateSceneFromText(scene.scenePrompt);
        if (!result.success || !result.scene) {
            throw new Error(result.error || 'Scene generation failed');
        }

        this.callbacks.setScene(result.scene);
        this.callbacks.onSceneGenerated(result.scene, scene);

        // Wait for scene to render
        await this.sleep(500);

        // 3. Execute direction if provided
        if (scene.directionPrompt) {
            scene.status = 'directing';
            this.callbacks.onDirectionStart(scene);

            const sceneRoot = this.callbacks.getSceneRoot();
            const objectNames = sceneRoot
                ? this.getObjectNames(sceneRoot)
                : [];

            const direction = await generateDirection(scene.directionPrompt, objectNames);
            const tasks = prepareTaskQueue(direction.tasks);

            const engine = getDirectionEngine();
            engine.clearTasks();
            engine.addTasks(tasks);
            engine.setContext(this.callbacks.getDirectionContext());

            await engine.execute();
        }

        // 4. Start recording
        scene.status = 'recording';
        this.callbacks.onRecordingStart(scene);
        await this.callbacks.startRecording();

        // Wait for scene duration
        await this.sleep(scene.duration * 1000);

        // 5. Stop recording
        const recording = await this.callbacks.stopRecording();
        if (recording) {
            this.recordings.push(recording);
        }

        // 6. Complete scene
        scene.status = 'completed';
        this.callbacks.onSceneComplete(scene, recording);

        // 7. Clear memory
        const sceneRoot = this.callbacks.getSceneRoot();
        if (sceneRoot) {
            disposeScene(sceneRoot);
        }
    }

    /**
     * Pause the story
     */
    pause(): void {
        this.isPaused = true;
        if (this.story) {
            this.story.status = 'paused';
        }
    }

    /**
     * Resume the story
     */
    resume(): void {
        this.isPaused = false;
        if (this.story) {
            this.story.status = 'running';
        }
    }

    /**
     * Stop the story
     */
    stop(): void {
        this.abortController?.abort();
        this.isRunning = false;
        this.isPaused = false;
        if (this.story) {
            this.story.status = 'idle';
        }
    }

    /**
     * Get all recordings
     */
    getRecordings(): Blob[] {
        return [...this.recordings];
    }

    /**
     * Helper: sleep
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Helper: get object names from scene
     */
    private getObjectNames(obj: THREE.Object3D, names: string[] = []): string[] {
        if (obj.name) {
            names.push(obj.name);
        }
        obj.children.forEach(child => this.getObjectNames(child, names));
        return names;
    }
}

// Singleton instance
let storytellerInstance: StorytellerEngine | null = null;

/**
 * Get or create storyteller instance
 */
export function getStorytellerEngine(): StorytellerEngine {
    if (!storytellerInstance) {
        storytellerInstance = new StorytellerEngine();
    }
    return storytellerInstance;
}
