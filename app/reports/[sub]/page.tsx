"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getEmployeeSummaries,
  getDailyReport,
  getTechnicalReport,
  type IEmployeeSummary,
  type IDailyReport,
  type ITechnicalReport,
} from "@/services/managerReports.service";
import {
  Loader2,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  ShoppingCart,
  Target,
  Calendar,
  Package,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useReportDate } from "@/hooks/useReportDate";
import { ExportModal } from "@/components/ExportModal";
import * as XLSX from "xlsx";

export default function EmployeeReportPage() {
  const params = useParams();
  const router = useRouter();
  const sub = params.sub as string;
  
  const [selectedDate, setSelectedDate] = useReportDate();
  const [summary, setSummary] = React.useState<IEmployeeSummary | null>(null);
  const [report, setReport] = React.useState<IDailyReport | ITechnicalReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingReport, setLoadingReport] = React.useState(false);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (sub) {
      fetchData();
    }
  }, [sub, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch employee summary
      const summariesResp = await getEmployeeSummaries(selectedDate);
      const foundSummary = summariesResp.data.data.summaries.find(
        (s) => s.sub === sub
      );
      
      if (!foundSummary) {
        toast.error("Employee not found");
        router.push("/reports");
        return;
      }
      
      setSummary(foundSummary);

      // Fetch detailed report
      setLoadingReport(true);
      if (foundSummary.role === "tech") {
        const techResp = await getTechnicalReport(sub, selectedDate);
        setReport(techResp.data.data);
      } else {
        const dailyResp = await getDailyReport(sub, selectedDate);
        setReport(dailyResp.data.data);
      }
    } catch (e: any) {
      console.error("Failed to fetch data:", e);
      toast.error(e?.response?.data?.msg || "Failed to fetch data");
    } finally {
      setLoading(false);
      setLoadingReport(false);
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

  const formatAsText = (): string => {
    if (!summary || !report) return "";
    
    const lines: string[] = [];
    const isTech = summary.role === "tech";
    
    if (isTech) {
      const techReport = report as ITechnicalReport;
      lines.push("TECHNICAL REPORT");
      lines.push(`Name: ${summary.name.toUpperCase()}`);
      lines.push(`Designation: ${summary.position || summary.role}`);
      lines.push(`Date: ${format(new Date(selectedDate), "dd/MM/yyyy")}`);
      lines.push(`Area: ${techReport.area || "—"}`);
      lines.push("");
      lines.push("DEMOS:");
      lines.push("-".repeat(80));
      
      techReport.demos.forEach((demo, idx) => {
        lines.push(`${idx + 1}. Salon Name: ${demo.salon?.name || "—"}`);
        lines.push(`   Contact Number: ${demo.salon?.mobile || "—"}`);
        lines.push(`   Demo ON: ${demo.status || "—"}`);
        if (demo.outcome) {
          lines.push(`   Salon Feedback: ${demo.outcome}`);
        }
        if (demo.products && demo.products.length > 0) {
          lines.push("   Product Consumption for the demo:");
          demo.products.forEach((product) => {
            const productName = product.product?.name || product.name || "Unknown";
            lines.push(`     ${productName}: —`);
          });
        }
        if (demo.amountUsed) {
          lines.push(`   Total Amount Used: ${demo.amountUsed}`);
        }
        if (demo.notes) {
          lines.push(`   Notes: ${demo.notes}`);
        }
        lines.push("");
      });
    } else {
      const dailyReport = report as IDailyReport;
      lines.push("DAILY REPORT");
      lines.push(`Date: ${format(new Date(selectedDate), "dd/MM/yyyy")}`);
      lines.push(`Name: ${summary.name.toUpperCase()}`);
      lines.push(`Design: ${summary.position || summary.role}`);
      lines.push(`HQ: ${summary.hq || "—"}`);
      lines.push(`Total TC calls of the Day: ${dailyReport.totalTC || 0}`);
      lines.push(`Total PC calls of the Day: ${dailyReport.totalPC || 0}`);
      lines.push(`Cumulative TC calls: ${dailyReport.cumulativeTC || 0}`);
      lines.push(`Cumulative PC calls: ${dailyReport.cumulativePC || 0}`);
      lines.push(`Target achieved of the day: ${dailyReport.dailyTarget || 0}`);
      lines.push(`Target for Month: ₹${Math.round(dailyReport.targetMonthly || 0).toLocaleString()}`);
      lines.push(`Achievement till date: ₹${Math.round(dailyReport.achievementTillDate || 0).toLocaleString()}`);
      lines.push("");
      lines.push("Salon Visited Name Detail:");
      dailyReport.visits.forEach((visit, idx) => {
        lines.push(`${idx + 1}) Salon Name: ${visit.salon?.name || "—"}`);
        lines.push(`   Mobile number: ${visit.salon?.mobile || "—"}`);
        if (visit.beat) {
          lines.push(`   Beat: ${visit.beat.beatname || visit.beat.name || "—"}`);
        }
      });
      lines.push("");
      lines.push("Order Booked Salon Details:");
      dailyReport.orders.forEach((order, idx) => {
        lines.push(`${idx + 1}. Salon Name: ${order.salon?.name || "—"}`);
        lines.push(`   Contact No: ${order.salon?.mobile || "—"}`);
        order.items.forEach((item) => {
          const productName = item.product?.name || item.name || "Unknown";
          const qty = item.qty || 0;
          lines.push(`   ${productName}: ${qty}`);
        });
        lines.push("");
      });
      if (dailyReport.demos && dailyReport.demos.length > 0) {
        lines.push("Demos Booked:");
        dailyReport.demos.forEach((demo, idx) => {
          lines.push(`${idx + 1}. Salon Name: ${demo.salon?.name || "—"}`);
          lines.push(`   Contact: ${demo.salon?.mobile || "—"}`);
          if (demo.products && demo.products.length > 0) {
            lines.push("   Products:");
            demo.products.forEach((product) => {
              const productName = product.product?.name || product.name || "Unknown";
              lines.push(`     - ${productName}`);
            });
          }
          if (demo.notes) {
            lines.push(`   Notes: ${demo.notes}`);
          }
          lines.push("");
        });
      }
      lines.push("Remarks: —");
    }
    
    return lines.join("\n");
  };

  const exportToSheet = () => {
    if (!summary || !report) return;
    
    const wsData: any[] = [];
    const isTech = summary.role === "tech";
    
    if (isTech) {
      const techReport = report as ITechnicalReport;
      wsData.push(["TECHNICAL REPORT"]);
      wsData.push(["Name:", summary.name]);
      wsData.push(["Designation:", summary.position || summary.role]);
      wsData.push(["Date:", format(new Date(selectedDate), "dd/MM/yyyy")]);
      wsData.push(["Area:", techReport.area || ""]);
      wsData.push([]);
      wsData.push(["DEMOS"]);
      wsData.push([
        "Salon Name",
        "Contact Number",
        "Demo ON",
        "Salon Feedback",
        "Products",
        "Amount Used",
        "Notes",
      ]);
      techReport.demos.forEach((demo) => {
        const products = demo.products
          ?.map((p) => p.product?.name || p.name || "Unknown")
          .join(", ") || "";
        wsData.push([
          demo.salon?.name || "",
          demo.salon?.mobile || "",
          demo.status || "",
          demo.outcome || "",
          products,
          demo.amountUsed || "",
          demo.notes || "",
        ]);
      });
    } else {
      const dailyReport = report as IDailyReport;
      wsData.push(["DAILY REPORT"]);
      wsData.push(["Date:", format(new Date(selectedDate), "dd/MM/yyyy")]);
      wsData.push(["Name:", summary.name]);
      wsData.push(["Design:", summary.position || summary.role]);
      wsData.push(["HQ:", summary.hq || ""]);
      wsData.push(["Total TC calls of the Day:", dailyReport.totalTC || 0]);
      wsData.push(["Total PC calls of the Day:", dailyReport.totalPC || 0]);
      wsData.push(["Cumulative TC calls:", dailyReport.cumulativeTC || 0]);
      wsData.push(["Cumulative PC calls:", dailyReport.cumulativePC || 0]);
      wsData.push(["Target achieved of the day:", dailyReport.dailyTarget || 0]);
      wsData.push(["Target for Month:", Math.round(dailyReport.targetMonthly || 0)]);
      wsData.push(["Achievement till date:", Math.round(dailyReport.achievementTillDate || 0)]);
      wsData.push([]);
      wsData.push(["SALON VISITED NAME DETAIL"]);
      wsData.push(["Salon Name", "Mobile number", "Beat"]);
      dailyReport.visits.forEach((visit) => {
        wsData.push([
          visit.salon?.name || "",
          visit.salon?.mobile || "",
          visit.beat?.beatname || visit.beat?.name || "",
        ]);
      });
      wsData.push([]);
      wsData.push(["ORDER BOOKED SALON DETAILS"]);
      dailyReport.orders.forEach((order) => {
        wsData.push(["Salon Name:", order.salon?.name || ""]);
        wsData.push(["Contact No:", order.salon?.mobile || ""]);
        wsData.push(["Product", "Quantity", "Unit Price", "Discount %", "Subtotal"]);
        order.items.forEach((item) => {
          const productName = item.product?.name || item.name || "Unknown";
          const qty = item.qty || 0;
          const unitPrice = item.unitPrice || 0;
          const discountPct = item.discountPct || 0;
          const priceAfter = item.priceAfter || (item.priceBefore || unitPrice * qty) * (1 - discountPct / 100);
          wsData.push([
            productName,
            qty,
            unitPrice,
            discountPct,
            Math.round(priceAfter),
          ]);
        });
        wsData.push([]);
      });
      if (dailyReport.demos && dailyReport.demos.length > 0) {
        wsData.push(["DEMOS BOOKED"]);
        wsData.push(["Salon Name", "Contact", "Products", "Status", "Notes"]);
        dailyReport.demos.forEach((demo) => {
          const products = demo.products
            ?.map((p) => p.product?.name || p.name || "Unknown")
            .join(", ") || "";
          wsData.push([
            demo.salon?.name || "",
            demo.salon?.mobile || "",
            products,
            demo.status || "",
            demo.notes || "",
          ]);
        });
      }
    }
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, isTech ? "Technical Report" : "Daily Report");
    const fileName = isTech
      ? `Technical_Report_${summary.name}_${selectedDate}.xlsx`
      : `Daily_Report_${summary.name}_${selectedDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading employee data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const isTech = summary.role === "tech";
  const dailyReport = !isTech ? (report as IDailyReport) : null;
  const technicalReport = isTech ? (report as ITechnicalReport) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/reports")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {summary.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {summary.position} • {summary.hq}
            </p>
          </div>
        </div>
        <div className="flex items-end gap-3">
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
            disabled={!report}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Employee Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage
                className="object-cover"
                src={summary.profileImage || undefined}
              />
              <AvatarFallback>
                {summary.name ? (
                  getInitials(summary.name)
                ) : (
                  <User className="w-6 h-6" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <CardTitle className="text-base font-semibold line-clamp-1 uppercase">
                  {summary.name}
                </CardTitle>
                <span className="text-xs px-2 py-1 rounded border bg-muted/50 shrink-0">
                  {summary.role === "tech" ? "Tech" : "Sales"}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-1.5 mt-2 text-xs">
            <div className="flex flex-col items-center gap-0.5">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="font-medium text-center">
                {summary.dailyTarget || "—"}
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="font-medium text-center">
                {summary.totalTC || 0}
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="font-medium text-center">
                {summary.totalSalonsVisited || 0}
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="font-medium text-center">
                {summary.totalOrders || 0}
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="mt-3 pt-3 border-t space-y-3">
            {summary.role === "sales" && summary.dailyVisitTarget && (
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

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">Today's Beat</span>
              <span className="font-medium truncate ml-2">
                {summary.todayBeat?.name || "Not selected"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {loadingReport && (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading report details...</p>
          </CardContent>
        </Card>
      )}

      {!loadingReport && dailyReport && (
        <>
          {/* Visits Section */}
          <Card>
            <CardHeader>
              <CardTitle>Salons Visited ({dailyReport.visits.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyReport.visits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No visits recorded for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {dailyReport.visits.map((visit) => (
                    <div
                      key={visit.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{visit.salon?.name || "Unknown Salon"}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {visit.beat && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {visit.beat.beatname || visit.beat.name || "—"}
                            </span>
                          )}
                          {visit.salon?.mobile && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {visit.salon.mobile}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders Section */}
          <Card>
            <CardHeader>
              <CardTitle>Orders Booked ({dailyReport.orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyReport.orders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No orders booked for this date
                </p>
              ) : (
                <div className="space-y-4">
                  {dailyReport.orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {order.salon?.name || "Unknown Salon"}
                          </p>
                          {order.salon?.mobile && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Contact: {order.salon.mobile}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Products:</p>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => {
                            const productName = item.product?.name || item.name || "Unknown Product";
                            const qty = item.qty || 0;
                            const unitPrice = item.unitPrice || 0;
                            const discountPct = item.discountPct || 0;
                            const priceBefore = item.priceBefore || (unitPrice * qty);
                            const priceAfter = item.priceAfter || (priceBefore * (1 - discountPct / 100));
                            
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{productName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {qty} × ₹{unitPrice.toLocaleString()}
                                    {discountPct > 0 && ` (${discountPct}% off)`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">₹{Math.round(priceAfter).toLocaleString()}</p>
                                  {discountPct > 0 && (
                                    <p className="text-xs text-muted-foreground line-through">
                                      ₹{Math.round(priceBefore).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="pt-2 border-t flex justify-between items-center">
                          <span className="font-medium">Subtotal:</span>
                          <span className="font-bold">
                            ₹{order.items.reduce((sum, item) => {
                              const priceAfter = item.priceAfter || (item.priceBefore || 0) * (1 - (item.discountPct || 0) / 100);
                              return sum + Math.round(priceAfter);
                            }, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demos Section */}
          <Card>
            <CardHeader>
              <CardTitle>Demos Booked ({dailyReport.demos?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {!dailyReport.demos || dailyReport.demos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No demos booked for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {dailyReport.demos.map((demo) => (
                    <div
                      key={demo.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {demo.salon?.name || "Unknown Salon"}
                          </p>
                          {demo.salon?.mobile && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Contact: {demo.salon.mobile}
                            </p>
                          )}
                        </div>
                        <span className="text-xs px-2 py-1 rounded border bg-muted/50">
                          {demo.status}
                        </span>
                      </div>
                      {demo.products && demo.products.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Products:</p>
                          <div className="flex flex-wrap gap-2">
                            {demo.products.map((product, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-primary/10 rounded"
                              >
                                {product.product?.name || product.name || "Unknown"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {demo.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium">Notes:</span> {demo.notes}
                        </p>
                      )}
                      {demo.demoDateExpected && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Expected: {format(new Date(demo.demoDateExpected), "dd/MM/yyyy h:mm a")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!loadingReport && technicalReport && (
        <Card>
          <CardHeader>
            <CardTitle>Demos ({technicalReport.demos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {technicalReport.demos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No demos recorded for this date
              </p>
            ) : (
              <div className="space-y-3">
                {technicalReport.demos.map((demo) => (
                  <div
                    key={demo.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {demo.salon?.name || "Unknown Salon"}
                        </p>
                        {demo.salon?.mobile && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Contact: {demo.salon.mobile}
                          </p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded border bg-muted/50">
                        {demo.status}
                      </span>
                    </div>
                    {demo.products && demo.products.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Products:</p>
                        <div className="flex flex-wrap gap-2">
                          {demo.products.map((product, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-primary/10 rounded"
                            >
                              {product.product?.name || product.name || "Unknown"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {demo.amountUsed && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Amount Used:</span> {demo.amountUsed}
                      </p>
                    )}
                    {demo.outcome && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Feedback:</span> {demo.outcome}
                      </p>
                    )}
                    {demo.notes && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {demo.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onCopyText={formatAsText}
        onExportSheet={exportToSheet}
        title={`Export ${summary.role === "tech" ? "Technical" : "Daily"} Report`}
      />
    </div>
  );
}
