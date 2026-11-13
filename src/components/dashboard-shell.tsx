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
  activePath?: "/dashboard" | "/profile";
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
            aria-current={activePath === "/profile" ? "page" : undefined}
            className="sidebar-link"
            href="/profile"
            onClick={() => setMenuOpen(false)}
          >
            Profil & pengaturan
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
