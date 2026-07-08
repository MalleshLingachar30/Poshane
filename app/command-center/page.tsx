import type { Metadata } from "next";
import "./command-center.css";
import CommandCenterApp from "./CommandCenterApp";
import { getCommandCenterSession } from "./auth";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";

export const metadata: Metadata = {
  title: "Command Center — Poshane | KSLSA Five Crore Sapling Plantation Programme",
  description:
    "Poshane Command & Control Center — restricted operations console for authorised programme users.",
  robots: { index: false, follow: false },
};

/**
 * /command-center — restricted programme operations console.
 */
export default function CommandCenterPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const session = getCommandCenterSession();

  if (!session) {
    return <LoginForm error={searchParams?.error} />;
  }

  return (
    <div className="cc-auth-shell">
      <CommandCenterApp adminEmail={session.email} adminName={session.name} />
      <LogoutButton />
    </div>
  );
}
