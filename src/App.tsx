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

// HARD STATE FREEZE: Minimal static loading - just logo, no complex logic
const StaticLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl opacity-50" />
      <img src={auraFlowLogo} alt="Aura Flow" className="relative w-24 h-24 object-contain" />
    </div>
  </div>
);

// STATE-BASED ROUTING: No router, no URL changes, no redirects
const AppContent = () => {
  const { user, loading } = useAuth();

  // Show minimal static loader while checking auth - NO complex loading states
  if (loading) {
    return <StaticLoader />;
  }

  // DIRECT RENDER: Session exists = Index, no session = Auth
  // No router, no URL manipulation, no redirect engine
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
