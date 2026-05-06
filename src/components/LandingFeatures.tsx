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
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Funcionalidades do Sistema</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Uma plataforma desenhada para transformar teoria em reflexo clínico imediato.
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
              className="bg-card p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-xl group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-primary/10">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
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