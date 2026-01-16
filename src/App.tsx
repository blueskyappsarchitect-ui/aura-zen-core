import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Simple auth-based routing - no redirects, just conditional rendering
const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

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
