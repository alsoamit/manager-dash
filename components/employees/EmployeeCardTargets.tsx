"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { getUserDashboard } from "@/services/dashboard.service";
import type { IUserDashboardData } from "@/services/dashboard.service";

interface EmployeeCardTargetsProps {
  employeeSub: string;
  employeeRole?: string;
}

export default function EmployeeCardTargets({
  employeeSub,
  employeeRole,
}: EmployeeCardTargetsProps) {
  const [dashboardData, setDashboardData] = React.useState<IUserDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!employeeSub) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const response = await getUserDashboard(employeeSub);
        setDashboardData(response.data.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employeeSub]);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded animate-pulse" />
        <div className="h-2 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!dashboardData) return null;

  const dailyTarget = dashboardData.dailyVisitTarget;
  const monthlyTarget = dashboardData.targetMonthly || 0;
  const monthlyAchieved = dashboardData.salesMonthTotal || 0;
  const monthlyPercent = monthlyTarget > 0 
    ? Math.min(100, Math.round((monthlyAchieved / monthlyTarget) * 100))
    : 0;

  return (
    <div className="space-y-3 pt-2 border-t">
      {/* Daily Visit Target Achievement (only for sales) */}
      {employeeRole === "sales" && dailyTarget && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Daily Visits</span>
            <span className="font-medium">
              {dailyTarget.achieved} / {dailyTarget.maxVisits}
            </span>
          </div>
          <Progress 
            value={dailyTarget.progressPercent} 
            className="h-2"
          />
        </div>
      )}

      {/* Monthly Sales Target */}
      {monthlyTarget > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly Sales</span>
            <span className="font-medium">
              ₹{Math.round(monthlyAchieved).toLocaleString()} / ₹{Math.round(monthlyTarget).toLocaleString()}
            </span>
          </div>
          <Progress 
            value={monthlyPercent} 
            className="h-2"
          />
        </div>
      )}
    </div>
  );
}
