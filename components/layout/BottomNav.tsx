"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
} from "lucide-react";

// Items to show directly in bottom nav
const DIRECT_NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileText },
] as const;

type NavItem = (typeof DIRECT_NAV_ITEMS)[number];

// Items to show in hamburger menu
const HAMBURGER_NAV_ITEMS = [] as const;

function BottomNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active =
    pathname === item.href ||
    (pathname?.startsWith(item.href + "/") &&
      !["/salons/create", "/products/create", "/beats/create", "/orders/telephonic"].some(
        (exclude) => pathname === exclude
      ));

  return (
    <Link
      href={item.href}
      className={
        "flex flex-col justify-center items-center gap-1 rounded-2xl px-3 py-2 text-sm transition-colors " +
        (active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50")
      }
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs">{item.label}</span>
    </Link>
  );
}


export default function BottomNav() {
  return (
    <aside className="fixed bottom-0 left-0 right-0 z-30 px-2 py-3 md:hidden">
      <nav className="flex justify-center items-center w-full bg-card/80 backdrop-blur-sm border rounded-full px-5 py-1">
        {/* Direct nav items */}
        {DIRECT_NAV_ITEMS.map((item) => (
          <BottomNavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
