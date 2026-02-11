import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "@/context/SimulationContext";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import CaseLobby from "./pages/CaseLobby";
import SimulationScreen from "./pages/SimulationScreen";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SimulationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cases" element={<CaseLobby />} />
            <Route path="/simulation/:id" element={<SimulationScreen />} />
            <Route path="/simulation" element={<CaseLobby />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </SimulationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
