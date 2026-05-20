import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SimulationState, StartParams } from "@/types/simulation";
import { startSimulation, resetConversation } from "@/services/simulationService";
const LandingPage = React.lazy(() => import("@/pages/LandingPage"));
const AuthScreen = React.lazy(() => import("@/components/AuthScreen"));
const ResetPasswordScreen = React.lazy(() => import("@/components/ResetPasswordScreen"));
const OnboardingTutorial = React.lazy(() => import("@/components/OnboardingTutorial"));
const Dashboard = React.lazy(() => import("@/components/Dashboard"));
const GameDashboard = React.lazy(() => import("@/components/GameDashboard"));
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { toast } from "sonner";
import { Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";


const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

const AppContent: React.FC = () => {

  const [gameState, setGameState] = useState<SimulationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastParams, setLastParams] = useState<StartParams | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

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
        if (!localStorage.getItem("pulzu_onboarding_done")) {
          setShowOnboarding(true);
        }
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

  // Landing Page
  if (showWelcome) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage
          onStart={() => {
            setShowWelcome(false);
          }}
        />
        <Toaster theme="dark" position="top-right" closeButton />
      </Suspense>
    );
  }

  // Loading
  if (isAuthChecking) {
    return <LoadingFallback />;
  }

  // Reset password
  if (isResettingPassword) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordScreen onComplete={() => {
          setIsResettingPassword(false);
        }} />
        <Toaster theme="dark" position="top-right" closeButton />
      </Suspense>
    );
  }

  // Auth
  if (!currentUser) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AuthScreen onAuthSuccess={() => {}} onBack={() => setShowWelcome(true)} />
        <Toaster theme="dark" position="top-right" closeButton />
      </Suspense>
    );
  }

  // Onboarding
  if (showOnboarding) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />
        <Toaster theme="dark" position="top-right" closeButton />
      </Suspense>
    );
  }

  // Game
  if (gameState) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <GameDashboard
          initialState={gameState}
          onRestart={handleRestartGame}
          onExit={handleExitGame}
          gameParams={lastParams!}
        />
        <Toaster theme="dark" position="top-right" closeButton />
      </Suspense>
    );
  }

  // Dashboard
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Dashboard
        onStartGame={handleStartGame}
        isLoading={isLoading}
        userEmail={currentUser}
        onLogout={handleLogout}
      />
      <Toaster theme="dark" position="top-right" closeButton />
    </Suspense>
  );
};

const LoadingFallback = () => (
  <div className="w-full h-screen bg-background flex items-center justify-center overflow-hidden relative">
    <div className="absolute inset-0 z-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
    </div>
    <div className="flex flex-col items-center gap-6 relative z-10">
      <div className="w-20 h-20 rounded-[2rem] bg-card border border-border flex items-center justify-center shadow-2xl animate-clinical-pulse">
        <Activity className="h-10 w-10 text-primary" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="font-black text-2xl text-foreground tracking-tighter italic opacity-80">PULZU</p>
        <div className="h-1 w-12 bg-primary/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="h-full w-full bg-primary rounded-full"
          />
        </div>
      </div>
    </div>
  </div>
);

export default App;
