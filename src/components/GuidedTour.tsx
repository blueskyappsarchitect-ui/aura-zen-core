import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipStep {
  id: string;
  target: string;
  title: string;
  message: string;
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TooltipStep[] = [
  {
    id: "add-button",
    target: "[data-tour='add-button']",
    title: "Start Here",
    message: "Add a task and let the Magic Wand slice it for you.",
    position: "top",
  },
  {
    id: "shield-mode",
    target: "[data-tour='shield-mode']",
    title: "Shield Mode",
    message: "Ready to focus? Enter Shield Mode to block out the world.",
    position: "left",
  },
  {
    id: "aura-score",
    target: "[data-tour='aura-score']",
    title: "Your Aura",
    message: "Earn Aura points by finishing sub-tasks. Watch your garden grow.",
    position: "bottom",
  },
];

const TOUR_KEY = "aura-guided-tour-completed";

interface GuidedTourProps {
  isActive: boolean;
  onComplete: () => void;
}

const GuidedTour = ({ isActive, onComplete }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      return;
    }

    // Small delay before showing first tooltip
    const timer = setTimeout(() => {
      updateTooltipPosition();
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isActive, currentStep]);

  useEffect(() => {
    const handleResize = () => {
      if (isActive && isVisible) {
        updateTooltipPosition();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isActive, isVisible, currentStep]);

  const updateTooltipPosition = () => {
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
      // If target not found, skip to next step
      handleNext();
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 120;
    const offset = 16;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case "top":
        top = rect.top - tooltipHeight - offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - offset;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + offset;
        break;
    }

    // Keep within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

    setTooltipPosition({ top, left });
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsVisible(true);
        updateTooltipPosition();
      }, 300);
    } else {
      handleComplete();
    }
  };

  const handleDismiss = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem(TOUR_KEY, "true");
    onComplete();
  };

  if (!isActive || !isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  if (!step) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-background/40 backdrop-blur-sm z-[100]"
        onClick={handleDismiss}
      />

      {/* Floating Tooltip */}
      <div
        className={cn(
          "fixed z-[101] w-[280px]",
          "animate-float"
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn(
          "glass rounded-2xl p-4 shadow-glow",
          "border border-primary/20"
        )}>
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary/50 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="pr-6">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {step.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.message}
            </p>
          </div>

          {/* Progress and Next */}
          <div className="flex items-center justify-between mt-4">
            {/* Step indicators */}
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    index === currentStep
                      ? "bg-primary"
                      : index < currentStep
                      ? "bg-primary/50"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Next/Done button */}
            <button
              onClick={handleNext}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors"
              )}
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Got it!" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const shouldShowTour = (): boolean => {
  return !localStorage.getItem(TOUR_KEY);
};

export default GuidedTour;
