import { useEffect, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
}

interface GlimmerOverlayProps {
  active: boolean;
}

const GlimmerOverlay = ({ active }: GlimmerOverlayProps) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }

    // Generate sparkles
    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      delay: Math.random() * 2,
      size: 8 + Math.random() * 12,
    }));

    setSparkles(newSparkles);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10">
      {/* Shimmer gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slow" />
      
      {/* Floating sparkles */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-glimmer-sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          <svg
            width={sparkle.size}
            height={sparkle.size}
            viewBox="0 0 24 24"
            className="text-yellow-300 drop-shadow-lg"
          >
            <path
              fill="currentColor"
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
            />
          </svg>
        </div>
      ))}

      {/* Subtle rainbow border glow */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-30 animate-pulse" 
           style={{ 
             WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
             WebkitMaskComposite: 'xor',
             maskComposite: 'exclude',
             padding: '2px'
           }} 
      />
    </div>
  );
};

export default GlimmerOverlay;
