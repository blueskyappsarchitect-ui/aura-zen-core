import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isToday, isSameDay, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface WeeklyDayPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  unfinishedCount: number;
  onMigrateUnfinished: () => void;
}

const WeeklyDayPicker = ({ 
  selectedDate, 
  onSelectDate, 
  unfinishedCount,
  onMigrateUnfinished,
}: WeeklyDayPickerProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showUnfinishedPopup, setShowUnfinishedPopup] = useState(false);

  // Generate days of the week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleSelectDay = (date: Date) => {
    if (isSameDay(date, selectedDate)) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      onSelectDate(date);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 mb-6">
      <div className="relative overflow-hidden rounded-2xl p-4 border border-white/20 backdrop-blur-xl bg-white/60 dark:bg-black/40">
        {/* Glassmorphic background */}
        <div className="absolute inset-0 bg-gradient-to-r from-category-study/20 via-white/40 to-category-personal/20" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header with unfinished badge */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Weekly Rhythm
            </h3>
            
            {/* Unfinished tasks badge */}
            {unfinishedCount > 0 && isToday(selectedDate) && (
              <Popover open={showUnfinishedPopup} onOpenChange={setShowUnfinishedPopup}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors">
                    <AlertCircle className="w-3 h-3" />
                    {unfinishedCount} Unfinished
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4 backdrop-blur-xl bg-white/90 dark:bg-black/80 border border-white/20" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Life happens!</p>
                        <p className="text-xs text-muted-foreground">
                          {unfinishedCount} task{unfinishedCount > 1 ? 's' : ''} from yesterday
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Want to slide these tasks into today's gaps?
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          onMigrateUnfinished();
                          setShowUnfinishedPopup(false);
                        }}
                      >
                        Yes, migrate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowUnfinishedPopup(false)}
                      >
                        Not now
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Day Picker Ribbon */}
          <div className="flex justify-between gap-2 overflow-x-auto hide-scrollbar pb-1">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const isPast = day < new Date() && !isToday(day);
              const isFuture = day > new Date();

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[48px] py-2 px-3 rounded-xl transition-all duration-300",
                    "hover:scale-105 active:scale-95",
                    isSelected && "relative",
                    !isSelected && "hover:bg-white/40 dark:hover:bg-white/10",
                    isPast && !isSelected && "opacity-60"
                  )}
                >
                  {/* Glowing violet circle for active day */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/40">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-400/50 to-transparent animate-pulse" />
                    </div>
                  )}
                  
                  {/* Day name */}
                  <span className={cn(
                    "text-xs font-medium uppercase tracking-wider relative z-10",
                    isSelected ? "text-white" : "text-muted-foreground"
                  )}>
                    {format(day, "EEE")}
                  </span>
                  
                  {/* Day number */}
                  <span className={cn(
                    "text-lg font-bold relative z-10",
                    isSelected ? "text-white" : isTodayDate ? "text-violet-600 dark:text-violet-400" : "text-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  
                  {/* Today indicator dot */}
                  {isTodayDate && !isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 pointer-events-none animate-fade-in" />
      )}
    </div>
  );
};

export default WeeklyDayPicker;
