import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Mail, Lock, Loader2, User, Building2, Calendar, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onBack?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onBack }) => {
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
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Navigation Header */}
      <header className="w-full h-20 flex items-center justify-between px-6 md:px-12 z-50 border-b border-border bg-background/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-sm">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-2xl text-foreground leading-none uppercase">BOLUS</span>
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-muted-foreground leading-none mt-1">Simulador Clínico</span>
          </div>
        </div>

        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-muted-foreground hover:text-primary transition-all group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar ao Início
          </button>
        )}
      </header>

      <div className="flex-1 flex items-center justify-center p-6 relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-card/50 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-black/5 border border-border overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-10 text-center border-b border-border bg-muted/30">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-6">
            <Activity className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">BOLUS</h1>
          <p className="text-primary text-[10px] font-black tracking-[0.4em] uppercase mt-3">Simulador Clínico</p>
        </div>

        <div className="p-10">
          <h2 className="text-2xl font-black text-foreground mb-8 tracking-tight">
            {mode === "login" ? "Bem-vindo ao Plantão" : mode === "signup" ? "Criar Credenciais" : "Recuperar Acesso"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-12 h-14 rounded-2xl bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-primary/20 transition-all"
                    placeholder="Nome completo do clínico"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">E-mail Institucional</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-primary/20 transition-all"
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
                    className="h-14 rounded-2xl bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-primary/20 transition-all"
                    placeholder="Ex: USP"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Ano/Período</Label>
                  <Input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="h-14 rounded-2xl bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-primary/20 transition-all"
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
                      className="text-[10px] text-primary hover:text-primary/80 font-black uppercase tracking-widest transition-colors"
                    >
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 rounded-2xl bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-primary/20 transition-all"
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
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 h-14 rounded-2xl bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl font-black text-base tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
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
              className="text-[10px] text-muted-foreground hover:text-primary font-black uppercase tracking-widest transition-colors"
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
