"use client";

import * as React from "react";
import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  User,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import useSession from "@/hooks/useSession";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

function getInitials(nameOrEmail?: string | null) {
  if (!nameOrEmail) return "U";
  if (nameOrEmail.includes("@")) return nameOrEmail[0]?.toUpperCase() ?? "U";
  const parts = nameOrEmail.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export default function Navbar() {
  const { session } = useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = (theme ?? resolvedTheme) === "dark";

  const displayName = useMemo(() => {
    return session?.user?.name || session?.user?.email || "User";
  }, [session]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="flex items-center h-16 gap-3 px-4 mx-auto max-w-7xl">
        <Link href="/" className="font-semibold tracking-tight">
          FFP Manager
        </Link>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          <Sun className="w-5 h-5 transition-all scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-5 h-5 transition-all scale-0 rotate-90 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={session?.user?.image ?? undefined}
                  alt={displayName}
                />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[18ch] truncate text-sm font-medium sm:inline-flex">
                {session?.user?.name?.split(" ")[0] ?? "—"}
              </span>
              <ChevronDown className="w-4 h-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="space-y-1">
              <div className="text-sm font-medium leading-none">
                {displayName}
              </div>
              <div className="text-xs truncate text-muted-foreground">
                {session?.user?.email ?? "No email available"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Account</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
