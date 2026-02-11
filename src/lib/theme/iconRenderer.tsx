import { Bot, Calculator, Eye, Hand, RefreshCcw, Star, Zap } from "lucide-react";
import type { ReactElement } from "react";
import { SCRATCH_THEME } from "./scratch";

export function renderCategoryIcon(categoryName: string): ReactElement | string {
  const iconName = SCRATCH_THEME.icons[categoryName as keyof typeof SCRATCH_THEME.icons];

  if (!iconName) return <Zap size={18} className="inline" />;

  switch (iconName) {
    case "Bot":
      return <Bot size={18} className="inline" />;
    case "RefreshCcw":
      return <RefreshCcw size={18} className="inline" />;
    case "Hand":
      return <Hand size={18} className="inline" />;
    case "Eye":
      return <Eye size={18} className="inline" />;
    case "Calculator":
      return <Calculator size={18} className="inline" />;
    case "Star":
      return <Star size={18} className="inline" />;
    default:
      return <Zap size={18} className="inline" />;
  }
}

export function getCategoryIconName(categoryName: string): string {
  return SCRATCH_THEME.icons[categoryName as keyof typeof SCRATCH_THEME.icons] || "Zap";
}
