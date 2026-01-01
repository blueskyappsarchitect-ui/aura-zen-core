import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Palette, Eye, Zap, Volume2, Check } from "lucide-react";
import { useSettings, ThemePreset, SoundProfile } from "@/contexts/SettingsContext";

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const themes: { id: ThemePreset; name: string; description: string; colors: string[] }[] = [
  {
    id: "zen",
    name: "Zen",
    description: "Lavender, Mint & Peach",
    colors: ["hsl(262, 83%, 58%)", "hsl(160, 50%, 85%)", "hsl(25, 90%, 88%)"],
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Navy, Charcoal & Cyan",
    colors: ["hsl(220, 60%, 20%)", "hsl(220, 20%, 25%)", "hsl(180, 90%, 50%)"],
  },
  {
    id: "forest",
    name: "Forest",
    description: "Moss, Earth & Cream",
    colors: ["hsl(120, 30%, 35%)", "hsl(30, 40%, 30%)", "hsl(45, 40%, 90%)"],
  },
];

const sounds: { id: SoundProfile; name: string }[] = [
  { id: "zen-bell", name: "Zen Bell" },
  { id: "birdsong", name: "Soft Birdsong" },
  { id: "digital-beep", name: "Digital Beep" },
];

const SettingsDrawer = ({ open, onOpenChange }: SettingsDrawerProps) => {
  const { settings, setTheme, setHighContrast, setReducedMotion, setSoundProfile, playSound } = useSettings();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[340px] sm:w-[400px] glass-drawer border-l border-border/30 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-semibold">Aura Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-8">
          {/* Theme Palette */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">The Vibe</h3>
            </div>
            <div className="space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                    settings.theme === theme.id
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-primary/30 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{theme.name}</p>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {theme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border-2 border-background"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      {settings.theme === theme.id && (
                        <Check className="w-5 h-5 text-primary ml-2" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Accessibility */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Accessibility</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                <div>
                  <p className="font-medium text-foreground">High Contrast</p>
                  <p className="text-sm text-muted-foreground">Sharper borders for visibility</p>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={setHighContrast}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                <div>
                  <p className="font-medium text-foreground">Reduced Motion</p>
                  <p className="text-sm text-muted-foreground">Stops animations & gradients</p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={setReducedMotion}
                />
              </div>
            </div>
          </section>

          {/* Sound Profile */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Sound Profile</h3>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-3">Focus End Sound</p>
              <div className="flex gap-2">
                <Select
                  value={settings.soundProfile}
                  onValueChange={(value) => setSoundProfile(value as SoundProfile)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sounds.map((sound) => (
                      <SelectItem key={sound.id} value={sound.id}>
                        {sound.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => playSound()}
                  className="shrink-0"
                >
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsDrawer;
