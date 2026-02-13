import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  FileUp,
  RefreshCw,
  Share2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

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
import {
  exportProject,
  generateRandomProjectName,
  generateShareableCode,
  type ImportResult,
  importFromShareableCode,
  importProjectFromFile,
  type ProjectData,
} from "@/lib/projectIO";
import { playSound } from "@/lib/theme/scratch";

type TabType = "export" | "import" | "share";

export function ProjectShareDialog() {
  const { blocks, importBlocks } = useScratch();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("export");
  const [projectName, setProjectName] = useState(() => generateRandomProjectName());
  const [projectDescription, setProjectDescription] = useState("");
  const [projectAuthor, setProjectAuthor] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [sharePassphrase, setSharePassphrase] = useState("");
  const [importCode, setImportCode] = useState("");
  const [importPassphrase, setImportPassphrase] = useState("");
  const [showSharePassphrase, setShowSharePassphrase] = useState(false);
  const [showImportPassphrase, setShowImportPassphrase] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSharePackage, setCopiedSharePackage] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
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

  const handleGenerateShareCode = async () => {
    if (blocks.length === 0) {
      playSound("error");
      return;
    }

    setShareError(null);

    try {
      const code = await generateShareableCode(
        blocks,
        {
          name: projectName,
          description: projectDescription,
          author: projectAuthor,
        },
        sharePassphrase
      );
      setShareCode(code);
      playSound("click");
    } catch (error) {
      setShareCode("");
      setShareError(
        error instanceof Error ? error.message : "Failed to generate secure share code"
      );
      playSound("error");
    }
  };

  const handleCopyShareCode = async () => {
    await navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setCopiedSharePackage(false);
    playSound("success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySharePackage = async () => {
    const payload = [
      "SO-ARM Scratch share package",
      "",
      `Share code: ${shareCode}`,
      `Passphrase: ${sharePassphrase}`,
      "",
      "Import steps:",
      "1. Open Import tab",
      "2. Paste passphrase",
      "3. Paste share code",
      "4. Click Import",
    ].join("\n");

    await navigator.clipboard.writeText(payload);
    setCopiedSharePackage(true);
    setCopied(false);
    playSound("success");
    setTimeout(() => setCopiedSharePackage(false), 2000);
  };

  const handleImportFromCode = async () => {
    setImportError(null);
    setImportSuccess(null);

    const result = await importFromShareableCode(importCode.trim(), importPassphrase);
    handleImportResult(result);
  };

  const handleImportResult = useCallback((result: ImportResult) => {
    if (result.success && result.data) {
      setImportSuccess(result.data);
      playSound("success");
    } else {
      setImportError(result.error || "Import failed");
      playSound("error");
    }
  }, []);

  const handleConfirmImport = () => {
    if (importSuccess) {
      importBlocks(importSuccess.blocks);
      playSound("drop");
      setIsOpen(false);
      resetState();
    }
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
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
    },
    [handleImportResult]
  );

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const resetState = () => {
    setShareError(null);
    setImportError(null);
    setImportSuccess(null);
    setImportCode("");
    setImportPassphrase("");
    setSharePassphrase("");
    setShowSharePassphrase(false);
    setShowImportPassphrase(false);
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-all duration-300"
        >
          <Share2 size={18} className="group-hover:scale-110 transition-transform" />
          <span className="font-semibold">Share</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-border shadow-2xl">
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
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                resetState();
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/60"
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
                <Label
                  htmlFor="project-name"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Project Name
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Awesome Robot Program"
                    className="bg-white dark:bg-slate-900 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={refreshProjectName}
                    title="Generate new random name"
                    className="shrink-0 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-300 border-slate-200 dark:border-slate-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="project-author"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Your Name (optional)
                </Label>
                <Input
                  id="project-author"
                  value={projectAuthor}
                  onChange={(e) => setProjectAuthor(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="project-description"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Description (optional)
                </Label>
                <Input
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="What does your robot do?"
                  className="bg-white dark:bg-slate-900"
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
                  <p className="text-center text-sm text-amber-600 dark:text-amber-400 mt-2">
                    Add some blocks to your workspace first!
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "import" && (
            <div className="space-y-4">
              {/* File Drop Zone */}
              <button
                type="button"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all w-full ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                }`}
                aria-label="Click or drag file to import"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <FileUp
                  className={`w-12 h-12 mx-auto mb-3 ${isDragging ? "text-blue-500" : "text-slate-400"}`}
                />
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {isDragging ? "Drop your file here!" : "Drag & drop a project file"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  or click to browse (.json)
                </p>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-slate-50 dark:bg-slate-900 px-3 text-sm text-slate-500 dark:text-slate-400">
                    or paste a share code
                  </span>
                </div>
              </div>

              {/* Share Code Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    value={importPassphrase}
                    onChange={(e) => setImportPassphrase(e.target.value)}
                    placeholder="Passphrase (required for secure codes)"
                    type={showImportPassphrase ? "text" : "password"}
                    className="bg-white dark:bg-slate-900 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowImportPassphrase((prev) => !prev)}
                    className="absolute right-1 top-1 h-8 w-8"
                    title={showImportPassphrase ? "Hide passphrase" : "Show passphrase"}
                  >
                    {showImportPassphrase ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Paste share code here..."
                  className="bg-white dark:bg-slate-900 font-mono text-sm"
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
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{importError}</span>
                </div>
              )}

              {/* Success Preview */}
              {importSuccess && (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FileCode2 className="w-10 h-10 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 truncate">
                          {importSuccess.metadata.name}
                        </h4>
                        {importSuccess.metadata.author && (
                          <p className="text-sm text-green-700 dark:text-green-300">
                            by {importSuccess.metadata.author}
                          </p>
                        )}
                        {importSuccess.metadata.description && (
                          <p className="text-sm text-green-600 dark:text-green-300 mt-1 line-clamp-2">
                            {importSuccess.metadata.description}
                          </p>
                        )}
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          {importSuccess.blocks.filter((b) => !b.parentId).length} blocks
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

                  <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                    ⚠️ This will replace your current workspace
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "share" && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-100 dark:border-purple-900/50">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>Quick Share:</strong> Generate a code that others can paste to instantly
                  load your project!
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="share-project-name"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Project Name
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="share-project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Awesome Robot Program"
                    className="bg-white dark:bg-slate-900 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={refreshProjectName}
                    title="Generate new random name"
                    className="shrink-0 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-300 border-slate-200 dark:border-slate-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="share-passphrase"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Share Passphrase
                </Label>
                <div className="relative">
                  <Input
                    id="share-passphrase"
                    type={showSharePassphrase ? "text" : "password"}
                    value={sharePassphrase}
                    onChange={(e) => setSharePassphrase(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="bg-white dark:bg-slate-900 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSharePassphrase((prev) => !prev)}
                    className="absolute right-1 top-1 h-8 w-8"
                    title={showSharePassphrase ? "Hide passphrase" : "Show passphrase"}
                  >
                    {showSharePassphrase ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Anyone with this code and passphrase can load the project.
                </p>
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
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Your Share Code
                  </Label>
                  <div className="relative">
                    <Input
                      value={shareCode}
                      readOnly
                      className="bg-slate-50 dark:bg-slate-900 font-mono text-xs pr-44"
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
                    <Button
                      onClick={handleCopySharePackage}
                      size="sm"
                      variant="outline"
                      className="absolute right-20 top-1 h-7 px-2.5"
                      title="Copy code, passphrase, and import instructions"
                    >
                      {copiedSharePackage ? "Copied package!" : "Copy package"}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Share this code with friends - they can import it in the Import tab!
                  </p>
                </div>
              )}

              {shareError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{shareError}</span>
                </div>
              )}

              {blocks.length === 0 && (
                <p className="text-center text-sm text-amber-600 dark:text-amber-400">
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
