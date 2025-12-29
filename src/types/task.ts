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

// Simulated AI task slicer - generates dopamine-sized micro-steps
export const generateMicroSteps = (taskName: string): SubTask[] => {
  const templates: Record<string, string[]> = {
    study: [
      `Open your notes for ${taskName}`,
      "Read the first paragraph slowly",
      "Highlight one key concept",
    ],
    work: [
      `Set up your workspace for ${taskName}`,
      "Complete the first small section",
      "Take a 30-second stretch break",
    ],
    default: [
      `Begin ${taskName} with a deep breath`,
      "Focus on just the first step",
      "Celebrate small progress",
    ],
  };

  const category = taskName.toLowerCase().includes("study") || 
                   taskName.toLowerCase().includes("work") || 
                   taskName.toLowerCase().includes("deep") 
                   ? "study" 
                   : taskName.toLowerCase().includes("break") || 
                     taskName.toLowerCase().includes("rest")
                     ? "default"
                     : "work";

  const steps = templates[category] || templates.default;
  
  return steps.map((text, index) => ({
    id: `subtask-${Date.now()}-${index}`,
    text,
    completed: false,
  }));
};
