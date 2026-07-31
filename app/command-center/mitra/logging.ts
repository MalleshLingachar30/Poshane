import "server-only";

import crypto from "crypto";
import type { CommandCenterSession } from "../auth";
import type { PoshaneMitraAuditEvent } from "./types";

export function safetyIdentifierForSession(session: CommandCenterSession) {
  return crypto
    .createHash("sha256")
    .update(`poshane:${session.email}:${session.role}`)
    .digest("hex");
}

export function logPoshaneMitraAudit(
  session: CommandCenterSession,
  payload: PoshaneMitraAuditEvent
) {
  const entry = {
    ts: new Date().toISOString(),
    programme: "poshane",
    actor_hash: safetyIdentifierForSession(session),
    role: session.role,
    ...payload,
  };

  console.info("[poshane-mitra-audit]", JSON.stringify(entry));
}
