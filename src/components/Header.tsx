import { Calendar, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import SettingsDrawer from "./SettingsDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
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
        <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
          {/* Logo / Brand */}
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Aura<span className="text-primary font-light">Flow</span>
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-3">
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
