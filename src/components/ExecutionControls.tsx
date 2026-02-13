import { Loader2, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/theme/scratch";
import { cn } from "@/lib/utils";

interface ExecutionControlsProps {
  isRunning: boolean;
  isConnected: boolean;
  onRun: (options?: { simulate?: boolean }) => void;
  onStop: () => void;
  className?: string;
}

export function ExecutionControls({
  isRunning,
  isConnected,
  onRun,
  onStop,
  className,
}: ExecutionControlsProps) {
  const handleRun = () => {
    playSound("success");
    onRun({ simulate: !isConnected });
  };

  const handleStop = () => {
    playSound("click");
    onStop();
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Run Button */}
      <Button
        onClick={handleRun}
        disabled={isRunning}
        className={cn(
          "h-14 px-8 text-lg font-bold rounded-2xl shadow-lg",
          "transition-all duration-200",
          isRunning
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700",
          "hover:scale-105 hover:shadow-xl",
          "active:scale-95"
        )}
        style={{
          boxShadow: isRunning
            ? "none"
            : "0 4px 0 hsl(142, 71%, 30%), 0 6px 20px rgba(34, 197, 94, 0.4)",
        }}
      >
        {isRunning ? (
          <>
            <Loader2 className="h-6 w-6 mr-2 animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play className="h-6 w-6 mr-2 fill-current" />
            {isConnected ? "Run Program" : "Simulate Program"}
          </>
        )}
      </Button>

      {/* Stop Button - only visible when running */}
      {isRunning && (
        <Button
          onClick={handleStop}
          className={cn(
            "h-14 px-8 text-lg font-bold rounded-2xl shadow-lg",
            "bg-gradient-to-b from-red-400 to-red-600 hover:from-red-500 hover:to-red-700",
            "transition-all duration-200",
            "hover:scale-105 hover:shadow-xl",
            "active:scale-95",
            "animate-pulse"
          )}
          style={{
            boxShadow: "0 4px 0 hsl(0, 72%, 40%), 0 6px 20px rgba(239, 68, 68, 0.4)",
          }}
        >
          <Square className="h-6 w-6 mr-2 fill-current" />
          Stop
        </Button>
      )}

      {isConnected && !isRunning && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-4 py-2 rounded-full border border-green-200 dark:border-green-800">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">Ready</span>
        </div>
      )}
    </div>
  );
}
