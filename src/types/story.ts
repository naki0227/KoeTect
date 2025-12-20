/**
 * Story Types
 * Type definitions for storyteller feature
 */

/**
 * Single scene in a story
 */
export interface StoryScene {
    /** Unique ID for the scene */
    id: string;

    /** Prompt to generate the 3D scene */
    scenePrompt: string;

    /** Prompt for direction/animation (optional) */
    directionPrompt?: string;

    /** Scene duration in seconds (for recording) */
    duration: number;

    /** Scene status */
    status: 'pending' | 'generating' | 'directing' | 'recording' | 'completed' | 'failed';

    /** Error message if failed */
    error?: string;
}

/**
 * Complete story script
 */
export interface Story {
    /** Story title */
    title: string;

    /** List of scenes */
    scenes: StoryScene[];

    /** Current scene index */
    currentSceneIndex: number;

    /** Overall story status */
    status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
}

/**
 * Storyteller state
 */
export interface StorytellerState {
    story: Story | null;
    isRunning: boolean;
    recordings: Blob[];
}

/**
 * Create empty story
 */
export function createEmptyStory(title = 'Untitled Story'): Story {
    return {
        title,
        scenes: [],
        currentSceneIndex: 0,
        status: 'idle'
    };
}

/**
 * Create scene from prompt
 */
export function createScene(
    scenePrompt: string,
    directionPrompt?: string,
    duration = 5
): StoryScene {
    return {
        id: crypto.randomUUID(),
        scenePrompt,
        directionPrompt,
        duration,
        status: 'pending'
    };
}
