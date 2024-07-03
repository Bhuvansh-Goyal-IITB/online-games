import { getRequestContext } from "@cloudflare/next-on-pages";
import { createId } from "@paralleldrive/cuid2";
import { Redis } from "@upstash/redis/cloudflare";
import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const redis = Redis.fromEnv(getRequestContext().env);

  const newId = createId();

  await redis.hset(newId, { started: false, state: "" });

  return NextResponse.json({ gameId: newId });
}
