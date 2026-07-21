import { connectDB } from "@/lib/mongodb";
import AiUsage from "@/lib/models/AiUsage";

// Combined ceiling across ALL AI tools for one calendar day (UTC). Sized
// comfortably under Gemini 2.5 Flash's free-tier daily quota so normal usage
// never hits it, while still capping the blast radius of a distributed
// abuse attempt that spreads requests across many IPs to dodge per-IP
// rate limiting.
const GLOBAL_DAILY_CAP = 300;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/**
 * Instant, code-free off switch. Set AI_TOOLS_ENABLED=false in the Vercel
 * dashboard to disable every AI route immediately — no deploy needed — if
 * costs spike or abuse is detected.
 */
export function areAiToolsEnabled(): boolean {
  return process.env.AI_TOOLS_ENABLED !== "false";
}

/**
 * Atomically increments today's global AI usage counter and reports
 * whether the request should be allowed. Fails open (allows the request)
 * if the DB is unreachable — a global cap is a cost-safety net, not a
 * correctness requirement, so an outage here shouldn't take down every AI
 * tool on top of whatever caused the outage.
 */
export async function checkAndIncrementGlobalAiUsage(): Promise<{
  allowed: boolean;
  count: number;
}> {
  try {
    await connectDB();
    const date = todayUTC();

    const existing = await AiUsage.findOne({ date }).lean();
    if (existing && existing.count >= GLOBAL_DAILY_CAP) {
      return { allowed: false, count: existing.count };
    }

    const updated = await AiUsage.findOneAndUpdate(
      { date },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: "after" }
    ).lean();

    return { allowed: true, count: updated?.count ?? 0 };
  } catch (err) {
    console.error("[aiUsage] Failed to check global usage, failing open:", err);
    return { allowed: true, count: 0 };
  }
}
