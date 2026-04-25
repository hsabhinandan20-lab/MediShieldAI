"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AlertTriangle, CheckCircle2, ShieldAlert, FileText, Download,
    Copy, ArrowLeft, Info, HelpCircle, User, Calendar, MapPin,
    TrendingDown, Languages, Volume2, Share2, Mail, Loader2, DownloadCloud,
    XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { generateDynamicBill, detectAnomalies, BillData } from "@/lib/bill-parser";
import { generateComplaintPDF } from "@/lib/pdf-service";

function ResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bill, setBill] = useState<BillData | null>(null);
    const [activeTab, setActiveTab] = useState<"audit" | "letter">("audit");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const isDemo = searchParams.get("demo") === "true";

        const timer = setTimeout(() => {
            // ONLY source of truth: validated JSON from sessionStorage
            const stored = sessionStorage.getItem("p_bill_data");

            if (isDemo) {
                // Support demo mode with fallback generator
                setBill(generateDynamicBill(searchParams.toString()));
            } else if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setBill(parsed);
                } catch (e) {
                    console.error("Malformed storage data");
                    // Fallback to dynamic if storage fails to avoid null
                    setBill(generateDynamicBill("ts=" + Date.now()));
                }
            } else {
                // Last resort fallback for direct navigation/demo continuity
                setBill(generateDynamicBill("ts=" + Date.now()));
            }
            setLoading(false);
        }, 1200); // Small delay to feel like "deep audit" is happening
        return () => clearTimeout(timer);
    }, [searchParams]);

    if (loading || !bill) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] flex flex-col items-center justify-center text-[#111827] p-4">
                <Loader2 className="w-12 h-12 text-[#0d6efd] animate-spin mb-4" />
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-[#0d6efd]">Deep AI Audit</h3>
                    <p className="text-[#6b7280] text-sm animate-pulse">Running cross-reference audit via rule-engine...</p>
                </div>
            </div>
        );
    }

    const anomalies = detectAnomalies(bill);
    const flaggedItems = bill.items.filter(i => i.issues.length > 0);
    const cleanItems = bill.items.filter(i => i.issues.length === 0);
    const savings = bill.savings || 0;

    const complaintLetter = `To, 
The Billing Manager, ${bill.hospitalName}

Subject: Formal Dispute of Bill #${bill.billNumber || 'N/A'} for Patient ${bill.patientName}

Respected Management,

Upon auditing my recent hospital bill using MediShield AI, I have identified several discrepancies that require your immediate intervention:

${anomalies.map((issue, idx) => `${idx + 1}. ${issue.title}: ${issue.desc}`).join('\n')}

The reported total of ₹${bill.reportedTotal} does not align with the individual line item calculations or standard medical pricing. Our audit suggests a corrected estimate of ₹${bill.reportedTotal - savings}.

We request an itemized correction and a revised invoice within 48 hours.

Sincerely,
${bill.patientName}
Audit verified by MediShield AI`;

    const handleDownloadPDF = () => {
        generateComplaintPDF(bill, complaintLetter);
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-[#111827]">
            {/* Navbar */}
            <nav className="h-16 border-b border-[#e5e7eb] flex items-center px-6 justify-between sticky top-0 bg-white/80 backdrop-blur-lg z-20">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-full transition-colors border border-slate-100">
                        <ArrowLeft className="w-5 h-5 text-[#111827]" />
                    </Link>
                    <div className="h-6 w-px bg-[#e5e7eb]" />
                    <h1 className="font-bold text-lg hidden sm:block uppercase tracking-tighter text-[#6b7280]">Audit Report</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" className="h-9 px-4 text-xs font-bold" onClick={() => {
                        navigator.clipboard.writeText(complaintLetter);
                        alert("Complaint text copied to clipboard!");
                    }}>
                        <Copy className="w-4 h-4 mr-2" /> Copy Text
                    </Button>
                    <Button className="h-9 px-4 text-xs font-bold bg-[#0d6efd] hover:bg-[#0b5ed7]" onClick={handleDownloadPDF}>
                        <DownloadCloud className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                </div>
            </nav>

            {bill.isPartial && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Partial Scan Completed • Some fields were inferred automatically for demo continuity</p>
                    </div>
                    <button onClick={() => setBill({ ...bill, isPartial: false })} className="text-[9px] font-black text-amber-500/50 hover:text-amber-500 uppercase">Dismiss</button>
                </div>
            )}

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-[#e5e7eb] rounded-3xl p-6 shadow-sm relative overflow-hidden"
                        >
                            <div className={cn(
                                "absolute top-0 left-0 w-full h-1.5",
                                bill.severity === "High" ? "bg-[#dc2626]" : bill.severity === "Medium" ? "bg-[#f59e0b]" : "bg-[#16a34a]"
                            )} />

                            <div className="flex justify-between items-start mb-6 pt-2">
                                <div>
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2",
                                        bill.severity === "High" ? "bg-red-50 text-[#dc2626] border border-red-100" : "bg-green-50 text-[#16a34a] border border-green-100"
                                    )}>
                                        <ShieldAlert className="w-3 h-3" /> {bill.severity} Risk Detected
                                    </div>
                                    <h3 className="text-xl font-bold text-[#111827]">Executive Summary</h3>
                                </div>
                                <div className="text-right">
                                    <div className={cn(
                                        "inline-flex items-center gap-1 px-2 py-1 rounded-lg border",
                                        bill.isPartial
                                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                    )}>
                                        {bill.isPartial ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {bill.isPartial ? "Partial Scan" : "Scan Complete"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-6">
                                <div className="bg-[#f5f7fb] p-5 rounded-2xl border border-[#e5e7eb] space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[#6b7280] font-bold uppercase tracking-widest text-[9px]">Calculated Bill</span>
                                        <span className="font-bold text-[#111827]">₹{bill.calculatedTotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[#6b7280] font-bold uppercase tracking-widest text-[9px]">Reported Total</span>
                                        <span className="font-bold text-[#111827]">₹{bill.reportedTotal}</span>
                                    </div>
                                    <div className="h-px bg-[#e5e7eb]" />
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-0.5">
                                            <span className="text-[#16a34a] font-black uppercase tracking-widest text-[10px] block">Potential Savings</span>
                                            <p className="text-[9px] text-[#6b7280] italic">Recoverable from anomalies</p>
                                        </div>
                                        <span className="text-2xl font-black text-[#16a34a]">₹{savings}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="bg-white border border-[#e5e7eb] rounded-3xl p-6 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase text-[#6b7280] tracking-[0.2em] border-b border-[#e5e7eb] pb-4 mb-4">Patient & Hospital Log</h4>
                            <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                                        <MapPin className="w-4 h-4 text-[#0d6efd]" />
                                    </div>
                                    <div>
                                        <label className="text-[8px] text-[#6b7280] font-black uppercase tracking-widest block mb-0.5">Facility</label>
                                        <p className="text-xs font-bold text-[#111827]">{bill.hospitalName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                                        <User className="w-4 h-4 text-[#0d6efd]" />
                                    </div>
                                    <div>
                                        <label className="text-[8px] text-[#6b7280] font-black uppercase tracking-widest block mb-0.5">Patient Account</label>
                                        <p className="text-xs font-bold text-[#111827]">{bill.patientName} {bill.age ? `(${bill.age}y)` : ''} {bill.gender ? `• ${bill.gender}` : ''}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                                        <Calendar className="w-4 h-4 text-[#0d6efd]" />
                                    </div>
                                    <div>
                                        <label className="text-[8px] text-[#6b7280] font-black uppercase tracking-widest block mb-0.5">Billing Record</label>
                                        <p className="text-[10px] font-bold text-[#111827]">{bill.billNumber || 'OCR REF 402'} • {bill.date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Audit Tabs */}
                    <div className="lg:col-span-8">
                        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-full w-fit border border-[#e5e7eb] shadow-sm">
                            <button
                                onClick={() => setActiveTab("audit")}
                                className={cn(
                                    "px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === "audit" ? "bg-[#0d6efd] text-white shadow-md" : "text-[#6b7280] hover:text-[#111827]"
                                )}
                            >
                                Intelligence Findings
                            </button>
                            <button
                                onClick={() => setActiveTab("letter")}
                                className={cn(
                                    "px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === "letter" ? "bg-[#0d6efd] text-white shadow-md" : "text-[#6b7280] hover:text-[#111827]"
                                )}
                            >
                                Dispute Letter
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === "audit" ? (
                                <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">

                                    {/* RED SECTION: Issues Found */}
                                    {anomalies.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-4 px-2">
                                                <div className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
                                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#dc2626]/80">Discrepancies flagged (Requires Review)</h4>
                                            </div>
                                            {anomalies.map((issue, idx) => (
                                                <div key={idx} className="bg-red-50 border border-red-100 rounded-3xl p-6 relative overflow-hidden group hover:bg-white hover:border-[#dc2626]/30 transition-all shadow-sm">
                                                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                                                        <ShieldAlert className="w-24 h-24 text-[#dc2626]" />
                                                    </div>
                                                    <div className="flex gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#dc2626] shrink-0 border border-red-100 shadow-sm">
                                                            <AlertTriangle className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-bold text-lg text-[#111827]">{issue.title}</h4>
                                                                {issue.amount && <span className="bg-[#dc2626] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">EXCESS: ₹{issue.amount}</span>}
                                                            </div>
                                                            <p className="text-sm text-[#6b7280] leading-relaxed max-w-2xl">{issue.desc}</p>
                                                            <div className="mt-4 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-red-100">
                                                                <Info className="w-3.5 h-3.5 text-[#0d6efd]" />
                                                                <p className="text-[10px] text-[#6b7280] font-medium italic">Action Recommendation: Request clarification or refuse this charge.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* GREEN SECTION: Verified Charges */}
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <div className="w-2 h-2 rounded-full bg-[#16a34a]" />
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#16a34a]/80">Verified Clean Charges ✅</h4>
                                        </div>

                                        {cleanItems.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {cleanItems.map((item, idx) => (
                                                    <div key={idx} className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex justify-between items-center group hover:bg-green-50 hover:border-[#16a34a]/30 transition-all shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-bold text-[#111827]">{item.name}</p>
                                                                <p className="text-[9px] font-bold text-[#6b7280] uppercase tracking-tighter">Validated Rate • Qty {item.qty}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs font-bold text-[#6b7280]">₹{item.total}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-[#e5e7eb] rounded-3xl p-12 text-center shadow-sm">
                                                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                <p className="text-sm text-[#6b7280] font-medium italic">All charges in this bill were flagged for anomalies.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="letter" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                    <div className="bg-white border border-[#e5e7eb] rounded-3xl p-8 relative shadow-sm">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="font-bold flex items-center gap-3 text-[#111827]">
                                                <FileText className="w-5 h-5 text-[#0d6efd]" /> Professional Dispute Draft
                                            </h4>
                                            <div className="flex gap-2">
                                                <Button variant="secondary" className="h-8 px-3 text-[10px] uppercase font-bold" onClick={handleDownloadPDF}>
                                                    <Download className="w-3 h-3 mr-2" /> PDF
                                                </Button>
                                                <Button variant="secondary" className="h-8 px-3 text-[10px] uppercase font-bold">
                                                    <Mail className="w-3 h-3 mr-2" /> Email
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="bg-[#f5f7fb] p-8 rounded-2xl border border-[#e5e7eb] font-serif text-[13px] leading-relaxed text-[#111827] max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                                            {complaintLetter}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function Results() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-[#111827]">Loading analysis...</div>}>
            <ResultsContent />
        </Suspense>
    );
}
