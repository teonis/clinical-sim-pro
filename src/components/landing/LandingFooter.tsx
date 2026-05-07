import React from "react";
import { ShieldAlert } from "lucide-react";

const LandingFooter: React.FC = () => {
  return (
    <footer className="py-24 border-t border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-black text-sm text-center">P</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black tracking-tighter text-2xl text-foreground leading-none">PULZU</span>
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-muted-foreground leading-none mt-1">Medical Simulator</span>
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
            © 2026 BOLUS Simulator
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
