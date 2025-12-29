interface NowIndicatorProps {
  topPosition: number;
}

const NowIndicator = ({ topPosition }: NowIndicatorProps) => {
  return (
    <div
      className="absolute left-0 right-0 flex items-center z-20 pointer-events-none"
      style={{ top: `${topPosition}px` }}
    >
      {/* Left extension line */}
      <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-primary animate-pulse-line" />
      
      {/* Center dot - the pulse */}
      <div className="relative">
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
        <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary/50 animate-ping" />
      </div>
      
      {/* Right extension line */}
      <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent via-primary/30 to-primary animate-pulse-line" />
    </div>
  );
};

export default NowIndicator;
