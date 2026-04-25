import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />


      {/* Footer Placeholder for now */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© 2024 MediShield AI. Because every patient deserves a fair bill.</p>
        </div>
      </footer>
    </main>
  );
}
