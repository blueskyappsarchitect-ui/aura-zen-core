import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import GroveFeed from "./GroveFeed";
import GlobalOxygenBar from "./GlobalOxygenBar";
import ActiveGardeners from "./ActiveGardeners";
import { Leaf, Users } from "lucide-react";
import { useAudioState } from "@/contexts/AudioContext";

interface GroveTabProps {
  userId: string | null;
  onXpGain: (amount: number) => void;
  onUnlockBadge: (badgeId: string) => void;
  sunshineNudgesSent: number;
  onSunshineSent: () => void;
}

const GroveTab = ({ 
  userId, 
  onXpGain, 
  onUnlockBadge, 
  sunshineNudgesSent,
  onSunshineSent 
}: GroveTabProps) => {
  const [sentSunshineIds, setSentSunshineIds] = useState<string[]>([]);
  const { isAudioEnabled, startAmbient, stopAmbient } = useAudioState();

  // Start ambient audio when entering Grove (if audio enabled)
  useEffect(() => {
    if (isAudioEnabled) {
      startAmbient();
    }
    
    return () => {
      stopAmbient();
    };
  }, [isAudioEnabled, startAmbient, stopAmbient]);

  // Fetch already sent sunshine nudges
  useEffect(() => {
    if (!userId) return;

    const fetchSentNudges = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data, error } = await supabase
          .from('sunshine_nudges')
          .select('id, receiver_id')
          .eq('sender_id', userId)
          .gte('created_at', `${today}T00:00:00`);

        if (error) throw error;
        
        // Store the activity IDs that have been sent sunshine
        // Note: We're tracking by receiver_id for simplicity
        if (data) {
          setSentSunshineIds(data.map(n => n.receiver_id));
        }
      } catch (error) {
        console.error('Error fetching sent nudges:', error);
      }
    };

    fetchSentNudges();
  }, [userId]);

  const handleSendSunshine = useCallback(async (receiverId: string, activityId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Insert sunshine nudge
      const { error } = await supabase
        .from('sunshine_nudges')
        .insert({
          sender_id: userId,
          receiver_id: receiverId
        });

      if (error) throw error;

      // Grant XP to sender
      onXpGain(5);

      // Track locally
      setSentSunshineIds(prev => [...prev, receiverId]);
      onSunshineSent();

      // Check for Community Caretaker badge (5 sunshine nudges)
      if (sunshineNudgesSent + 1 >= 5) {
        onUnlockBadge('community_caretaker');
      }

      return true;
    } catch (error) {
      console.error('Error sending sunshine:', error);
      return false;
    }
  }, [userId, onXpGain, onUnlockBadge, sunshineNudgesSent, onSunshineSent]);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 mb-2">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">The Aura Grove</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          Community Garden 🌳
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          See what fellow gardeners are growing
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Active Gardeners - Body Doubling */}
        <ActiveGardeners />

        {/* Global Oxygen Bar */}
        <GlobalOxygenBar />

        {/* Activity Feed */}
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
            <Leaf className="w-4 h-4" />
            Recent Activity
          </h2>
          <GroveFeed 
            currentUserId={userId}
            onSendSunshine={handleSendSunshine}
            sentSunshineIds={sentSunshineIds}
          />
        </div>
      </div>
    </div>
  );
};

export default GroveTab;