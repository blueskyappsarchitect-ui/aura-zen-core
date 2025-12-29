export type TaskCategory = "study" | "personal" | "rest";

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  startTime: string; // HH:MM format
  duration: number; // in minutes
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
