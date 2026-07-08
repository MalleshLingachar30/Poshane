"use server";

import { redirect } from "next/navigation";
import {
  clearCommandCenterSession,
  setCommandCenterSession,
  verifyCommandCenterCredentials,
} from "./auth";

export async function loginCommandCenter(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!verifyCommandCenterCredentials(email, password)) {
    redirect("/command-center?error=invalid");
  }

  setCommandCenterSession();
  redirect("/command-center");
}

export async function logoutCommandCenter() {
  clearCommandCenterSession();
  redirect("/command-center");
}
