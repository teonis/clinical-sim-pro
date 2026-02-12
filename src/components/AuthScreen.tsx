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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Header */}
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
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            {mode === "login" ? "Acesse sua conta" : mode === "signup" ? "Criar conta" : "Redefinir senha"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase">Nome Completo</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    placeholder="Seu nome completo"
                    required
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {mode === "signup" && (
              <>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Universidade / Instituição</Label>
                  <div className="relative mt-1">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="pl-10"
                      placeholder="Ex: USP, UNIFESP..."
                      maxLength={100}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Ano de Formação / Período</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="pl-10"
                      placeholder="Ex: 6º período, 2025..."
                      maxLength={50}
                    />
                  </div>
                </div>
              </>
            )}

            {mode !== "forgot" && (
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase">Senha</Label>
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
            )}

            {mode === "signup" && (
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase">Confirmar Senha</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {mode === "signup" && (
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Ao criar sua conta, você concorda com os{" "}
                <a href="/termos" target="_blank" className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium">
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a href="/privacidade" target="_blank" className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium">
                  Política de Privacidade
                </a>
                .
              </p>
            )}

            <Button type="submit" disabled={isLoading} className="w-full py-6 font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                "Entrar"
              ) : mode === "signup" ? (
                "Criar Conta"
              ) : (
                "Enviar link de redefinição"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === "forgot" ? (
              <button
                onClick={() => setMode("login")}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Voltar ao login
              </button>
            ) : (
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
