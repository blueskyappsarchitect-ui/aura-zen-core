import { useState, useEffect, useMemo } from "react";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayActivity {
  date: Date;
  tasksCompleted: number;
  xpEarned: number;
}

const ActivityHeatmap = () => {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<DayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!user) return;

      const today = startOfDay(new Date());
      const thirtyDaysAgo = subDays(today, 29);

      // Generate all days in range
      const days: DayActivity[] = [];
      for (let i = 0; i < 30; i++) {
        days.push({
          date: subDays(today, 29 - i),
          tasksCompleted: 0,
          xpEarned: 0,
        });
      }

      // Fetch tasks for the date range
      const { data: tasks } = await supabase
        .from("tasks")
        .select("task_date, is_completed")
        .eq("user_id", user.id)
        .gte("task_date", format(thirtyDaysAgo, "yyyy-MM-dd"))
        .lte("task_date", format(today, "yyyy-MM-dd"));

      if (tasks) {
        tasks.forEach((task) => {
          const taskDate = new Date(task.task_date);
          const dayIndex = days.findIndex((d) => isSameDay(d.date, taskDate));
          if (dayIndex !== -1 && task.is_completed) {
            days[dayIndex].tasksCompleted += 1;
            days[dayIndex].xpEarned += 10; // Estimate 10 XP per completed task
          }
        });
      }

      setActivityData(days);
      setIsLoading(false);
    };

    fetchActivityData();
  }, [user]);

  // Get intensity level (0-4) based on tasks completed
  const getIntensity = (tasksCompleted: number): number => {
    if (tasksCompleted === 0) return 0;
    if (tasksCompleted <= 2) return 1;
    if (tasksCompleted <= 4) return 2;
    if (tasksCompleted <= 6) return 3;
    return 4;
  };

  // Organize data into weeks (6 columns of 5 days each + today)
  const weeks = useMemo(() => {
    const result: DayActivity[][] = [];
    for (let i = 0; i < 6; i++) {
      result.push(activityData.slice(i * 5, (i + 1) * 5));
    }
    return result;
  }, [activityData]);

  const totalXP = activityData.reduce((sum, d) => sum + d.xpEarned, 0);
  const activeDays = activityData.filter((d) => d.tasksCompleted > 0).length;

  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-3" />
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-sm bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-foreground">30-Day Activity</span>
        </div>
        <span className="text-xs text-muted-foreground">{activeDays} active days</span>
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-1 justify-center mb-3">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => {
              const intensity = getIntensity(day.tasksCompleted);
              const isToday = isSameDay(day.date, new Date());
              
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "w-4 h-4 rounded-sm transition-all cursor-pointer hover:scale-110",
                    isToday && "ring-1 ring-offset-1 ring-violet-500",
                    intensity === 0 && "bg-muted",
                    intensity === 1 && "bg-emerald-200",
                    intensity === 2 && "bg-emerald-300",
                    intensity === 3 && "bg-emerald-400",
                    intensity === 4 && "bg-emerald-500"
                  )}
                  title={`${format(day.date, "MMM d")}: ${day.tasksCompleted} tasks, ${day.xpEarned} XP`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200" />
          <div className="w-3 h-3 rounded-sm bg-emerald-300" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
        </div>
        <span>More</span>
      </div>

      {/* Total XP */}
      <div className="mt-3 pt-3 border-t border-white/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">30-Day Total</span>
          <span className="text-sm font-bold text-emerald-600">{totalXP} XP</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
