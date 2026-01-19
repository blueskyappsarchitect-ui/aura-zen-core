import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import auraFlowLogo from "@/assets/aura-flow-logo.png";

const queryClient = new QueryClient();

// IRON CURTAIN: Manual entry state machine
const AppContent = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null); // null = gate, true = Index, false = Auth

  const handleEnter = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuth(!!session?.user);
  };

  // STAGE 1: Static entry gate
  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400 rounded-full blur-3xl opacity-40 animate-pulse" />
            <div className="absolute inset-2 bg-gradient-to-br from-purple-300 via-pink-300 to-indigo-300 rounded-full blur-2xl opacity-50" />
            <img src={auraFlowLogo} alt="Aura Flow" className="relative w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            Aura Flow
          </h1>
          <button
            onClick={handleEnter}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
          >
            ENTER AURA FLOW
          </button>
        </div>
      </div>
    );
  }

  // STAGE 2: Render based on auth state
  return isAuth ? <Index /> : <Auth />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AudioProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
