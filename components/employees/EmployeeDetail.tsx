"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getEmployee,
  selectEmployeeById,
} from "@/store/slices/employees.slice";
import type { RootState } from "@/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditEmployeeModal from "./EditEmployeeModal";
import ConfirmDeleteEmployeeModal from "./ConfirmDeleteModal";
import TargetCard from "./TargetCard";

export default function EmployeeDetails({ sub }: { sub: string }) {
  const dispatch = useAppDispatch();
  const employee = useAppSelector((s: RootState) => selectEmployeeById(s, sub));

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (!employee && sub) {
      dispatch(getEmployee({ sub }));
    }
  }, [dispatch, employee, sub]);

  return (
    <div className="max-w-3xl p-4 mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Employee</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {employee?.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={employee.profileImage}
                alt={employee?.name || employee.sub}
                className="object-cover w-10 h-10 rounded"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-muted" />
            )}
            <span>{employee?.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Sub</div>
            <div className="text-sm">{employee?.sub || sub}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="text-sm">{employee?.email || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Mobile</div>
            <div className="text-sm">{employee?.mobileNumber || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Role</div>
            <div className="text-sm">
              {employee?.role === "tech" && employee?.isTechHead === true
                ? "Tech Head"
                : employee?.role || "—"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Position</div>
            <div className="text-sm">{employee?.position || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Date of Birth</div>
            <div className="text-sm">{employee?.dateOfBirth || "—"}</div>
          </div>
        </CardContent>
      </Card>

      <EditEmployeeModal sub={sub} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDeleteEmployeeModal
        sub={sub}
        nameOrEmail={employee?.email}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <TargetCard employeeSub={sub} />
    </div>
  );
}
