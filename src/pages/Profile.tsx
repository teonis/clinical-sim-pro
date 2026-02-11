import { motion } from 'framer-motion';
import { User, BarChart3, BookOpen, Award, LogOut } from 'lucide-react';

const Profile = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="px-5 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-extrabold text-foreground"
        >
          Meu Perfil
        </motion.h1>
      </header>

      {/* Avatar */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Estudante</h2>
            <p className="text-xs text-muted-foreground">Medicina — 6º ano (Internato)</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="px-5 mb-6">
        <h3 className="text-sm font-bold text-foreground mb-3">Desempenho</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatBox icon={<BookOpen className="h-4 w-4" />} label="Casos realizados" value="1" />
          <StatBox icon={<Award className="h-4 w-4" />} label="Score médio" value="--" />
          <StatBox icon={<BarChart3 className="h-4 w-4" />} label="Melhor área" value="--" />
          <StatBox icon={<BarChart3 className="h-4 w-4" />} label="Área p/ melhorar" value="--" />
        </div>
      </section>

      {/* Info */}
      <section className="px-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            📊 O sistema de performance será alimentado conforme você completa os casos clínicos. 
            Continue praticando para visualizar sua evolução por especialidade.
          </p>
        </div>
      </section>

      <footer className="mt-auto px-5 py-4">
        <p className="text-[10px] text-center text-muted-foreground">
          ⚠️ Ferramenta exclusivamente educacional.
        </p>
      </footer>
    </div>
  );
};

const StatBox = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-4">
    <div className="text-primary">{icon}</div>
    <span className="font-mono text-xl font-bold text-foreground">{value}</span>
    <span className="text-[10px] text-muted-foreground text-center">{label}</span>
  </div>
);

export default Profile;
