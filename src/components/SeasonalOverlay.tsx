import { useEffect, useState } from "react";
import { getCurrentSeason, Season } from "@/types/species";

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

const SeasonalOverlay = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const season = getCurrentSeason();

  useEffect(() => {
    // Generate particles based on season
    const count = season === "winter" ? 30 : season === "autumn" ? 15 : season === "spring" ? 20 : 0;
    
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: season === "winter" ? 4 + Math.random() * 4 : 8 + Math.random() * 8,
    }));
    
    setParticles(newParticles);
  }, [season]);

  if (season === "summer") return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute animate-seasonal-fall ${
            season === "winter"
              ? "bg-white/60 rounded-full blur-[1px]"
              : season === "autumn"
              ? "text-amber-500/70"
              : "text-pink-300/60"
          }`}
          style={{
            left: `${particle.x}%`,
            width: season === "winter" ? `${particle.size}px` : undefined,
            height: season === "winter" ? `${particle.size}px` : undefined,
            fontSize: season !== "winter" ? `${particle.size}px` : undefined,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {season === "autumn" && "🍂"}
          {season === "spring" && "🌸"}
        </div>
      ))}
    </div>
  );
};

export default SeasonalOverlay;
