import React from "react";
import { motion } from "framer-motion";

interface LandingCTAProps {
  onStart: () => void;
}

const LandingCTA: React.FC<LandingCTAProps> = ({ onStart }) => {
  return (
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
  );
};

export default LandingCTA;
