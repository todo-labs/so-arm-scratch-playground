
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import type { BlockParameter } from "@/lib/types";

interface BlockParameterEditorProps {
  parameter: BlockParameter;
  value: boolean | number | string;
  onChange: (value: boolean | number | string) => void;
  className?: string;
}

export function BlockParameterEditor({
  parameter,
  value,
  onChange,
  className = "",
}: BlockParameterEditorProps) {
  const handleChange = (newValue: boolean | number | string) => {
    onChange(newValue);
  };

  switch (parameter.type) {
    case "number":
    case "angle":
      return (
        <Input
          type="number"
          value={String(value ?? parameter.defaultValue)}
          onChange={(e) => handleChange(Number(e.target.value))}
          min={parameter.min}
          max={parameter.max}
          step={parameter.step}
          className={`w-14 h-6 text-[11px] font-bold bg-white text-slate-900 rounded-full border border-black/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-black/5 ${className}`}
        />
      );

    case "string":
      return (
        <Input
          type="text"
          value={String(value ?? parameter.defaultValue)}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={parameter.placeholder}
          className={`w-20 h-6 text-[11px] font-bold bg-white text-slate-900 rounded-full border border-black/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-black/5 ${className}`}
        />
      );

    case "dropdown":
      return (
        <Select
          value={String(value ?? parameter.defaultValue)}
          onValueChange={handleChange}
        >
          <SelectTrigger
            className={`w-auto min-w-[60px] h-6 px-3 text-[11px] font-bold bg-white text-slate-900 rounded-full border border-black/10 shadow-sm hover:bg-gray-50 transition-colors ${className}`}
          >
            <SelectValue className="text-gray-900" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-black/10">
            {parameter.options?.map((option) => (
              <SelectItem key={option} value={option} className="text-xs text-gray-900 rounded-lg">
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
            className="bg-white/95 border border-black/20 data-[state=checked]:bg-white data-[state=checked]:text-black w-4 h-4 rounded-sm shadow-none"
          />
        </div>
      );

    default:
      return null;
  }
}
