import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Mail, Lock, Loader2, User, Building2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        toast.success("Link de redefinição enviado! Verifique seu e-mail.");
        setMode("login");
      } else if (mode === "login") {
        if (!password.trim()) return;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        onAuthSuccess();
      } else {
        if (!password.trim()) return;
        if (password !== confirmPassword) {
          toast.error("As senhas não coincidem.");
          setIsLoading(false);
          return;
        }
        if (!fullName.trim()) {
          toast.error("Preencha seu nome completo.");
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              university: university.trim(),
              graduation_year: graduationYear.trim(),
            },
          },
        });
        if (error) throw error;

        // Update profile with extra fields
        if (data.user) {
          await supabase.from("profiles").update({
            display_name: fullName.trim(),
            university: university.trim() || null,
            graduation_year: graduationYear.trim() || null,
          }).eq("user_id", data.user.id);
        }

        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
        onAuthSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na autenticação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-10 text-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] mb-6">
            <Activity className="h-10 w-10 text-primary-foreground animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">BOLUS</h1>
          <p className="text-primary text-[10px] font-black tracking-[0.4em] uppercase mt-3 opacity-80">Medical Simulation Suite</p>
        </div>

        <div className="p-10">
          <h2 className="text-2xl font-bold text-white mb-8">
            {mode === "login" ? "Bem-vindo ao Plantão" : mode === "signup" ? "Criar Credenciais" : "Recuperar Acesso"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-primary/20 transition-all"
                    placeholder="Nome completo do clínico"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">E-mail Institucional</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-primary/20 transition-all"
                  placeholder="seu@hospital.com"
                  required
                />
              </div>
            </div>

            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Instituição</Label>
                  <Input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-primary/20"
                    placeholder="Ex: USP"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Ano/Período</Label>
                  <Input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-primary/20"
                    placeholder="Ex: 2026"
                  />
                </div>
              </div>
            )}

            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Senha de Acesso</Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[10px] text-primary hover:text-white font-black uppercase tracking-widest transition-colors"
                    >
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : mode === "login" ? (
                "AUTENTICAR"
              ) : mode === "signup" ? (
                "CRIAR CREDENCIAIS"
              ) : (
                "RECUPERAR"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm text-muted-foreground hover:text-white font-bold transition-colors"
            >
              {mode === "login" ? "Ainda não possui acesso? Solicitar" : "Já possui credenciais? Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
