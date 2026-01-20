import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import auraFlowLogo from "@/assets/aura-flow-logo.png";

interface OnlineFounder {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  vine_species: string;
}

const ActiveGardeners = () => {
  const [activeCount, setActiveCount] = useState(0);
  const [founders, setFounders] = useState<OnlineFounder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveData = useCallback(async () => {
    try {
      // Fetch active gardeners count
      const { data: countData, error: countError } = await supabase
        .rpc('get_active_gardeners_count');

      if (countError) throw countError;
      setActiveCount(countData || 0);

      // Fetch online founders
      const { data: foundersData, error: foundersError } = await supabase
        .rpc('get_online_founders');

      if (foundersError) throw foundersError;
      setFounders(foundersData || []);
    } catch (error) {
      console.error('Error fetching active gardeners:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update last_seen periodically
  const updatePresence = useCallback(async () => {
    try {
      await supabase.rpc('update_last_seen');
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, []);

  useEffect(() => {
    fetchActiveData();
    updatePresence();

    // Refresh data every 30 seconds
    const dataInterval = setInterval(fetchActiveData, 30000);
    
    // Update presence every 2 minutes
    const presenceInterval = setInterval(updatePresence, 120000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(presenceInterval);
    };
  }, [fetchActiveData, updatePresence]);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-white/60 border border-white/30 backdrop-blur-md animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="relative p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 to-yellow-50/80 border border-amber-200/50 backdrop-blur-md overflow-hidden">
      {/* Subtle golden glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-200/10 to-yellow-200/10 animate-pulse pointer-events-none" />
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
        {/* Top/Left side - Active count */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-50 animate-pulse" />
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {activeCount} {activeCount === 1 ? 'Gardener' : 'Gardeners'} Growing
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Body double with your community 🌱
            </p>
          </div>
        </div>

        {/* Bottom/Right side - Founder avatars */}
        <div className="flex -space-x-1.5 sm:-space-x-2 pl-10 sm:pl-0">
          {founders.slice(0, 5).map((founder, index) => (
            <div
              key={founder.user_id}
              className="relative group"
              style={{ zIndex: 5 - index }}
            >
              {/* Golden glow ring for founders */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full blur-sm opacity-60 animate-pulse" />
              <div className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-amber-300 overflow-hidden bg-white shadow-lg">
                <img
                  src={founder.avatar_url || auraFlowLogo}
                  alt={founder.display_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = auraFlowLogo;
                  }}
                />
              </div>
              {/* Tooltip on hover - hidden on mobile */}
              <div className="hidden sm:block absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {founder.display_name}
              </div>
            </div>
          ))}
          
          {/* Show placeholder if less than 3 founders */}
          {founders.length < 3 && (
            <div className="relative" style={{ zIndex: 0 }}>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-dashed border-amber-300/50 flex items-center justify-center bg-amber-50">
                <span className="text-[10px] sm:text-xs text-amber-400">+</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveGardeners;
