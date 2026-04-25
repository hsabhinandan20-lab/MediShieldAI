"use client";

import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Navbar() {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md"
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-[#0d6efd] p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-[#111827]">
                        MediShield <span className="text-[#0d6efd]">AI</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6b7280]">
                    <Link href="#features" className="hover:text-[#0d6efd] transition-colors">Features</Link>
                    <Link href="#how-it-works" className="hover:text-[#0d6efd] transition-colors">How it Works</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="hidden sm:block text-sm font-medium text-[#6b7280] hover:text-[#111827] transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                    >
                        Analyze Bill <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}
