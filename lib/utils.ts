import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a date string is today in IST (UTC+5:30)
 * @param dateStr - ISO date string or null
 * @returns true if the date is today in IST, false otherwise
 */
export function isTodayIST(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  
  try {
    const date = new Date(dateStr);
    const now = new Date();
    
    // Convert both to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const dateIST = new Date(date.getTime() + istOffset);
    const nowIST = new Date(now.getTime() + istOffset);
    
    // Compare dates (YYYY-MM-DD)
    const dateStrIST = `${dateIST.getUTCFullYear()}-${String(dateIST.getUTCMonth() + 1).padStart(2, "0")}-${String(dateIST.getUTCDate()).padStart(2, "0")}`;
    const todayStrIST = `${nowIST.getUTCFullYear()}-${String(nowIST.getUTCMonth() + 1).padStart(2, "0")}-${String(nowIST.getUTCDate()).padStart(2, "0")}`;
    
    return dateStrIST === todayStrIST;
  } catch {
    return false;
  }
}
