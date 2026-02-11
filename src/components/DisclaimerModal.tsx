import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('simulamed-disclaimer');
    if (!dismissed) setIsOpen(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('simulamed-disclaimer', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-md w-full rounded-2xl bg-card p-6 shadow-2xl border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/15">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Aviso Importante</h2>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground mb-6">
              O <strong className="text-foreground">SIMULAMED</strong> é uma ferramenta{' '}
              <strong className="text-foreground">exclusivamente educacional</strong> destinada
              ao treinamento de raciocínio clínico. Os cenários são fictícios e simulados por IA.
            </p>

            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-6">
              <p className="text-xs font-semibold text-destructive">
                ⚠️ NÃO utilize esta plataforma para conduta clínica real. Sempre consulte
                protocolos oficiais e profissionais habilitados.
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Eu compreendo — Entrar na plataforma
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerModal;
