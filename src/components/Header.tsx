import { Calendar, Settings, LogOut, User } from "lucide-react";
import { useState } from "react";
import SettingsDrawer from "./SettingsDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import auraFlowLogo from "@/assets/aura-flow-logo.png";

interface HeaderProps {
  onProfileOpen?: () => void;
}

const Header = ({ onProfileOpen }: HeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "See you next time! ✨",
    });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-md opacity-40" />
              <img 
                src={auraFlowLogo} 
                alt="Aura Flow" 
                className="relative w-10 h-10 object-contain"
              />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground hidden sm:block">
              Aura<span className="text-primary font-light">Flow</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onProfileOpen}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              aria-label="Profile"
            >
              <User className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              aria-label="Calendar"
            >
              <Calendar className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};

export default Header;
