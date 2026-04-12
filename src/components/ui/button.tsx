"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-brand text-white hover:bg-brand/90",
    secondary: "bg-white/10 text-text hover:bg-white/15",
    ghost: "bg-transparent text-text hover:bg-white/10",
    danger: "bg-bad text-white hover:bg-bad/90"
  };
  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm"
  };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

