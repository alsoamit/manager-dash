"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import { getTargetHistory } from "@/services/target.service";
import type {
  IDailyTargetHistoryItem,
  IMonthlyTargetHistoryItem,
} from "@/services/target.service";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

function formatINR(n?: number) {
  if (typeof n !== "number" || isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

interface TargetHistoryChartProps {
  employeeSub: string;
  type: "daily" | "monthly";
  employeeRole?: string;
}

// Chart rendering component
function ChartContent({
  type,
  data,
  chartHeight = 200,
}: {
  type: "daily" | "monthly";
  data: (IDailyTargetHistoryItem | IMonthlyTargetHistoryItem)[];
  chartHeight?: number;
}) {
  const chartPadding = 40;

  if (type === "daily") {
    const dailyData = data as IDailyTargetHistoryItem[];

    // Calculate max value for scaling
    const maxValue = Math.max(
      ...dailyData.flatMap((d) => [d.maxVisits, d.achieved]),
      1
    );

    return (
      <div className="space-y-4">
        {/* Chart */}
        <div
          className="relative border rounded-lg p-4 bg-muted/20"
          style={{ height: `${chartHeight + chartPadding}px` }}
        >
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue / 2)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div
            className="absolute left-10 right-0 top-0 bottom-8"
            style={{ height: `${chartHeight}px` }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 0.5, 1].map((ratio) => (
                <div
                  key={ratio}
                  className="border-t border-dashed border-muted-foreground/20"
                />
              ))}
            </div>

            {/* Bars - side by side */}
            <div className="relative h-full flex items-end gap-1 px-1">
              {dailyData.map((item) => {
                const goalAvg = (item.minVisits + item.maxVisits) / 2;
                const goalHeight = Math.max(
                  (goalAvg / maxValue) * chartHeight,
                  2
                ); // Minimum 2px for visibility
                const achievementHeight = Math.max(
                  (item.achieved / maxValue) * chartHeight,
                  item.achieved > 0 ? 2 : 0
                );

                return (
                  <div
                    key={item.targetKey}
                    className="flex-1 flex items-end justify-center gap-0.5 group min-w-0"
                  >
                    {/* Goal bar (average of min and max) */}
                    <div
                      className="w-1/2 bg-primary/30 rounded-t border border-primary/50 min-h-[2px]"
                      style={{ height: `${goalHeight}px` }}
                      title={`Goal: ${item.minVisits}-${
                        item.maxVisits
                      } visits (avg: ${goalAvg.toFixed(1)})`}
                    />
                    {/* Achievement bar */}
                    <div
                      className="w-1/2 bg-primary rounded-t min-h-[2px]"
                      style={{ height: `${achievementHeight}px` }}
                      title={`Achievement: ${item.achieved} visits`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-muted-foreground">
              {dailyData.map((item, index) => {
                if (
                  dailyData.length <= 7 ||
                  index === 0 ||
                  index === dailyData.length - 1 ||
                  (dailyData.length > 7 &&
                    index % Math.ceil(dailyData.length / 7) === 0)
                ) {
                  return (
                    <span key={item.targetKey}>
                      {format(new Date(item.date), "MMM d")}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/30 rounded" />
            <span className="text-muted-foreground">Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded" />
            <span className="text-muted-foreground">Achievement</span>
          </div>
        </div>
      </div>
    );
  } else {
    // Monthly target chart
    const monthlyData = data as IMonthlyTargetHistoryItem[];

    // Calculate max value for scaling
    const maxValue = Math.max(
      ...monthlyData.flatMap((d) => [d.targetMonthly, d.achieved]),
      1
    );

    return (
      <div className="space-y-4">
        {/* Chart */}
        <div
          className="relative border rounded-lg p-4 bg-muted/20"
          style={{ height: `${chartHeight + chartPadding}px` }}
        >
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{formatINR(maxValue)}</span>
            <span>{formatINR(Math.round(maxValue / 2))}</span>
            <span>₹0</span>
          </div>

          {/* Chart area */}
          <div
            className="absolute left-16 right-0 top-0 bottom-8"
            style={{ height: `${chartHeight}px` }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 0.5, 1].map((ratio) => (
                <div
                  key={ratio}
                  className="border-t border-dashed border-muted-foreground/20"
                />
              ))}
            </div>

            {/* Bars - side by side */}
            <div className="relative h-full flex items-end gap-1 px-1">
              {monthlyData.map((item) => {
                const goalHeight = Math.max(
                  (item.targetMonthly / maxValue) * chartHeight,
                  2
                );
                const achievementHeight = Math.max(
                  (item.achieved / maxValue) * chartHeight,
                  item.achieved > 0 ? 2 : 0
                );

                return (
                  <div
                    key={item.targetKey}
                    className="flex-1 flex items-end justify-center gap-0.5 group min-w-0"
                  >
                    {/* Goal bar */}
                    <div
                      className="w-1/2 bg-primary/30 rounded-t border border-primary/50 min-h-[2px]"
                      style={{ height: `${goalHeight}px` }}
                      title={`Goal: ${formatINR(item.targetMonthly)}`}
                    />
                    {/* Achievement bar */}
                    <div
                      className="w-1/2 bg-primary rounded-t min-h-[2px]"
                      style={{ height: `${achievementHeight}px` }}
                      title={`Achievement: ${formatINR(item.achieved)}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Month labels */}
            <div className="absolute bottom-0 left-16 right-0 flex justify-between text-xs text-muted-foreground">
              {monthlyData.map((item) => (
                <span
                  key={item.targetKey}
                  className="transform -rotate-45 origin-bottom-left whitespace-nowrap"
                >
                  {format(new Date(`${item.month}-01`), "MMM yyyy")}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/30 rounded" />
            <span className="text-muted-foreground">Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded" />
            <span className="text-muted-foreground">Achievement</span>
          </div>
        </div>
      </div>
    );
  }
}

export default function TargetHistoryChart({
  employeeSub,
  type,
  employeeRole,
}: TargetHistoryChartProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<
    (IDailyTargetHistoryItem | IMonthlyTargetHistoryItem)[]
  >([]);
  const [dateRange, setDateRange] = React.useState<string>(
    type === "daily" ? "last7days" : "thismonth"
  );
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  // Calculate date range based on selection
  const getDateRange = React.useCallback(() => {
    const today = new Date();
    let from: string | undefined;
    let to: string | undefined;

    if (type === "daily") {
      switch (dateRange) {
        case "last7days":
          from = format(subDays(today, 6), "yyyy-MM-dd");
          to = format(today, "yyyy-MM-dd");
          break;
        case "last30days":
          from = format(subDays(today, 29), "yyyy-MM-dd");
          to = format(today, "yyyy-MM-dd");
          break;
        case "lastmonth":
          const lastMonth = subMonths(today, 1);
          from = format(startOfMonth(lastMonth), "yyyy-MM-dd");
          to = format(endOfMonth(lastMonth), "yyyy-MM-dd");
          break;
        case "alltime":
          // No date range - get all
          break;
      }
    } else {
      // monthly
      switch (dateRange) {
        case "thismonth":
          from = format(startOfMonth(today), "yyyy-MM");
          to = format(endOfMonth(today), "yyyy-MM");
          break;
        case "lastmonth":
          const lastMonth = subMonths(today, 1);
          from = format(startOfMonth(lastMonth), "yyyy-MM");
          to = format(endOfMonth(lastMonth), "yyyy-MM");
          break;
        case "alltime":
          // No date range - get all
          break;
      }
    }

    return { from, to };
  }, [dateRange, type]);

  // Fetch history data
  React.useEffect(() => {
    if (!employeeSub || employeeRole !== "sales") return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const { from, to } = getDateRange();
        const response = await getTargetHistory({
          userId: employeeSub,
          type,
          from,
          to,
        });
        setData(response.data.data.items || []);
      } catch (err: any) {
        setError(err?.response?.data?.msg || "Failed to load target history");
        console.error("Error loading target history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [employeeSub, type, dateRange, getDateRange, employeeRole]);

  if (employeeRole !== "sales") {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {type === "daily"
              ? "Daily Visit Target History"
              : "Monthly Target History"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {type === "daily"
              ? "Daily Visit Target History"
              : "Monthly Target History"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              {type === "daily"
                ? "Daily Visit Target History"
                : "Monthly Target History"}
            </CardTitle>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {type === "daily" ? (
                  <>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="lastmonth">Last Month</SelectItem>
                    <SelectItem value="alltime">All Time</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="thismonth">This Month</SelectItem>
                    <SelectItem value="lastmonth">Last Month</SelectItem>
                    <SelectItem value="alltime">All Time</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            No target history available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartTitle =
    type === "daily" ? "Daily Visit Target History" : "Monthly Target History";

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{chartTitle}</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {type === "daily" ? (
                    <>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="lastmonth">Last Month</SelectItem>
                      <SelectItem value="alltime">All Time</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="thismonth">This Month</SelectItem>
                      <SelectItem value="lastmonth">Last Month</SelectItem>
                      <SelectItem value="alltime">All Time</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFullScreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContent type={type} data={data} chartHeight={200} />
        </CardContent>
      </Card>

      {/* Full screen modal */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-none w-[95vw] h-[90vh] p-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{chartTitle}</DialogTitle>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {type === "daily" ? (
                    <>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="lastmonth">Last Month</SelectItem>
                      <SelectItem value="alltime">All Time</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="thismonth">This Month</SelectItem>
                      <SelectItem value="lastmonth">Last Month</SelectItem>
                      <SelectItem value="alltime">All Time</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <ChartContent type={type} data={data} chartHeight={600} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
