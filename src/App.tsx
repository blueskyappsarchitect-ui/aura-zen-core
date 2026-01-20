import { useState, useEffect } from "react";
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
import LoadingSanctuary from "@/components/LoadingSanctuary";

const queryClient = new QueryClient();

const SESSION_ENTRY_KEY = "aura-session-entered";

const AppContent = () => {
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [hasEnteredSession, setHasEnteredSession] = useState(() => {
    return sessionStorage.getItem(SESSION_ENTRY_KEY) === "true";
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthState(session?.user ? "authenticated" : "unauthenticated");
    };
    checkSession();
  }, []);

  const handleBeginJourney = () => {
    sessionStorage.setItem(SESSION_ENTRY_KEY, "true");
    setHasEnteredSession(true);
  };

  // Show loading while checking auth
  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Show Auth page if not authenticated
  if (authState === "unauthenticated") {
    return <Auth />;
  }

  // Show Loading Sanctuary for first-time session entry
  if (!hasEnteredSession) {
    return <LoadingSanctuary onBeginJourney={handleBeginJourney} />;
  }

  // Render the main app
  return <Index />;
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