/**
 * Direction Engine
 * Task queue management and execution
 */

import * as THREE from 'three';
import type {
    DirectorTask,
    DirectorCommand,
    VFXState,
    AnimationCommand,
    CameraCommand,
    VFXCommand,
    SoundCommand,
    PhysicsCommand,
    WaitCommand
} from '../types';
import {
    executeAnimation,
    executeCamera,
    executeVFX,
    executeSound,
    executePhysics,
    type CameraController
} from './systems';

export interface DirectionContext {
    sceneRoot: THREE.Object3D | null;
    cameraController: CameraController | null;
    vfxState: VFXState;
    setVfxState: (state: VFXState) => void;
    onTaskStart?: (task: DirectorTask) => void;
    onTaskComplete?: (task: DirectorTask) => void;
    onAllComplete?: () => void;
}

/**
 * Execute a single director command
 */
async function executeCommand(
    command: DirectorCommand,
    context: DirectionContext
): Promise<void> {
    switch (command.type) {
        case 'animation':
            await executeAnimation(command as AnimationCommand, context.sceneRoot);
            break;

        case 'camera':
            await executeCamera(
                command as CameraCommand,
                context.cameraController,
                context.sceneRoot
            );
            break;

        case 'vfx':
            await executeVFX(
                command as VFXCommand,
                context.vfxState,
                context.setVfxState
            );
            break;

        case 'sound':
            await executeSound(command as SoundCommand);
            break;

        case 'physics':
            await executePhysics(command as PhysicsCommand, context.sceneRoot);
            break;

        case 'wait':
            await new Promise(resolve =>
                setTimeout(resolve, (command as WaitCommand).duration * 1000)
            );
            break;

        default:
            console.warn('Unknown command type:', (command as DirectorCommand).type);
    }
}

/**
 * Direction Engine class for managing task execution
 */
export class DirectionEngine {
    private taskQueue: DirectorTask[] = [];
    private isRunning = false;
    private isPaused = false;
    private currentTaskIndex = 0;
    private context: DirectionContext | null = null;
    private abortController: AbortController | null = null;

    /**
     * Set execution context
     */
    setContext(context: DirectionContext): void {
        this.context = context;
    }

    /**
     * Add tasks to the queue
     */
    addTasks(tasks: DirectorTask[]): void {
        this.taskQueue.push(...tasks);
    }

    /**
     * Clear all tasks
     */
    clearTasks(): void {
        this.taskQueue = [];
        this.currentTaskIndex = 0;
    }

    /**
     * Get current state
     */
    getState(): {
        isRunning: boolean;
        isPaused: boolean;
        currentIndex: number;
        totalTasks: number
    } {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            currentIndex: this.currentTaskIndex,
            totalTasks: this.taskQueue.length
        };
    }

    /**
     * Start executing tasks
     */
    async execute(): Promise<void> {
        if (!this.context) {
            console.error('Direction context not set');
            return;
        }

        if (this.isRunning) {
            console.warn('Direction engine already running');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.abortController = new AbortController();

        try {
            while (this.currentTaskIndex < this.taskQueue.length) {
                if (this.abortController.signal.aborted) {
                    break;
                }

                if (this.isPaused) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    continue;
                }

                const task = this.taskQueue[this.currentTaskIndex];
                task.status = 'running';

                this.context.onTaskStart?.(task);

                try {
                    await executeCommand(task.command, this.context);
                    task.status = 'completed';
                } catch (error) {
                    console.error('Task execution error:', error);
                    task.status = 'failed';
                }

                this.context.onTaskComplete?.(task);
                this.currentTaskIndex++;
            }

            this.context.onAllComplete?.();
        } finally {
            this.isRunning = false;
            this.currentTaskIndex = 0;
        }
    }

    /**
     * Pause execution
     */
    pause(): void {
        this.isPaused = true;
    }

    /**
     * Resume execution
     */
    resume(): void {
        this.isPaused = false;
    }

    /**
     * Stop execution and reset
     */
    stop(): void {
        this.abortController?.abort();
        this.isRunning = false;
        this.isPaused = false;
        this.currentTaskIndex = 0;
    }
}

// Singleton instance
let engineInstance: DirectionEngine | null = null;

/**
 * Get or create the direction engine instance
 */
export function getDirectionEngine(): DirectionEngine {
    if (!engineInstance) {
        engineInstance = new DirectionEngine();
    }
    return engineInstance;
}
