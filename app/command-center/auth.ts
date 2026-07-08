import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "poshane_command_center_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const ADMIN_EMAIL =
  process.env.COMMAND_CENTER_ADMIN_EMAIL ?? "ml@feedbacknfc.com";
const ADMIN_NAME = process.env.COMMAND_CENTER_ADMIN_NAME ?? "Super Admin";
const ADMIN_PASSWORD_SALT =
  process.env.COMMAND_CENTER_ADMIN_PASSWORD_SALT ??
  "86a1d83003fc59bc7ee5938dd8871ccd";
const ADMIN_PASSWORD_HASH =
  process.env.COMMAND_CENTER_ADMIN_PASSWORD_HASH ??
  "2f9cc5be5f737b0d5d5b9b90a4703c7540b4b8db97de5964db886700107548ab";
const ADMIN_PASSWORD_ITERATIONS = Number(
  process.env.COMMAND_CENTER_ADMIN_PASSWORD_ITERATIONS ?? 210000
);
const SESSION_SECRET =
  process.env.COMMAND_CENTER_SESSION_SECRET ??
  (process.env.VERCEL_ENV === "production"
    ? ""
    : "dev-only-command-center-session-secret");

export type CommandCenterSession = {
  email: string;
  name: string;
  role: "super_admin";
  expiresAt: number;
};

type SessionPayload = CommandCenterSession;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function timingSafeEqualString(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function hashPassword(password: string) {
  return crypto
    .pbkdf2Sync(
      password,
      ADMIN_PASSWORD_SALT,
      ADMIN_PASSWORD_ITERATIONS,
      32,
      "sha256"
    )
    .toString("hex");
}

function signPayload(payload: string) {
  if (!SESSION_SECRET) {
    throw new Error(
      "COMMAND_CENTER_SESSION_SECRET must be configured for production command-center sessions."
    );
  }

  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}

function createSessionCookie(session: CommandCenterSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function readSessionCookie(value: string | undefined): CommandCenterSession | null {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  if (!timingSafeEqualString(signature, expectedSignature)) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<SessionPayload>;

    if (
      decoded.role !== "super_admin" ||
      normalizeEmail(decoded.email ?? "") !== normalizeEmail(ADMIN_EMAIL) ||
      typeof decoded.expiresAt !== "number" ||
      decoded.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: "super_admin",
      expiresAt: decoded.expiresAt,
    };
  } catch {
    return null;
  }
}

export function verifyCommandCenterCredentials(email: string, password: string) {
  const emailMatches = timingSafeEqualString(
    normalizeEmail(email),
    normalizeEmail(ADMIN_EMAIL)
  );
  const passwordMatches = timingSafeEqualString(
    hashPassword(password),
    ADMIN_PASSWORD_HASH
  );

  return emailMatches && passwordMatches;
}

export function getCommandCenterSession() {
  return readSessionCookie(cookies().get(COOKIE_NAME)?.value);
}

export function setCommandCenterSession() {
  const session: CommandCenterSession = {
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: "super_admin",
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  cookies().set(COOKIE_NAME, createSessionCookie(session), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/command-center",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearCommandCenterSession() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/command-center",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
