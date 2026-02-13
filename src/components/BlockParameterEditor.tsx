import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { BlockParameter } from "@/lib/types";

interface BlockParameterEditorProps {
  parameter: BlockParameter;
  value: boolean | number | string;
  onChange: (value: boolean | number | string) => void;
  className?: string;
  min?: number;
  max?: number;
}

export function BlockParameterEditor({
  parameter,
  value,
  onChange,
  className = "",
  min,
  max,
}: BlockParameterEditorProps) {
  const handleChange = (newValue: boolean | number | string) => {
    onChange(newValue);
  };

  const resolvedMin = min ?? parameter.min;
  const resolvedMax = max ?? parameter.max;

  switch (parameter.type) {
    case "number":
    case "angle":
      return (
        <Input
          type="number"
          value={String(value ?? parameter.defaultValue)}
          onChange={(e) => {
            const numericValue = Number(e.target.value);
            if (Number.isNaN(numericValue)) return;

            let boundedValue = numericValue;
            if (typeof resolvedMin === "number") {
              boundedValue = Math.max(resolvedMin, boundedValue);
            }
            if (typeof resolvedMax === "number") {
              boundedValue = Math.min(resolvedMax, boundedValue);
            }
            handleChange(boundedValue);
          }}
          min={resolvedMin}
          max={resolvedMax}
          step={parameter.step}
          className={`w-14 h-6 text-[11px] font-bold bg-background/95 text-foreground rounded-full border border-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring/40 ${className}`}
        />
      );

    case "string":
      return (
        <Input
          type="text"
          value={String(value ?? parameter.defaultValue)}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={parameter.placeholder}
          className={`w-20 h-6 text-[11px] font-bold bg-background/95 text-foreground rounded-full border border-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring/40 ${className}`}
        />
      );

    case "dropdown":
      return (
        <Select value={String(value ?? parameter.defaultValue)} onValueChange={handleChange}>
          <SelectTrigger
            className={`w-auto min-w-[60px] h-6 px-3 text-[11px] font-bold bg-background text-foreground rounded-full border border-border shadow-sm hover:bg-accent transition-colors ${className}`}
          >
            <SelectValue className="text-foreground" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border">
            {parameter.options?.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="text-xs text-foreground rounded-lg"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "boolean":
      return (
        <div className={`flex items-center ${className}`}>
          <Checkbox
            checked={Boolean(value ?? parameter.defaultValue)}
            onCheckedChange={handleChange}
            className="bg-background/95 border border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground w-4 h-4 rounded-sm shadow-none"
          />
        </div>
      );

    default:
      return null;
  }
}
