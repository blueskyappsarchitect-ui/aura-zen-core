import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import auraFlowLogo from "@/assets/aura-flow-logo.png";

interface LoadingSanctuaryProps {
  onBeginJourney: () => void;
}

const LoadingSanctuary = ({ onBeginJourney }: LoadingSanctuaryProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBegin = () => {
    setIsExiting(true);
    setTimeout(() => {
      onBeginJourney();
    }, 500);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-500 ease-in-out bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 ${
        isVisible && !isExiting ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-300/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div 
        className={`relative z-10 text-center max-w-md w-full transition-all duration-500 ease-in-out ${
          isVisible && !isExiting 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-8'
        }`}
      >
        {/* Logo with aura glow */}
        <div className="relative mx-auto mb-8 w-32 h-32">
          {/* Outer glow layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400 rounded-full blur-3xl opacity-40 animate-pulse" />
          <div className="absolute inset-2 bg-gradient-to-br from-purple-300 via-pink-300 to-indigo-300 rounded-full blur-2xl opacity-50" />
          <div className="absolute inset-4 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-xl opacity-60" />
          
          {/* Logo */}
          <img 
            src={auraFlowLogo} 
            alt="Aura Flow" 
            className="relative w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Welcome text */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Welcome to Aura Flow
        </h1>
        
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Your personal sanctuary for mindful productivity. 
          Nurture your tasks, grow your vine, and watch your aura flourish.
        </p>

        {/* Begin button */}
        <Button
          onClick={handleBegin}
          size="lg"
          className="w-full max-w-xs h-14 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:opacity-90 text-white font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Begin My Journey
        </Button>
      </div>
    </div>
  );
};

export default LoadingSanctuary;
