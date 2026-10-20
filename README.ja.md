# KoeTekt (コエテクト) - AI Spatial Architect 🏗️

<p align="center">
  <b>「言葉が、空間になる。」</b><br>
  Text-to-3D Scene Director powered by Gemini & React Three Fiber
</p>

![Status](https://img.shields.io/badge/status-beta-blue)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20iOS%20%7C%20Desktop-lightgrey)

---

## 📖 概要 (Overview)

**KoeTekt** は、テキストや音声入力から **「3D空間」** と **「演出（カメラワーク・照明・動き）」** をリアルタイムに生成するAIアーキテクトツールです。
Google Gemini のマルチモーダル能力を使って「森の中で静かに佇む古代の遺跡」といった抽象的な指示を解釈し、3Dオブジェクトの配置、ライティング、環境音、そしてカメラカットまでを全自動でディレクションします。

## ✨ 特徴 (Key Features)

### 1. 🎬 AI Director System
* **概要:** 映画監督のように振る舞うAIシステム。
* **機能:**
    * **Scene Builder:** プロンプトから最適な3Dアセット（ジオメトリ）を生成・配置。
    * **Camera Work:** 「ドラマチックに」「俯瞰で」といった指示に基づき、Cinematicなカメラパスを自動生成。
    * **Atmosphere:**  照明（Lighting）や環境効果（Fog, Particles）を動的に制御。

### 2. 物理演算とインタラクション (Physics & Logic)
* **技術:** `Rapier Physics` を採用し、生成されたオブジェクトに重力や衝突判定を付与。積み木のように崩れる遺跡や、転がるボールなどの動的なシーンも生成可能です。

### 3. Cross-Platform "Spatial" App
* **Web:** Vite + React による高速プレビュー。
* **Mobile (iOS):** Capacitorを使用したAR体験（予定）。
* **Desktop (Electron):** 高解像度レンダリングと動画書き出しに対応。

### 4. 💎 Economy & Pro Tools
* **Gem System:** 高度な生成機能やプレミアムアセットの使用にはジェムを使用。
* **Export:** 生成したシーンを動画（.mp4）や3Dモデル（.gltf）としてエクスポート可能。

---

## 🛠 技術スタック (Tech Stack)

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Framework** | **React 19 + Vite** | Core Application Logic |
| **3D Engine** | **React Three Fiber (Three.js)** | 3D Rendering & Scene Graph |
| **AI Brain** | **Google Gemini 2.5** | Scene Understanding & Direction |
| **Physics** | **Rapier (WASM)** | High-performance Physics Engine |
| **Sound** | **Tone.js** | Procedural Audio Generation |
| **Desktop** | **Electron** | Native Desktop Integration |
| **Mobile** | **Capacitor** | iOS/Android Native Bridge |

---

## 🏗️ アーキテクチャ (Architecture)

**ECS (Entity Component System)** ライクな設計を採用し、AIからの指示を「システム」が解釈して3D空間に反映します。

```mermaid
graph TD
    User["🧑‍🎨 Creator"]
    
    subgraph "AI Brain (Director)"
        Gemini["✨ Gemini 2.5"]
    end
    
    subgraph "KoeTekt Engine"
        Prompt["Prompt Parser"]
        
        subgraph "Director Systems"
            Cam["🎥 Camera System"]
            Light["💡 Lighting System"]
            Phys["⚛️ Physics System"]
            Sound["🔊 Sound System"]
        end
        
        Scene["3D Scene Graph\n(R3F / Three.js)"]
    end
    
    User -->|Text/Voice| Prompt
    Prompt -->|Context| Gemini
    Gemini -->|JSON Directives| Prompt
    
    Prompt -->|Update Config| Director Systems
    Cam -->|Animate| Scene
    Light -->|Update| Scene
    Phys -->|Simulate| Scene
    
    Scene -->|Render| User
```

---

## 🚀 セットアップ (Getting Started)

### Prerequisites
* Node.js 20+
* Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/naki0227/koetekt.git
   cd koetekt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment:
   Create `.env`:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Run (Web):
   ```bash
   npm run dev
   ```

5. Run (Desktop):
   ```bash
   npm run electron:dev
   ```

---

## 👨‍💻 開発者 (Developer)
**Enludus**

Focus: AI x 3D Procedural Generation
Contact: https://enludus.com

<p align="center"> 
    © 2025 KoeTekt Project. All rights reserved. 
</p>
