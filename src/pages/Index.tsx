import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, BookOpen, TrendingUp, Activity } from 'lucide-react';
import DisclaimerModal from '@/components/DisclaimerModal';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <DisclaimerModal />
      
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">SIMULAMED</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Simulação Clínica
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Treine seu raciocínio clínico com casos interativos
          </p>
        </motion.div>
      </header>

      {/* Quick Stats */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<BookOpen className="h-4 w-4" />} value="6" label="Casos" />
          <StatCard icon={<Stethoscope className="h-4 w-4" />} value="1" label="Concluído" />
          <StatCard icon={<TrendingUp className="h-4 w-4" />} value="--" label="Score" />
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 mb-6">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/cases')}
          className="w-full min-h-[56px] rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Iniciar Simulação
        </motion.button>
      </section>

      {/* Feature Cards */}
      <section className="px-5">
        <h2 className="text-sm font-bold text-foreground mb-3">Como funciona</h2>
        <div className="space-y-3">
          <FeatureCard
            step="1"
            title="Escolha um caso clínico"
            description="Selecione entre diferentes especialidades e níveis de dificuldade."
          />
          <FeatureCard
            step="2"
            title="Conduza o atendimento"
            description="Solicite exames, prescreva medicações e observe as reações do paciente em tempo real."
          />
          <FeatureCard
            step="3"
            title="Receba feedback"
            description="Ao final, veja um debriefing detalhado comparando sua conduta com o padrão-ouro."
          />
        </div>
      </section>

      {/* Disclaimer footer */}
      <footer className="mt-auto px-5 py-4">
        <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
          ⚠️ Ferramenta exclusivamente educacional. Não utilizar para conduta clínica real.
        </p>
      </footer>
    </div>
  );
};

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3"
  >
    <div className="text-primary">{icon}</div>
    <span className="font-mono text-xl font-bold text-foreground">{value}</span>
    <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
  </motion.div>
);

const FeatureCard = ({ step, title, description }: { step: string; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 * parseInt(step) }}
    className="flex gap-3 rounded-xl border border-border bg-card p-4"
  >
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
      {step}
    </div>
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  </motion.div>
);

export default Index;
