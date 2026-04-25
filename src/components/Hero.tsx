"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, ShieldCheck, FileSearch } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative pt-20 pb-32 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Trusted by 10,000+ Patients & Families</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                    >
                        AI That Protects You From <br />
                        <span className="text-gradient">Medical Bill Scams</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl"
                    >
                        Upload any hospital bill and instantly detect fraud, duplicate charges,
                        inflated medicine prices, and hidden taxes. Because every patient deserves a fair bill.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 mb-16"
                    >
                        <Link href="/dashboard">
                            <Button className="h-12 px-8 text-base">
                                Analyze My Bill <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Button variant="outline" className="h-12 px-8 text-base">
                            <Play className="mr-2 w-4 h-4 fill-white" /> Watch Demo
                        </Button>
                    </motion.div>

                    {/* Floating UI Elements / Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="relative w-full max-w-5xl mx-auto"
                    >
                        <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full -z-10" />
                        <div className="glass-dark border border-white/10 rounded-2xl p-4 md:p-8 shadow-2xl relative overflow-hidden group text-left">
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                        <FileSearch className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">HOSPITAL_INVOICE_042.PDF</h4>
                                        <p className="text-xs text-slate-500">Scanning in progress...</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/40" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400/20 border border-yellow-400/40" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/40" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: "Duplicate Items", count: "3 Detected", color: "text-red-400" },
                                    { label: "Price Anomaly", count: "₹4,250 Over", color: "text-amber-400" },
                                    { label: "Total Mismatch", count: "₹1,200 Gap", color: "text-red-400" },
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                                        <p className={cn("font-bold text-lg", item.color)}>{item.count}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Decorative Lines */}
                            <div className="mt-8 space-y-3 opacity-20">
                                <div className="h-2 w-full bg-white/20 rounded-full" />
                                <div className="h-2 w-3/4 bg-white/20 rounded-full" />
                                <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                            </div>

                            <div className="absolute bottom-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
                                    <CheckCircle2 className="w-4 h-4" /> Scam Prevented
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
