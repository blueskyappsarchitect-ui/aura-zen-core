export type TaskCategory = "study" | "personal" | "rest";

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  startTime: string; // HH:MM format
  duration: number; // in minutes
  subTasks?: SubTask[];
  isGeneratingSubTasks?: boolean;
}

export const CATEGORY_CONFIG: Record<
  TaskCategory,
  { label: string; icon: string; bgClass: string; textClass: string }
> = {
  study: {
    label: "Study",
    icon: "BookOpen",
    bgClass: "bg-category-study",
    textClass: "text-category-study-foreground",
  },
  personal: {
    label: "Personal",
    icon: "User",
    bgClass: "bg-category-personal",
    textClass: "text-category-personal-foreground",
  },
  rest: {
    label: "Rest",
    icon: "Coffee",
    bgClass: "bg-category-rest",
    textClass: "text-category-rest-foreground",
  },
};

// Category-aware AI task slicer - generates dopamine-sized micro-steps
export const generateMicroSteps = (taskName: string, category: TaskCategory): SubTask[] => {
  const templates: Record<TaskCategory, (name: string) => string[]> = {
    // Pomodoro-style steps for study tasks
    study: (name) => [
      `Set a 25-minute timer for focused ${name}`,
      "Clear your desk and put phone on DND",
      "Work through the first section without breaks",
      "5-min review: summarize what you learned",
      "Reward yourself with a quick stretch",
    ],
    // Low-friction steps for personal tasks
    personal: (name) => [
      `Just get your materials ready for ${name}`,
      "Take one small action (no pressure)",
      "If it feels good, keep going for 5 more minutes",
      "Celebrate that you showed up today",
    ],
    // Unplugging-focused steps for rest
    rest: (name) => [
      "Set your phone to Do Not Disturb",
      "Dim the lights or find a cozy spot",
      `Begin ${name} with three slow breaths`,
      "Let your mind wander freely",
      "When ready, gently return to the present",
    ],
  };

  const steps = templates[category](taskName);
  
  return steps.map((text, index) => ({
    id: `subtask-${Date.now()}-${index}`,
    text,
    completed: false,
  }));
};
