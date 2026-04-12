type RateEntry = { count: number; resetAtMs: number };

const attemptsByKey = new Map<string, RateEntry>();

export function rateLimitLogin(key: string, opts?: { windowMs?: number; max?: number }) {
  const windowMs = opts?.windowMs ?? 60_000;
  const max = opts?.max ?? 10;

  const now = Date.now();
  const current = attemptsByKey.get(key);

  if (!current || current.resetAtMs <= now) {
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

