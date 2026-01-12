import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MaintenanceMode {
  enabled: boolean;
  message: string;
}

interface GlobalBroadcast {
  active: boolean;
  message: string;
  expires_at: string | null;
}

export const useAdminSettings = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceMode>({ enabled: false, message: "" });
  const [globalBroadcast, setGlobalBroadcast] = useState<GlobalBroadcast>({ active: false, message: "", expires_at: null });
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .rpc('is_admin', { _user_id: user.id });

    if (!error && data) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      data?.forEach(setting => {
        if (setting.setting_key === 'maintenance_mode') {
          const value = setting.setting_value as unknown as MaintenanceMode;
          setMaintenanceMode(value);
        } else if (setting.setting_key === 'global_broadcast') {
          const value = setting.setting_value as unknown as GlobalBroadcast;
          // Check if broadcast is still active (not expired)
          if (value.expires_at && new Date(value.expires_at) < new Date()) {
            setGlobalBroadcast({ ...value, active: false });
          } else {
            setGlobalBroadcast(value);
          }
        }
      });
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchSettings();
    checkAdminStatus();

    const channel = supabase
      .channel('admin-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_settings'
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings, checkAdminStatus]);

  // Toggle maintenance mode (admin only)
  const toggleMaintenanceMode = useCallback(async (enabled: boolean, message: string = "") => {
    if (!isAdmin) return false;

    const { error } = await supabase
      .from('admin_settings')
      .update({ 
        setting_value: { enabled, message },
        updated_by: user?.id 
      })
      .eq('setting_key', 'maintenance_mode');

    if (error) {
      console.error('Error toggling maintenance mode:', error);
      return false;
    }

    setMaintenanceMode({ enabled, message });
    return true;
  }, [isAdmin, user]);

  // Send global broadcast (admin only)
  const sendGlobalBroadcast = useCallback(async (message: string, durationHours: number = 24) => {
    if (!isAdmin) return false;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    const { error } = await supabase
      .from('admin_settings')
      .update({ 
        setting_value: { 
          active: true, 
          message, 
          expires_at: expiresAt.toISOString() 
        },
        updated_by: user?.id 
      })
      .eq('setting_key', 'global_broadcast');

    if (error) {
      console.error('Error sending global broadcast:', error);
      return false;
    }

    // Also post to grove feed as system message
    await supabase
      .from('grove_activities')
      .insert({
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        display_name: 'Aura Evolution',
        activity_type: 'global_broadcast',
        activity_data: { message },
        vine_species: null,
        is_withered: false
      });

    setGlobalBroadcast({ active: true, message, expires_at: expiresAt.toISOString() });
    return true;
  }, [isAdmin, user]);

  // Dismiss global broadcast (admin only)
  const dismissBroadcast = useCallback(async () => {
    if (!isAdmin) return false;

    const { error } = await supabase
      .from('admin_settings')
      .update({ 
        setting_value: { active: false, message: "", expires_at: null },
        updated_by: user?.id 
      })
      .eq('setting_key', 'global_broadcast');

    if (error) {
      console.error('Error dismissing broadcast:', error);
      return false;
    }

    setGlobalBroadcast({ active: false, message: "", expires_at: null });
    return true;
  }, [isAdmin, user]);

  return {
    isAdmin,
    isLoading,
    maintenanceMode,
    globalBroadcast,
    toggleMaintenanceMode,
    sendGlobalBroadcast,
    dismissBroadcast,
  };
};
