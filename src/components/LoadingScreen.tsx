import auraFlowLogo from "@/assets/aura-flow-logo.png";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Logo with pulse animation */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Outer glow ring */}
        <div className="absolute w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-50 animate-pulse" />
        
        {/* Inner glow ring */}
        <div className="absolute w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 animate-pulse" style={{ animationDelay: "0.5s" }} />
        
        {/* Logo */}
        <div className="relative animate-aura-pulse">
          <img 
            src={auraFlowLogo} 
            alt="Aura Flow" 
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Aura Flow
          </h1>
          <p className="text-sm text-muted-foreground mt-1 animate-pulse">
            Loading your sanctuary...
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
