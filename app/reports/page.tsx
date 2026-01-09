"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getEmployeeSummaries,
  generateAllReports,
  type IEmployeeSummary,
} from "@/services/managerReports.service";
import {
  Loader2,
  RefreshCw,
  User,
  Phone,
  MapPin,
  ShoppingCart,
  Target,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useReportDate } from "@/hooks/useReportDate";
import { ExportModal } from "@/components/ExportModal";
import * as XLSX from "xlsx";


export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useReportDate();
  const [summaries, setSummaries] = React.useState<IEmployeeSummary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);

  // Categorize summaries by role
  const categorizedSummaries = React.useMemo(() => {
    const sales = summaries.filter((s) => s.role === "sales");
    const tech = summaries.filter((s) => s.role === "tech");
    return { sales, tech };
  }, [summaries]);

  React.useEffect(() => {
    fetchSummaries();
  }, [selectedDate]);

  const fetchSummaries = async () => {
    setLoadingSummaries(true);
    try {
      const resp = await getEmployeeSummaries(selectedDate);
      setSummaries(resp.data.data.summaries || []);
    } catch (e: any) {
      console.error("Failed to fetch employee summaries:", e);
      toast.error(e?.response?.data?.msg || "Failed to fetch employee summaries");
    } finally {
      setLoadingSummaries(false);
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


  const handleGenerateReports = async () => {
    setGenerating(true);
    try {
      await generateAllReports(selectedDate);
      toast.success("Reports generated successfully for all users");
    } catch (e: any) {
      console.error("Failed to generate reports:", e);
      toast.error(e?.response?.data?.msg || "Failed to generate reports");
    } finally {
      setGenerating(false);
    }
  };

  const formatAsText = (): string => {
    const lines: string[] = [];
    lines.push("EMPLOYEE SUMMARIES REPORT");
    lines.push(`Date: ${format(new Date(selectedDate), "dd/MM/yyyy")}`);
    lines.push("");
    lines.push("=".repeat(80));
    lines.push("");

    const { sales, tech } = categorizedSummaries;

    if (sales.length > 0) {
      lines.push("SALES TEAM");
      lines.push("-".repeat(80));
      sales.forEach((summary, idx) => {
        lines.push(`${idx + 1}. ${summary.name.toUpperCase()}`);
        lines.push(`   Designation: ${summary.position || summary.role}`);
        lines.push(`   HQ: ${summary.hq || "—"}`);
        lines.push(`   Daily Target: ${summary.dailyTarget || "—"}`);
        lines.push(`   Monthly Target: ₹${Math.round(summary.monthlyTarget).toLocaleString()}`);
        lines.push(`   Total TC Calls: ${summary.totalTC || 0}`);
        lines.push(`   Total Salons Visited: ${summary.totalSalonsVisited || 0}`);
        lines.push(`   Total Orders: ${summary.totalOrders || 0}`);
        lines.push(`   Monthly Sales Achieved: ₹${Math.round(summary.monthlySalesAchieved || 0).toLocaleString()}`);
        if (summary.dailyVisitTarget) {
          lines.push(`   Daily Visits: ${summary.dailyVisitTarget.achieved} / ${summary.dailyVisitTarget.maxVisits}`);
        }
        lines.push(`   Today's Beat: ${summary.todayBeat?.name || "Not selected"}`);
        lines.push("");
      });
    }

    if (tech.length > 0) {
      lines.push("TECHNICAL TEAM");
      lines.push("-".repeat(80));
      tech.forEach((summary, idx) => {
        lines.push(`${idx + 1}. ${summary.name.toUpperCase()}`);
        lines.push(`   Designation: ${summary.position || summary.role}`);
        lines.push(`   HQ: ${summary.hq || "—"}`);
        lines.push(`   Daily Target: ${summary.dailyTarget || "—"}`);
        lines.push(`   Monthly Target: ₹${Math.round(summary.monthlyTarget).toLocaleString()}`);
        lines.push(`   Total TC Calls: ${summary.totalTC || 0}`);
        lines.push(`   Total Salons Visited: ${summary.totalSalonsVisited || 0}`);
        lines.push(`   Total Orders: ${summary.totalOrders || 0}`);
        lines.push(`   Monthly Sales Achieved: ₹${Math.round(summary.monthlySalesAchieved || 0).toLocaleString()}`);
        lines.push(`   Today's Beat: ${summary.todayBeat?.name || "Not selected"}`);
        lines.push("");
      });
    }

    return lines.join("\n");
  };

  const exportToSheet = () => {
    const wsData: any[] = [];
    
    // Header
    wsData.push(["EMPLOYEE SUMMARIES REPORT"]);
    wsData.push(["Date:", format(new Date(selectedDate), "dd/MM/yyyy")]);
    wsData.push([]);

    const { sales, tech } = categorizedSummaries;

    if (sales.length > 0) {
      wsData.push(["SALES TEAM"]);
      wsData.push([
        "Name",
        "Designation",
        "HQ",
        "Daily Target",
        "Monthly Target",
        "TC Calls",
        "Salons Visited",
        "Orders",
        "Monthly Sales Achieved",
        "Daily Visits",
        "Today's Beat",
      ]);
      sales.forEach((summary) => {
        wsData.push([
          summary.name,
          summary.position || summary.role,
          summary.hq || "",
          summary.dailyTarget || "",
          Math.round(summary.monthlyTarget),
          summary.totalTC || 0,
          summary.totalSalonsVisited || 0,
          summary.totalOrders || 0,
          Math.round(summary.monthlySalesAchieved || 0),
          summary.dailyVisitTarget
            ? `${summary.dailyVisitTarget.achieved} / ${summary.dailyVisitTarget.maxVisits}`
            : "",
          summary.todayBeat?.name || "Not selected",
        ]);
      });
      wsData.push([]);
    }

    if (tech.length > 0) {
      wsData.push(["TECHNICAL TEAM"]);
      wsData.push([
        "Name",
        "Designation",
        "HQ",
        "Daily Target",
        "Monthly Target",
        "TC Calls",
        "Salons Visited",
        "Orders",
        "Monthly Sales Achieved",
        "Today's Beat",
      ]);
      tech.forEach((summary) => {
        wsData.push([
          summary.name,
          summary.position || summary.role,
          summary.hq || "",
          summary.dailyTarget || "",
          Math.round(summary.monthlyTarget),
          summary.totalTC || 0,
          summary.totalSalonsVisited || 0,
          summary.totalOrders || 0,
          Math.round(summary.monthlySalesAchieved || 0),
          summary.todayBeat?.name || "Not selected",
        ]);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Summaries");
    XLSX.writeFile(wb, `Employee_Summaries_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Reports</h1>
          <p className="text-muted-foreground mt-2">
            Click on an employee card to view their detailed daily report
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button
            onClick={() => setExportModalOpen(true)}
            variant="outline"
            className="gap-2"
            disabled={summaries.length === 0}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={handleGenerateReports}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Generate Reports
          </Button>
        </div>
      </div>

      {loadingSummaries && (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading employee summaries...</p>
          </CardContent>
        </Card>
      )}

      {!loadingSummaries && summaries.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No employees found</p>
          </CardContent>
        </Card>
      )}

      {!loadingSummaries && summaries.length > 0 && (
        <div className="space-y-8">
          {/* Sales Team Section */}
          {categorizedSummaries.sales.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sales Team</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorizedSummaries.sales.map((summary) => (
                  <Link key={summary.sub} href={`/reports/${summary.sub}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="w-7 h-7 shrink-0">
                          <AvatarImage
                            className="object-cover"
                            src={summary.profileImage || undefined}
                          />
                          <AvatarFallback>
                            {summary.name ? (
                              getInitials(summary.name)
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <CardTitle className="text-xs font-semibold line-clamp-1 uppercase">
                              {summary.name}
                            </CardTitle>
                            <span className="text-xs px-1 py-0.5 rounded border bg-muted/50 shrink-0">
                              Sales
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Stats Grid - Similar to EmployeeOverview */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2 text-xs">
                        {/* Daily Target */}
                        <div className="flex flex-col items-center gap-0.5">
                          <Target className="w-3.5 h-3.5 text-muted-foreground" />
                          <div className="font-medium text-center">
                            {summary.dailyTarget || "—"}
                          </div>
                        </div>
                        {/* TC Calls */}
                        <div className="flex flex-col items-center gap-0.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <div className="font-medium text-center">
                            {summary.totalTC || 0}
                          </div>
                        </div>
                        {/* Salons Visited */}
                        <div className="flex flex-col items-center gap-0.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <div className="font-medium text-center">
                            {summary.totalSalonsVisited || 0}
                          </div>
                        </div>
                        {/* Orders */}
                        <div className="flex flex-col items-center gap-0.5">
                          <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                          <div className="font-medium text-center">
                            {summary.totalOrders || 0}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bars - Similar to EmployeeCardTargets */}
                      <div className="mt-3 pt-3 border-t space-y-3">
                        {/* Daily Visit Target (only for sales) */}
                        {summary.dailyVisitTarget && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Daily Visits</span>
                              <span className="font-medium">
                                {summary.dailyVisitTarget.achieved} / {summary.dailyVisitTarget.maxVisits}
                              </span>
                            </div>
                            <Progress 
                              value={summary.dailyVisitTarget.progressPercent} 
                              className="h-2"
                            />
                          </div>
                        )}

                        {/* Monthly Sales Target */}
                        {summary.monthlyTarget > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Monthly Sales</span>
                              <span className="font-medium">
                                ₹{Math.round(summary.monthlySalesAchieved || 0).toLocaleString()} / ₹{Math.round(summary.monthlyTarget).toLocaleString()}
                              </span>
                            </div>
                            <Progress 
                              value={summary.monthlyTarget > 0 
                                ? Math.min(100, Math.round(((summary.monthlySalesAchieved || 0) / summary.monthlyTarget) * 100))
                                : 0} 
                              className="h-2"
                            />
                          </div>
                        )}

                        {/* Today's Beat */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-muted-foreground">Today's Beat</span>
                          <span className="font-medium truncate ml-2">
                            {summary.todayBeat?.name || "Not selected"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Technical Team Section */}
          {categorizedSummaries.tech.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Technical Team</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorizedSummaries.tech.map((summary) => (
                  <Link key={summary.sub} href={`/reports/${summary.sub}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="w-7 h-7 shrink-0">
                          <AvatarImage
                            className="object-cover"
                            src={summary.profileImage || undefined}
                          />
                          <AvatarFallback>
                            {summary.name ? (
                              getInitials(summary.name)
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <CardTitle className="text-xs font-semibold line-clamp-1 uppercase">
                              {summary.name}
                            </CardTitle>
                            <span className="text-xs px-1 py-0.5 rounded border bg-muted/50 shrink-0">
                              Tech
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Stats Grid - Similar to EmployeeOverview */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2 text-xs">
                        {/* Daily Target */}
                        <div className="flex flex-col items-center gap-0.5">
                          <Target className="w-3.5 h-3.5 text-muted-foreground" />
                          <div className="font-medium text-center">
                            {summary.dailyTarget || "—"}
                          </div>
                        </div>
                        {/* TC Calls */}
                        <div className="flex flex-col items-center gap-0.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <div className="font-medium text-center">
                            {summary.totalTC || 0}
                          </div>
                        </div>
                        {/* Salons Visited */}
                        <div className="flex flex-col items-center gap-0.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <div className="font-medium text-center">
                            {summary.totalSalonsVisited || 0}
                          </div>
                        </div>
                        {/* Orders */}
                        <div className="flex flex-col items-center gap-0.5">
                          <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                          <div className="font-medium text-center">
                            {summary.totalOrders || 0}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bars - For tech, only show monthly sales if applicable */}
                      <div className="mt-3 pt-3 border-t space-y-3">
                        {/* Monthly Sales Target (if applicable) */}
                        {summary.monthlyTarget > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Monthly Sales</span>
                              <span className="font-medium">
                                ₹{Math.round(summary.monthlySalesAchieved || 0).toLocaleString()} / ₹{Math.round(summary.monthlyTarget).toLocaleString()}
                              </span>
                            </div>
                            <Progress 
                              value={summary.monthlyTarget > 0 
                                ? Math.min(100, Math.round(((summary.monthlySalesAchieved || 0) / summary.monthlyTarget) * 100))
                                : 0} 
                              className="h-2"
                            />
                          </div>
                        )}

                        {/* Today's Beat */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-muted-foreground">Today's Beat</span>
                          <span className="font-medium truncate ml-2">
                            {summary.todayBeat?.name || "Not selected"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onCopyText={formatAsText}
        onExportSheet={exportToSheet}
        title="Export Employee Summaries"
      />
    </div>
  );
}
