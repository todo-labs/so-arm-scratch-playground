import {
  AlertTriangle,
  Home,
  Loader2,
  Play,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectShareDialog } from "@/components/ProjectShareDialog";

import { useScratch } from "@/context/ScratchContext";

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

  return (
    <header className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-50 transition-all shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🤖</span>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">
                  SO-ARM101
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Robot Control Interface
                </p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-200" />
            
            <Button
              variant="ghost"
              size="sm"
              className="group flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300"
              onClick={homeRobot}
              disabled={!isConnected}
            >
              <Home size={18} className="group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Home Robot</span>
            </Button>
            
            <div className="h-8 w-px bg-slate-200" />
            
            {/* Share/Export/Import Dialog */}
            <ProjectShareDialog />
          </div>

          <div className="flex items-center space-x-3">
            {/* Status indicators */}
            <div className="flex items-center gap-2 mr-2">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                isConnected 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {isConnected ? "Robot Connected" : "Not Connected"}
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner">
              <Button
                onClick={isConnected ? disconnectRobot : connectRobot}
                variant={isConnected ? "ghost" : "default"}
                size="sm"
                className={`rounded-full shadow-sm px-6 h-8 text-xs font-bold transition-all duration-300 ${
                  isConnected 
                    ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isConnected ? "Disconnect" : "Connect Robot"}
              </Button>

              <div className="w-px h-5 bg-slate-300 mx-1" />

              <Button
                onClick={handleRunCode}
                disabled={!blocks.length || isRunningCode || !isConnected}
                size="sm"
                className={`rounded-full h-8 px-6 text-xs font-bold transition-all duration-300 shadow-sm ${
                  isRunningCode 
                    ? "bg-amber-500 hover:bg-amber-600" 
                    : "bg-emerald-600 hover:bg-emerald-700"
                } text-white`}
              >
                {isRunningCode ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
              className="rounded-full h-10 w-10 shadow-lg hover:scale-105 transition-all bg-rose-600 hover:bg-rose-700"
              onClick={emergencyStop}
              title="Emergency Stop"
            >
              <AlertTriangle size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
