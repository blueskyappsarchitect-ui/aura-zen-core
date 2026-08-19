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

// Sanitize message by stripping HTML tags and limiting length
const sanitizeMessage = (msg: string, maxLength: number = 500): string => {
  // Remove HTML tags to prevent XSS
  const stripped = msg.replace(/<[^>]*>/g, '');
  // Trim whitespace and limit length
  return stripped.trim().slice(0, maxLength);
};

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

  // Fetch settings via the admin-safe read-only accessor
  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_public_app_settings');

      if (error) throw error;

      const settings = (data ?? {}) as Record<string, unknown>;

      const maintenance = settings['maintenance_mode'] as MaintenanceMode | undefined;
      if (maintenance) {
        setMaintenanceMode(maintenance);
      }

      const broadcast = settings['global_broadcast'] as GlobalBroadcast | undefined;
      if (broadcast) {
        if (broadcast.expires_at && new Date(broadcast.expires_at) < new Date()) {
          setGlobalBroadcast({ ...broadcast, active: false });
        } else {
          setGlobalBroadcast(broadcast);
        }
      }
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll for updates (admin_settings is no longer broadcast over realtime)
  useEffect(() => {
    fetchSettings();
    checkAdminStatus();

    const interval = setInterval(fetchSettings, 60000);
    return () => clearInterval(interval);
  }, [fetchSettings, checkAdminStatus]);


  // Toggle maintenance mode (admin only)
  const toggleMaintenanceMode = useCallback(async (enabled: boolean, message: string = "") => {
    if (!isAdmin) return false;

    // Sanitize the message to prevent XSS
    const sanitizedMessage = sanitizeMessage(message);

    const { error } = await supabase
      .from('admin_settings')
      .update({ 
        setting_value: { enabled, message: sanitizedMessage },
        updated_by: user?.id 
      })
      .eq('setting_key', 'maintenance_mode');

    if (error) {
      console.error('Error toggling maintenance mode:', error);
      return false;
    }

    setMaintenanceMode({ enabled, message: sanitizedMessage });
    return true;
  }, [isAdmin, user]);

  // Send global broadcast (admin only)
  const sendGlobalBroadcast = useCallback(async (message: string, durationHours: number = 24) => {
    if (!isAdmin) return false;

    // Sanitize the message to prevent XSS
    const sanitizedMessage = sanitizeMessage(message);
    
    if (!sanitizedMessage) {
      console.error('Empty message after sanitization');
      return false;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    const { error } = await supabase
      .from('admin_settings')
      .update({ 
        setting_value: { 
          active: true, 
          message: sanitizedMessage, 
          expires_at: expiresAt.toISOString() 
        },
        updated_by: user?.id 
      })
      .eq('setting_key', 'global_broadcast');

    if (error) {
      console.error('Error sending global broadcast:', error);
      return false;
    }

    // Also post to grove feed as system message with sanitized content
    await supabase
      .from('grove_activities')
      .insert({
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        display_name: 'Aura Evolution',
        activity_type: 'global_broadcast',
        activity_data: { message: sanitizedMessage },
        vine_species: null,
        is_withered: false
      });

    setGlobalBroadcast({ active: true, message: sanitizedMessage, expires_at: expiresAt.toISOString() });
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
