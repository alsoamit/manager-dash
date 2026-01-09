"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
} from "lucide-react";
import BottomNav from "./BottomNav";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/reports", label: "Daily Reports", icon: FileText },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

function SidebarLink({ item }: { item: NavItem }) {
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
        "flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors " +
        (active
          ? "bg-blue-500 text-white"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50")
      }
    >
      <Icon className="w-4 h-4" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <>
      <aside className="hidden h-full pt-4 md:flex md:w-64 md:flex-col">
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.href} item={item} />
          ))}
        </nav>
      </aside>
      <BottomNav />
    </>
  );
}
