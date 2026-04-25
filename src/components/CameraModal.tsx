"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, RefreshCw, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            setCapturedImage(null);
            setError(null);
        }
    }, [isOpen]);

    const startCamera = async () => {
        setIsStarting(true);
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err: any) {
            console.error("Camera Error:", err);
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setError("Camera access denied. Please allow camera permission or upload a file.");
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                setError("No camera detected on this device.");
            } else {
                setError("Unable to access camera. Please try uploading a file instead.");
            }
        } finally {
            setIsStarting(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
                setCapturedImage(dataUrl);
            }
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    const handleConfirm = () => {
        if (capturedImage) {
            fetch(capturedImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                    onCapture(file);
                    onClose();
                });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                            <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-blue-500" />
                                <span className="font-bold text-white">Camera Capture</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                            {error ? (
                                <div className="p-8 text-center">
                                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                    <p className="text-white font-medium mb-2">{error}</p>
                                    <Button variant="outline" onClick={startCamera}>Try Again</Button>
                                </div>
                            ) : capturedImage ? (
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    {isStarting && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                        </div>
                                    )}
                                </>
                            )}
                            <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-950/50 flex items-center justify-center gap-4">
                            {!error && !capturedImage ? (
                                <Button
                                    onClick={handleCapture}
                                    disabled={!stream || isStarting}
                                    className="h-14 px-10 rounded-full text-base font-bold shadow-lg shadow-blue-600/20 bg-[#0d6efd] hover:bg-[#0b5ed7] border-none"
                                >
                                    Capture Photo
                                </Button>
                            ) : capturedImage ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleRetake}
                                        className="h-12 px-6 rounded-full border-white/20 text-white hover:bg-white/10"
                                    >
                                        <RefreshCw className="mr-2 w-4 h-4" /> Retake
                                    </Button>
                                    <Button
                                        onClick={handleConfirm}
                                        className="h-12 px-8 rounded-full bg-[#16a34a] hover:bg-[#16a34a]/90 border-none shadow-lg shadow-[#16a34a]/20"
                                    >
                                        <Check className="mr-2 w-4 h-4" /> Use This Photo
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="h-12 px-8 rounded-full"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
