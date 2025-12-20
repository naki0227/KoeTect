/**
 * PromptInput Component
 * Clean command input with minimal design
 */

import { useState, useCallback, useRef } from 'react';

interface PromptInputProps {
    onSubmit: (prompt: string, imageBase64?: string, mimeType?: string) => void;
    onGenerateImageRequest?: (prompt: string) => Promise<{ base64: string; mimeType: string } | null>;
    onDemoClick?: () => void;
    isLoading?: boolean;
    placeholder?: string;
}

export function PromptInput({
    onSubmit,
    onGenerateImageRequest,
    onDemoClick,
    isLoading = false,
    placeholder = 'Describe a 3D scene... (e.g., a red sports car)'
}: PromptInputProps) {
    const [prompt, setPrompt] = useState('');
    const [selectedImage, setSelectedImage] = useState<{ url: string; base64: string; mimeType: string } | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Extract base64 and mime type
                const matches = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);

                if (matches && matches.length === 3) {
                    const mimeType = matches[1];
                    const base64 = matches[2];
                    setSelectedImage({
                        url: URL.createObjectURL(file),
                        base64,
                        mimeType
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const clearImage = useCallback(() => {
        if (selectedImage) {
            URL.revokeObjectURL(selectedImage.url);
            setSelectedImage(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [selectedImage]);

    const handleMagicGenerate = useCallback(async () => {
        if (!prompt.trim() || !onGenerateImageRequest) return;

        setIsGeneratingImage(true);
        try {
            const result = await onGenerateImageRequest(prompt.trim());
            if (result) {
                setSelectedImage({
                    url: `data:${result.mimeType};base64,${result.base64}`,
                    base64: result.base64,
                    mimeType: result.mimeType
                });
            }
        } catch (error) {
            console.error("Magic generation failed", error);
        } finally {
            setIsGeneratingImage(false);
        }
    }, [prompt, onGenerateImageRequest]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if ((prompt.trim() || selectedImage) && !isLoading && !isGeneratingImage) {
            onSubmit(
                prompt.trim(),
                selectedImage?.base64,
                selectedImage?.mimeType
            );
            setPrompt('');
            clearImage();
        }
    }, [prompt, selectedImage, isLoading, isGeneratingImage, onSubmit, clearImage]);

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-10">
            {/* Image Preview */}
            {selectedImage && (
                <div className="relative inline-block mb-3 animate-fade-in-up">
                    <img
                        src={selectedImage.url}
                        alt="Preview"
                        className="h-24 w-auto rounded-lg border border-white/20 shadow-lg object-cover bg-black/50"
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                        Image Input
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
                {/* Input container */}
                <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={selectedImage ? "Describe what to make from this image..." : placeholder}
                        disabled={isLoading}
                        className="w-full bg-transparent text-white placeholder-white/30 px-5 py-4 pr-40 text-base focus:outline-none disabled:opacity-50"
                    />

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />

                    {/* Action buttons */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {/* Magic Generate Button */}
                        {onGenerateImageRequest && (
                            <button
                                type="button"
                                onClick={handleMagicGenerate}
                                disabled={isLoading || isGeneratingImage || !prompt.trim()}
                                className={`p-2 rounded-xl transition-colors ${isGeneratingImage ? 'text-yellow-400 bg-yellow-500/10 animate-pulse' : 'text-white/40 hover:text-yellow-400 hover:bg-white/5'}`}
                                title="AI Generate Image"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </button>
                        )}

                        {/* Image Upload Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className={`p-2 rounded-xl transition-colors ${selectedImage ? 'text-purple-400 bg-purple-500/10' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                            title="Upload Image"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>

                        {onDemoClick && !selectedImage && (
                            <button
                                type="button"
                                onClick={onDemoClick}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
                            >
                                Demo
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading || (!prompt.trim() && !selectedImage)}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-5 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Generating</span>
                                </>
                            ) : (
                                'Generate'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
