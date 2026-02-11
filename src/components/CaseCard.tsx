import { ClinicalCase } from '@/types/medical';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, ChevronRight } from 'lucide-react';

interface CaseCardProps {
  clinicalCase: ClinicalCase;
}

const difficultyConfig = {
  easy: { label: 'Fácil', className: 'bg-success/15 text-success' },
  medium: { label: 'Médio', className: 'bg-warning/15 text-warning' },
  hard: { label: 'Difícil', className: 'bg-critical/15 text-critical' },
};

const CaseCard = ({ clinicalCase }: CaseCardProps) => {
  const navigate = useNavigate();
  const diff = difficultyConfig[clinicalCase.difficulty];

  return (
    <button
      onClick={() => navigate(`/simulation/${clinicalCase.id}`)}
      className="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', diff.className)}>
              {diff.label}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {clinicalCase.specialty}
            </span>
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1 truncate">{clinicalCase.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{clinicalCase.description}</p>
        </div>
        <div className="flex flex-col items-center gap-1 pt-1">
          {clinicalCase.completed ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : (
            <Clock className="h-5 w-5 text-muted-foreground" />
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
};

export default CaseCard;
