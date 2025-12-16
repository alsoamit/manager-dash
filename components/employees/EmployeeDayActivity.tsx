"use client";

import * as React from "react";
import { format } from "date-fns";
import { Clock, MapPin, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listPingsByUser, type IPing } from "@/services/ping.service";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeDayActivityProps {
  employeeSub: string;
  day?: string; // YYYY-MM-DD, defaults to today
}

export default function EmployeeDayActivity({
  employeeSub,
  day,
}: EmployeeDayActivityProps) {
  const [pings, setPings] = React.useState<IPing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const targetDay = day || format(new Date(), "yyyy-MM-dd");

  React.useEffect(() => {
    if (!employeeSub) return;

    const loadPings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listPingsByUser({
          sub: employeeSub,
          day: targetDay,
        });
        const items = response.data.data.items || [];
        // Sort by timestamp
        items.sort(
          (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
        );
        setPings(items);
      } catch (err: any) {
        setError(err?.response?.data?.msg || "Failed to load pings");
        console.error("Error loading pings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPings();
  }, [employeeSub, targetDay]);

  // Calculate attendance info from pings
  const attendanceInfo = React.useMemo(() => {
    if (pings.length === 0) {
      return {
        firstPing: null,
        lastPing: null,
        pingCount: 0,
        minutesActive: 0,
      };
    }

    const firstPing = pings[0].ts;
    const lastPing = pings[pings.length - 1].ts;
    const pingCount = pings.length;

    // Calculate minutes active (time between first and last ping)
    const firstTime = new Date(firstPing).getTime();
    const lastTime = new Date(lastPing).getTime();
    const minutesActive = Math.round((lastTime - firstTime) / (1000 * 60));

    return {
      firstPing,
      lastPing,
      pingCount,
      minutesActive,
    };
  }, [pings]);

  if (loading) {
    return (
      <div className="space-y-2 pt-4 border-t">
        <div className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Today's Activity
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4 border-t">
        <div className="text-sm font-medium flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4" />
          Today's Activity
        </div>
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  const hasActivity = pings.length > 0;

  return (
    <div className="pt-4 border-t space-y-3">
      <div className="text-sm font-medium flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Today's Activity
      </div>
      <div className="space-y-3">
        {hasActivity ? (
          <>
            {/* Attendance Summary */}
            <div className="space-y-2 pb-2 border-b">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>First Ping</span>
                </div>
                <span className="font-medium">
                  {attendanceInfo.firstPing
                    ? format(new Date(attendanceInfo.firstPing), "h:mm a")
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Last Ping</span>
                </div>
                <span className="font-medium">
                  {attendanceInfo.lastPing
                    ? format(new Date(attendanceInfo.lastPing), "h:mm a")
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ping Count</span>
                <Badge variant="secondary">{attendanceInfo.pingCount}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Minutes Active</span>
                <Badge variant="secondary">
                  {attendanceInfo.minutesActive} min
                </Badge>
              </div>
            </div>

            {/* Pings List */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                All Pings ({pings.length})
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {pings.map((ping, idx) => (
                  <div
                    key={`${ping.ts}-${idx}`}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono">
                        {format(new Date(ping.ts), "h:mm:ss a")}
                      </span>
                    </div>
                    {ping.lat && ping.lng && (
                      <span className="text-muted-foreground font-mono text-[10px]">
                        {ping.lat.toFixed(4)}, {ping.lng.toFixed(4)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No activity today
          </div>
        )}
      </div>
    </div>
  );
}
