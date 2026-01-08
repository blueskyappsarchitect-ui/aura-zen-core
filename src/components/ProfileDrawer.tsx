import { useRef, useState } from "react";
import { Sparkles, Flame, TrendingUp, User, Share2, Download, Snowflake, Droplet, BarChart3 } from "lucide-react";
import { toPng } from "html-to-image";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getAuraLevel, getProgressToNextLevel, Badge, HABITAT_THEMES, getStreakMultiplier, STREAK_THRESHOLD } from "@/types/aura";
import { VineSpecies } from "@/types/species";
import AuraLevelIcon from "@/components/AuraLevelIcon";
import BadgesPanel from "@/components/BadgesPanel";
import AuraShareCard from "@/components/AuraShareCard";
import WeeklyAuraStats from "@/components/WeeklyAuraStats";
import VineSpeciesSelector from "@/components/VineSpeciesSelector";
import SeasonalOverlay from "@/components/SeasonalOverlay";
import { toast } from "sonner";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auraScore: number;
  streak: number;
  badges: Badge[];
  completedTasks?: number;
  totalTasks?: number;
  isStreakFrozen?: boolean;
  hasWateredToday?: boolean;
  unlockBadge?: (badgeId: string) => void;
  vineSpecies?: VineSpecies;
  onChangeSpecies?: (species: VineSpecies) => void;
}

const ProfileDrawer = ({
  open,
  onOpenChange,
  auraScore,
  streak,
  badges,
  completedTasks = 0,
  totalTasks = 0,
  isStreakFrozen = false,
  hasWateredToday = false,
  unlockBadge,
  vineSpecies = "ivy",
  onChangeSpecies,
}: ProfileDrawerProps) => {
  const { user } = useAuth();
  const level = getAuraLevel(auraScore);
  const progressToNext = getProgressToNextLevel(auraScore);
  const habitat = HABITAT_THEMES[level.level];
  const multiplier = getStreakMultiplier(streak);
  const hasMultiplier = streak >= STREAK_THRESHOLD;

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      });
      return dataUrl;
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to generate image");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `aura-growth-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("Aura Card downloaded!");
  };

  const handleShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    // Convert data URL to blob for sharing
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], "aura-growth.png", { type: "image/png" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: "My Aura Growth",
          text: `I'm a ${level.name} with ${auraScore} Aura points! 🌱`,
          files: [file],
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
          toast.error("Share failed");
        }
      }
    } else {
      // Fallback: copy to clipboard or download
      handleDownload();
      toast.info("Web Share not supported - downloaded instead");
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent 
          className="max-h-[85vh] overflow-hidden relative"
          style={{ background: habitat.gradient }}
        >
          {/* Seasonal overlay */}
          <SeasonalOverlay />
          <DrawerHeader className="border-b border-white/20 pb-4 backdrop-blur-sm bg-white/10">
            <DrawerTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white drop-shadow-md">Your Profile</p>
                <p className="text-sm text-white/80 font-normal drop-shadow">
                  {user?.email}
                </p>
              </div>
            </DrawerTitle>
            <p className="text-xs text-white/70 mt-2 font-medium">
              🌿 {habitat.name} Habitat
            </p>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto backdrop-blur-sm bg-white/10">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-white/20 mx-4 mt-4" style={{ width: 'calc(100% - 2rem)' }}>
                <TabsTrigger value="overview" className="data-[state=active]:bg-white/80">
                  <User className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-white/80">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Weekly Stats
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-6 space-y-6 mt-0">
                {/* Share Button */}
                <Button
                  onClick={() => setShareDialogOpen(true)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share My Growth
                </Button>

                {/* Aura Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Aura Score Card */}
                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-purple-600 uppercase">
                        Aura Score
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                      {auraScore}
                    </p>
                  </div>

                  {/* Streak Card */}
                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {isStreakFrozen ? (
                        <Snowflake className="w-4 h-4 text-cyan-500" />
                      ) : (
                        <Flame className="w-4 h-4 text-orange-500" />
                      )}
                      <span className={`text-xs font-medium uppercase ${isStreakFrozen ? 'text-cyan-600' : 'text-orange-600'}`}>
                        {isStreakFrozen ? 'Frozen Streak' : 'Streak'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-3xl font-bold ${isStreakFrozen ? 'text-cyan-600' : 'text-orange-600'}`}>
                        {streak} Days
                      </p>
                      {hasMultiplier && !isStreakFrozen && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-bold">
                          🔥 {multiplier}x
                        </span>
                      )}
                    </div>
                    {isStreakFrozen && (
                      <p className="text-xs text-cyan-500 mt-1">❄️ Protected by watering</p>
                    )}
                    {hasMultiplier && !isStreakFrozen && (
                      <p className="text-xs text-orange-500 mt-1">Sunshine Multiplier Active!</p>
                    )}
                  </div>
                </div>

                {/* Watering Status */}
                <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplet className={`w-5 h-5 ${hasWateredToday ? 'text-cyan-500' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">Aura Well</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      hasWateredToday 
                        ? 'bg-cyan-100 text-cyan-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {hasWateredToday ? '✓ Watered Today' : 'Not Watered'}
                    </span>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AuraLevelIcon auraScore={auraScore} />
                      <div>
                        <p className="font-semibold text-emerald-700">
                          {level.name}
                        </p>
                        <p className="text-xs text-emerald-600/70">
                          Level {level.level === "seedling" ? 1 : level.level === "sprout" ? 2 : 3}
                        </p>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>

                  {/* Progress to next level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-emerald-700">
                      <span>Progress to next level</span>
                      <span>{Math.round(progressToNext)}%</span>
                    </div>
                    <div className="h-2 bg-emerald-200/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressToNext}%` }}
                      />
                    </div>
                    {level.level !== "bloom" && (
                      <p className="text-xs text-emerald-600/70">
                        {level.maxScore - auraScore + 1} points to{" "}
                        {level.level === "seedling" ? "Sprout" : "Bloom"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vine Species Selector */}
                {onChangeSpecies && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                    <VineSpeciesSelector
                      currentSpecies={vineSpecies}
                      auraScore={auraScore}
                      streak={streak}
                      onSelectSpecies={onChangeSpecies}
                    />
                  </div>
                )}

                {/* Badges Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                  <BadgesPanel unlockedBadges={badges} />
                </div>
              </TabsContent>

              <TabsContent value="stats" className="p-6 mt-0">
                <WeeklyAuraStats 
                  currentStreak={streak} 
                  isStreakFrozen={isStreakFrozen} 
                  currentAuraScore={auraScore}
                  unlockBadge={unlockBadge}
                  badges={badges}
                />
              </TabsContent>
            </Tabs>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-fit p-6 bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Share My Growth</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6">
            {/* Card Preview */}
            <AuraShareCard
              ref={cardRef}
              auraScore={auraScore}
              streak={streak}
              completedTasks={completedTasks}
              totalTasks={totalTasks}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleShare}
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDrawer;
