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
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-6"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Simulação de Alto Rigor</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-foreground uppercase">Excelência Clínica</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium tracking-tight">
            Uma plataforma minimalista desenhada para transformar teoria em reflexo clínico imediato.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card p-10 rounded-[2rem] border border-border hover:border-primary/30 transition-all hover:shadow-xl group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-8 border border-primary/10 transition-transform group-hover:scale-110">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground uppercase tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
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