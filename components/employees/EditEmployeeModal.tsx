"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectEmployeeById,
  updateEmployee,
} from "@/store/slices/employees.slice";
import type { RootState } from "@/store";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const emailSchema = z
  .string()
  .email("Invalid email")
  .or(z.literal(""))
  .optional();

const schema = z.object({
  name: z.string().max(80, "Max 80 chars").or(z.literal("")).optional(),
  email: emailSchema,
  mobileNumber: z.string().max(30, "Max 30 chars").or(z.literal("")).optional(),
  dateOfBirth: z.string().or(z.literal("")).optional(),
  role: z.string().max(60, "Max 60 chars").or(z.literal("")).optional(),
  position: z.string().max(60, "Max 60 chars").or(z.literal("")).optional(),
  profileImage: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditEmployeeModal({
  sub,
  open,
  onOpenChange,
}: {
  sub: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const employee = useAppSelector((s: RootState) =>
    sub ? selectEmployeeById(s, sub) : undefined
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      mobileNumber: "",
      dateOfBirth: "",
      role: "",
      position: "",
      profileImage: "",
    },
    values: {
      email: employee?.email ?? "",
      mobileNumber: employee?.mobileNumber ?? "",
      dateOfBirth: employee?.dateOfBirth ?? "",
      role: employee?.role ?? "",
      position: employee?.position ?? "",
      profileImage: employee?.profileImage ?? "",
    },
  });

  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      form.reset({
        name: employee?.name ?? "",
        email: employee?.email ?? "",
        mobileNumber: employee?.mobileNumber ?? "",
        dateOfBirth: employee?.dateOfBirth ?? "",
        role: employee?.role ?? "",
        position: employee?.position ?? "",
        profileImage: employee?.profileImage ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sub]);

  const onSubmit = (values: FormValues) => {
    if (!sub) return;

    const clean = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [
        k,
        typeof v === "string" ? v.trim() : v,
      ])
    );

    const changes = Object.fromEntries(
      Object.entries(clean).filter(
        ([, v]) => v !== "" && v !== undefined && v !== null
      )
    );

    setSaving(true);
    dispatch(updateEmployee({ sub, changes }))
      .unwrap?.()
      .then(() => onOpenChange(false))
      .finally(() => setSaving(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Update basic profile fields.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="+91..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Role" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Position" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="profileImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid || saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
