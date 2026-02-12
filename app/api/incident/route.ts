import { NextResponse } from "next/server";
import type { WipeoutEntry, WipeoutFormData } from "@/lib/types";

let fallbackTimestamp: string | null = null;
let fallbackLog: WipeoutEntry[] = [];

async function getKv() {
  try {
    const { kv } = await import("@vercel/kv");
    return kv;
  } catch {
    return null;
  }
}

function daysSince(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / 86_400_000);
}

export async function GET() {
  const kv = await getKv();

  let lastWipeout: string | null = null;
  let log: WipeoutEntry[] = [];

  if (kv) {
    try {
      lastWipeout = await kv.get<string>("lastWipeout");
      log = (await kv.get<WipeoutEntry[]>("wipeoutLog")) ?? [];
    } catch {
      // KV not configured — fall through
    }
  }

  if (!lastWipeout) {
    lastWipeout = fallbackTimestamp;
    log = fallbackLog;
  }

  if (!lastWipeout) {
    return NextResponse.json({ days: 0, lastWipeout: null, latestEntry: null, log: [] });
  }

  return NextResponse.json({
    days: daysSince(lastWipeout),
    lastWipeout,
    latestEntry: log[0] ?? null,
    log,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as WipeoutFormData;

  if (!body.details || !body.details.trim()) {
    return NextResponse.json({ error: "Details are required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const entry: WipeoutEntry = {
    id: crypto.randomUUID(),
    timestamp: now,
    details: body.details.trim(),
    ...(body.resort?.trim() ? { resort: body.resort.trim() } : {}),
    ...(body.run?.trim() ? { run: body.run.trim() } : {}),
    ...(body.runDifficulty ? { runDifficulty: body.runDifficulty } : {}),
  };

  const kv = await getKv();

  if (kv) {
    try {
      const existing = (await kv.get<WipeoutEntry[]>("wipeoutLog")) ?? [];
      const updated = [entry, ...existing];
      await kv.set("lastWipeout", now);
      await kv.set("wipeoutLog", updated);
    } catch {
      fallbackTimestamp = now;
      fallbackLog = [entry, ...fallbackLog];
    }
  } else {
    fallbackTimestamp = now;
    fallbackLog = [entry, ...fallbackLog];
  }

  return NextResponse.json({ days: 0, lastWipeout: now, latestEntry: entry });
}
