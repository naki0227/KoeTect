/**
 * Director Gemini Client
 * Converts natural language directions to task commands
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DirectionResponse, DirectorCommand, DirectorTask } from '../types';
import { v4 as uuidv4 } from 'uuid';

// System prompt for direction parsing
const DIRECTOR_SYSTEM_PROMPT = `あなたは『KoeTekt』の演出監督AIです。
ユーザーの抽象的な演出指示を、具体的なタスクコマンドリストに変換してください。

【利用可能なコマンドタイプ】

1. Animation (GSAP):
   - type: "animation"
   - target: オブジェクト名 (例: "Arm_R", "Wheel_FL", "Body")
   - action: "rotate" | "move" | "scale" | "color" | "opacity"
   - value: [x, y, z] または number または "color_name"
   - duration: 秒数 (デフォルト: 1)
   - ease: GSAPイージング (デフォルト: "power2.inOut")

2. Camera:
   - type: "camera"
   - action: "dolly_in" | "dolly_out" | "pan" | "orbit" | "focus" | "shake" | "reset"
   - target: フォーカス先オブジェクト名 (focusの場合)
   - value: 移動量/角度
   - duration: 秒数

3. VFX (Post-processing):
   - type: "vfx"
   - effect: "bloom" | "chromatic_aberration" | "vignette" | "noise" | "glitch"
   - intensity: 0-3 (デフォルト: 1)
   - duration: 秒数

4. Sound (Tone.js):
   - type: "sound"
   - sound: "explosion" | "impact" | "whoosh" | "laser" | "charge" | "powerup" | "alarm"
   - volume: -60 to 0 dB (デフォルト: -12)
   - duration: 秒数

5. Physics:
   - type: "physics"
   - action: "enable" | "disable" | "apply_force" | "apply_impulse" | "explode" | "gravity"
   - target: オブジェクト名
   - value: [x, y, z] (力の方向)
   - radius: 爆発半径

6. Wait:
   - type: "wait"
   - duration: 待機秒数

【ルール】
- 演出は映画的に、視覚的インパクトを重視すること
- 同時実行が必要なタスクは連続して配置（例: 爆発音とVFXは同時）
- 適切な待機時間を入れて演出にリズムを作ること
- カメラワークで視聴者の注目を誘導すること

【出力形式】
JSONのみを返してください。説明文は不要です。

{
  "description": "演出の説明文",
  "tasks": [
    { "type": "camera", "action": "focus", "target": "Hero", "duration": 0.5 },
    { "type": "animation", "target": "Arm_R", "action": "rotate", "value": [0, 1.5, 0], "duration": 0.5 },
    { "type": "sound", "sound": "whoosh", "duration": 0.3 },
    { "type": "wait", "duration": 0.3 },
    { "type": "vfx", "effect": "bloom", "intensity": 2, "duration": 0.5 },
    { "type": "sound", "sound": "explosion", "duration": 1 },
    { "type": "physics", "action": "explode", "radius": 3 },
    { "type": "camera", "action": "shake", "value": 0.5, "duration": 0.5 }
  ]
}`;

/**
 * Initialize Gemini client
 */
function getGeminiClient() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
        throw new Error('VITE_GEMINI_API_KEY is not configured in .env file');
    }
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Parse direction JSON from Gemini response
 */
function parseDirectionJSON(text: string): DirectionResponse {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

    return JSON.parse(jsonStr) as DirectionResponse;
}

/**
 * Generate direction commands from natural language
 */
export async function generateDirection(
    prompt: string,
    availableObjects: string[] = []
): Promise<DirectionResponse> {
    try {
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.8,
                topP: 0.9,
                topK: 40,
            }
        });

        const objectContext = availableObjects.length > 0
            ? `\n\n【現在のシーンにあるオブジェクト】\n${availableObjects.join(', ')}`
            : '';

        const fullPrompt = `${DIRECTOR_SYSTEM_PROMPT}${objectContext}\n\n【ユーザーの演出指示】\n${prompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return parseDirectionJSON(text);
    } catch (error) {
        console.error('Direction generation error:', error);
        throw error;
    }
}

/**
 * Create demo direction for testing
 */
export function createDemoDirection(): DirectionResponse {
    return {
        description: 'デモ演出: カメラズーム → 光る → 爆発',
        tasks: [
            { type: 'camera', action: 'dolly_in', value: 3, duration: 0.8 },
            { type: 'wait', duration: 0.3 },
            { type: 'vfx', effect: 'bloom', intensity: 2, duration: 1 },
            { type: 'sound', sound: 'charge', duration: 0.8 },
            { type: 'wait', duration: 0.5 },
            { type: 'vfx', effect: 'chromatic_aberration', intensity: 2, duration: 0.3 },
            { type: 'sound', sound: 'explosion', duration: 1 },
            { type: 'physics', action: 'explode', radius: 3 },
            { type: 'camera', action: 'shake', value: 0.4, duration: 0.5 },
            { type: 'wait', duration: 0.5 },
            { type: 'camera', action: 'reset', duration: 1 }
        ]
    };
}

/**
 * Assign unique IDs to commands
 */
export function prepareTaskQueue(commands: DirectorCommand[]): DirectorTask[] {
    return commands.map(command => ({
        id: uuidv4(),
        command,
        status: 'pending' as const
    }));
}
