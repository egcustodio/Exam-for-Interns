"use client";

import { Palette, Rocket, Code2, Database, BookOpen, Star } from "lucide-react";
import { Category } from "@/data/questions";

const categoryConfig: Record<Category, { color: string; icon: React.ReactNode }> = {
  "CSS & Styling": {
    color: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    icon: <Palette size={13} />,
  },
  "Coding & Deployment": {
    color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    icon: <Rocket size={13} />,
  },
  Programming: {
    color: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    icon: <Code2 size={13} />,
  },
  Databases: {
    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    icon: <Database size={13} />,
  },
  "Fundamentals & Technology": {
    color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: <BookOpen size={13} />,
  },
  Bonus: {
    color: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
    icon: <Star size={13} />,
  },
};

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md";
}

export default function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  const { color, icon } = categoryConfig[category];
  const sizeClass = size === "md"
    ? "px-3.5 py-1.5 text-sm gap-2"
    : "px-3 py-1 text-xs gap-1.5";
  return (
    <span className={`inline-flex items-center rounded-md font-medium border ${color} ${sizeClass}`}>
      {icon}
      {category}
    </span>
  );
}

