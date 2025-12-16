"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getUserDashboard,
  type IUserDashboardData,
} from "@/services/dashboard.service";
import { IndianRupee, Package, ShoppingCart, Store } from "lucide-react";

function formatINR(n?: number) {
  if (typeof n !== "number" || isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

// Simple Bar Chart Component
function SimpleBarChart({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const percentage =
    max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface EmployeeDashboardProps {
  employeeSub: string;
  employeeRole?: string;
}

export default function EmployeeDashboard({
  employeeSub,
  employeeRole,
}: EmployeeDashboardProps) {
  const [data, setData] = React.useState<IUserDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!employeeSub) return;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUserDashboard(employeeSub);
        setData(res?.data?.data || null);
      } catch (err: any) {
        setError(err?.response?.data?.msg || "Failed to load dashboard");
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [employeeSub]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
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
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No dashboard data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const role = data.role || employeeRole || "sales";
  const isTech = role === "tech";
  const percent = Number(data.percent ?? 0);
  const target = data.targetMonthly ?? 0;
  const achieved = data.salesMonthTotal ?? 0;

  const lifetimeAmount = data.lifetimeTotal ?? 0;
  const lifetimeProducts = data.lifetimeProducts ?? 0;
  const lifetimeOrders = data.lifetimeOrders ?? 0;
  const lifetimeSalons = data.uniqueSalonsLifetime ?? 0;

  const dailyVisitTarget = data.dailyVisitTarget;

  // Tech team specific data
  const visitsLast7 = data.visitsLast7 ?? 0;
  const visitsLast30 = data.visitsLast30 ?? 0;
  const visitsLifetime = data.visitsLifetime ?? 0;
  const uniqueSalonsLast30 = data.uniqueSalonsLast30 ?? 0;
  const uniqueSalonsLifetime = data.uniqueSalonsLifetime ?? 0;
  const demos = data.demos;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          {/* Target Cards - Compact, one row each */}
          {role === "sales" && (
            <div className="space-y-3">
              {/* Daily Visit Target Card */}
              {dailyVisitTarget && (
                <Card className="p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold mb-2">
                        Daily Visit Target
                      </div>
                      <SimpleBarChart
                        value={dailyVisitTarget.achieved}
                        max={dailyVisitTarget.maxVisits}
                        label={`${dailyVisitTarget.achieved} / ${dailyVisitTarget.maxVisits} visits`}
                      />
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xs text-muted-foreground">Range</div>
                      <div className="text-sm font-semibold">
                        {dailyVisitTarget.minVisits} -{" "}
                        {dailyVisitTarget.maxVisits}
                      </div>
                      <div
                        className={`text-xs font-medium mt-1 ${
                          dailyVisitTarget.status === "achieved"
                            ? "text-green-600"
                            : dailyVisitTarget.status === "in_range"
                            ? "text-primary"
                            : "text-orange-600"
                        }`}
                      >
                        {dailyVisitTarget.status === "achieved"
                          ? "Achieved"
                          : dailyVisitTarget.status === "in_range"
                          ? "In Range"
                          : "Below Min"}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Monthly Target Card */}
              <Card className="p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-2">
                      Monthly Target
                    </div>
                    <SimpleBarChart
                      value={achieved}
                      max={target}
                      label={`${formatINR(achieved)} / ${formatINR(target)}`}
                    />
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-xs text-muted-foreground">
                      Progress
                    </div>
                    <div className="text-sm font-semibold">
                      {percent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Summary Cards - Compact */}
          {isTech ? (
            // Tech Team Dashboard
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Card className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      Total Demos
                    </div>
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">
                    {demos?.lifetime?.total ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Lifetime</p>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      Visits
                    </div>
                    <Store className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold">{visitsLifetime}</div>
                  <p className="text-sm text-muted-foreground">Lifetime</p>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      Salons Visited
                    </div>
                    <Store className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold">
                    {uniqueSalonsLifetime}
                  </div>
                  <p className="text-sm text-muted-foreground">Unique</p>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      This Month
                    </div>
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold">
                    {demos?.last30?.total ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Demos (30d)</p>
                </div>
              </Card>
            </div>
          ) : (
            // Sales Team Dashboard
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Card className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      Total Sales
                    </div>
                    <IndianRupee className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold">
                    {formatINR(lifetimeAmount)}
                  </div>
                  <p className="text-sm text-muted-foreground">Lifetime</p>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      Products
                    </div>
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">{lifetimeProducts}</div>
                  <p className="text-sm text-muted-foreground">Unique</p>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      Orders
                    </div>
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold">{lifetimeOrders}</div>
                  <p className="text-sm text-muted-foreground">Created</p>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      Salons
                    </div>
                    <Store className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold">{lifetimeSalons}</div>
                  <p className="text-sm text-muted-foreground">Visited</p>
                </div>
              </Card>
            </div>
          )}

          {/* Additional Stats */}
          {isTech ? (
            // Tech Team Additional Stats
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 pt-4 border-t">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Last 7 Days</div>
                <div className="text-lg font-semibold">
                  {demos?.last7?.total ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {demos?.last7?.total ?? 0} demos • {visitsLast7} visits
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Last 30 Days
                </div>
                <div className="text-lg font-semibold">
                  {demos?.last30?.total ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {demos?.last30?.total ?? 0} demos • {visitsLast30} visits
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">This Month</div>
                <div className="text-lg font-semibold">
                  {uniqueSalonsLast30}
                </div>
                <div className="text-xs text-muted-foreground">
                  Unique salons • {visitsLast30} visits
                </div>
              </div>
            </div>
          ) : (
            // Sales Team Additional Stats
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 pt-4 border-t">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Last 7 Days</div>
                <div className="text-lg font-semibold">
                  {formatINR(data.last7Total)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.last7Orders} orders • {data.visitsLast7} visits
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Last 30 Days
                </div>
                <div className="text-lg font-semibold">
                  {formatINR(data.last30Total)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.last30Orders} orders • {data.visitsLast30} visits
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">This Month</div>
                <div className="text-lg font-semibold">
                  {formatINR(data.salesMonthTotal)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.salesMonthOrders} orders • {data.salesMonthCount} units
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
