import { Star } from "lucide-react";

interface NorthStarProps {
  intention: string;
}

const NorthStar = ({ intention }: NorthStarProps) => {
  if (!intention) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-2 animate-fade-in">
      <div className="relative">
        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        <div className="absolute inset-0 w-4 h-4 bg-amber-400/50 rounded-full blur-md animate-pulse-glow" />
      </div>
      <span className="text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
        Today I want to feel {intention}
      </span>
      <div className="relative">
        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        <div className="absolute inset-0 w-4 h-4 bg-amber-400/50 rounded-full blur-md animate-pulse-glow" />
      </div>
    </div>
  );
};

export default NorthStar;
