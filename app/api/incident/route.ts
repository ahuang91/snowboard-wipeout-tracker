import { NextResponse } from "next/server";

let fallbackTimestamp: string | null = null;

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

  if (kv) {
    try {
      lastWipeout = await kv.get<string>("lastWipeout");
    } catch {
      // KV not configured — fall through
    }
  }

  if (!lastWipeout) {
    lastWipeout = fallbackTimestamp;
  }

  if (!lastWipeout) {
    return NextResponse.json({ days: 0, lastWipeout: null });
  }

  return NextResponse.json({ days: daysSince(lastWipeout), lastWipeout });
}

export async function POST() {
  const now = new Date().toISOString();
  const kv = await getKv();

  if (kv) {
    try {
      await kv.set("lastWipeout", now);
    } catch {
      fallbackTimestamp = now;
    }
  } else {
    fallbackTimestamp = now;
  }

  return NextResponse.json({ days: 0, lastWipeout: now });
}
