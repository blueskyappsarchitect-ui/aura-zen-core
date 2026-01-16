import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// EMERGENCY: Global mount counter to prevent render loops
let appMountCount = 0;
let routesMountCount = 0;

// Simple auth-based routing - no redirects, just conditional rendering
const AppRoutes = () => {
  routesMountCount++;
  console.log(`[RENDER_GUARD] AppRoutes mount #${routesMountCount}`, new Error().stack?.split('\n').slice(0, 5).join('\n'));
  
  // EMERGENCY: Prevent infinite re-renders
  if (routesMountCount > 10) {
    console.error('[EMERGENCY] AppRoutes exceeded 10 mounts - blocking render');
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center space-y-4 p-8">
          <div className="text-2xl font-bold text-red-600">🚨 Render Loop Detected</div>
          <div className="text-sm text-red-500">AppRoutes mounted {routesMountCount} times</div>
          <div className="text-xs text-muted-foreground">Check console for stack trace</div>
        </div>
      </div>
    );
  }

  const { user, loading } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    console.log('[RENDER_GUARD] Auth loading...');
    return <LoadingScreen />;
  }

  console.log('[RENDER_GUARD] Auth resolved, user:', user ? 'YES' : 'NO');

  // No session = show Auth, session exists = show Index
  // No Navigate components, no redirect loops
  return (
    <Routes>
      {user ? (
        <>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Index />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
        </>
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
