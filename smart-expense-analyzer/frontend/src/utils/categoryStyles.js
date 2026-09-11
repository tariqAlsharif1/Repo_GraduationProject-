import {
  Book,
  Car,
  Film,
  HelpCircle,
  ShoppingBag,
  UtensilsCrossed,
  Zap,
} from "lucide-react";

export const CATEGORY_STYLES = {
  Food: { icon: UtensilsCrossed, color: "#E1A33E", bg: "#FBF1DF" },
  Transportation: { icon: Car, color: "#1F7A5C", bg: "#EAF6F0" },
  Shopping: { icon: ShoppingBag, color: "#8E5FD1", bg: "#F1EAFB" },
  Education: { icon: Book, color: "#2B6FCB", bg: "#E9F0FC" },
  Entertainment: { icon: Film, color: "#D6483F", bg: "#FBEAE8" },
  Bills: { icon: Zap, color: "#C9962A", bg: "#FBF1DF" },
  Other: { icon: HelpCircle, color: "#667085", bg: "#EEF1F5" },
};

export const getCategoryStyle = (name) => CATEGORY_STYLES[name] || CATEGORY_STYLES.Other;

export const CHART_COLORS = [
  "#1F7A5C", "#E1A33E", "#8E5FD1", "#2B6FCB", "#D6483F", "#C9962A", "#667085",
];
