import { Shield, Search, AlertCircle, FileText, Smartphone, Zap } from "lucide-react";

const features = [
    {
        title: "Duplicate Charge Detection",
        description: "Our AI identifies repeated medicines or services charged multiple times on the same bill.",
        icon: Shield,
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        title: "Market Benchmark Audit",
        description: "Auto-compare medicine charges with average market benchmarks from top pharmacy chains.",
        icon: Search,
        color: "bg-purple-500/10 text-purple-500",
    },
    {
        title: "Total Mismatch Filter",
        description: "Ensures the sum of every line item matches the final total billed amount perfectly.",
        icon: AlertCircle,
        color: "bg-red-500/10 text-red-500",
    },
    {
        title: "Complaint Generator",
        description: "Generate professional, ready-to-send letters to hospital management for disputed charges.",
        icon: FileText,
        color: "bg-amber-500/10 text-amber-500",
    },
    {
        title: "Multi-device Capture",
        description: "Scan bills easily using your phone camera or upload PDFs directly from your desktop.",
        icon: Smartphone,
        color: "bg-green-500/10 text-green-500",
    },
    {
        title: "Instant AI Explanation",
        description: "Complex billing jargon translated into simple language so you understand every charge.",
        icon: Zap,
        color: "bg-indigo-500/10 text-indigo-500",
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[#111827]">Powerful Auditing Features</h2>
                    <p className="text-[#6b7280] max-w-2xl mx-auto">
                        MediShield AI doesn't just read your bill—it understands it, protects you,
                        and helps you get your money back.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="p-8 rounded-2xl border border-[#e5e7eb] bg-white hover:border-[#0d6efd]/30 hover:shadow-lg transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#111827]">{feature.title}</h3>
                            <p className="text-[#6b7280] leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
