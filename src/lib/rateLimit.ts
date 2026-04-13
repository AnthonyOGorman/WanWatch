type RateEntry = { count: number; resetAtMs: number };

const attemptsByKey = new Map<string, RateEntry>();
const CLEANUP_INTERVAL_MS = 30_000;
const MAX_TRACKED_KEYS = 10_000;
let lastCleanupAtMs = 0;

function cleanupAttempts(now: number) {
  for (const [key, entry] of attemptsByKey) {
    if (entry.resetAtMs <= now) {
      attemptsByKey.delete(key);
    }
  }
}

function enforceMapCap(maxSize = MAX_TRACKED_KEYS) {
  if (attemptsByKey.size <= maxSize) return;

  const entries = [...attemptsByKey.entries()].sort((a, b) => a[1].resetAtMs - b[1].resetAtMs);
  const toDelete = attemptsByKey.size - maxSize;
  for (let i = 0; i < toDelete; i++) {
    attemptsByKey.delete(entries[i]![0]);
  }
}

function maybeCleanup(now: number) {
  if (attemptsByKey.size >= MAX_TRACKED_KEYS || now - lastCleanupAtMs >= CLEANUP_INTERVAL_MS) {
    cleanupAttempts(now);
    enforceMapCap();
    lastCleanupAtMs = now;
  }
}

export function rateLimitLogin(key: string, opts?: { windowMs?: number; max?: number }) {
  const windowMs = opts?.windowMs ?? 60_000;
  const max = opts?.max ?? 10;

  const now = Date.now();
  maybeCleanup(now);
  const current = attemptsByKey.get(key);

  if (!current || current.resetAtMs <= now) {
    if (!current && attemptsByKey.size >= MAX_TRACKED_KEYS) {
      // Ensure room for the new key so the map never exceeds the cap.
      enforceMapCap(MAX_TRACKED_KEYS - 1);
    }
    attemptsByKey.set(key, { count: 1, resetAtMs: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }

  if (current.count >= max) {
    return { ok: false, remaining: 0, retryAfterMs: current.resetAtMs - now };
  }

  current.count += 1;
  attemptsByKey.set(key, current);
  return { ok: true, remaining: Math.max(0, max - current.count) };
}
