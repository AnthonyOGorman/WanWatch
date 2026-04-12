import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <label className={cn("text-sm font-medium text-text", className)}>{children}</label>;
}

