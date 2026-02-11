import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import CaseCard from '@/components/CaseCard';
import { mockCases, specialties, difficulties } from '@/data/cases';

const CaseLobby = () => {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('Todas');
  const [difficulty, setDifficulty] = useState('all');

  const filtered = useMemo(() => {
    return mockCases.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                         c.description.toLowerCase().includes(search.toLowerCase());
      const matchSpecialty = specialty === 'Todas' || c.specialty === specialty;
      const matchDifficulty = difficulty === 'all' || c.difficulty === difficulty;
      return matchSearch && matchSpecialty && matchDifficulty;
    });
  }, [search, specialty, difficulty]);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="px-5 pt-12 pb-4">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-extrabold text-foreground"
        >
          Casos Clínicos
        </motion.h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {filtered.length} {filtered.length === 1 ? 'caso disponível' : 'casos disponíveis'}
        </p>
      </header>

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar caso..."
            className="w-full min-h-[44px] rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Specialty Filter */}
      <div className="px-5 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {specialties.map(s => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={`shrink-0 min-h-[36px] rounded-full px-4 text-xs font-semibold transition-all ${
                specialty === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="px-5 mb-4">
        <div className="flex gap-2">
          {difficulties.map(d => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`min-h-[32px] rounded-lg px-3 text-[11px] font-semibold transition-all ${
                difficulty === d.value
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      <div className="px-5 space-y-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <CaseCard clinicalCase={c} />
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Filter className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum caso encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseLobby;
