// components/employees/TargetCard.tsx
"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchEmployeeTarget,
  updateEmployeeTarget,
  selectEmployeeTargetBySub,
  selectTargetGetStatus,
  selectTargetSetStatus,
  selectTargetSetError,
} from "@/store/slices/target.slice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
const MIN = 30_000;
const STEP = 10_000;

function clamp(n: number) {
  return Math.max(MIN, n);
}
function roundToStep(n: number) {
  return Math.round(n / STEP) * STEP;
}

interface TargetCardProps {
  employeeSub: string;
}

export default function TargetCard({ employeeSub }: TargetCardProps) {
  const sub = employeeSub;
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) =>
    selectEmployeeTargetBySub(s as any, sub as any)
  );
  const getStatus = useAppSelector(selectTargetGetStatus);
  const setStatus = useAppSelector(selectTargetSetStatus);
  const setError = useAppSelector(selectTargetSetError);

  const [target, setTarget] = React.useState<number>(MIN);

  React.useEffect(() => {
    if (!sub) return;
    dispatch(fetchEmployeeTarget({ sub }));
  }, [dispatch, sub]);

  React.useEffect(() => {
    const t = data?.targetMonthly;
    if (typeof t === "number") {
      const rounded = roundToStep(t);
      setTarget(rounded >= MIN ? rounded : MIN);
    }
  }, [data?.targetMonthly]);

  const onInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    const numValue = Number(raw || 0);
    if (numValue === 0) {
      setTarget(MIN);
    } else {
      const v = clamp(roundToStep(numValue));
      setTarget(v);
    }
  };

  const saving = setStatus === "loading";

  const onSave = async () => {
    if (!sub) return;
    try {
      await dispatch(
        updateEmployeeTarget({ sub, targetMonthly: target })
      ).unwrap();
      toast.success("Target saved");
    } catch {
      toast.error(setError || "Failed to save target");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Monthly Target</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {getStatus === "loading" && (
          <div className="text-xs text-muted-foreground">Loading target…</div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">
              Target Amount
            </div>
            <Input
              inputMode="numeric"
              value={target.toString()}
              onChange={onInput}
              className="text-sm h-9"
            />
          </div>
          <Button onClick={onSave} disabled={saving} size="sm" className="h-9">
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
