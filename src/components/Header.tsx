import { AlertTriangle, Bot, Home, Loader2, Moon, Play, Sun } from "lucide-react";
import { ProjectShareDialog } from "@/components/ProjectShareDialog";
import { Button } from "@/components/ui/button";

import { useScratch } from "@/context/ScratchContext";
import { useTheme } from "@/context/ThemeContext";

type HeaderProps = {
  isConnected: boolean;
  connectRobot: () => void;
  disconnectRobot: () => void;
  emergencyStop: () => void;
  homeRobot: () => void;
};

export const Header = ({
  isConnected,
  connectRobot,
  disconnectRobot,
  emergencyStop,
  homeRobot,
}: HeaderProps) => {
  const { blocks, handleRunCode, isRunningCode } = useScratch();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 transition-all shadow-sm dark:shadow-lg/20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md hover:shadow-lg transition-all duration-300">
                <Bot size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                  SO-ARM101
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Robot Control Interface
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

            <Button
              variant="ghost"
              size="sm"
              className="group flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-full transition-all duration-200 hover:scale-105"
              onClick={homeRobot}
              disabled={!isConnected}
            >
              <Home
                size={16}
                className="group-hover:rotate-[-12deg] transition-transform duration-200"
              />
              <span className="font-semibold text-xs">Home Robot</span>
            </Button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Share/Export/Import Dialog */}
            <ProjectShareDialog />
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicators */}
            <div className="flex items-center gap-2 mr-2">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-200 ${
                  isConnected
                    ? "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-700/50 shadow-sm"
                    : "bg-slate-100/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/50"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse shadow-sm" : "bg-slate-400 dark:bg-slate-500"}`}
                />
                {isConnected ? "Robot Connected" : "Not Connected"}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="group flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-full transition-all duration-200 hover:scale-105"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <>
                  <Moon
                    size={16}
                    className="group-hover:rotate-[-12deg] transition-transform duration-200"
                  />
                  <span className="font-semibold text-xs sr-only">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun
                    size={16}
                    className="group-hover:rotate-[-12deg] transition-transform duration-200"
                  />
                  <span className="font-semibold text-xs sr-only">Light Mode</span>
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-full border border-slate-200/70 dark:border-slate-700/50 shadow-sm">
              <Button
                onClick={isConnected ? disconnectRobot : connectRobot}
                variant={isConnected ? "ghost" : "default"}
                size="sm"
                className={`rounded-full shadow-sm px-5 h-8 text-[11px] font-bold transition-all duration-200 hover:scale-105 ${
                  isConnected
                    ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-none"
                }`}
              >
                {isConnected ? "Disconnect" : "Connect Robot"}
              </Button>

              <div className="w-px h-5 bg-slate-300/70 dark:bg-slate-600/50" />

              <Button
                onClick={handleRunCode}
                disabled={!blocks.length || isRunningCode || !isConnected}
                size="sm"
                className={`rounded-full h-8 px-5 text-[11px] font-bold transition-all duration-200 shadow-sm hover:scale-105 ${
                  isRunningCode
                    ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-none"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none"
                } text-white`}
              >
                {isRunningCode ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                    Execute Program
                  </>
                )}
              </Button>
            </div>

            <Button
              disabled={!isConnected}
              variant="destructive"
              size="icon"
              className="rounded-full h-10 w-10 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 shadow-rose-300/50 dark:shadow-none"
              onClick={emergencyStop}
              title="Emergency Stop"
            >
              <AlertTriangle size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
