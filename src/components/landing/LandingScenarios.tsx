import React from "react";
import { motion } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import { ClinicalCase } from "@/types/medical";

interface LandingScenariosProps {
  mockCases: ClinicalCase[];
  onStart: () => void;
}

const LandingScenarios: React.FC<LandingScenariosProps> = ({ mockCases, onStart }) => {
  const goToLibrary = () => {
    try {
      localStorage.setItem("pulzu_intent", "library");
    } catch {}
    onStart();
  };

  return (
    <section id="cases" className="py-32 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-6"
            >
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Biblioteca de Casos</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-foreground uppercase">Cenários Reais</h2>
            <p className="text-muted-foreground text-lg font-medium tracking-tight">
              Enfrente os desafios mais complexos do plantão com casos gerados dinamicamente para cada especialidade.
            </p>
          </div>
          <button 
            onClick={goToLibrary}
            className="group flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-primary hover:text-primary/80 transition-all"
          >
            Ver todos os casos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCases.map((clinicalCase, index) => (
            <motion.div
              key={clinicalCase.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 hover:border-primary/40 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full ${
                    clinicalCase.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {clinicalCase.difficulty === 'hard' ? 'DIFFICULT' : 'INTERMEDIATE'}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {clinicalCase.specialty}
                  </span>
                </div>
                <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-tight group-hover:text-primary transition-colors">
                  {clinicalCase.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-8 line-clamp-2 font-medium leading-relaxed">
                  {clinicalCase.description}
                </p>
                <button 
                  onClick={goToLibrary}
                  className="w-full py-4 rounded-xl border-2 border-border font-black text-[10px] tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-[0.98]"
                >
                  INICIAR SIMULAÇÃO
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingScenarios;
