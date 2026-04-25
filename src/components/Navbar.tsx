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
            className="sticky top-0 z-50 w-full border-b border-white/10 glass-dark"
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">
                        MediShield <span className="text-blue-500">AI</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                    <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
                    <Link href="#testimonials" className="hover:text-white transition-colors">Success Stories</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="hidden sm:block text-sm font-medium hover:text-white transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    >
                        Analyze Bill <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}
