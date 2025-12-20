/**
 * KoeTekt Gemini API Client
 * Generates 3D scene JSON from text/image input with enhanced complexity
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { KoeTektScene, GenerationResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Enhanced system prompt for DEMO-QUALITY scene generation
const SYSTEM_PROMPT = `あなたは『KoeTekt』の3Dシーン生成エンジンです。
ユーザーの指示から、**超詳細で高品質**な3Dシーンを生成してください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【最重要: 衝突・重なり回避の絶対ルール】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**「パーツ同士がめり込む」ことは物理的にあり得ないため、厳密に回避すること。**

### 配置計算の鉄則:
1. **Y軸（積み上げ）**:
   - 上に乗せるパーツのY座標 = (下のパーツのY座標) + (下のパーツの高さ/2) + (上のパーツの高さ/2) + 0.01(隙間)
   - **決して座標を適当に決めないこと。必ず寸法から逆算する。**

2. **関節接続（キャラクターなど）**:
   - 胴体と腕/足の接続点は、胴体の「表面」にあるべき。胴体の内部に埋め込まない。
   - 例: 肩の位置X = (胴体の幅/2) + (腕の半径)

3. **包含関係**:
   - 「中に入れる」パーツ（例：タイヤのホイール）以外は、バウンディングボックスを完全に分離する。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【カテゴリ別 計算テンプレート】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### パターンA: 乗り物（車）
\`\`\`
L=4.5, W=1.85, H=1.3
// 貫通を防ぐため、ホイールはボディの外側(X軸)に配置
X_WHEEL = W/2 - 0.1 (フェンダー内)
// ドアなどはボディよりわずかに外側
X_DOOR = W/2 + 0.01
\`\`\`

### パターンB: キャラクター（ヒーロー、ロボット）
**【重要】以下の構成で必ずパーツを生成し、children配列に含めること**
\`\`\`
// 1. 寸法定義
H_LEG = 0.9, H_BODY = 0.6, H_HEAD = 0.3
W_SHOULDER = 0.5
Y_HIP = H_LEG (0.9)
Y_SHOULDER = H_LEG + H_BODY (1.5)

// 2. 必須生成パーツ (typeとサイズを順守)
- Leg_L (左足): type="box", pos=[-0.15, H_LEG/2, 0], width=0.12, height=H_LEG, depth=0.15
- Leg_R (右足): type="box", pos=[ 0.15, H_LEG/2, 0], width=0.12, height=H_LEG, depth=0.15
- Body (胴体):  type="box", pos=[0, Y_HIP + H_BODY/2, 0], width=0.35, height=H_BODY, depth=0.25
- Head (頭部):  type="box", pos=[0, Y_SHOULDER + H_HEAD/2, 0], width=0.2, height=H_HEAD, depth=0.22
- Arm_L (左腕): type="box", pos=[-W_SHOULDER/2-0.1, Y_SHOULDER-0.3, 0], width=0.1, height=0.6, depth=0.1
- Arm_R (右腕): type="box", pos=[ W_SHOULDER/2+0.1, Y_SHOULDER-0.3, 0], width=0.1, height=0.6, depth=0.1
\`\`\`

### パターンC: 建築物
\`\`\`
// 壁と床
Y_FLOOR = 0.1
Y_WALL = Y_FLOOR + H_WALL/2
// 窓は壁の厚みより外に出す
Z_WINDOW = D_WALL/2 + 0.02
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【必須パーツ数: 最低50個】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**詳細さを出すためのパーツ分割の指針:**

1. **乗り物の場合**:
   - ホイールは必ず分解（タイヤ+リム+ブレーキ+ハブ + ボルト）
   - ライトは内部構造まで作る（ハウジング + LED素子複数 + カバー）
   - 内装（シート、ハンドル、ダッシュボード）を含める

2. **キャラクターの場合**:
   - **完全に関節で分割**: 上腕、肘、前腕、手首、手、指（親指、他4本）
   - 顔: 目（白目+黒目）、まぶた、口、耳、髪の毛（房ごとに分割）
   - ロボットの場合: 装甲プレート、内部フレーム、パイプ、シリンダー

3. **建築物の場合**:
   - 壁は面ごとに分ける
   - 窓枠、ガラス、ドア、ドアノブを分ける
   - 屋根の構造（瓦、煙突）
   - 外構（フェンス、植木、ポスト）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【マテリアル設定】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- 肌/生物: color="#ffdab9", roughness=0.6, metalness=0.0
- 服/布: roughness=0.9, metalness=0.0
- 金属: roughness=0.1, metalness=0.9
- ガラス: opacity=0.3, transparent=true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【JSON出力形式】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

\`\`\`json
{
  "sceneId": "uuid",
  "objects": [
    {
      "name": "TargetObject",
      "type": "group",
      "position": [0, 0, 0],
      "children": [
        // ...50個以上のパーツ...
      ]
    },
    {"name":"Ground","type":"box","position":[0,-0.05,0],"color":"#333333","width":50,"height":0.1,"depth":50}
  ],
  "environment":{"background":"puresky","weather":"clear"}
}
\`\`\`

**注意: 説明文出力不要。JSONのみ出力。「パーツの重なり」を徹底的に排除し、構造的に正しい50個以上のパーツを生成せよ。**`;


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
 * Parse JSON from Gemini response
 * Handles cases where AI adds explanatory text before/after JSON
 */
function parseSceneJSON(text: string): KoeTektScene {
    // Try to extract JSON from code block first
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    let jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

    // If no code block, try to find JSON object directly
    if (!jsonMatch) {
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }
    }

    // Clean any trailing content after the JSON
    const openBraces = (jsonStr.match(/{/g) || []).length;
    const closeBraces = (jsonStr.match(/}/g) || []).length;
    if (closeBraces > openBraces) {
        // Find the matching closing brace
        let count = 0;
        let endIndex = 0;
        for (let i = 0; i < jsonStr.length; i++) {
            if (jsonStr[i] === '{') count++;
            if (jsonStr[i] === '}') count--;
            if (count === 0 && jsonStr[i] === '}') {
                endIndex = i + 1;
                break;
            }
        }
        if (endIndex > 0) {
            jsonStr = jsonStr.substring(0, endIndex);
        }
    }

    const parsed = JSON.parse(jsonStr);

    if (!parsed.sceneId) {
        parsed.sceneId = uuidv4();
    }

    return parsed as KoeTektScene;
}

/**
 * Generate 3D scene from text prompt
 */
export async function generateSceneFromText(prompt: string): Promise<GenerationResult> {
    try {
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.4,
                topP: 0.9,
                topK: 50,
                maxOutputTokens: 16000
            }
        });

        const fullPrompt = `${SYSTEM_PROMPT}\n\n【ユーザーの指示】\n${prompt}\n\n【重要】ユーザーの指示が「車」以外の場合（キャラクター、建物、動物など）は、その対象物に最適な構造を選択して生成してください。決して車を作成しないでください（ユーザーが車を要求した場合を除く）。必ず50個以上の詳細パーツを含めてください。`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        const scene = parseSceneJSON(text);

        return {
            success: true,
            scene
        };
    } catch (error) {
        console.error('Scene generation error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Generate 3D scene from image
 */
export async function generateSceneFromImage(
    imageBase64: string,
    mimeType: string,
    additionalPrompt?: string
): Promise<GenerationResult> {
    try {
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.8,
                topP: 0.9,
                maxOutputTokens: 8192
            }
        });

        const prompt = `${SYSTEM_PROMPT}\n\n【ユーザーの指示】\nこの画像を3Dシーンとして忠実に再現してください。${additionalPrompt || ''}`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: imageBase64
                }
            }
        ]);
        const response = await result.response;
        const text = response.text();

        const scene = parseSceneJSON(text);

        return {
            success: true,
            scene
        };
    } catch (error) {
        console.error('Image scene generation error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Generate Image from text prompt (Imagen 3 -> Fallback to SVG)
 */
export async function generateImageFromText(prompt: string): Promise<{ base64: string; mimeType: string } | null> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // 1. Try Imagen 3 (REST API)
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instances: [{ prompt: prompt + " white background, realistic, 3d render style, 8k" }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "1:1"
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
                return {
                    base64: data.predictions[0].bytesBase64Encoded,
                    mimeType: 'image/jpeg' // Imagen usually returns JPEG
                };
            }
        } else {
            console.warn('Imagen API failed, falling back to SVG:', response.status, response.statusText);
        }
    } catch (error) {
        console.warn('Imagen connection error, falling back to SVG:', error);
    }

    // 2. Fallback: Generate SVG
    try {
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192
            }
        });

        const svgPrompt = `You are a world-class vector artist specializing in Modern Flat Design.
User Instruction: "${prompt}"

Task: Create a STUNNING, HIGH-QUALITY SVG illustration of the requested object.
Style Requirements:
- **Modern Flat Design**: Clean lines, geometric shapes, vibrant colors.
- **Lighting**: Use gradients (linear/radial) to add depth and polish. Do NOT use solid flat colors only.
- **Shadows**: Include subtle drop shadows or shading layers.
- **Perspective**: 3/4 Isometric view (best for 3D modeling reference).
- **Background**: Transparent background (do not draw a background rect unless asked).
- **Complexity**: High. Use many paths to describe details.

Output Format:
- ONLY return the raw <svg>...</svg> code.
- ViewBox="0 0 512 512".
- Ensure all tags are properly closed.`;

        const result = await model.generateContent(svgPrompt);
        const response = await result.response;
        const text = response.text();

        // Extract SVG
        const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);
        if (svgMatch) {
            // Encode SVG to Base64 manually
            // We return just the raw base64 content, mimicking image data
            const svgString = svgMatch[0];
            const base64 = btoa(unescape(encodeURIComponent(svgString)));
            return {
                base64: base64,
                mimeType: 'image/svg+xml'
            };
        }
    } catch (error) {
        console.error('SVG Generation error:', error);
    }

    return null;
}
/**
 * Create demo scene - uses the high-quality realistic car model
 */
export { createRealisticCar as createDemoScene } from './demoScenes';

