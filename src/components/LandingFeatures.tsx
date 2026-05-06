import React from "react";
import { motion } from "framer-motion";
import { Zap, Activity, ShieldCheck, GraduationCap, Heart, Clock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Motor Fisiológico Dinâmico",
    description: "Cada ação gera respostas sistêmicas reais. O paciente reage em tempo real a drogas, manobras e tempo decorrido."
  },
  {
    icon: Activity,
    title: "Cenários de Alto Rigor",
    description: "Casos baseados na vida real, desde paradas cardiorrespiratórias até choques indiferenciados e trauma complexo."
  },
  {
    icon: ShieldCheck,
    title: "Debriefing Implacável",
    description: "Feedback técnico profundo baseado em guidelines internacionais. Aprenda com o erro em um ambiente seguro."
  },
  {
    icon: GraduationCap,
    title: "Treinamento de Reflexo",
    description: "Não é apenas sobre saber, é sobre agir. Desenvolva a intuição necessária para tomar decisões sob pressão extrema."
  },
  {
    icon: Clock,
    title: "Tempo é Vida",
    description: "O sistema monitora cada segundo. Atrasos na conduta têm consequências diretas no desfecho clínico do paciente."
  },
  {
    icon: Heart,
    title: "Protocolos Reais",
    description: "Treine aderência total aos protocolos ACLS, ATLS e PALS com validação passo a passo de cada conduta."
  }
];

const LandingFeatures: React.FC = () => {
  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary">Arquitetura de Alto Rigor</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-white">Funcionalidades do Sistema</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-xl font-medium">
            Uma plataforma desenhada por especialistas para transformar teoria em reflexo clínico imediato.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 hover:border-primary/40 transition-all hover:bg-white/[0.04] group hover:-translate-y-2"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-primary/20 shadow-inner shadow-primary/20">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;