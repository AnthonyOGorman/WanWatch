import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-semibold text-text">
              WanLogger
            </Link>
            <nav className="flex items-center gap-3 text-sm text-muted">
              <Link href="/dashboard" className="hover:text-text">
                Dashboard
              </Link>
              <Link href="/logs" className="hover:text-text">
                Logs
              </Link>
              <Link href="/settings" className="hover:text-text">
                Settings
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

