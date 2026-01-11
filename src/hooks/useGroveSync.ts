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

  // Update global oxygen when watering (via secure RPC function)
  const incrementGlobalOxygen = useCallback(async (): Promise<{ success: boolean; alreadyWatered: boolean }> => {
    try {
      const { data, error } = await supabase
        .rpc('increment_global_oxygen');

      if (error) throw error;

      // Type assertion for the RPC response
      const result = data as { success?: boolean; already_watered?: boolean } | null;
      
      return {
        success: result?.success ?? false,
        alreadyWatered: result?.already_watered ?? false
      };
    } catch (error) {
      console.error('Error updating global oxygen:', error);
      return { success: false, alreadyWatered: false };
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

  // Check if user has already watered today
  const hasWateredToday = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('has_watered_today');

      if (error) throw error;
      return data ?? false;
    } catch (error) {
      console.error('Error checking watered status:', error);
      return false;
    }
  }, []);

  return {
    postActivity,
    incrementGlobalOxygen,
    checkXpBonus,
    hasWateredToday
  };
};