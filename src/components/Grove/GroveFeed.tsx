import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Sun, Droplets, Sparkles, Award, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSpeciesInfo, VineSpecies } from "@/types/species";
import { Json } from "@/integrations/supabase/types";

interface GroveActivity {
  id: string;
  user_id: string;
  display_name: string;
  activity_type: string;
  activity_data: Json;
  vine_species: string;
  is_withered: boolean;
  created_at: string;
}

interface GroveFeedProps {
  currentUserId: string | null;
  onSendSunshine: (receiverId: string, activityId: string) => Promise<boolean>;
  sentSunshineIds: string[];
}

const getActivityData = (data: Json): Record<string, any> => {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as Record<string, any>;
  }
  return {};
};

const GroveFeed = ({ currentUserId, onSendSunshine, sentSunshineIds }: GroveFeedProps) => {
  const [activities, setActivities] = useState<GroveActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('grove-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'grove_activities'
        },
        (payload) => {
          const newActivity = payload.new as GroveActivity;
          setActivities(prev => [newActivity, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('grove_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching grove activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string, isSystem: boolean = false) => {
    if (isSystem) {
      return <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />;
    }
    switch (type) {
      case 'level_up':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'watered':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'species_change':
        return <Leaf className="w-4 h-4 text-green-500" />;
      case 'badge_unlocked':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'system_message':
        return <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  const getActivityMessage = (activity: GroveActivity) => {
    const speciesInfo = getSpeciesInfo(activity.vine_species as VineSpecies);
    const data = getActivityData(activity.activity_data);
    
    switch (activity.activity_type) {
      case 'level_up':
        const level = data?.level || 'Bloom';
        return `just reached ${level} level! 🎉`;
      case 'watered':
        return `watered their ${speciesInfo.name} 💧`;
      case 'species_change':
        return `switched to ${speciesInfo.name} 🌿`;
      case 'badge_unlocked':
        const badge = data?.badge || 'a badge';
        return `unlocked ${badge}! 🏆`;
      case 'system_message':
        return data?.message || 'System notification';
      case 'global_broadcast':
        return data?.message || 'Important announcement';
      default:
        return 'made progress on their journey';
    }
  };

  // Check if this is a system message (for special styling)
  const isSystemActivity = (activity: GroveActivity) => {
    return activity.display_name === 'Aura Evolution' || 
           activity.activity_type === 'system_message' || 
           activity.activity_type === 'global_broadcast';
  };

  const handleSendSunshine = async (activity: GroveActivity) => {
    if (activity.user_id === currentUserId) {
      toast.error("You can't send sunshine to yourself!");
      return;
    }

    const success = await onSendSunshine(activity.user_id, activity.id);
    if (success) {
      toast.success(`☀️ Sent sunshine to ${activity.display_name}! +5 XP`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 sm:p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Leaf className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">The Grove is quiet...</p>
        <p className="text-sm text-muted-foreground/70">Be the first to share your progress!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {/* System Welcome Message - Always show at top if feed is new */}
      {activities.length > 0 && !activities.some(a => a.activity_type === 'system_message') && (
        <div className="relative p-4 rounded-2xl border bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200/50 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                <span className="font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Aura Evolution
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Welcome to the first generation of Aura Evolution. Let's grow together! 🌱✨
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">System Message</p>
            </div>
          </div>
        </div>
      )}
      
      {activities.map((activity) => {
        const speciesInfo = getSpeciesInfo(activity.vine_species as VineSpecies);
        const hasSentSunshine = sentSunshineIds.includes(activity.user_id);
        const isOwnActivity = activity.user_id === currentUserId;
        const isSystem = isSystemActivity(activity);

        // Create a simple gradient for species or system
        const speciesGradient = isSystem
          ? 'linear-gradient(135deg, #a855f7, #ec4899)'
          : `linear-gradient(135deg, ${
              speciesInfo.id === 'ivy' ? '#10b981, #22c55e' :
              speciesInfo.id === 'wisteria' ? '#a855f7, #d946ef' :
              '#f59e0b, #fbbf24'
            })`;

        return (
          <div
            key={activity.id}
            className={`relative p-3 sm:p-4 rounded-2xl border transition-all duration-300 ease-in-out touch-manipulation ${
              isSystem
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200/50 backdrop-blur-md'
                : activity.is_withered
                ? 'bg-muted/50 border-muted-foreground/20 grayscale-[30%]'
                : 'bg-white/60 border-white/30 backdrop-blur-md'
            }`}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {/* Withered indicator */}
            {activity.is_withered && (
              <div className="absolute -top-2 -right-2 text-[10px] sm:text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                Needs care
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Species icon */}
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0"
                style={{ background: speciesGradient }}
              >
                {speciesInfo.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {getActivityIcon(activity.activity_type, isSystem)}
                  <span className={`font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none ${
                    isSystem ? 'font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : ''
                  }`}>
                    {activity.display_name}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                  {getActivityMessage(activity)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* Sunshine button for withered vines */}
              {activity.is_withered && !isOwnActivity && (
                <Button
                  size="sm"
                  variant={hasSentSunshine ? "secondary" : "outline"}
                  className={`shrink-0 min-h-[40px] sm:min-h-0 touch-manipulation ${
                    hasSentSunshine
                      ? 'bg-amber-100 text-amber-600 border-amber-200'
                      : 'hover:bg-amber-50 hover:border-amber-200 active:bg-amber-100'
                  }`}
                  onClick={() => handleSendSunshine(activity)}
                  disabled={hasSentSunshine}
                >
                  <Sun className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{hasSentSunshine ? 'Sent!' : 'Send ☀️'}</span>
                  <span className="sm:hidden">{hasSentSunshine ? '✓' : '☀️'}</span>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroveFeed;