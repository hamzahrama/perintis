"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { logoutAction } from "@/app/auth/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Theme } from "@/components/theme-toggle";
import { Button } from "@/components/ui";

type DashboardShellProps = {
  children: ReactNode;
  initialTheme: Theme;
  activePath?: "/dashboard" | "/goals" | "/daily" | "/habits" | "/reminders" | "/commitment" | "/calendar" | "/coach" | "/reflection" | "/review" | "/profile";
};

export function DashboardShell({
  children,
  initialTheme,
  activePath = "/dashboard",
}: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="brand" href="/">
          PERINTIS
        </Link>
        <div className="dashboard-header-actions">
          <ThemeToggle initialTheme={initialTheme} />
          <Button
            aria-controls="dashboard-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            className="menu-toggle"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            type="button"
            variant="secondary"
          >
            Menu
          </Button>
        </div>
      </header>

      <aside
        className={`dashboard-sidebar${menuOpen ? " dashboard-sidebar--open" : ""}`}
        id="dashboard-navigation"
      >
        <nav aria-label="Navigasi utama">
          <p className="sidebar-label">Menu</p>
          <Link
            aria-current={activePath === "/dashboard" ? "page" : undefined}
            className="sidebar-link"
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
          >
            Ringkasan
          </Link>
          <Link
            aria-current={activePath === "/goals" ? "page" : undefined}
            className="sidebar-link"
            href="/goals"
            onClick={() => setMenuOpen(false)}
          >
            My Direction
          </Link>
          <Link
            aria-current={activePath === "/daily" ? "page" : undefined}
            className="sidebar-link"
            href="/daily"
            onClick={() => setMenuOpen(false)}
          >
            Daily Guidance
          </Link>
          <Link
            aria-current={activePath === "/habits" ? "page" : undefined}
            className="sidebar-link"
            href="/habits"
            onClick={() => setMenuOpen(false)}
          >
            My Habits
          </Link>
          <Link
            aria-current={activePath === "/reminders" ? "page" : undefined}
            className="sidebar-link"
            href="/reminders"
            onClick={() => setMenuOpen(false)}
          >
            Reminder
          </Link>
          <Link
            aria-current={activePath === "/commitment" ? "page" : undefined}
            className="sidebar-link"
            href="/commitment"
            onClick={() => setMenuOpen(false)}
          >
            Commitment
          </Link>
          <Link
            aria-current={activePath === "/calendar" ? "page" : undefined}
            className="sidebar-link"
            href="/calendar"
            onClick={() => setMenuOpen(false)}
          >
            Calendar
          </Link>
          <Link
            aria-current={activePath === "/coach" ? "page" : undefined}
            className="sidebar-link"
            href="/coach"
            onClick={() => setMenuOpen(false)}
          >
            Coach
          </Link>
          <Link
            aria-current={activePath === "/reflection" ? "page" : undefined}
            className="sidebar-link"
            href="/reflection"
            onClick={() => setMenuOpen(false)}
          >
            Refleksi
          </Link>
          <Link
            aria-current={activePath === "/review" ? "page" : undefined}
            className="sidebar-link"
            href="/review"
            onClick={() => setMenuOpen(false)}
          >
            Review Mingguan
          </Link>
          <Link
            aria-current={activePath === "/profile" ? "page" : undefined}
            className="sidebar-link"
            href="/profile"
            onClick={() => setMenuOpen(false)}
          >
            Profil &amp; pengaturan
          </Link>
        </nav>
        <div className="sidebar-footer">
          <p className="sidebar-caption">Sesi akun aktif</p>
          <form action={logoutAction}>
            <Button fullWidth type="submit" variant="ghost">
              Keluar
            </Button>
          </form>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}
