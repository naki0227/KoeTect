# KoeTekt - AI Spatial Architect 🏗️

<p align="center">
  <b>"Words Become Space."</b><br>
  Text-to-3D Scene Director powered by Gemini & React Three Fiber
</p>

![Status](https://img.shields.io/badge/status-beta-blue)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20iOS%20%7C%20Desktop-lightgrey)

---

[🇯🇵 Japanese (日本語)](README.ja.md)

## 📖 Overview

**KoeTekt** is an AI architect tool that generates **"3D Spaces"** and **"Direction (Camera work, Lighting, Motion)"** in real-time from text or voice input.
Using the multimodal capabilities of Google Gemini, it interprets abstract instructions like "ancient ruins standing quietly in a forest" and fully directs everything from 3D object placement, lighting, and environmental sounds to camera cuts.

## ✨ Key Features

### 1. 🎬 AI Director System
* **Overview:** An AI system that acts like a film director.
* **Features:**
    * **Scene Builder:** Generates and places optimal 3D assets (geometry) from prompts.
    * **Camera Work:** Automatically generates cinematic camera paths based on instructions like "Dramatic" or "Overhead view".
    * **Atmosphere:** Dynamically controls lighting and environmental effects (Fog, Particles).

### 2. Physics & Logic
* **Technology:** Uses `Rapier Physics` to give gravity and collision detection to generated objects. It can generate dynamic scenes like crumbling ruins or rolling balls.

### 3. Cross-Platform "Spatial" App
* **Web:** Vite + React for high-speed preview.
* **Mobile (iOS):** AR experience using Capacitor (Planned).
* **Desktop (Electron):** Supports high-resolution rendering and video export.

### 4. 💎 Economy & Pro Tools
* **Gem System:** Gems are used for advanced generation features and premium assets.
* **Export:** Export generated scenes as video (.mp4) or 3D models (.gltf).

---

## 🛠 Tech Stack

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

## 🏗️ Architecture

Adopts an **ECS (Entity Component System)**-like design, where the "System" interprets instructions from the AI and reflects them in the 3D space.

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

## 🚀 Getting Started

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

## 👨‍💻 Developer
**Enludus**

Focus: AI x 3D Procedural Generation
Contact: https://enludus.com

<p align="center"> 
    © 2025 KoeTekt Project. All rights reserved. 
</p>
