"use client";

import * as React from "react";
import { Calendar, FileText, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          View daily and monthly reports for all employees
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Reports
            </CardTitle>
            <CardDescription>
              View daily activity reports for all employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              See daily visits, orders, targets, and achievements for each employee
            </p>
            <Link href="/reports/daily">
              <Button className="w-full">View Daily Reports</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Monthly Reports
            </CardTitle>
            <CardDescription>
              View monthly performance reports for all employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              See monthly sales, visits, orders, and target achievements
            </p>
            <Link href="/reports/monthly">
              <Button className="w-full">View Monthly Reports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
