import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("rounded-xl border border-border bg-card/70 backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("px-5 pt-5", className)}>{children}</div>;
}

export function CardTitle({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("text-sm font-semibold text-text", className)}>{children}</div>;
}

export function CardContent({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("px-5 pb-5 pt-3", className)}>{children}</div>;
}

