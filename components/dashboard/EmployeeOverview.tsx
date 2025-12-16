"use client";

import * as React from "react";
import { User, TrendingUp, Clock, LogOut } from "lucide-react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { IEmployeeOverview } from "@/services/dashboard.service";
import { LuLogIn } from "react-icons/lu";
import { isTodayIST } from "@/lib/utils";

interface EmployeeOverviewCardProps {
  employee: IEmployeeOverview;
}

function EmployeeOverviewCard({ employee }: EmployeeOverviewCardProps) {
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "—";
    try {
      return format(new Date(timeStr), "h:mm a").toLowerCase();
    } catch {
      return "—";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="transition-shadow shadow-sm hover:shadow p-0">
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          {/* Profile Picture */}
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarImage
              className="object-cover"
              src={employee.profileImage || undefined}
            />
            <AvatarFallback>
              {employee.name ? (
                getInitials(employee.name)
              ) : (
                <User className="w-5 h-5" />
              )}
            </AvatarFallback>
          </Avatar>
          {/* Employee Name and Role */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-xs line-clamp-1 uppercase">
                {employee.name || "Untitled"}
              </h3>
              {/* Role Badge */}
              {employee.role && (
                <span className="text-xs px-1 py-0.5 rounded border bg-muted/50 shrink-0">
                  {employee.role === "tech" && employee.isTechHead === true
                    ? "Tech Head"
                    : employee.role === "tech"
                    ? "Tech"
                    : employee.role === "sales"
                    ? "Sales"
                    : employee.role === "manager"
                    ? "Manager"
                    : employee.role === "admin"
                    ? "Admin"
                    : employee.role}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid - Single line, 4 columns */}
        <div className="grid grid-cols-4 gap-1.5 mt-2 text-xs">
          {/* 1st Place: Login (only show if today) */}
          <div className="flex flex-col items-center gap-0.5">
            <LuLogIn className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="font-medium text-center">
              {isTodayIST(employee.loginTime)
                ? formatTime(employee.loginTime)
                : "—"}
            </div>
          </div>

          {/* 2nd Place: First Visit (only show if today) */}
          <div className="flex flex-col items-center gap-0.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="font-medium text-center">
              {isTodayIST(employee.firstVisitTime)
                ? formatTime(employee.firstVisitTime)
                : "—"}
            </div>
          </div>

          {/* 3rd Place: Sales (for sales) or Demos (for tech) */}
          <div className="flex flex-col items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="font-medium text-center">
              {employee.role === "sales"
                ? `₹${Math.round(employee.todaySales || 0).toLocaleString()}`
                : employee.role === "tech"
                ? employee.todayDemos ?? 0
                : "—"}
            </div>
          </div>

          {/* 4th Place: Logout (only show if today) */}
          <div className="flex flex-col items-center gap-0.5">
            <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="font-medium text-center">
              {isTodayIST(employee.lastLogoutTime)
                ? formatTime(employee.lastLogoutTime)
                : "—"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmployeeOverviewProps {
  employees: IEmployeeOverview[];
  loading?: boolean;
}

export default function EmployeeOverview({
  employees,
  loading,
}: EmployeeOverviewProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="">
          <CardTitle>Employees</CardTitle>
        </div>
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="transition-shadow shadow-sm p-0">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-muted animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div
                        key={j}
                        className="flex flex-col items-center gap-0.5"
                      >
                        <div className="w-3.5 h-3.5 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="space-y-4">
        <div className="">
          <CardTitle>Employees</CardTitle>
        </div>
        <div>
          <Card className="h-40 flex items-center justify-center">
            <CardContent className="text-center">
              <div className="text-sm text-muted-foreground">
                No employees have logged in today.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="">
        <CardTitle>Employees</CardTitle>
      </div>
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <EmployeeOverviewCard key={employee.sub} employee={employee} />
          ))}
        </div>
      </div>
    </div>
  );
}
