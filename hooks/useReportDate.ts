"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

const STORAGE_KEY = "manager-report-selected-date";

export function useReportDate() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Initialize from localStorage or use today's date
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return stored;
      }
    }
    return format(new Date(), "yyyy-MM-dd");
  });

  useEffect(() => {
    // Save to localStorage whenever date changes
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, selectedDate);
    }
  }, [selectedDate]);

  return [selectedDate, setSelectedDate] as const;
}

