/**
 * useRecorder Hook
 * MediaRecorder API for canvas + audio recording with watermark support
 */

import { useState, useRef, useCallback } from 'react';
import * as Tone from 'tone';

export interface RecorderState {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    error: string | null;
}

export interface RecorderOptions {
    /** Add watermark for free users */
    addWatermark?: boolean;
    /** Limit resolution for free users */
    maxHeight?: number;
}

export interface UseRecorderReturn {
    state: RecorderState;
    startRecording: (canvas: HTMLCanvasElement, options?: RecorderOptions) => Promise<void>;
    stopRecording: () => Promise<Blob | null>;
    pauseRecording: () => void;
    resumeRecording: () => void;
    downloadRecording: (filename?: string) => void;
}

/**
 * Get audio stream from Tone.js destination
 */
function getToneAudioStream(): MediaStream | null {
    try {
        const context = Tone.getContext();
        const destination = context.destination as unknown as AudioNode;
        const mediaStreamDest = context.createMediaStreamDestination();
        destination.connect(mediaStreamDest);
        return mediaStreamDest.stream;
    } catch (error) {
        console.warn('Could not get Tone.js audio stream:', error);
        return null;
    }
}

/**
 * Create canvas with watermark overlay
 */
function createWatermarkedCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const watermarkCanvas = document.createElement('canvas');
    watermarkCanvas.width = sourceCanvas.width;
    watermarkCanvas.height = sourceCanvas.height;

    const ctx = watermarkCanvas.getContext('2d')!;

    // Animation frame to continuously copy and add watermark
    let animationId: number;

    const render = () => {
        // Copy source canvas
        ctx.drawImage(sourceCanvas, 0, 0);

        // Add watermark
        const watermarkText = 'Made with KoeTekt';
        const padding = 20;

        ctx.save();
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        const textWidth = ctx.measureText(watermarkText).width;
        ctx.fillText(
            watermarkText,
            watermarkCanvas.width - textWidth - padding,
            watermarkCanvas.height - padding
        );
        ctx.restore();

        animationId = requestAnimationFrame(render);
    };

    render();

    // Store cleanup function on canvas
    (watermarkCanvas as unknown as { cleanup: () => void }).cleanup = () => {
        cancelAnimationFrame(animationId);
    };

    return watermarkCanvas;
}

/**
 * Merge video and audio streams
 */
function mergeStreams(videoStream: MediaStream, audioStream: MediaStream | null): MediaStream {
    const tracks = [...videoStream.getVideoTracks()];
    if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
    }
    return new MediaStream(tracks);
}

export function useRecorder(): UseRecorderReturn {
    const [state, setState] = useState<RecorderState>({
        isRecording: false,
        isPaused: false,
        duration: 0,
        error: null
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const blobRef = useRef<Blob | null>(null);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const watermarkCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const updateDuration = useCallback(() => {
        if (startTimeRef.current > 0 && !state.isPaused) {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setState(prev => ({ ...prev, duration: elapsed }));
        }
    }, [state.isPaused]);

    const startRecording = useCallback(async (
        canvas: HTMLCanvasElement,
        options: RecorderOptions = {}
    ) => {
        try {
            // Reset state
            chunksRef.current = [];
            blobRef.current = null;

            // Use watermarked canvas if needed
            let recordCanvas = canvas;
            if (options.addWatermark) {
                watermarkCanvasRef.current = createWatermarkedCanvas(canvas);
                recordCanvas = watermarkCanvasRef.current;
            }

            // Get canvas video stream (30fps)
            const videoStream = recordCanvas.captureStream(30);

            // Get Tone.js audio stream
            const audioStream = getToneAudioStream();

            // Merge streams
            const combinedStream = mergeStreams(videoStream, audioStream);

            // Create MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : 'video/webm';

            // Adjust bitrate based on resolution limit
            const bitrate = options.maxHeight && options.maxHeight <= 720
                ? 3000000  // 3 Mbps for 720p
                : 8000000; // 8 Mbps for 4K

            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType,
                videoBitsPerSecond: bitrate
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                blobRef.current = new Blob(chunksRef.current, { type: mimeType });

                // Cleanup watermark canvas
                if (watermarkCanvasRef.current) {
                    (watermarkCanvasRef.current as unknown as { cleanup?: () => void }).cleanup?.();
                    watermarkCanvasRef.current = null;
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(100);

            startTimeRef.current = Date.now();
            timerRef.current = window.setInterval(updateDuration, 1000);

            setState({
                isRecording: true,
                isPaused: false,
                duration: 0,
                error: null
            });

        } catch (error) {
            console.error('Failed to start recording:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Recording failed'
            }));
        }
    }, [updateDuration]);

    const stopRecording = useCallback(async (): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                resolve(null);
                return;
            }

            mediaRecorderRef.current.onstop = () => {
                const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
                blobRef.current = new Blob(chunksRef.current, { type: mimeType });

                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                // Cleanup watermark canvas
                if (watermarkCanvasRef.current) {
                    (watermarkCanvasRef.current as unknown as { cleanup?: () => void }).cleanup?.();
                    watermarkCanvasRef.current = null;
                }

                setState({
                    isRecording: false,
                    isPaused: false,
                    duration: 0,
                    error: null
                });

                resolve(blobRef.current);
            };

            mediaRecorderRef.current.stop();
        });
    }, []);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.pause();
            setState(prev => ({ ...prev, isPaused: true }));
        }
    }, []);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'paused') {
            mediaRecorderRef.current.resume();
            setState(prev => ({ ...prev, isPaused: false }));
        }
    }, []);

    const downloadRecording = useCallback((filename = 'koetekt-recording') => {
        if (!blobRef.current) {
            console.warn('No recording to download');
            return;
        }

        const url = URL.createObjectURL(blobRef.current);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    return {
        state,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        downloadRecording
    };
}
