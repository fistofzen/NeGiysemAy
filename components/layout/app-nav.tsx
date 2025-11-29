'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LogoutButton } from "@/components/auth/logout-button";

const navLinks = [
  { href: "/dashboard", label: "Panel" },
  { href: "/wardrobe", label: "Dolap" },
  { href: "/outfits", label: "Kombinler" },
  { href: "/profiles", label: "Profiller" },
];

type AppNavProps = {
  activeProfileName?: string;
};

export const AppNav = ({ activeProfileName }: AppNavProps) => {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
            Ne Giysem Ay
          </Link>
          <nav className="hidden gap-4 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "rounded-md px-3 py-2 transition",
                    isActive ? "bg-brand-50 text-brand-600" : "hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profiles/select"
            className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 md:flex"
          >
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-500" />
            {activeProfileName ?? "Profil seç"}
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};
