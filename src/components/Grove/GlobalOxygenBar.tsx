import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Wind, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GlobalOxygen {
  id: string;
  date: string;
  water_count: number;
  target_count: number;
  bonus_active_until: string | null;
}

const GlobalOxygenBar = () => {
  const [oxygen, setOxygen] = useState<GlobalOxygen | null>(null);
  const [isBonusActive, setIsBonusActive] = useState(false);

  useEffect(() => {
    fetchOxygen();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('global-oxygen')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_oxygen'
        },
        (payload) => {
          const updated = payload.new as GlobalOxygen;
          if (updated.date === format(new Date(), 'yyyy-MM-dd')) {
            setOxygen(updated);
            checkBonusActive(updated);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOxygen = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    try {
      const { data, error } = await supabase
        .from('global_oxygen')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setOxygen(data);
        checkBonusActive(data);
      } else {
        // Create today's entry if it doesn't exist
        setOxygen({
          id: '',
          date: today,
          water_count: 0,
          target_count: 100,
          bonus_active_until: null
        });
      }
    } catch (error) {
      console.error('Error fetching global oxygen:', error);
    }
  };

  const checkBonusActive = (data: GlobalOxygen) => {
    if (data.bonus_active_until) {
      const bonusEnd = new Date(data.bonus_active_until);
      setIsBonusActive(bonusEnd > new Date());
    } else {
      setIsBonusActive(false);
    }
  };

  if (!oxygen) return null;

  const percentage = Math.min(100, (oxygen.water_count / oxygen.target_count) * 100);
  const isComplete = percentage >= 100;

  return (
    <div className={`relative p-4 rounded-2xl border transition-all ${
      isBonusActive
        ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-lg shadow-amber-500/20'
        : isComplete
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        : 'bg-white/60 border-white/30 backdrop-blur-sm'
    }`}>
      {/* Bonus active indicator */}
      {isBonusActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
          <Zap className="w-3 h-3" />
          +10% XP BOOST ACTIVE!
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isComplete || isBonusActive
            ? 'bg-gradient-to-br from-green-400 to-emerald-500'
            : 'bg-gradient-to-br from-blue-400 to-cyan-500'
        }`}>
          <Wind className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Global Oxygen Level</h3>
          <p className="text-xs text-muted-foreground">
            {isComplete
              ? 'Community goal reached! 🎉'
              : `${oxygen.water_count}/${oxygen.target_count} waterings today`
            }
          </p>
        </div>
      </div>

      <div className="relative">
        <Progress 
          value={percentage} 
          className={`h-3 ${
            isComplete || isBonusActive
              ? '[&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-emerald-500'
              : '[&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-cyan-500'
          }`}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">0%</span>
          <span className={`text-xs font-medium ${
            isComplete ? 'text-green-600' : 'text-muted-foreground'
          }`}>
            {Math.round(percentage)}%
          </span>
          <span className="text-xs text-muted-foreground">100%</span>
        </div>
      </div>

      {!isComplete && (
        <p className="text-xs text-center text-muted-foreground/70 mt-2">
          Water your vine to contribute! 100% = +10% XP boost for everyone 🌍
        </p>
      )}
    </div>
  );
};

export default GlobalOxygenBar;