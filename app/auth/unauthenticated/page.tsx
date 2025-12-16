"use client";

import * as React from "react";
import { ShieldAlert, AlertTriangle, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthenticatedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-lg">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              You are not authorized to access this application.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-destructive font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>This attempt will be reported.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              This dashboard is restricted to administrators only. If you believe
              this is an error, please contact your system administrator.
            </p>
          </div>

          <div className="pt-4">
            <Button asChild className="w-full" variant="outline">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
