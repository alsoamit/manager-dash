// hooks/useEmployeeLiveStatus.tsx
"use client";

import * as React from "react";
import socket from "@/lib/socket";

/**
 * Hook to track live status for multiple employees
 * Listens to socket pings and tracks which employees are currently active
 */
export function useEmployeeLiveStatus(employeeSubs: string[]) {
  const [liveEmployees, setLiveEmployees] = React.useState<Set<string>>(new Set());
  const [socketConnected, setSocketConnected] = React.useState(false);

  // Serialize employeeSubs to create a stable dependency
  const employeeSubsKey = React.useMemo(
    () => employeeSubs.sort().join(","),
    [employeeSubs]
  );

  React.useEffect(() => {
    if (!employeeSubs || employeeSubs.length === 0) return;

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setSocketConnected(true);
      // Join all employee rooms
      employeeSubs.forEach((sub) => {
        socket.emit("join", { sub });
      });
    };

    const onDisconnect = () => {
      setSocketConnected(false);
      setLiveEmployees(new Set());
    };

    const onPing = (data: {
      sub: string;
      ts: string;
      loc?: { lat: number; lng: number; accuracy?: number };
    }) => {
      // Only track if the ping has location data and the employee is in our list
      if (data.sub && data.loc && employeeSubs.includes(data.sub)) {
        setLiveEmployees((prev) => {
          const next = new Set(prev);
          next.add(data.sub);
          return next;
        });

        // Reset live status after 2 minutes of no pings
        setTimeout(() => {
          setLiveEmployees((prev) => {
            const next = new Set(prev);
            next.delete(data.sub);
            return next;
          });
        }, 120000); // 2 minutes
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("ping", onPing);

    // If already connected, join immediately
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("ping", onPing);
    };
  }, [employeeSubsKey, employeeSubs]); // Use serialized key for dependency, but reference array in effect

  const isLive = React.useCallback(
    (sub: string) => {
      return liveEmployees.has(sub);
    },
    [liveEmployees]
  );

  return { isLive, socketConnected };
}
