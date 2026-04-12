export type IpChangeEvent = { ts: string; fromIp: string; toIp: string };

export function detectIpChanges(
  logsNewestFirst: Array<{ ts: string; ok: boolean; ip: string | null }>,
  limit: number
): IpChangeEvent[] {
  const out: IpChangeEvent[] = [];
  let lastIp: string | null = null;

  for (const row of logsNewestFirst) {
    if (!row.ok || !row.ip) continue;
    if (lastIp === null) {
      lastIp = row.ip;
      continue;
    }
    if (row.ip !== lastIp) {
      out.push({ ts: row.ts, fromIp: row.ip, toIp: lastIp });
      lastIp = row.ip;
      if (out.length >= limit) break;
    }
  }

  return out;
}

