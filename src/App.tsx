/**
 * KoeTekt Main Application
 * AI-powered 3D scene generation and direction
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { KoeTektScene, VFXState, DirectorTask, Story } from './types';
import { generateSceneFromText, generateSceneFromImage, generateImageFromText, createDemoScene, generateRefinement, isRefinementInstruction, getStorytellerEngine } from './engine';
import {
    generateDirection,
    createDemoDirection,
    prepareTaskQueue,
    getDirectionEngine,
    initAudio,
    type CameraController
} from './director';
import {
    PromptInput,
    SceneRenderer,
    EnvironmentRenderer,
    StatusOverlay,
    ObjectHierarchy,
    DirectorPanel,
    VFXEffects,
    RecordButton,
    ExportPanel,
    StorytellerPanel,
    GemDisplay,
    PurchaseModal,
    type SceneRendererHandle
} from './components';
import { useRecorder } from './hooks';
import { useUser } from './contexts';
import { exportToGLB, exportToSTL } from './utils';
import { getObjectNames } from './engine/sceneBuilder';
import { FREE_TIER_LIMITS } from './types/economy';

type StatusType = 'info' | 'error' | 'success';

// Component to get OrbitControls reference
function CameraHelper({
    controlsRef,
    cameraRef
}: {
    controlsRef: React.MutableRefObject<{ target: THREE.Vector3; update: () => void; enabled: boolean } | null>;
    cameraRef: React.MutableRefObject<THREE.Camera | null>;
}) {
    const { camera, controls } = useThree();

    useEffect(() => {
        cameraRef.current = camera;
        if (controls && typeof controls === 'object' && 'target' in controls) {
            controlsRef.current = controls as unknown as { target: THREE.Vector3; update: () => void; enabled: boolean };
        }
    }, [camera, controls, cameraRef, controlsRef]);

    return null;
}

function App() {
    // Scene state
    const [scene, setScene] = useState<KoeTektScene | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string | null; type: StatusType }>({
        message: null,
        type: 'info'
    });
    const [showHierarchy, setShowHierarchy] = useState(false);

    // Director state
    const [isDirectorMode, setIsDirectorMode] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [taskQueue, setTaskQueue] = useState<DirectorTask[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [directorHistory, setDirectorHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

    // VFX state
    const [vfxState, setVfxState] = useState<VFXState>({
        bloom: { enabled: false, intensity: 0 },
        chromaticAberration: { enabled: false, offset: 0 },
        vignette: { enabled: false, darkness: 0 },
        noise: { enabled: false, opacity: 0 },
        glitch: { enabled: false, strength: 0 }
    });

    // Storyteller state
    const [story, setStory] = useState<Story | null>(null);
    const [isStoryRunning, setIsStoryRunning] = useState(false);
    const [isStoryPaused, setIsStoryPaused] = useState(false);

    // Recording hook
    const recorder = useRecorder();

    // User/economy context
    const { isPro, consumeGemsForAction } = useUser();

    // Refs
    const sceneRendererRef = useRef<SceneRendererHandle>(null);
    const cameraRef = useRef<THREE.Camera | null>(null);
    const controlsRef = useRef<{ target: THREE.Vector3; update: () => void; enabled: boolean } | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Clear status after delay
    const showStatus = useCallback((message: string, type: StatusType, duration = 3000) => {
        setStatus({ message, type });
        if (duration > 0) {
            setTimeout(() => setStatus({ message: null, type: 'info' }), duration);
        }
    }, []);

    // Generate scene from text prompt (with refinement support)
    const handleSceneSubmit = useCallback(async (prompt: string, imageBase64?: string, mimeType?: string) => {
        // Check if this is a refinement
        const isRefine = scene && isRefinementInstruction(prompt) && !imageBase64;
        const action = isRefine ? 'REFINE' : 'GENERATE';

        // Consume gems (will show purchase modal if insufficient)
        if (!consumeGemsForAction(action)) {
            return;
        }

        setIsLoading(true);

        try {
            if (isRefine) {
                showStatus('シーンを修正中...', 'info', 0);
                const result = await generateRefinement(scene!, prompt);
                setScene(result.scene);
                showStatus(`修正完了: ${result.description}`, 'success');
            } else if (imageBase64 && mimeType) {
                showStatus('画像からシーンを生成中...', 'info', 0);
                const result = await generateSceneFromImage(imageBase64, mimeType, prompt);

                if (result.success && result.scene) {
                    setScene(result.scene);
                    showStatus(`画像生成完了: ${result.scene.objects.length} オブジェクト`, 'success');
                } else {
                    showStatus(result.error || '生成に失敗しました', 'error', 5000);
                }
            } else {
                showStatus('Gemini APIでシーンを生成中...', 'info', 0);
                const result = await generateSceneFromText(prompt);

                if (result.success && result.scene) {
                    setScene(result.scene);
                    showStatus(`シーン生成完了: ${result.scene.objects.length} オブジェクト`, 'success');
                } else {
                    showStatus(result.error || '生成に失敗しました', 'error', 5000);
                }
            }
        } catch (error) {
            console.error('Generation error:', error);
            showStatus('エラーが発生しました', 'error', 5000);
        } finally {
            setIsLoading(false);
        }
    }, [showStatus, scene, consumeGemsForAction]);

    // Handle AI Image Generation request
    const handleGenerateImageRequest = useCallback(async (prompt: string): Promise<{ base64: string; mimeType: string } | null> => {
        showStatus('AIが画像を生成中(Imagen/SVG)...', 'info', 0);
        const result = await generateImageFromText(prompt);

        if (result) {
            showStatus('画像生成完了！これを元に3D化できます', 'success');
            return result;
        } else {
            showStatus('画像生成に失敗しました', 'error');
            return null;
        }
    }, [showStatus]);

    // Load demo scene
    const handleDemoClick = useCallback(() => {
        const demoScene = createDemoScene();
        setScene(demoScene);
        showStatus('デモシーンを読み込みました', 'success');
    }, [showStatus]);

    // Get camera controller
    const getCameraController = useCallback((): CameraController | null => {
        if (cameraRef.current && controlsRef.current) {
            return {
                camera: cameraRef.current,
                controls: controlsRef.current
            };
        }
        return null;
    }, []);

    // Handle direction submission
    const handleDirectionSubmit = useCallback(async (prompt: string) => {
        // Consume gems for direction
        if (!consumeGemsForAction('DIRECTION')) {
            return;
        }

        try {
            await initAudio();
            setDirectorHistory(prev => [...prev, { role: 'user', content: prompt }]);
            setIsExecuting(true);
            showStatus('演出を解析中...', 'info', 0);

            const sceneGroup = sceneRendererRef.current?.getSceneGroup();
            const objectNames = sceneGroup ? getObjectNames(sceneGroup) : [];
            const direction = await generateDirection(prompt, objectNames);

            setDirectorHistory(prev => [...prev, { role: 'assistant', content: direction.description }]);

            const tasks = prepareTaskQueue(direction.tasks);
            setTaskQueue(tasks as DirectorTask[]);
            setCurrentTaskIndex(0);

            const engine = getDirectionEngine();
            engine.clearTasks();
            engine.addTasks(tasks as DirectorTask[]);
            engine.setContext({
                sceneRoot: sceneGroup ?? null,
                cameraController: getCameraController(),
                vfxState,
                setVfxState,
                onTaskStart: (task) => {
                    const index = tasks.findIndex(t => t.id === task.id);
                    setCurrentTaskIndex(index);
                    setTaskQueue([...tasks] as DirectorTask[]);
                },
                onTaskComplete: (task) => {
                    const index = tasks.findIndex(t => t.id === task.id);
                    tasks[index] = task;
                    setTaskQueue([...tasks] as DirectorTask[]);
                },
                onAllComplete: () => {
                    setIsExecuting(false);
                    showStatus('演出完了', 'success');
                }
            });

            showStatus('演出実行中...', 'info', 0);
            await engine.execute();

        } catch (error) {
            console.error('Direction error:', error);
            showStatus('演出エラー: ' + (error instanceof Error ? error.message : '不明なエラー'), 'error', 5000);
            setIsExecuting(false);
        }
    }, [showStatus, vfxState, getCameraController]);

    // Handle demo direction
    const handleDemoDirectionClick = useCallback(async () => {
        try {
            await initAudio();
            setDirectorHistory(prev => [...prev, { role: 'user', content: 'デモ演出' }]);
            setIsExecuting(true);

            const direction = createDemoDirection();
            setDirectorHistory(prev => [...prev, { role: 'assistant', content: direction.description }]);

            const tasks = prepareTaskQueue(direction.tasks);
            setTaskQueue(tasks as DirectorTask[]);
            setCurrentTaskIndex(0);

            const sceneGroup = sceneRendererRef.current?.getSceneGroup();

            const engine = getDirectionEngine();
            engine.clearTasks();
            engine.addTasks(tasks as DirectorTask[]);
            engine.setContext({
                sceneRoot: sceneGroup ?? null,
                cameraController: getCameraController(),
                vfxState,
                setVfxState,
                onTaskStart: (task) => {
                    const index = tasks.findIndex(t => t.id === task.id);
                    setCurrentTaskIndex(index);
                    setTaskQueue([...tasks] as DirectorTask[]);
                },
                onTaskComplete: (task) => {
                    const index = tasks.findIndex(t => t.id === task.id);
                    tasks[index] = task;
                    setTaskQueue([...tasks] as DirectorTask[]);
                },
                onAllComplete: () => {
                    setIsExecuting(false);
                    showStatus('デモ演出完了', 'success');
                }
            });

            showStatus('デモ演出実行中...', 'info', 0);
            await engine.execute();

        } catch (error) {
            console.error('Demo direction error:', error);
            setIsExecuting(false);
        }
    }, [showStatus, vfxState, getCameraController]);

    // Recording handlers
    const handleStartRecording = useCallback(async () => {
        if (canvasRef.current) {
            await initAudio();
            // Add watermark for free users
            await recorder.startRecording(canvasRef.current, {
                addWatermark: !isPro && FREE_TIER_LIMITS.WATERMARK,
                maxHeight: isPro ? undefined : FREE_TIER_LIMITS.MAX_RECORDING_HEIGHT
            });
            showStatus('録画開始' + (!isPro ? ' (ウォーターマーク付き)' : ''), 'info');
        }
    }, [recorder, showStatus, isPro]);

    const handleStopRecording = useCallback(async () => {
        await recorder.stopRecording();
        showStatus('録画停止 - ダウンロードボタンで保存', 'success');
    }, [recorder, showStatus]);

    const handleDownloadRecording = useCallback(() => {
        recorder.downloadRecording(`koetekt-${Date.now()}`);
        showStatus('録画をダウンロードしました', 'success');
    }, [recorder, showStatus]);

    // Export handlers
    const handleExportGLB = useCallback(async () => {
        const sceneGroup = sceneRendererRef.current?.getSceneGroup();
        if (sceneGroup) {
            showStatus('GLBエクスポート中...', 'info', 0);
            await exportToGLB(sceneGroup, { filename: `koetekt-${Date.now()}` });
            showStatus('GLBエクスポート完了', 'success');
        }
    }, [showStatus]);

    const handleExportSTL = useCallback(() => {
        const sceneGroup = sceneRendererRef.current?.getSceneGroup();
        if (sceneGroup) {
            showStatus('STLエクスポート中...', 'info', 0);
            exportToSTL(sceneGroup, { filename: `koetekt-${Date.now()}` });
            showStatus('STLエクスポート完了', 'success');
        }
    }, [showStatus]);

    // Storyteller handlers
    const handleLoadStory = useCallback((newStory: Story) => {
        setStory(newStory);
        getStorytellerEngine().loadStory(newStory);
        showStatus(`ストーリー「${newStory.title}」を読み込みました`, 'success');
    }, [showStatus]);

    const handleStartStory = useCallback(async () => {
        if (!canvasRef.current) return;

        const engine = getStorytellerEngine();
        engine.setCallbacks({
            onSceneStart: (_storyScene, index) => {
                showStatus(`シーン ${index + 1}/${story?.scenes.length || 0}: 生成中...`, 'info', 0);
            },
            onSceneGenerated: (koetektScene) => {
                setScene(koetektScene);
            },
            onDirectionStart: () => {
                showStatus('演出実行中...', 'info', 0);
            },
            onRecordingStart: () => {
                showStatus('録画中...', 'info', 0);
            },
            onSceneComplete: (storyScene) => {
                setStory(prev => prev ? { ...prev } : null);
                showStatus(`シーン完了: ${storyScene.scenePrompt.slice(0, 20)}...`, 'info');
            },
            onStoryComplete: (recordings) => {
                setIsStoryRunning(false);
                showStatus(`ストーリー完了! ${recordings.length}本の録画`, 'success');
            },
            onError: (error) => {
                showStatus(`エラー: ${error.message}`, 'error', 5000);
            },
            startRecording: async () => {
                if (canvasRef.current) {
                    await recorder.startRecording(canvasRef.current);
                }
            },
            stopRecording: async () => {
                return await recorder.stopRecording();
            },
            setScene: setScene,
            getSceneRoot: () => sceneRendererRef.current?.getSceneGroup() ?? null,
            getDirectionContext: () => ({
                sceneRoot: sceneRendererRef.current?.getSceneGroup() ?? null,
                cameraController: getCameraController(),
                vfxState,
                setVfxState
            })
        });

        setIsStoryRunning(true);
        setIsStoryPaused(false);
        await engine.start();
    }, [story, getCameraController, vfxState, recorder, showStatus]);

    const handlePauseStory = useCallback(() => {
        getStorytellerEngine().pause();
        setIsStoryPaused(true);
    }, []);

    const handleResumeStory = useCallback(() => {
        getStorytellerEngine().resume();
        setIsStoryPaused(false);
    }, []);

    const handleStopStory = useCallback(() => {
        getStorytellerEngine().stop();
        setIsStoryRunning(false);
        setIsStoryPaused(false);
    }, []);

    // Store canvas ref
    const handleCanvasCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
        canvasRef.current = gl.domElement;
    }, []);

    return (
        <div className="w-full h-full relative">
            {/* 3D Canvas */}
            <Canvas
                camera={{ position: [8, 5, 8], fov: 50 }}
                shadows
                gl={{ antialias: true, alpha: false }}
                style={{ background: '#0a0a0f' }}
                onCreated={handleCanvasCreated}
            >
                {/* Camera helper to get refs */}
                <CameraHelper controlsRef={controlsRef} cameraRef={cameraRef} />

                {/* Background stars */}
                <Stars
                    radius={100}
                    depth={50}
                    count={3000}
                    factor={4}
                    saturation={0}
                    fade
                    speed={0.5}
                />

                {/* Environment (lights, fog, etc.) */}
                <EnvironmentRenderer scene={scene} />

                {/* Generated scene objects */}
                <SceneRenderer
                    ref={sceneRendererRef}
                    scene={scene}
                    disableAutoRotate={isExecuting || isStoryRunning}
                />

                {/* Post-processing effects */}
                <VFXEffects vfxState={vfxState} />

                {/* Camera controls */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    minDistance={3}
                    maxDistance={50}
                    autoRotate={!scene && !isExecuting && !isStoryRunning}
                    autoRotateSpeed={0.3}
                />
            </Canvas>

            {/* UI Overlays */}
            <StatusOverlay message={status.message} type={status.type} />

            {/* Object hierarchy panel */}
            <ObjectHierarchy
                scene={scene}
                isOpen={showHierarchy}
                onToggle={() => setShowHierarchy(!showHierarchy)}
            />

            {/* Top left: Title */}
            <div className="absolute top-6 left-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            KoeTekt
                        </h1>
                        <p className="text-white/40 text-xs">
                            AI 3D Creation
                        </p>
                    </div>
                </div>
            </div>

            {/* Top right: Gem display, Recording & Export controls */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
                <GemDisplay />
                <RecordButton
                    state={recorder.state}
                    onStart={handleStartRecording}
                    onStop={handleStopRecording}
                    onDownload={handleDownloadRecording}
                />
                <ExportPanel
                    onExportGLB={handleExportGLB}
                    onExportSTL={handleExportSTL}
                    disabled={!scene}
                />
            </div>

            {/* Purchase Modal */}
            <PurchaseModal />

            {/* Storyteller Panel */}
            <StorytellerPanel
                story={story}
                onLoadStory={handleLoadStory}
                onStart={handleStartStory}
                onPause={handlePauseStory}
                onResume={handleResumeStory}
                onStop={handleStopStory}
                isRunning={isStoryRunning}
                isPaused={isStoryPaused}
            />

            {/* Scene generation input (only show when not in director mode) */}
            {!isDirectorMode && (
                <PromptInput
                    onSubmit={handleSceneSubmit}
                    onGenerateImageRequest={handleGenerateImageRequest}
                    onDemoClick={handleDemoClick}
                    isLoading={isLoading}
                />
            )}

            {/* Director panel */}
            <DirectorPanel
                onSubmit={handleDirectionSubmit}
                onDemoClick={handleDemoDirectionClick}
                isExecuting={isExecuting}
                isDirectorMode={isDirectorMode}
                onToggleDirectorMode={() => setIsDirectorMode(!isDirectorMode)}
                taskQueue={taskQueue}
                currentTaskIndex={currentTaskIndex}
                history={directorHistory}
            />
        </div>
    );
}

export default App;
