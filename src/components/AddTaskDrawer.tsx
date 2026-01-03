import { useState } from "react";
import { BookOpen, User, Coffee, Plus, Clock, Timer, FileText, Sparkles } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task, TaskCategory, CATEGORY_CONFIG } from "@/types/task";
import { cn } from "@/lib/utils";

interface AddTaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Omit<Task, "id">) => void;
}

const categoryIcons = {
  study: BookOpen,
  personal: User,
  rest: Coffee,
};

const durationOptions = [15, 30, 45, 60, 90, 120];

// Quick-start templates
const quickStartTemplates: { name: string; icon: string; duration: number; category: TaskCategory }[] = [
  { name: "Deep Study", icon: "📝", duration: 90, category: "study" },
  { name: "Quick Reset", icon: "☕", duration: 15, category: "rest" },
  { name: "Clear Space", icon: "🧹", duration: 30, category: "personal" },
];

const AddTaskDrawer = ({ open, onOpenChange, onAddTask }: AddTaskDrawerProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TaskCategory>("study");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);

  const handleSubmit = () => {
    if (!name.trim()) return;

    onAddTask({
      name: name.trim(),
      category,
      startTime,
      duration,
    });

    // Reset form
    setName("");
    setCategory("study");
    setStartTime("09:00");
    setDuration(60);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="glass-drawer rounded-t-3xl max-h-[85vh]">
        <DrawerHeader className="pt-6 pb-2">
          <DrawerTitle className="text-xl font-semibold text-foreground text-center">
            New Task
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 space-y-6 overflow-y-auto">
          {/* Quick-Start Templates */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Suggested for You
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {quickStartTemplates.map((template) => {
                const config = CATEGORY_CONFIG[template.category];
                return (
                  <button
                    key={template.name}
                    onClick={() => {
                      setName(template.name);
                      setCategory(template.category);
                      setDuration(template.duration);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl",
                      "bg-secondary/50 hover:bg-secondary transition-all duration-200",
                      "hover:scale-105 active:scale-95",
                      name === template.name && cn(config.bgClass, "scale-105")
                    )}
                  >
                    <span className="text-lg">{template.icon}</span>
                    <span className="text-xs font-medium text-foreground">{template.name}</span>
                    <span className="text-[10px] text-muted-foreground">{template.duration}m</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">or create custom</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-sm font-medium text-muted-foreground">
              What are you working on?
            </Label>
            <Input
              id="task-name"
              placeholder="e.g., Study for exam, Read book..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base bg-secondary/50 border-0 rounded-xl placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">Category</Label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const Icon = categoryIcons[cat];
                const isSelected = category === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200",
                      isSelected
                        ? cn(config.bgClass, "scale-105 shadow-soft")
                        : "bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6",
                        isSelected ? config.textClass : "text-muted-foreground"
                      )}
                      strokeWidth={1.5}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? config.textClass : "text-muted-foreground"
                      )}
                    >
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Duration Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12 text-base bg-secondary/50 border-0 rounded-xl focus-visible:ring-primary/30"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Duration
              </Label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="h-12 w-full text-base bg-secondary/50 border-0 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                {durationOptions.map((mins) => (
                  <option key={mins} value={mins}>
                    {mins < 60 ? `${mins} min` : `${mins / 60}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <DrawerFooter className="px-6 pb-8 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-glow transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add to Timeline
          </Button>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              className="h-12 rounded-xl text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AddTaskDrawer;
