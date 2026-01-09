"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  getSalesSummary,
  invalidateDashboardCache,
  getEmployeeOverview,
  type ISalesSummary,
  type IEmployeeOverview,
} from "@/services/dashboard.service";
import EmployeeOverview from "@/components/dashboard/EmployeeOverview";
import TodayDemos from "@/components/dashboard/TodayDemos";
import BookedDemos from "@/components/dashboard/BookedDemos";
import TodayOrders from "@/components/dashboard/TodayOrders";
import { RefreshCw, TrendingUp, Calendar } from "lucide-react";

export default function ManagerDashboardPage() {
  // Overview data states
  const [salesSummary, setSalesSummary] = React.useState<ISalesSummary | null>(
    null
  );
  const [employeeOverview, setEmployeeOverview] = React.useState<
    IEmployeeOverview[]
  >([]);
  const [loadingSummary, setLoadingSummary] = React.useState(true);
  const [loadingOverview, setLoadingOverview] = React.useState(true);
  const [refetching, setRefetching] = React.useState(false);

  const fetchOverviewData = React.useCallback(async (forceRefresh = false) => {
    try {
      setLoadingSummary(true);
      setLoadingOverview(true);
      const [summaryResp, overviewResp] = await Promise.all([
        getSalesSummary(
          forceRefresh ? { params: { forceRefresh: "1" } } : undefined
        ),
        getEmployeeOverview(
          forceRefresh ? { params: { forceRefresh: "1" } } : undefined
        ),
      ]);
      setSalesSummary(summaryResp.data.data);
      setEmployeeOverview(overviewResp.data.data.employees || []);
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
    } finally {
      setLoadingSummary(false);
      setLoadingOverview(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const handleRefetch = async () => {
    setRefetching(true);
    try {
      await invalidateDashboardCache();
      await fetchOverviewData(true);
    } catch (e) {
      console.error("Failed to refetch dashboard data:", e);
    } finally {
      setRefetching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of sales, employees, demos, and orders
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefetch}
          disabled={refetching}
          className="gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${refetching ? "animate-spin" : ""}`}
          />
          Refresh Data
        </Button>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ₹{salesSummary?.today.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">Sales today</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ₹{salesSummary?.last7Days.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">Past week</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ₹{salesSummary?.last30Days.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">Past month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Overview */}
      <EmployeeOverview
        employees={employeeOverview}
        loading={loadingOverview}
      />

      {/* Today's Demos */}
      <TodayDemos />

      {/* Demos Booked (Unassigned) */}
      <BookedDemos />

      {/* Today's Orders */}
      <TodayOrders />
    </div>
  );
}
