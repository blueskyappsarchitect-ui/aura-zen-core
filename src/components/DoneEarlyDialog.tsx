import { useState, useEffect } from "react";
import { Mountain, PlayCircle, Timer } from "lucide-react";
import { Task, CATEGORY_CONFIG } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface DoneEarlyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextTask: Task | null;
  onStartNextTask: () => void;
  onTakeBreak: () => void;
}

const DoneEarlyDialog = ({
  open,
  onOpenChange,
  nextTask,
  onStartNextTask,
  onTakeBreak,
}: DoneEarlyDialogProps) => {
  const nextTaskConfig = nextTask ? CATEGORY_CONFIG[nextTask.category] : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm glass border-primary/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-lg">
            Great work! 🎉
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            What would you like to do next?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          {nextTask && (
            <Button
              onClick={onStartNextTask}
              className={cn(
                "w-full gap-2 h-12",
                "bg-primary/10 hover:bg-primary/20 text-foreground border border-primary/20"
              )}
            >
              <PlayCircle className="w-5 h-5" />
              <span>
                Start <span className={nextTaskConfig?.textClass}>{nextTask.name}</span>
              </span>
            </Button>
          )}

          <Button
            onClick={onTakeBreak}
            variant="outline"
            className="w-full gap-2 h-12 border-muted-foreground/20"
          >
            <Timer className="w-5 h-5" />
            Take a 5-minute break
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DoneEarlyDialog;
