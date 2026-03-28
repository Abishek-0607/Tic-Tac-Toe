import { useEffect, useState } from 'react';

const Timer = ({ turnStartTime, turnTimeLimit, isMyTurn }) => {
  const [timeLeft, setTimeLeft] = useState(turnTimeLimit);

  useEffect(() => {
    console.log("Timer mounted - Start Time:", turnStartTime, "Limit:", turnTimeLimit);
    
    if (!turnStartTime || turnStartTime === 0) {
      console.log("No valid start time");
      setTimeLeft(turnTimeLimit);
      return;
    }

    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const elapsed = currentTime - turnStartTime;
      const remaining = Math.max(0, turnTimeLimit - elapsed);
      
      console.log("Current:", currentTime, "Elapsed:", elapsed, "Remaining:", remaining);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [turnStartTime, turnTimeLimit]);

  const percentage = (timeLeft / turnTimeLimit) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      {/* Timer Display */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/70 font-semibold">
          {isMyTurn ? "⏰ Your Turn" : "⏳ Opponent's Turn"}
        </span>
        <span 
          className={`text-2xl font-bold ${
            isCritical 
              ? 'text-red-500 animate-pulse' 
              : isLow 
              ? 'text-yellow-400' 
              : 'text-green-400'
          }`}
        >
          {timeLeft}s
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl border border-white/20">
        <div 
          className={`h-full transition-all duration-200 ${
            isCritical 
              ? 'bg-gradient-to-r from-red-600 to-red-500' 
              : isLow 
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' 
              : 'bg-gradient-to-r from-green-500 to-emerald-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Warning Message */}
      {isCritical && isMyTurn && (
        <p className="text-red-400 text-sm mt-2 animate-pulse font-semibold text-center">
          ⚠️ Hurry! Time running out!
        </p>
      )}
    </div>
  );
};

export default Timer;
