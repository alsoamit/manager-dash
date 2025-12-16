"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { format, subMonths, eachDayOfInterval } from "date-fns";
import {
  listAttendanceByUser,
  type IAttendanceDay,
} from "@/services/attendance.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ActivityCalendar: any = dynamic(
  () => import("react-activity-calendar").then((m) => m.default),
  { ssr: false }
);

// 0..4 intensity levels
function levelFromCount(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count < 15) return 1;
  if (count < 60) return 2;
  if (count < 180) return 3;
  return 4;
}

interface EmployeeAttendanceProps {
  employeeSub: string;
}

export default function EmployeeAttendance({
  employeeSub,
}: EmployeeAttendanceProps) {
  const [attendance, setAttendance] = React.useState<IAttendanceDay[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Tooltip state for calendar
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [tip, setTip] = React.useState<{
    show: boolean;
    x: number;
    y: number;
    text: string;
  }>({ show: false, x: 0, y: 0, text: "" });

  const showTip = (
    activity: { date: string; count: number },
    e: React.MouseEvent
  ) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTip({
      show: true,
      x: e.clientX - r.left + 12,
      y: e.clientY - r.top + 12,
      text: `${format(new Date(activity.date), "EEE, MMM d, yyyy")} • ${
        activity.count
      } min active`,
    });
  };

  const moveTip = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTip((t) => ({
      ...t,
      x: e.clientX - r.left + 12,
      y: e.clientY - r.top + 12,
    }));
  };

  const hideTip = () => setTip((t) => ({ ...t, show: false }));

  // Load attendance data
  React.useEffect(() => {
    if (!employeeSub) return;

    const loadAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const end = new Date();
        const start = subMonths(end, 2);
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

  // Prepare calendar data
  const calendarData = React.useMemo(() => {
    if (loading || attendance.length === 0) return [];

    const end = new Date();
    const start = subMonths(end, 2);
    const allDays = eachDayOfInterval({ start, end }).map((d) =>
      format(d, "yyyy-MM-dd")
    );

    const byDay = new Map<string, number>();
    for (const it of attendance) {
      byDay.set(it.day, Number(it.minutesActive ?? it.pingCount ?? 0));
    }

    return allDays.map((day) => {
      const count = byDay.get(day) ?? 0;
      return { date: day, count, level: levelFromCount(count) };
    });
  }, [attendance, loading]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
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
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Attendance Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Attendance Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="relative w-full max-w-2xl p-3 border rounded-xl bg-card"
          >
            <ActivityCalendar
              data={calendarData}
              showWeekdayLabels
              blockSize={20}
              blockMargin={4}
              weekStart={0}
              hideColorLegend={true}
              renderBlock={(arg1: any, activity: any) => {
                const handlers = {
                  onMouseEnter: (e: React.MouseEvent) => showTip(activity, e),
                  onMouseMove: (e: React.MouseEvent) => moveTip(e),
                  onMouseLeave: () => hideTip(),
                };
                if (React.isValidElement(arg1)) {
                  return React.cloneElement(arg1 as React.ReactElement, {
                    ...((arg1 as any).props || {}),
                    ...handlers,
                  });
                }
                return React.createElement("rect", {
                  ...(arg1 || {}),
                  ...handlers,
                });
              }}
            />

            {/* Floating tooltip */}
            {tip.show && (
              <div
                className="absolute z-50 px-2 py-1 text-xs border rounded-md shadow pointer-events-none bg-popover text-popover-foreground"
                style={{
                  left: tip.x,
                  top: tip.y,
                  maxWidth: 240,
                  transform: "translate(0, 0)",
                  whiteSpace: "nowrap",
                }}
              >
                {tip.text}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
