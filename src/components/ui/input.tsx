"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-border bg-black/20 px-3 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-brand/60",
        className
      )}
      {...props}
    />
  );
}

