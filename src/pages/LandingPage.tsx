import React from "react";
import LandingHero from "@/components/LandingHero";
import LandingFeatures from "@/components/LandingFeatures";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border scroll-smooth">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-sm">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tighter text-2xl text-foreground leading-none">BOLUS</span>
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-muted-foreground leading-none mt-1">Simulador Clínico</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 mr-4">
              <a href="#features" className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">Funcionalidades</a>
              <a href="#cases" className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">Cenários</a>
            </nav>
            <ThemeToggle />
            <button 
              onClick={onStart}
              className="text-[10px] font-bold tracking-widest px-8 py-3 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              ENTRAR
            </button>
          </div>
        </div>
      </header>

      <main>
        <LandingHero onStart={onStart} />
        <LandingFeatures />
        
        {/* Call to Action Section */}
        <section className="py-24 border-t border-border/50">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto p-12 rounded-[2rem] bg-primary text-primary-foreground shadow-2xl relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
              
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Pronto para o plantão?</h2>
              <p className="text-primary-foreground/80 text-lg mb-10 leading-relaxed">
                Não espere a emergência real para testar seus conhecimentos. 
                Comece agora sua simulação no BOLUS e refine sua conduta.
              </p>
              <button 
                onClick={onStart}
                className="px-10 py-5 bg-white text-primary font-black rounded-xl hover:scale-105 transition-all shadow-xl text-lg"
              >
                CRIAR MINHA CONTA GRÁTIS
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-24 border-t border-border bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-primary-foreground font-black text-sm">B</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-black tracking-tighter text-2xl text-foreground leading-none">BOLUS</span>
                  <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-muted-foreground leading-none mt-1">Medical OS v4</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center md:text-left font-medium max-w-xs leading-relaxed">
                Simulação de alto rigor para profissionais que buscam a excelência clínica através de um design minimalista.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex items-center gap-10">
                <a href="#" className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">Privacidade</a>
                <a href="#" className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">Termos</a>
                <a href="#" className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">Suporte</a>
              </div>
              <div className="flex items-start gap-3 max-w-sm p-4 bg-muted/50 rounded-2xl border border-border">
                <ShieldAlert className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-muted-foreground leading-normal uppercase tracking-wider opacity-80">
                  EXCLUSIVAMENTE EDUCACIONAL. O BOLUS NÃO SUBSTITUI O JULGAMENTO CLÍNICO PROFISSIONAL E NÃO DEVE SER UTILIZADO EM AMBIENTES DE ASSISTÊNCIA REAL.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-border text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em]">
              © 2026 BOLUS Simulator • Clinical Minimalist Design
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;