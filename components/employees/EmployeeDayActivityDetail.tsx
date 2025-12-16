"use client";

import * as React from "react";
import { format, subDays } from "date-fns";
import {
  listAttendanceByUser,
  type IAttendanceDay,
} from "@/services/attendance.service";
import { listPingsByUser, type IPing } from "@/services/ping.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeDayActivityDetailProps {
  employeeSub: string;
}

export default function EmployeeDayActivityDetail({
  employeeSub,
}: EmployeeDayActivityDetailProps) {
  const [attendance, setAttendance] = React.useState<IAttendanceDay[]>([]);
  const [selectedDay, setSelectedDay] = React.useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedDayPings, setSelectedDayPings] = React.useState<IPing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pingsLoading, setPingsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Generate last 7 days options
  const dayOptions = React.useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, i);
      const dayStr = format(date, "yyyy-MM-dd");
      const label =
        i === 0 ? "Today" : i === 1 ? "Yesterday" : format(date, "EEE, MMM d");
      return { value: dayStr, label };
    });
  }, []);

  // Load attendance data
  React.useEffect(() => {
    if (!employeeSub) return;

    const loadAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        const from = format(start, "yyyy-MM-dd");
        const to = format(end, "yyyy-MM-dd");

        const res = await listAttendanceByUser({
          sub: employeeSub,
          from,
          to,
        });
        const items: IAttendanceDay[] = res?.data?.data?.items ?? [];
        setAttendance(items);
      } catch (err: any) {
        setError(err?.response?.data?.msg || "Failed to load attendance");
        console.error("Error loading attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [employeeSub]);

  // Load pings for selected day
  React.useEffect(() => {
    if (!employeeSub || !selectedDay) return;

    const loadDayPings = async () => {
      setPingsLoading(true);
      try {
        const response = await listPingsByUser({
          sub: employeeSub,
          day: selectedDay,
        });
        const items = response.data.data.items || [];
        items.sort(
          (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
        );
        setSelectedDayPings(items);
      } catch (err: any) {
        console.error("Error loading pings:", err);
      } finally {
        setPingsLoading(false);
      }
    };

    loadDayPings();
  }, [employeeSub, selectedDay]);

  // Get selected day's attendance info
  const selectedDayAttendance = React.useMemo(() => {
    return attendance.find((a) => a.day === selectedDay);
  }, [attendance, selectedDay]);

  // Prepare hourly activity data for productivity visualization (10am-10pm only)
  const hourlyActivityData = React.useMemo(() => {
    // Only show hours from 10am (10) to 10pm (22)
    const workingHours = Array.from({ length: 13 }, (_, i) => i + 10); // 10 to 22
    const dayDate = new Date(selectedDay + "T00:00:00");

    // Calculate max ping count only for working hours
    const maxPings = Math.max(
      ...workingHours.map((h) => {
        const hStart = new Date(dayDate);
        hStart.setHours(h, 0, 0, 0);
        const hEnd = new Date(dayDate);
        hEnd.setHours(h, 59, 59, 999);
        return selectedDayPings.filter(
          (p) => new Date(p.ts) >= hStart && new Date(p.ts) <= hEnd
        ).length;
      }),
      1
    );

    return workingHours.map((hour) => {
      const hourStart = new Date(dayDate);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(dayDate);
      hourEnd.setHours(hour, 59, 59, 999);

      const pingsInHour = selectedDayPings.filter((ping) => {
        const pingTime = new Date(ping.ts);
        return pingTime >= hourStart && pingTime <= hourEnd;
      });

      const pingCount = pingsInHour.length;
      const percentage = maxPings > 0 ? (pingCount / maxPings) * 100 : 0;

      return {
        hour,
        pingCount,
        percentage,
        pings: pingsInHour,
        hourLabel: `${String(hour).padStart(2, "0")}:00`,
      };
    });
  }, [selectedDayPings, selectedDay]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Day Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Day Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Day Activity
          </CardTitle>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {dayOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedDayAttendance ? (
          <>
            {/* Attendance Summary */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>First Ping</span>
                </div>
                <span className="font-medium text-sm">
                  {selectedDayAttendance.firstPing
                    ? format(
                        new Date(selectedDayAttendance.firstPing),
                        "h:mm a"
                      )
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Last Ping</span>
                </div>
                <span className="font-medium text-sm">
                  {selectedDayAttendance.lastPing
                    ? format(new Date(selectedDayAttendance.lastPing), "h:mm a")
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Ping Count
                </span>
                <Badge variant="secondary">
                  {selectedDayAttendance.pingCount}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Minutes Active
                </span>
                <Badge variant="secondary">
                  {selectedDayAttendance.minutesActive} min
                </Badge>
              </div>
            </div>

            {/* Hourly Productivity Chart */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Hourly Activity (Productivity by Hour)
              </div>
              <div className="border rounded-lg bg-muted/30 p-4">
                <div className="space-y-2">
                  {hourlyActivityData.map((data) => {
                    const isActive = data.pingCount > 0;
                    const maxPingCount = Math.max(
                      ...hourlyActivityData.map((d) => d.pingCount)
                    );
                    const barHeight =
                      maxPingCount > 0
                        ? `${(data.pingCount / maxPingCount) * 100}%`
                        : "0%";

                    return (
                      <div
                        key={data.hour}
                        className="flex items-center gap-3 group"
                        title={`${data.hourLabel} - ${data.pingCount} ping${
                          data.pingCount !== 1 ? "s" : ""
                        }`}
                      >
                        <div className="w-12 text-xs text-muted-foreground font-mono shrink-0">
                          {data.hourLabel}
                        </div>
                        <div className="flex-1 relative">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden relative">
                              {isActive && (
                                <div
                                  className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-md transition-all duration-300 flex items-center justify-end pr-2 group-hover:from-green-500 group-hover:via-green-600 group-hover:to-green-700"
                                  style={{ width: barHeight }}
                                >
                                  {data.pingCount > 0 && (
                                    <span className="text-[10px] font-semibold text-white">
                                      {data.pingCount}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="w-8 text-xs text-muted-foreground text-right shrink-0">
                              {data.pingCount > 0 ? data.pingCount : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
                      <span>Active hours with pings</span>
                    </div>
                    <div className="text-muted-foreground/60">
                      Height indicates ping count (relative to max)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No activity on {format(new Date(selectedDay), "MMM d, yyyy")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
