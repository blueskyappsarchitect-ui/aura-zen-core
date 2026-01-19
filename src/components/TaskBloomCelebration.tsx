import { useEffect } from "react";
import confetti from "canvas-confetti";

interface TaskBloomCelebrationProps {
  trigger: boolean;
  onComplete: () => void;
}

const TaskBloomCelebration = ({ trigger, onComplete }: TaskBloomCelebrationProps) => {
  useEffect(() => {
    if (!trigger) return;

    // Flower/petal colors - soft pastels with gold
    const flowerColors = [
      "#fbbf24", // Gold
      "#f472b6", // Pink
      "#a78bfa", // Purple
      "#34d399", // Green
      "#fb923c", // Orange
      "#fde047", // Yellow
    ];

    // Custom flower-like shapes using scalar for size variation
    const shapes = ['circle'];

    // Phase 1: Central bloom burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: flowerColors,
      shapes,
      scalar: 1.2,
      gravity: 0.8,
      ticks: 200,
    });

    // Phase 2: Golden sparkles radiating outward
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#fbbf24", "#fde047", "#fcd34d"],
        shapes: ['circle'],
        scalar: 0.8,
        gravity: 0.6,
        startVelocity: 35,
        ticks: 150,
      });
    }, 100);

    // Phase 3: Petal drift - softer, slower falling particles
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 120,
        origin: { x: 0.5, y: 0.3 },
        colors: ["#f472b6", "#a78bfa", "#fbbf24"],
        shapes: ['circle'],
        scalar: 1.5,
        gravity: 1.5,
        drift: 1,
        ticks: 300,
      });
    }, 200);

    // Clean up and notify completion
    const timeout = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [trigger, onComplete]);

  return null; // This component only triggers effects, no UI
};

export default TaskBloomCelebration;
