import { NextResponse } from "next/server";
import { getCommandCenterSession } from "../../auth";
import { logPoshaneMitraAudit } from "../logging";
import type { PoshaneMitraAuditEvent } from "../types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCommandCenterSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<PoshaneMitraAuditEvent>;
  logPoshaneMitraAudit(session, {
    event: body.event ?? "error",
    tool: body.tool,
    result_status: body.result_status,
    navigation_action: body.navigation_action,
    latency_ms: body.latency_ms,
    error: body.error,
    audio_duration_ms: body.audio_duration_ms,
    estimated_cost_usd: body.estimated_cost_usd,
  });

  return NextResponse.json({ ok: true });
}
