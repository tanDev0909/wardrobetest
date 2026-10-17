"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";
import type { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const icon = (path: ReactNode) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {path}
  </svg>
);

const NAV: NavItem[] = [
  {
    href: "/",
    label: "Wardrobe",
    icon: icon(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>),
  },
  {
    href: "/today",
    label: "Today",
    icon: icon(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></>),
  },
  {
    href: "/inspo",
    label: "Inspo",
    icon: icon(<><path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1c0-.4.1-.8.5-1.1A6 6 0 0 0 12 3Z" /><path d="M9 21h6" /></>),
  },
  {
    href: "/tryon",
    label: "Try on",
    icon: icon(<><circle cx="12" cy="7" r="3.2" /><path d="M5.5 21v-1.5a6.5 6.5 0 0 1 13 0V21" /></>),
  },
  {
    href: "/add",
    label: "Add",
    icon: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>),
  },
];

function Brand() {
  return (
    <span className="text-xl font-semibold tracking-tight">
      Ashi&apos;s wardrobe<span className="text-accent">.</span>
    </span>
  );
}

export default function AppNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop side rail */}
      <aside className="hidden h-full w-52 shrink-0 flex-col gap-1 border-r border-line px-2 py-8 md:flex">
        <div className="px-3 pb-6">
          <Brand />
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  active ? "bg-accent/10 text-accent" : "text-muted hover:bg-swatch hover:text-ink",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-6xl items-stretch justify-around">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    active ? "text-accent" : "text-muted",
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
