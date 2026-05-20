import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, Stethoscope, Sparkles, Play, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  caseLibrary,
  LIBRARY_SPECIALTIES,
  LIBRARY_LEVELS,
} from "@/data/caseLibrary";
import { LibraryCase } from "@/types/caseLibrary";
import { StartParams } from "@/types/simulation";
import { buildStructuredCasePrompt } from "@/lib/buildStructuredCasePrompt";


interface CaseLibraryTabProps {
  onStartGame: (params: StartParams) => void;
  isLoading?: boolean;
}

const levelStyles: Record<LibraryCase["level"], string> = {
  Básico: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Intermediário: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Avançado: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const CaseLibraryTab: React.FC<CaseLibraryTabProps> = ({ onStartGame, isLoading }) => {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string>("Todos");
  const [level, setLevel] = useState<string>("Todos os níveis");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return caseLibrary.filter((c) => {
      const matchSpecialty =
        specialty === "Todos" ||
        c.specialty === specialty ||
        (c.tags ?? []).includes(specialty);
      const matchLevel = level === "Todos os níveis" || c.level === level;
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.specialty.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.competencies.some((k) => k.toLowerCase().includes(q));
      return matchSpecialty && matchLevel && matchQuery;
    });
  }, [query, specialty, level]);

  const handleStart = (c: LibraryCase) => {
    onStartGame({
      especialidade: c.engineSpecialty,
      dificuldade: c.engineDifficulty,
      caso_especifico: buildStructuredCasePrompt(c),
    });
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
          <BookMarked className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
            Biblioteca Clínica
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
          Biblioteca de Casos
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Escolha um cenário clínico, teste sua tomada de decisão e desenvolva
          raciocínio prático em situações de alta relevância.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por caso, especialidade ou síndrome clínica..."
          className="w-full h-14 pl-12 pr-5 rounded-2xl bg-card border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
        />
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <FilterRow
          label="Especialidade"
          options={[...LIBRARY_SPECIALTIES]}
          value={specialty}
          onChange={setSpecialty}
        />
        <FilterRow
          label="Nível"
          options={[...LIBRARY_LEVELS]}
          value={level}
          onChange={setLevel}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Nenhum caso encontrado com esses filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((c, idx) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="group relative flex flex-col rounded-2xl bg-card border border-border p-7 hover:border-primary/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between mb-5">
                <span
                  className={cn(
                    "text-[10px] font-black tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border",
                    levelStyles[c.level],
                  )}
                >
                  {c.level}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Stethoscope className="h-3 w-3 text-primary" />
                  {c.specialty}
                </span>
              </div>

              <h3 className="text-lg font-black text-foreground leading-snug mb-3 tracking-tight group-hover:text-primary transition-colors">
                {c.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                {c.description}
              </p>

              <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground mb-5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {c.duration}
              </div>

              <div className="mb-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" /> Competências
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.competencies.slice(0, 3).map((k) => (
                    <span
                      key={k}
                      className="text-[10px] font-semibold text-foreground/80 bg-muted/60 border border-border/60 px-2.5 py-1 rounded-full"
                    >
                      {k}
                    </span>
                  ))}
                  {c.competencies.length > 3 && (
                    <span className="text-[10px] font-semibold text-muted-foreground px-1.5 py-1">
                      +{c.competencies.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleStart(c)}
                disabled={isLoading}
                className="mt-auto w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-[0.18em] shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Play className="h-3.5 w-3.5" />
                Iniciar simulação
              </button>
            </motion.article>
          ))}
        </div>
      )}
    </motion.div>
  );
};

interface FilterRowProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

const FilterRow: React.FC<FilterRowProps> = ({ label, options, value, onChange }) => (
  <div className="space-y-2">
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </p>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-4 h-9 rounded-full text-xs font-bold tracking-tight transition-all border",
              active
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

export default CaseLibraryTab;
