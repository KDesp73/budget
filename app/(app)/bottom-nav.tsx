"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Settings } from "lucide-react";

const LINKS = [
  { href: "/", label: "Log", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t bg-background py-2 md:hidden">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
              active ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className={`size-5 ${active ? "fill-foreground/10 stroke-[2.5]" : ""}`} />
            <span className={`text-[10px] font-medium ${active ? "text-foreground" : ""}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
