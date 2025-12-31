import { PlayCircle, Clock } from "lucide-react";
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

interface StartNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onStartNow: () => void;
  onCancel: () => void;
}

const StartNowDialog = ({
  open,
  onOpenChange,
  task,
  onStartNow,
  onCancel,
}: StartNowDialogProps) => {
  if (!task) return null;
  
  const config = CATEGORY_CONFIG[task.category];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm glass border-primary/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-lg">
            Start Now? ⚡
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You moved <span className={cn("font-medium", config.textClass)}>{task.name}</span> to the current time.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={onStartNow}
            className="w-full gap-2 h-12 bg-primary/10 hover:bg-primary/20 text-foreground border border-primary/20"
          >
            <PlayCircle className="w-5 h-5" />
            Start Focus Now
          </Button>

          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full gap-2 h-12 border-muted-foreground/20"
          >
            <Clock className="w-5 h-5" />
            Just Move It
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StartNowDialog;
