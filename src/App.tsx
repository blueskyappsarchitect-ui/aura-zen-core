import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import auraFlowLogo from "@/assets/aura-flow-logo.png";

const queryClient = new QueryClient();

// IRON CURTAIN: Static entry screen - NO automatic session checks
const EntryGate = ({ onEnter }: { onEnter: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
    <div className="text-center space-y-8">
      {/* Logo with aura glow */}
      <div className="relative mx-auto w-32 h-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute inset-2 bg-gradient-to-br from-purple-300 via-pink-300 to-indigo-300 rounded-full blur-2xl opacity-50" />
        <img src={auraFlowLogo} alt="Aura Flow" className="relative w-full h-full object-contain drop-shadow-2xl" />
      </div>
      
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
        Aura Flow
      </h1>
      
      {/* MANUAL ENTRY BUTTON - the ONLY trigger */}
      <button
        onClick={onEnter}
        className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
      >
        ENTER AURA FLOW
      </button>
    </div>
  </div>
);

// IRON CURTAIN: Manual entry state machine
const AppContent = () => {
  const [hasEnteredManually, setHasEnteredManually] = useState(false);
  const { user, loading } = useAuth();

  // STAGE 1: Static entry gate - NO automatic checks
  if (!hasEnteredManually) {
    return <EntryGate onEnter={() => setHasEnteredManually(true)} />;
  }

  // STAGE 2: Only after manual entry, show loading while auth checks
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl opacity-50 animate-pulse" />
          <img src={auraFlowLogo} alt="Aura Flow" className="relative w-24 h-24 object-contain" />
        </div>
      </div>
    );
  }

  // STAGE 3: Render based on auth state
  return user ? <Index /> : <Auth />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
