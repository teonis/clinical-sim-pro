import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SimulationState, StartParams } from "@/types/simulation";
import { startSimulation, resetConversation } from "@/services/simulationService";
import WelcomeScreen from "@/components/WelcomeScreen";
import AuthScreen from "@/components/AuthScreen";
import ResetPasswordScreen from "@/components/ResetPasswordScreen";
import Dashboard from "@/components/Dashboard";
import GameDashboard from "@/components/GameDashboard";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Activity, Loader2 } from "lucide-react";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<SimulationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastParams, setLastParams] = useState<StartParams | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem("rma_welcome_seen");
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setCurrentUser(session.user.email);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsResettingPassword(true);
        setIsAuthChecking(false);
      } else if (event === "SIGNED_IN" && session?.user?.email) {
        setCurrentUser(session.user.email);
        setIsAuthChecking(false);
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setGameState(null);
        setIsAuthChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartGame = async (params: StartParams) => {
    setIsLoading(true);
    setLastParams(params);
    resetConversation();
    try {
      const initialState = await startSimulation(params);
      setGameState(initialState);
    } catch (error: any) {
      console.error("Failed to start game:", error);
      toast.error(error.message || "Falha ao iniciar simulação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartGame = async () => {
    if (!lastParams) return;
    setIsLoading(true);
    resetConversation();
    try {
      const initialState = await startSimulation(lastParams);
      setGameState(initialState);
    } catch (error: any) {
      console.error("Failed to restart game:", error);
      toast.error(error.message || "Erro ao reiniciar o caso.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitGame = () => {
    setGameState(null);
    setLastParams(null);
    resetConversation();
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setGameState(null);
    setShowWelcome(false);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Welcome screen
  if (showWelcome) {
    return (
      <>
        <WelcomeScreen
          onContinue={() => {
            localStorage.setItem("rma_welcome_seen", "true");
            setShowWelcome(false);
          }}
        />
        <Toaster />
      </>
    );
  }

  // Loading
  if (isAuthChecking) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center animate-pulse shadow-xl shadow-primary/20">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <p className="font-display font-bold text-sm gradient-brand-text tracking-widest uppercase">SIMULAMED</p>
        </div>
      </div>
    );
  }

  // Reset password
  if (isResettingPassword) {
    return (
      <>
        <ResetPasswordScreen onComplete={() => {
          setIsResettingPassword(false);
        }} />
        <Toaster />
      </>
    );
  }

  // Auth
  if (!currentUser) {
    return (
      <>
        <AuthScreen onAuthSuccess={() => {}} />
        <Toaster />
      </>
    );
  }

  // Game
  if (gameState) {
    return (
      <>
        <GameDashboard
          initialState={gameState}
          onRestart={handleRestartGame}
          onExit={handleExitGame}
          gameParams={lastParams!}
        />
        <Toaster />
      </>
    );
  }

  // Dashboard
  return (
    <>
      <Dashboard
        onStartGame={handleStartGame}
        isLoading={isLoading}
        userEmail={currentUser}
        onLogout={handleLogout}
      />
      <Toaster />
    </>
  );
};

export default App;
