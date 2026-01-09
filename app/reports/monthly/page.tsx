"use client";

import * as React from "react";
import {
  Download,
  Target,
  TrendingUp,
  Phone,
  ShoppingCart,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAllUsers,
  getMonthlyReport,
  type IMonthlyReport,
  type IUser,
} from "@/services/managerReports.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function MonthlyReportsPage() {
  const [users, setUsers] = React.useState<IUser[]>([]);
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [selectedYear, setSelectedYear] = React.useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    new Date().getMonth() + 1
  );
  const [report, setReport] = React.useState<IMonthlyReport | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingUsers, setLoadingUsers] = React.useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const resp = await getAllUsers();
        setUsers(resp.data.data.users);
        if (resp.data.data.users.length > 0) {
          setSelectedUserId(resp.data.data.users[0].sub);
        }
      } catch (e) {
        console.error("Failed to fetch users:", e);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  React.useEffect(() => {
    if (selectedUserId && selectedYear && selectedMonth) {
      fetchReport();
    }
  }, [selectedUserId, selectedYear, selectedMonth]);

  const fetchReport = async () => {
    if (!selectedUserId || !selectedYear || !selectedMonth) return;
    setLoading(true);
    try {
      const resp = await getMonthlyReport(
        selectedUserId,
        selectedYear,
        selectedMonth
      );
      setReport(resp.data.data);
    } catch (e) {
      console.error("Failed to fetch report:", e);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!report) return;

    const wsData: any[] = [];

    // Header
    wsData.push(["Monthly Report"]);
    wsData.push([]);
    wsData.push(["Name:", report.user.name]);
    wsData.push(["Designation:", report.user.position || report.user.role]);
    wsData.push(["Date:", `${selectedMonth}/${selectedYear}`]);
    wsData.push(["Area:", report.user.hq || ""]);
    wsData.push([]);

    // Summary
    wsData.push(["Summary"]);
    wsData.push(["Total Visits:", report.totalVisits]);
    wsData.push(["Total Orders:", report.totalOrders]);
    wsData.push(["Total Amount:", report.totalAmount]);
    wsData.push(["Target for Month:", report.targetMonthly]);
    wsData.push(["Achievement:", report.totalAmount]);
    wsData.push([
      "Achievement %:",
      report.targetMonthly > 0
        ? ((report.totalAmount / report.targetMonthly) * 100).toFixed(2) + "%"
        : "0%",
    ]);
    wsData.push([]);

    // Salon Visited
    wsData.push(["Salon Visited Name Detail"]);
    report.visits.forEach((visit, idx) => {
      wsData.push([
        `${idx + 1}) Salon Name:`,
        visit.salon?.name || "",
        "Mobile number:",
        visit.salon?.mobile || "",
      ]);
    });
    wsData.push([]);

    // Order Booked Salon Details
    wsData.push(["Order Booked Salon Details"]);
    report.orders.forEach((order, idx) => {
      wsData.push([`${idx + 1}. Salon Name:`, order.salon?.name || ""]);
      wsData.push(["Contact No:", order.salon?.mobile || ""]);

      // Product details
      const productMap: Record<string, number> = {};
      order.items.forEach((item) => {
        const productName = item.product?.name || item.name || "Unknown";
        productMap[productName] = (productMap[productName] || 0) + item.qty;
      });

      wsData.push(["Nanoplastia kit:", productMap["Nanoplastia kit"] || ""]);
      wsData.push(["Aqua Plex Kit:", productMap["Aqua Plex Kit"] || ""]);
      wsData.push([
        "Retail Shampoo 250ml:",
        productMap["Retail Shampoo 250ml"] || "",
      ]);
      wsData.push(["Marula Spa:", productMap["Marula Spa"] || ""]);
      wsData.push([
        "Retail Mask 200gm:",
        productMap["Retail Mask 200gm"] || "",
      ]);
      wsData.push([
        "Retail Serum 100ml:",
        productMap["Retail Serum 100ml"] || "",
      ]);
      wsData.push(["Argan Oil 50 ml:", productMap["Argan Oil 50 ml"] || ""]);
      wsData.push([]);
    });

    wsData.push(["Remarks:"]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Report");
    XLSX.writeFile(
      wb,
      `Monthly_Report_${report.user.name}_${selectedMonth}_${selectedYear}.xlsx`
    );
  };

  const achievementData = report
    ? [
        { name: "Achieved", value: report.totalAmount },
        {
          name: "Remaining",
          value: Math.max(0, report.targetMonthly - report.totalAmount),
        },
      ]
    : [];

  const activityData = report
    ? [
        { name: "Visits", value: report.totalVisits },
        { name: "Orders", value: report.totalOrders },
      ]
    : [];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Reports</h1>
          <p className="text-muted-foreground mt-2">
            View monthly performance reports for employees
          </p>
        </div>
        {report && (
          <Button onClick={exportToExcel} className="gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Employee and Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={loadingUsers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.sub} value={user.sub}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                min={2020}
                max={2100}
              />
            </div>
            <div className="space-y-2">
              <Label>Month</Label>
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, idx) => (
                    <SelectItem key={idx + 1} value={String(idx + 1)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading report...</p>
          </CardContent>
        </Card>
      )}

      {!loading && report && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Visits
                </CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalVisits}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalOrders}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Amount
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{report.totalAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sales this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Target Achievement
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.targetMonthly > 0
                    ? Math.round(
                        (report.totalAmount / report.targetMonthly) * 100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  of ₹{report.targetMonthly.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Target Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={achievementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) =>
                        `${entry.name}: ₹${(entry.value || 0).toLocaleString()}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {achievementData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-lg font-semibold">{report.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Designation
                  </p>
                  <p className="text-lg font-semibold">
                    {report.user.position || report.user.role}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Area
                  </p>
                  <p className="text-lg font-semibold">
                    {report.user.hq || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Period
                  </p>
                  <p className="text-lg font-semibold">
                    {monthNames[selectedMonth - 1]} {selectedYear}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salon Visits */}
          <Card>
            <CardHeader>
              <CardTitle>Salon Visited ({report.totalVisits})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {report.visits.map((visit, idx) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{idx + 1}.</span>
                      <div>
                        <p className="font-medium">
                          {visit.salon?.name || "Unknown Salon"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {visit.salon?.mobile || "No mobile"}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {visit.status}
                    </span>
                  </div>
                ))}
                {report.visits.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No visits recorded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader>
              <CardTitle>
                Order Booked Salon Details ({report.totalOrders})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {report.orders.map((order, idx) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="mb-3">
                      <p className="font-semibold">
                        {idx + 1}. Salon Name: {order.salon?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Contact No: {order.salon?.mobile || "N/A"}
                      </p>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {order.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="text-sm">
                          <span className="font-medium">
                            {item.product?.name || item.name || "Unknown"}:
                          </span>{" "}
                          <span>{item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {report.orders.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No orders recorded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
