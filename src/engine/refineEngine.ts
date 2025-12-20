/**
 * Refine Engine
 * Differential updates to existing scenes based on user instructions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { KoeTektScene, SceneObject } from '../types';

const REFINE_SYSTEM_PROMPT = `あなたは『KoeTekt』のシーン修正AIです。
現在のシーンデータを受け取り、ユーザーの追加指示に基づいて**差分のみ**を生成してください。

【ルール】
1. 指示に関係のないオブジェクトは変更しない
2. 変更が必要なオブジェクトの、変更が必要なプロパティのみを出力
3. オブジェクトはnameで識別する
4. 既存の構造を維持しながら部分的に更新

【出力形式】
JSONのみを返してください。変更対象のオブジェクトと変更内容のみ含めてください。

{
  "changes": [
    {
      "targetName": "Body",  // 変更対象のオブジェクト名
      "updates": {           // 変更するプロパティのみ
        "color": "#FF0000"
      }
    },
    {
      "targetName": "Arm_R",
      "updates": {
        "rotation": [0, -0.5, 0]
      }
    }
  ],
  "description": "変更内容の説明"
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

interface RefineChange {
    targetName: string;
    updates: Record<string, unknown>;
}

interface RefineResponse {
    changes: RefineChange[];
    description: string;
}

/**
 * Parse refine response
 */
function parseRefineJSON(text: string): RefineResponse {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(jsonStr) as RefineResponse;
}

/**
 * Flatten scene objects into a map for easy lookup
 */
function flattenObjects(
    objects: SceneObject[],
    map: Map<string, SceneObject> = new Map()
): Map<string, SceneObject> {
    for (const obj of objects) {
        map.set(obj.name, obj);
        if (obj.type === 'group' && 'children' in obj) {
            flattenObjects(obj.children, map);
        }
    }
    return map;
}

/**
 * Apply updates to an object
 */
function applyUpdates(obj: SceneObject, updates: Record<string, unknown>): SceneObject {
    return { ...obj, ...updates } as SceneObject;
}

/**
 * Recursively update objects in the scene
 */
function updateObjects(
    objects: SceneObject[],
    changes: Map<string, Record<string, unknown>>
): SceneObject[] {
    return objects.map(obj => {
        let updated = obj;

        // Apply changes if this object has updates
        const updates = changes.get(obj.name);
        if (updates) {
            updated = applyUpdates(obj, updates);
        }

        // Recursively update children
        if (obj.type === 'group' && 'children' in obj) {
            return {
                ...updated,
                children: updateObjects(obj.children, changes)
            } as SceneObject;
        }

        return updated;
    });
}

/**
 * Generate refinement from user instruction
 */
export async function generateRefinement(
    currentScene: KoeTektScene,
    instruction: string
): Promise<{ scene: KoeTektScene; description: string }> {
    try {
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
            }
        });

        // Get current object names
        const objectMap = flattenObjects(currentScene.objects);
        const objectNames = Array.from(objectMap.keys()).join(', ');

        const fullPrompt = `${REFINE_SYSTEM_PROMPT}

【現在のシーンにあるオブジェクト】
${objectNames}

【現在のシーンデータ（参考）】
${JSON.stringify(currentScene, null, 2)}

【ユーザーの修正指示】
${instruction}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        const refineResponse = parseRefineJSON(text);

        // Apply changes to scene
        const changesMap = new Map<string, Record<string, unknown>>();
        for (const change of refineResponse.changes) {
            changesMap.set(change.targetName, change.updates);
        }

        const updatedObjects = updateObjects(currentScene.objects, changesMap);

        return {
            scene: {
                ...currentScene,
                objects: updatedObjects
            },
            description: refineResponse.description
        };
    } catch (error) {
        console.error('Refinement error:', error);
        throw error;
    }
}

/**
 * Check if instruction is a refinement request
 */
export function isRefinementInstruction(instruction: string): boolean {
    const refinementKeywords = [
        'もっと', 'より', '変えて', '変更', '修正', '調整',
        '色を', '大きく', '小さく', '上げて', '下げて',
        '左に', '右に', '前に', '後ろに', '回して',
        '明るく', '暗く', 'を赤', 'を青', 'を緑'
    ];

    return refinementKeywords.some(keyword => instruction.includes(keyword));
}
