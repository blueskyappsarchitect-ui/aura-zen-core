import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Flame, Sparkles, CheckCircle2, Calendar, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayStats {
  date: Date;
  dayLabel: string;
  tasksCompleted: number;
  totalTasks: number;
  xpEarned: number;
  isToday: boolean;
}

interface WeeklyAuraStatsProps {
  currentStreak: number;
  isStreakFrozen: boolean;
}

const WeeklyAuraStats = ({ currentStreak, isStreakFrozen }: WeeklyAuraStatsProps) => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<DayStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      if (!user) return;

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

      const stats: DayStats[] = [];

      for (const day of weekDays) {
        const dateStr = format(day, "yyyy-MM-dd");

        const { data: tasks } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("task_date", dateStr);

        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter((t) => t.is_completed).length || 0;
        
        // Estimate XP: 10 XP per completed task
        const xpEarned = completedTasks * 10;

        stats.push({
          date: day,
          dayLabel: format(day, "EEE"),
          tasksCompleted: completedTasks,
          totalTasks,
          xpEarned,
          isToday: isToday(day),
        });
      }

      setWeeklyData(stats);
      setIsLoading(false);
    };

    fetchWeeklyData();
  }, [user]);

  const totalXP = weeklyData.reduce((sum, d) => sum + d.xpEarned, 0);
  const totalCompleted = weeklyData.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const totalTasks = weeklyData.reduce((sum, d) => sum + d.totalTasks, 0);
  const avgCompletion = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-300/30 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[10px] font-medium text-purple-600 uppercase tracking-wide">Week XP</span>
          </div>
          <p className="text-xl font-bold text-purple-700">{totalXP}</p>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-300/30 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wide">Done</span>
          </div>
          <p className="text-xl font-bold text-emerald-700">{totalCompleted}</p>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-300/30 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 mb-1">
            {isStreakFrozen ? (
              <Snowflake className="w-3.5 h-3.5 text-cyan-500" />
            ) : (
              <Flame className="w-3.5 h-3.5 text-orange-500" />
            )}
            <span className={cn(
              "text-[10px] font-medium uppercase tracking-wide",
              isStreakFrozen ? "text-cyan-600" : "text-orange-600"
            )}>Streak</span>
          </div>
          <p className={cn(
            "text-xl font-bold",
            isStreakFrozen ? "text-cyan-700" : "text-orange-700"
          )}>{currentStreak}d</p>
        </div>
      </div>

      {/* XP Chart */}
      <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Daily XP Earned</span>
          </div>
          <span className="text-xs text-muted-foreground">{avgCompletion}% avg completion</span>
        </div>

        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="20%">
              <XAxis 
                dataKey="dayLabel" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DayStats;
                    return (
                      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
                        <p className="text-xs font-medium">{format(data.date, "EEEE, MMM d")}</p>
                        <p className="text-xs text-purple-600">✨ {data.xpEarned} XP</p>
                        <p className="text-xs text-emerald-600">✓ {data.tasksCompleted}/{data.totalTasks} tasks</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="xpEarned" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isToday 
                      ? 'hsl(271, 91%, 65%)' 
                      : entry.xpEarned > 0 
                        ? 'hsl(271, 91%, 75%)' 
                        : 'hsl(var(--muted))'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tasks Completed Chart */}
      <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-semibold text-foreground">Tasks Completed</span>
        </div>

        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="20%">
              <XAxis 
                dataKey="dayLabel" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DayStats;
                    return (
                      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
                        <p className="text-xs font-medium">{format(data.date, "EEEE, MMM d")}</p>
                        <p className="text-xs text-emerald-600">✓ {data.tasksCompleted} completed</p>
                        <p className="text-xs text-muted-foreground">of {data.totalTasks} total</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="tasksCompleted" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isToday 
                      ? 'hsl(152, 69%, 45%)' 
                      : entry.tasksCompleted > 0 
                        ? 'hsl(152, 69%, 55%)' 
                        : 'hsl(var(--muted))'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streak History Visual */}
      <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-foreground">This Week's Activity</span>
        </div>

        <div className="flex justify-between gap-2">
          {weeklyData.map((day, i) => {
            const hasActivity = day.tasksCompleted > 0;
            const completionRate = day.totalTasks > 0 ? day.tasksCompleted / day.totalTasks : 0;
            
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    day.isToday && "ring-2 ring-offset-2 ring-violet-500",
                    hasActivity 
                      ? completionRate >= 1 
                        ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-gradient-to-br from-orange-300 to-amber-400 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {hasActivity ? (
                    completionRate >= 1 ? "🔥" : "🌱"
                  ) : (
                    <span className="text-xs">—</span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  day.isToday ? "text-violet-600" : "text-muted-foreground"
                )}>
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyAuraStats;
