"use client";

import * as React from "react";
import Link from "next/link";
import { User, Phone } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAllEmployees,
  selectEmployeesNextToken,
  listEmployees,
  selectEmployeesListStatus,
} from "@/store/slices/employees.slice";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Radio } from "lucide-react";
import { useEmployeeLiveStatus } from "@/hooks/useEmployeeLiveStatus";

import EmployeesListSkeleton from "@/components/skeletons/EmployeesListSkeleton";
import EmployeeCardTargets from "./EmployeeCardTargets";
import type { IEmployee } from "@/services/employee.service";
import { getBeat } from "@/services/beat.service";
import { getUserDashboard } from "@/services/dashboard.service";
import { MapPin, TrendingUp } from "lucide-react";
import { isTodayIST } from "@/lib/utils";

interface EmployeeCardProps {
  employee: IEmployee;
  isLive: boolean;
  showStats: boolean;
}

interface EmployeeCardData {
  dayBeatName?: string;
  todaySales?: number;
}

function EmployeeCard({ employee: e, isLive, showStats }: EmployeeCardProps) {
  const [cardData, setCardData] = React.useState<EmployeeCardData>({});
  const [loadingData, setLoadingData] = React.useState(false);

  // Fetch beat name and today's sales for sales persons
  React.useEffect(() => {
    if (!showStats || !e.sub) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const promises: Promise<any>[] = [];

        // Check if dayBeatDate is for today (IST)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        const istDate = new Date(now.getTime() + istOffset);
        const today = istDate.toISOString().split("T")[0]; // YYYY-MM-DD

        // Fetch beat name only if dayBeatId exists AND dayBeatDate is for today
        if (e.dayBeatId && e.dayBeatDate === today) {
          promises.push(
            getBeat(e.dayBeatId)
              .then((res) => ({ beatName: res.data.data.beatname }))
              .catch(() => ({ beatName: undefined }))
          );
        } else {
          promises.push(Promise.resolve({ beatName: undefined }));
        }

        // Fetch today's sales
        promises.push(
          getUserDashboard(e.sub)
            .then((res) => {
              const dashboardData = res.data.data;
              // Get today's date in IST (UTC+5:30) as YYYY-MM-DD
              const now = new Date();
              const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
              const istDate = new Date(now.getTime() + istOffset);
              const today = istDate.toISOString().split("T")[0]; // YYYY-MM-DD
              const todaySales = dashboardData.last7DailySales?.find(
                (sale: any) => sale.date === today
              );
              return { todaySales: todaySales?.amount || 0 };
            })
            .catch(() => ({ todaySales: 0 }))
        );

        const results = await Promise.all(promises);
        setCardData({
          dayBeatName: results[0].beatName,
          todaySales: results[1].todaySales,
        });
      } catch (err) {
        console.error("Failed to load employee card data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [e.sub, e.dayBeatId, e.dayBeatDate, showStats]);

  return (
    <Link key={e.sub} href={`/employees/${e.sub}`} className="block h-full">
      <Card className="transition-shadow shadow-sm hover:shadow cursor-pointer h-full flex flex-col">
        <CardHeader className="">
          <div className="flex items-start gap-2">
            {e.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={e.profileImage}
                alt={e.name || e.sub}
                className="object-cover w-10 h-10 rounded shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-muted shrink-0 flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base font-semibold line-clamp-1">
                  {e.name || "Untitled"}
                </CardTitle>
                {/* Role Badge - Only show for tech-head */}
                {e.role === "tech" && e.isTechHead === true && (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    Tech Head
                  </Badge>
                )}
                {isLive && (
                  <Badge
                    variant="default"
                    className="bg-green-500 text-white shrink-0"
                  >
                    <Radio className="w-3 h-3 mr-1 animate-pulse" />
                    Live
                  </Badge>
                )}
              </div>
              {/* Position - Show below name if available */}
              {e.position && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {e.position}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 flex-1 flex flex-col">
          <div className="space-y-2">
            {/* Contact Number - Always show */}
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {e.mobileNumber || "—"}
              </span>
            </div>

            {/* Day Beat Name - Only for sales */}
            {showStats && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {loadingData ? "Loading..." : cardData.dayBeatName || "—"}
                </span>
              </div>
            )}

            {/* Total Sales Today - Only for sales */}
            {showStats && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {loadingData
                    ? "Loading..."
                    : `₹${Math.round(
                        cardData.todaySales || 0
                      ).toLocaleString()}`}
                </span>
              </div>
            )}

            {/* First Visit Time - Only show if today */}
            {e.firstVisitTime && isTodayIST(e.firstVisitTime) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>First Visit</div>
                <div>{format(new Date(e.firstVisitTime), "HH:mm")}</div>
              </div>
            )}

            {/* First Login Time - Only show if today */}
            {e.firstLoginTime && isTodayIST(e.firstLoginTime) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>First Login</div>
                <div>{format(new Date(e.firstLoginTime), "HH:mm")}</div>
              </div>
            )}

            {/* Last Logout Time - Only show if today */}
            {e.lastLogoutTime && isTodayIST(e.lastLogoutTime) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>Last Logout</div>
                <div>{format(new Date(e.lastLogoutTime), "HH:mm")}</div>
              </div>
            )}
          </div>

          {/* Target Achievement Graphs - Only for sales, push to bottom */}
          {showStats && (
            <div className="mt-auto">
              <EmployeeCardTargets employeeSub={e.sub} employeeRole={e.role} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function EmployeeTable() {
  const dispatch = useAppDispatch();
  const employees = useAppSelector(selectAllEmployees);
  const nextToken = useAppSelector(selectEmployeesNextToken);
  const listStatus = useAppSelector(selectEmployeesListStatus);

  // Get all employee subs for live tracking
  const employeeSubs = React.useMemo(
    () => employees?.map((e) => e.sub).filter(Boolean) || [],
    [employees]
  );

  // Track live status for all employees
  const { isLive } = useEmployeeLiveStatus(employeeSubs);

  // Categorize employees by role
  const categorizedEmployees = React.useMemo(() => {
    const sales = employees?.filter((e) => e.role === "sales") || [];
    // Tech team includes both tech and tech-head (tech-head has role="tech" and isTechHead=true)
    const tech = employees?.filter((e) => e.role === "tech") || [];
    const manager = employees?.filter((e) => e.role === "manager") || [];
    const admin = employees?.filter((e) => e.role === "admin") || [];
    return { sales, tech, manager, admin };
  }, [employees]);

  React.useEffect(() => {
    dispatch(listEmployees({ limit: 500, mode: "replace" }));
  }, [dispatch]);

  return (
    <>
      {/* Loading state */}
      {listStatus === "loading" && (!employees || employees.length === 0) ? (
        <EmployeesListSkeleton />
      ) : (
        <div className="space-y-8">
          {/* Sales Team Section */}
          {categorizedEmployees.sales.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sales Team</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorizedEmployees.sales.map((e) => (
                  <EmployeeCard
                    key={e.sub}
                    employee={e}
                    isLive={isLive(e.sub)}
                    showStats={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Technical Team Section */}
          {categorizedEmployees.tech.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Technical Team</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorizedEmployees.tech.map((e) => (
                  <EmployeeCard
                    key={e.sub}
                    employee={e}
                    isLive={isLive(e.sub)}
                    showStats={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Manager Section */}
          {categorizedEmployees.manager.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Manager</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorizedEmployees.manager.map((e) => (
                  <EmployeeCard
                    key={e.sub}
                    employee={e}
                    isLive={isLive(e.sub)}
                    showStats={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Admin Section */}
          {categorizedEmployees.admin.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Admin</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorizedEmployees.admin.map((e) => (
                  <EmployeeCard
                    key={e.sub}
                    employee={e}
                    isLive={isLive(e.sub)}
                    showStats={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {employees?.length === 0 && listStatus !== "loading" && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No employees found.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {nextToken && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => {
              dispatch(listEmployees({ limit: 20, nextToken, mode: "append" }));
            }}
          >
            Load more
          </Button>
        </div>
      )}
    </>
  );
}
