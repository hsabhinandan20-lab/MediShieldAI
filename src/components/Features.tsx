import { Shield, Search, AlertCircle, FileText, Smartphone, Zap } from "lucide-react";

const features = [
    {
        title: "Duplicate Charge Detection",
        description: "Our AI identifies repeated medicines or services charged multiple times on the same bill.",
        icon: Shield,
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        title: "MRP Price Audit",
        description: "Auto-compare medicine charges with real-time MRP data to catch overpricing instantly.",
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
        <section id="features" className="py-24 bg-slate-950/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Auditing Features</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        MediShield AI doesn't just read your bill—it understands it, protects you,
                        and helps you get your money back.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
