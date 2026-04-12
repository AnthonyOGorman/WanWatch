"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RunNowButton({ onRequested }: { onRequested?: () => void }) {
  const [busy, setBusy] = useState(false);

  async function runNow() {
    setBusy(true);
    try {
      const res = await fetch("/api/poll/request", { method: "POST" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      alert("Poll requested. The worker should pick it up within a few seconds.");
      await new Promise((r) => setTimeout(r, 4000));
      onRequested?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to request poll");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={runNow} disabled={busy}>
      {busy ? "Requesting..." : "Run now"}
    </Button>
  );
}
