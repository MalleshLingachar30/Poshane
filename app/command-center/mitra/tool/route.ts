import { NextResponse } from "next/server";
import { getCommandCenterSession } from "../../auth";
import { logPoshaneMitraAudit } from "../logging";
import { executePoshaneMitraTool } from "../provider";
import { POSHANE_MITRA_TOOL_DEFINITIONS } from "../tool-definitions";
import type { PoshaneMitraToolName } from "../types";

export const runtime = "nodejs";

const READ_ONLY_TOOLS = new Set<PoshaneMitraToolName>(
  POSHANE_MITRA_TOOL_DEFINITIONS.map((tool) => tool.name)
);

function isToolName(value: unknown): value is PoshaneMitraToolName {
  return typeof value === "string" && READ_ONLY_TOOLS.has(value as PoshaneMitraToolName);
}

function sanitiseArgs(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([key]) =>
      /^[a-zA-Z0-9_]+$/.test(key)
    )
  );
}

export async function POST(request: Request) {
  const session = await getCommandCenterSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const startedAt = performance.now();
  let tool: PoshaneMitraToolName | undefined;
  let args: Record<string, unknown> = {};

  try {
    const body = await request.json();
    if (!isToolName(body?.tool)) {
      return NextResponse.json({ error: "Unsupported read-only tool." }, { status: 400 });
    }

    const requestedTool = body.tool;
    tool = requestedTool;
    args = sanitiseArgs(body.arguments);
    const result = executePoshaneMitraTool(requestedTool, args);

    logPoshaneMitraAudit(session, {
      event: "tool_call",
      tool,
      validated_parameters: args,
      result_status: result.record_status,
      navigation_action: result.ui_action,
      latency_ms: Math.round(performance.now() - startedAt),
      estimated_cost_usd: 0,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tool execution failed.";
    logPoshaneMitraAudit(session, {
      event: "error",
      tool,
      validated_parameters: args,
      result_status: "Error",
      error: message,
      latency_ms: Math.round(performance.now() - startedAt),
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
