import React, { useState, useEffect } from "react";
import { UserStats, StartParams, GameHistoryEntry } from "@/types/simulation";
import { getUserStats, getLeaderboard, getUserHistory, sendFeedback } from "@/services/gameService";
import { getUserSessions, GameSession } from "@/services/sessionService";
import { supabase } from "@/integrations/supabase/client";
import ProfilePerformance from "@/components/ProfilePerformance";
import { LayoutDashboard, BarChart3, Clock, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";

import Sidebar from "./dashboard/Sidebar";
import TopHeader from "./dashboard/TopHeader";
import HomeTab from "./dashboard/HomeTab";
import HistoryTab from "./dashboard/HistoryTab";
import FeedbackTab from "./dashboard/FeedbackTab";

type TabType = "home" | "performance" | "history" | "feedback";

interface DashboardProps {
  onStartGame: (params: StartParams) => void;
  isLoading: boolean;
  userEmail: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartGame, isLoading, userEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameHistoryEntry[]>([]);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [reviewSession, setReviewSession] = useState<GameSession | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [sidebarAvatar, setSidebarAvatar] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isFeedbackSending, setIsFeedbackSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const fetchTabData = async () => {
      try {
        if (activeTab === "history") {
          const s = await getUserSessions();
          setSessions(s);
        }
        if (activeTab === "home") {
          const l = await getLeaderboard("TODAS");
          setLeaderboard(l);
        }
      } catch (err: any) {
        toast.error("Erro ao carregar dados da aba selecionada.");
      }
    };
    fetchTabData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [stats, hist] = await Promise.all([getUserStats(), getUserHistory()]);
      setUserStats(stats);
      setHistory(hist);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", user.id)
          .single();
        
        if (profileError && profileError.code !== "PGRST116") {
           console.error("Error loading profile:", profileError);
        }

        if (profile?.display_name) setDisplayName(profile.display_name);
        else setDisplayName(userEmail.split("@")[0]);
        if (profile?.avatar_url) setSidebarAvatar(profile.avatar_url);
      }
    } catch (err: any) {
      console.error("Dashboard load error:", err);
      toast.error("Alguns dados do perfil não puderam ser carregados.");
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim() || isFeedbackSending) return;
    
    setIsFeedbackSending(true);
    try {
      await sendFeedback(feedbackText);
      setFeedbackText("");
      toast.success("Feedback enviado com sucesso! Obrigado pela contribuição.");
    } catch (err: any) {
      toast.error(err.message || "Não foi possível enviar o feedback. Tente novamente mais tarde.");
    } finally {
      setIsFeedbackSending(false);
    }
  };

  const navItems = [
    { id: "home" as TabType, icon: LayoutDashboard, label: "Dashboard" },
    { id: "performance" as TabType, icon: User, label: "Perfil" },
    { id: "history" as TabType, icon: Clock, label: "Histórico" },
    { id: "feedback" as TabType, icon: MessageSquare, label: "Feedback" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden selection:bg-primary/20">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        displayName={displayName}
        userEmail={userEmail}
        sidebarAvatar={sidebarAvatar}
        userStats={userStats}
        onLogout={onLogout}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-muted/30">
        <TopHeader />

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            
            {activeTab === "home" && (
              <HomeTab 
                onStartGame={onStartGame}
                isLoading={isLoading}
                leaderboard={leaderboard}
                userStats={userStats}
              />
            )}

            {activeTab === "performance" && userStats && (
              <ProfilePerformance
                userStats={userStats}
                userEmail={userEmail}
                displayName={displayName}
                onDisplayNameChange={setDisplayName}
                onSaveDisplayName={loadData}
                isProfileLoading={isProfileLoading}
                onGoToHome={() => setActiveTab("home")}
                history={history}
              />
            )}

            {activeTab === "history" && (
              <HistoryTab 
                sessions={sessions}
                reviewSession={reviewSession}
                setReviewSession={setReviewSession}
              />
            )}

            {activeTab === "feedback" && (
              <FeedbackTab 
                feedbackText={feedbackText}
                setFeedbackText={setFeedbackText}
                onSendFeedback={handleSendFeedback}
              />
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;