import { Plus } from "lucide-react";

interface AddTaskButtonProps {
  onClick: () => void;
}

const AddTaskButton = ({ onClick }: AddTaskButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 group"
      aria-label="Add new task"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all duration-300" />

      {/* Glass button */}
      <div className="relative w-16 h-16 rounded-full glass glass-glow flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95">
        <Plus
          className="w-7 h-7 text-primary group-hover:text-primary/80 transition-colors duration-200"
          strokeWidth={2}
        />
      </div>
    </button>
  );
};

export default AddTaskButton;
