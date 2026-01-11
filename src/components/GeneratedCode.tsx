import { Copy, Download } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useScratch } from "@/context/ScratchContext";

export const GeneratedCode = () => {
  const { generatedCode, handleCopyCode, handleExportCode } = useScratch();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Generated Code</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyCode}
            disabled={!generatedCode}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCode}
            disabled={!generatedCode}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 rounded-lg border overflow-hidden">
        <ScrollArea className="h-full">
          <pre className="text-sm p-4 whitespace-pre-wrap">
            <code>
              {generatedCode ||
                "// Generate code from your blocks to see it here"}
            </code>
          </pre>
        </ScrollArea>
      </div>
    </section>
  );
};
