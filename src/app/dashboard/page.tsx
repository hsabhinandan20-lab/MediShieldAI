"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Camera, Shield, X, CheckCircle2, ChevronRight, PlayCircle, Edit3, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { performOCR } from "@/lib/ocr-service";
import { BillData } from "@/lib/bill-parser";

export default function Dashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState("Reading bill...");
    const [extractedData, setExtractedData] = useState<Partial<BillData> | null>(null);
    const router = useRouter();

    const stages = [
        { message: "Reading bill...", progress: 25 },
        { message: "Extracting patient details...", progress: 50 },
        { message: "Analyzing charges...", progress: 75 },
        { message: "Detecting suspicious entries...", progress: 90 },
        { message: "Scanning Complete → Opening Report...", progress: 100 }
    ];

    const runLoadingStages = async () => {
        for (const stage of stages) {
            setLoadingMessage(stage.message);
            setProgress(stage.progress);
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        setProgress(10);
        setLoadingMessage("Initializing OCR engine...");

        try {
            // Start loading animation in parallel with OCR
            const loadingPromise = runLoadingStages();

            // Real OCR extraction (Always returns an object now)
            const data = await performOCR(file);
            setExtractedData(data);

            await loadingPromise;

            // Unconditional navigation to results for smooth demo flow
            setTimeout(() => {
                handleFinalSubmit(data);
            }, 500);
        } catch (error) {
            console.error("OCR Failed:", error);
            setIsUploading(false);
            // Fallback for fatal errors (still avoiding alert popup)
            setLoadingMessage("Parsing failure. Retrying with sample...");
            setTimeout(() => {
                handleDemo();
            }, 1000);
        }
    };

    const handleDemo = async () => {
        setIsUploading(true);
        setProgress(5);
        setLoadingMessage("Loading demo sample...");

        await runLoadingStages();

        setTimeout(() => {
            // For demo, we still use the query param to signal demo mode
            router.push(`/results?demo=true&ts=${Date.now()}`);
        }, 500);
    };

    const handleFinalSubmit = (dataOverrides?: Partial<BillData>) => {
        const data = dataOverrides || extractedData;
        if (data) {
            // MANDATORY: Save to sessionStorage as the ONLY source of truth
            sessionStorage.setItem("p_bill_data", JSON.stringify(data));
        }

        // Clean navigation with ONLY a timestamp to force fresh load
        router.push(`/results?ts=${Date.now()}`);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Shield className="w-6 h-6 text-blue-500" />
                        <span className="font-bold text-lg">MediShield <span className="text-blue-500">AI</span></span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                            JD
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <AnimatePresence mode="wait">
                    {!isUploading && !isEditing ? (
                        <motion.div
                            key="upload-ui"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="space-y-6 pt-8"
                        >
                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-bold mb-3">Upload Medical Bill</h1>
                                <p className="text-slate-400">Our AI will scan your bill for real-time scam detection.</p>
                            </div>

                            <div
                                className={cn(
                                    "border-2 border-dashed border-white/10 rounded-3xl p-12 text-center transition-all",
                                    file ? "bg-blue-600/5 border-blue-500/50" : "bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
                                )}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const f = e.dataTransfer.files[0];
                                    if (f) setFile(f);
                                }}
                            >
                                <div className="max-w-xs mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-xl">
                                        {file ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : <Upload className="w-8 h-8 text-blue-500" />}
                                    </div>

                                    {file ? (
                                        <div className="mb-8">
                                            <p className="font-semibold text-white mb-1 truncate">{file.name}</p>
                                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • Ready to Analyze</p>
                                            <button onClick={() => setFile(null)} className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1 mx-auto">
                                                <X className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mb-8">
                                            <p className="text-lg font-semibold text-white mb-2">Drag & drop your bill here</p>
                                            <p className="text-sm text-slate-500">PDF, JPG, PNG supported</p>
                                        </div>
                                    )}

                                    <input type="file" id="file-upload" className="hidden" onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) setFile(f);
                                    }} />

                                    {!file ? (
                                        <label htmlFor="file-upload" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all cursor-pointer">
                                            Browse Files
                                        </label>
                                    ) : (
                                        <Button onClick={handleUpload} className="w-full h-12 rounded-full">
                                            Scan Bill Content <ChevronRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all text-left">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Camera className="w-5 h-5" /></div>
                                    <div><p className="font-semibold text-sm">Use Camera</p><p className="text-xs text-slate-500">Perfect for mobile</p></div>
                                </button>
                                <button onClick={handleDemo} className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all text-left group">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><PlayCircle className="w-5 h-5" /></div>
                                    <div><p className="font-semibold text-sm">Demo Sample Bill</p><p className="text-xs text-slate-500">See magic in action</p></div>
                                </button>
                            </div>
                        </motion.div>
                    ) : isUploading ? (
                        <motion.div key="scanning-ui" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-20 flex flex-col items-center justify-center">
                            <div className="relative w-56 h-56 mb-12">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                    <motion.circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={628} strokeDashoffset={628 - (628 * progress) / 100} className="text-blue-500" transition={{ duration: 0.5 }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                                    <span className="text-2xl font-bold text-white">{progress}%</span>
                                </div>

                                {/* Scanning Effect Overlay */}
                                <motion.div
                                    className="absolute left-0 right-0 h-1 bg-blue-500/50 blur-sm z-20"
                                    animate={{ top: ["20%", "80%", "20%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                            <div className="text-center max-w-sm">
                                <h3 className="text-2xl font-bold mb-3 tracking-tight text-white">{loadingMessage}</h3>
                                <p className="text-slate-500 text-sm animate-pulse">Our AI is verifying every line item against medical standards...</p>

                                <div className="mt-8 flex justify-center gap-2">
                                    {[0, 1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            className={cn("w-2 h-2 rounded-full", progress > (i + 1) * 20 ? "bg-blue-500" : "bg-white/10")}
                                            animate={{ scale: progress > (i + 1) * 20 ? [1, 1.2, 1] : 1 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        // Fallback Edit UI (Normally Bypassed)
                        <motion.div key="edit-ui" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-8 text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Extraction Successful</h2>
                            <p className="text-slate-400 mb-8">Redirecting to your audit report...</p>
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
