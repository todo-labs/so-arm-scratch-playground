import { useState, useRef, useCallback } from "react";
import {
  Download,
  Upload,
  Share2,
  Copy,
  Check,
  FileUp,
  Sparkles,
  X,
  FileCode2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useScratch } from "@/context/ScratchContext";
import { playSound } from "@/lib/theme/scratch";
import {
  exportProject,
  importProjectFromFile,
  generateShareableCode,
  importFromShareableCode,
  generateRandomProjectName,
  type ProjectData,
  type ImportResult,
} from "@/lib/projectIO";

type TabType = "export" | "import" | "share";

export function ProjectShareDialog() {
  const { blocks, setBlocks } = useScratch();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("export");
  const [projectName, setProjectName] = useState(() => generateRandomProjectName());
  const [projectDescription, setProjectDescription] = useState("");
  const [projectAuthor, setProjectAuthor] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<ProjectData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (blocks.length === 0) {
      playSound("error");
      return;
    }
    
    playSound("success");
    exportProject(blocks, {
      name: projectName,
      description: projectDescription,
      author: projectAuthor,
    });
  };

  const handleGenerateShareCode = () => {
    if (blocks.length === 0) {
      playSound("error");
      return;
    }
    
    const code = generateShareableCode(blocks, {
      name: projectName,
      description: projectDescription,
      author: projectAuthor,
    });
    setShareCode(code);
    playSound("click");
  };

  const handleCopyShareCode = async () => {
    await navigator.clipboard.writeText(shareCode);
    setCopied(true);
    playSound("success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportFromCode = () => {
    setImportError(null);
    setImportSuccess(null);
    
    const result = importFromShareableCode(importCode.trim());
    handleImportResult(result);
  };

  const handleImportResult = (result: ImportResult) => {
    if (result.success && result.data) {
      setImportSuccess(result.data);
      playSound("success");
    } else {
      setImportError(result.error || "Import failed");
      playSound("error");
    }
  };

  const handleConfirmImport = () => {
    if (importSuccess) {
      setBlocks(importSuccess.blocks);
      playSound("drop");
      setIsOpen(false);
      resetState();
    }
  };

  const handleFileSelect = async (file: File) => {
    setImportError(null);
    setImportSuccess(null);
    
    // Check file extension
    if (!file.name.endsWith(".json")) {
      setImportError("Please select a .json file");
      playSound("error");
      return;
    }
    
    const result = await importProjectFromFile(file);
    handleImportResult(result);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const resetState = () => {
    setImportError(null);
    setImportSuccess(null);
    setImportCode("");
    setShareCode("");
  };

  const refreshProjectName = () => {
    setProjectName(generateRandomProjectName());
    playSound("click");
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "export", label: "Export", icon: <Download className="w-4 h-4" /> },
    { id: "import", label: "Import", icon: <Upload className="w-4 h-4" /> },
    { id: "share", label: "Share", icon: <Share2 className="w-4 h-4" /> },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group flex items-center space-x-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300"
        >
          <Share2 size={18} className="group-hover:scale-110 transition-transform" />
          <span className="font-semibold">Share</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg bg-gradient-to-b from-white to-slate-50 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">📤</span>
            Share Your Project
            <Sparkles className="w-5 h-5 text-amber-500" />
          </DialogTitle>
          <DialogDescription>
            Export your robot program to share with friends, classmates, or teachers!
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); resetState(); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "export" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name" className="text-sm font-medium text-slate-700">
                  Project Name
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Awesome Robot Program"
                    className="bg-white flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={refreshProjectName}
                    title="Generate new random name"
                    className="shrink-0 hover:bg-purple-50 hover:text-purple-600 border-slate-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-author" className="text-sm font-medium text-slate-700">
                  Your Name (optional)
                </Label>
                <Input
                  id="project-author"
                  value={projectAuthor}
                  onChange={(e) => setProjectAuthor(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-description" className="text-sm font-medium text-slate-700">
                  Description (optional)
                </Label>
                <Input
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="What does your robot do?"
                  className="bg-white"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleExport}
                  disabled={blocks.length === 0}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Project File (.json)
                </Button>
                {blocks.length === 0 && (
                  <p className="text-center text-sm text-amber-600 mt-2">
                    Add some blocks to your workspace first!
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "import" && (
            <div className="space-y-4">
              {/* File Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <FileUp className={`w-12 h-12 mx-auto mb-3 ${isDragging ? "text-blue-500" : "text-slate-400"}`} />
                <p className="font-medium text-slate-700">
                  {isDragging ? "Drop your file here!" : "Drag & drop a project file"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  or click to browse (.json)
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-slate-50 px-3 text-sm text-slate-500">or paste a share code</span>
                </div>
              </div>

              {/* Share Code Input */}
              <div className="flex gap-2">
                <Input
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Paste share code here..."
                  className="bg-white font-mono text-sm"
                />
                <Button
                  onClick={handleImportFromCode}
                  disabled={!importCode.trim()}
                  className="px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Import
                </Button>
              </div>

              {/* Error Message */}
              {importError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{importError}</span>
                </div>
              )}

              {/* Success Preview */}
              {importSuccess && (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FileCode2 className="w-10 h-10 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-green-800 truncate">
                          {importSuccess.metadata.name}
                        </h4>
                        {importSuccess.metadata.author && (
                          <p className="text-sm text-green-700">
                            by {importSuccess.metadata.author}
                          </p>
                        )}
                        {importSuccess.metadata.description && (
                          <p className="text-sm text-green-600 mt-1 line-clamp-2">
                            {importSuccess.metadata.description}
                          </p>
                        )}
                        <p className="text-xs text-green-600 mt-2">
                          {importSuccess.blocks.filter(b => !b.parentId).length} blocks
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setImportSuccess(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmImport}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      Load Project
                    </Button>
                  </div>
                  
                  <p className="text-xs text-center text-amber-600">
                    ⚠️ This will replace your current workspace
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "share" && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <p className="text-sm text-purple-800">
                  <strong>Quick Share:</strong> Generate a code that others can paste to instantly load your project!
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="share-project-name" className="text-sm font-medium text-slate-700">
                  Project Name
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="share-project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Awesome Robot Program"
                    className="bg-white flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={refreshProjectName}
                    title="Generate new random name"
                    className="shrink-0 hover:bg-purple-50 hover:text-purple-600 border-slate-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleGenerateShareCode}
                disabled={blocks.length === 0}
                className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Generate Share Code
              </Button>

              {shareCode && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Your Share Code
                  </Label>
                  <div className="relative">
                    <Input
                      value={shareCode}
                      readOnly
                      className="bg-slate-50 font-mono text-xs pr-20"
                    />
                    <Button
                      onClick={handleCopyShareCode}
                      size="sm"
                      className="absolute right-1 top-1 h-7 px-3 bg-slate-800 hover:bg-slate-900"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Share this code with friends - they can import it in the Import tab!
                  </p>
                </div>
              )}

              {blocks.length === 0 && (
                <p className="text-center text-sm text-amber-600">
                  Add some blocks to your workspace first!
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
