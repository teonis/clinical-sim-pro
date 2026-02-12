import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Lock, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordScreenProps {
  onComplete: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onComplete }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada com sucesso!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Erro ao redefinir senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="gradient-brand p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/15 backdrop-blur-md mb-4 shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">SIMULAMED</h1>
            <p className="text-white/70 text-xs font-medium tracking-widest uppercase mt-1">By Time Rocha</p>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">Nova senha</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase">Nova senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase">Confirmar senha</Label>
              <div className="relative mt-1">
                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full py-6 font-bold">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar nova senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
