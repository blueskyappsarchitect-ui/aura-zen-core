import { useState, useEffect } from "react";
import { Droplets, Users, Sprout, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SeedlingOnboardingProps {
  onComplete: () => void;
  onHighlightWell?: () => void;
}

const steps = [
  {
    icon: Sprout,
    title: "Welcome to Aura",
    description: "Your tasks give life to your vine. Every completed task earns XP and helps your garden flourish.",
    gradient: "from-emerald-400 to-green-500",
    emoji: "🌱"
  },
  {
    icon: Droplets,
    title: "Water Daily",
    description: "Tap the Aura Well each day to protect your streak and earn bonus XP. A well-watered vine grows strong!",
    gradient: "from-blue-400 to-cyan-500",
    emoji: "💧"
  },
  {
    icon: Users,
    title: "Join the Grove",
    description: "Visit the community Grove to see fellow gardeners and send sunshine to those in need.",
    gradient: "from-purple-400 to-pink-500",
    emoji: "🌳"
  }
];

const SeedlingOnboarding = ({ onComplete, onHighlightWell }: SeedlingOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
      // Delay well highlight to ensure UI renders first, then trigger spotlight
      if (onHighlightWell) {
        setTimeout(() => {
          onHighlightWell();
        }, 300);
      }
    }, 500);
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-500 ease-in-out ${
        isVisible && !isExiting ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop - pointer-events-none to not block clicks */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-500 ease-in-out pointer-events-none ${
          isVisible && !isExiting ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Card - z-10 ensures card is above backdrop */}
      <div 
        className={`relative z-10 max-w-md w-full transition-all duration-500 ease-in-out ${
          isVisible && !isExiting 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-8'
        }`}
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 dark:border-gray-700/50">
          {/* Header gradient */}
          <div className={`h-2 bg-gradient-to-r ${step.gradient}`} />

          <div className="p-8">
            {/* Step indicator */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'w-8 bg-gradient-to-r ' + step.gradient
                      : index < currentStep
                      ? 'w-4 bg-green-400'
                      : 'w-4 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-12 h-12 text-white" />
                <span className="absolute -top-2 -right-2 text-3xl animate-bounce">
                  {step.emoji}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {step.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleNext}
                className={`w-full h-14 rounded-2xl bg-gradient-to-r ${step.gradient} hover:opacity-90 text-white font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-[1.02]`}
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Continue
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Growing
                  </>
                )}
              </Button>

              {currentStep === 0 && (
                <button
                  onClick={handleComplete}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip intro
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedlingOnboarding;