import { useState, useEffect } from "react";

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface TimeTheme {
  timeOfDay: TimeOfDay;
  gradientClass: string;
  label: string;
}

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
};

const TIME_THEMES: Record<TimeOfDay, Omit<TimeTheme, "timeOfDay">> = {
  morning: {
    gradientClass: "bg-gradient-morning",
    label: "Good morning",
  },
  afternoon: {
    gradientClass: "bg-gradient-afternoon", 
    label: "Good afternoon",
  },
  evening: {
    gradientClass: "bg-gradient-evening",
    label: "Good evening",
  },
};

export const useTimeOfDay = (): TimeTheme => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay);

  useEffect(() => {
    // Update every minute to check for time changes
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    timeOfDay,
    ...TIME_THEMES[timeOfDay],
  };
};
