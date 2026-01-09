import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useGroveSync = (userId: string | null) => {
  // Post activity to the Grove feed
  const postActivity = useCallback(async (
    activityType: 'level_up' | 'watered' | 'species_change' | 'badge_unlocked',
    activityData: Record<string, any> = {},
    vineSpecies: string = 'ivy',
    isWithered: boolean = false
  ) => {
    if (!userId) return;

    try {
      // Generate anonymous display name
      const displayName = `Gardener #${userId.slice(0, 4).toUpperCase()}`;

      const { error } = await supabase
        .from('grove_activities')
        .insert({
          user_id: userId,
          display_name: displayName,
          activity_type: activityType,
          activity_data: activityData,
          vine_species: vineSpecies,
          is_withered: isWithered
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error posting grove activity:', error);
    }
  }, [userId]);

  // Update global oxygen when watering
  const incrementGlobalOxygen = useCallback(async () => {
    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      // Try to get today's record
      const { data: existing, error: fetchError } = await supabase
        .from('global_oxygen')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        // Update existing record
        const newCount = existing.water_count + 1;
        const updates: any = { water_count: newCount };

        // Check if we hit 100% and activate bonus
        if (newCount >= existing.target_count && !existing.bonus_active_until) {
          const bonusEnd = new Date();
          bonusEnd.setHours(bonusEnd.getHours() + 1);
          updates.bonus_active_until = bonusEnd.toISOString();
        }

        const { error: updateError } = await supabase
          .from('global_oxygen')
          .update(updates)
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Create new record for today
        const { error: insertError } = await supabase
          .from('global_oxygen')
          .insert({
            date: today,
            water_count: 1,
            target_count: 100
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating global oxygen:', error);
    }
  }, []);

  // Check if XP bonus is active
  const checkXpBonus = useCallback(async (): Promise<boolean> => {
    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      const { data, error } = await supabase
        .from('global_oxygen')
        .select('bonus_active_until')
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data?.bonus_active_until) {
        return new Date(data.bonus_active_until) > new Date();
      }

      return false;
    } catch (error) {
      console.error('Error checking XP bonus:', error);
      return false;
    }
  }, []);

  return {
    postActivity,
    incrementGlobalOxygen,
    checkXpBonus
  };
};