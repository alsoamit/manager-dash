// components/employees/DailyVisitTargetCard.tsx
"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDailyVisitTarget,
  setDailyVisitTarget,
  type IDailyVisitTarget,
} from "@/services/dailyVisitTarget.service";
import { toast } from "react-hot-toast";

const MIN_VISITS = 0;
const MAX_VISITS = 20;
const DEFAULT_MIN = 6;
const DEFAULT_MAX = 8;

function clamp(n: number) {
  return Math.max(MIN_VISITS, Math.min(MAX_VISITS, n));
}

interface DailyVisitTargetCardProps {
  employeeSub: string;
  employeeRole?: string;
}

export default function DailyVisitTargetCard({
  employeeSub,
  employeeRole,
}: DailyVisitTargetCardProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [target, setTarget] = React.useState<IDailyVisitTarget | null>(null);
  const [minVisits, setMinVisits] = React.useState(DEFAULT_MIN);
  const [maxVisits, setMaxVisits] = React.useState(DEFAULT_MAX);

  // Load current target (don't pass date - will get persistent default)
  React.useEffect(() => {
    // Only load if sales user
    if (employeeRole !== "sales") return;
    if (!employeeSub) return;

    const loadTarget = async () => {
      setLoading(true);
      try {
        // Don't pass date - this will retrieve the persistent default target
        const response = await getDailyVisitTarget({
          userId: employeeSub,
        });
        const data = response.data.data;
        setTarget(data);
        setMinVisits(data.minVisits || DEFAULT_MIN);
        setMaxVisits(data.maxVisits || DEFAULT_MAX);
      } catch (err: any) {
        console.error("Failed to load daily visit target:", err);
        // Use defaults on error
        setMinVisits(DEFAULT_MIN);
        setMaxVisits(DEFAULT_MAX);
      } finally {
        setLoading(false);
      }
    };

    loadTarget();
  }, [employeeSub, employeeRole]);

  const onMinInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    const val = clamp(Number(raw || 0));
    setMinVisits(val);
    if (val > maxVisits) {
      setMaxVisits(val);
    }
  };

  const onMaxInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    const val = clamp(Number(raw || 0));
    setMaxVisits(val);
    if (val < minVisits) {
      setMinVisits(val);
    }
  };

  const onSave = async () => {
    if (!employeeSub) return;
    if (minVisits > maxVisits) {
      toast.error("Minimum visits cannot be greater than maximum");
      return;
    }

    setSaving(true);
    try {
      // Don't pass targetDate - this will set the persistent default target
      const response = await setDailyVisitTarget(employeeSub, {
        minVisits,
        maxVisits,
      });
      setTarget(response.data.data);
      toast.success("Daily visit target saved");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.msg || "Failed to save daily visit target"
      );
    } finally {
      setSaving(false);
    }
  };

  // Only show for sales users
  if (employeeRole !== "sales") {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Daily Visit Target</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <div className="text-xs text-muted-foreground">Loading target…</div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="min-visits" className="text-xs">
                  Min
                </Label>
                <Input
                  id="min-visits"
                  type="number"
                  min={MIN_VISITS}
                  max={MAX_VISITS}
                  value={minVisits}
                  onChange={onMinInputChange}
                  inputMode="numeric"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="max-visits" className="text-xs">
                  Max
                </Label>
                <Input
                  id="max-visits"
                  type="number"
                  min={MIN_VISITS}
                  max={MAX_VISITS}
                  value={maxVisits}
                  onChange={onMaxInputChange}
                  inputMode="numeric"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Range:{" "}
              <span className="font-medium text-foreground">
                {minVisits} - {maxVisits} visits
              </span>
            </div>

            <div className="flex justify-end pt-1">
              <Button onClick={onSave} disabled={saving} size="sm" className="h-9">
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
