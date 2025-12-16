"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  BarChart2,
  MapPin,
  ShoppingCart,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/salons", label: "Salons", icon: Store },
  { href: "/products", label: "Products", icon: Package },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/beats", label: "Beats", icon: MapPin },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

// Items to show directly in bottom nav
const DIRECT_NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/salons", label: "Salons", icon: Store },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
] as const;

// Items to show in hamburger menu
const HAMBURGER_NAV_ITEMS = [
  { href: "/beats", label: "Beats", icon: MapPin },
  { href: "/products", label: "Products", icon: Package },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
] as const;

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

function HamburgerMenuItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active =
    pathname === item.href ||
    (pathname?.startsWith(item.href + "/") &&
      !["/salons/create", "/products/create", "/beats/create", "/orders/telephonic"].some(
        (exclude) => pathname === exclude
      ));

  return (
    <DropdownMenuItem asChild>
      <Link
        href={item.href}
        className={`flex items-center gap-2 ${
          active ? "bg-accent" : ""
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{item.label}</span>
      </Link>
    </DropdownMenuItem>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  
  // Check if any hamburger item is active
  const isHamburgerActive = HAMBURGER_NAV_ITEMS.some(
    (item) =>
      pathname === item.href ||
      (pathname?.startsWith(item.href + "/") &&
        !["/salons/create", "/products/create", "/beats/create", "/orders/telephonic"].some(
          (exclude) => pathname === exclude
        ))
  );

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-30 px-2 py-3 md:hidden">
      <nav className="flex justify-between items-center w-full bg-card/80 backdrop-blur-sm border rounded-full px-5 py-1">
        {/* Direct nav items */}
        {DIRECT_NAV_ITEMS.map((item) => (
          <BottomNavLink key={item.href} item={item} />
        ))}

        {/* Hamburger menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={
                "flex flex-col justify-center items-center gap-1 rounded-2xl px-3 py-2 text-sm transition-colors h-auto " +
                (isHamburgerActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50")
              }
            >
              <Menu className="w-4 h-4" />
              <span className="text-xs">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
            {HAMBURGER_NAV_ITEMS.map((item) => (
              <HamburgerMenuItem key={item.href} item={item} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </aside>
  );
}
