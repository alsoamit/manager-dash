"use client";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function BaseLayoutWrapper({ children }: any) {
  const pathname = usePathname();

  useEffect(() => {
    if (localStorage.getItem("color-theme") !== "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const showMenu = !pathname.startsWith("/auth");

  return (
    <>
      {showMenu && <Navbar />}
      <main className="flex mx-auto max-w-7xl">
        {showMenu && (
          <div>
            <Sidebar />
          </div>
        )}
        <div className="flex-1 p-4 pb-24">{children}</div>
      </main>
    </>
  );
}
