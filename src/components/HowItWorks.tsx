import { Upload, FileSearch, ShieldAlert, FileText } from "lucide-react";

const steps = [
    {
        title: "Upload Your Bill",
        desc: "Take a photo of your hospital invoice or upload a PDF/JPG directly.",
        icon: Upload,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        title: "AI Analysis",
        desc: "Our neural engine scans every line item for pricing anomalies and duplicates.",
        icon: FileSearch,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
    {
        title: "Fraud Detection",
        desc: "Instantly see flagged items, hidden taxes, and inflated totals.",
        icon: ShieldAlert,
        color: "text-red-500",
        bg: "bg-red-500/10",
    },
    {
        title: "Get Reimbursed",
        desc: "Generate a legal complaint letter and request a corrected invoice.",
        icon: FileText,
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[#111827]">How It Works</h2>
                    <p className="text-[#6b7280] max-w-2xl mx-auto">
                        From upload to recovery in less than 60 seconds.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-10 transform -translate-y-8" />

                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className={`w-16 h-16 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform relative z-10 bg-white`}>
                                <step.icon className="w-8 h-8" />
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-[10px] font-bold flex items-center justify-center border border-slate-200 text-[#111827]">
                                    {i + 1}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-3 text-[#111827]">{step.title}</h3>
                            <p className="text-sm text-[#6b7280] leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
