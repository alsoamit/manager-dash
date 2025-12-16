"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { useAppDispatch } from "@/store/hooks";
import { deleteEmployee } from "@/store/slices/employees.slice";

const schema = z.object({
  confirm: z.literal("DELETE", { message: 'Type "DELETE" to confirm' }),
});

type FormValues = z.infer<typeof schema>;

export default function ConfirmDeleteEmployeeModal({
  sub,
  nameOrEmail,
  open,
  onOpenChange,
}: {
  sub: string | null;
  nameOrEmail?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { confirm: "" as unknown as "DELETE" },
  });

  React.useEffect(() => {
    if (!open) form.reset({ confirm: "" as unknown as "DELETE" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onConfirm = () => {
    if (!sub) return;
    setLoading(true);
    dispatch(deleteEmployee({ sub }))
      .unwrap?.()
      .then(() => onOpenChange(false))
      .finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete employee</DialogTitle>
          <DialogDescription>
            This permanently removes the user from Cognito and the database.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 text-sm rounded-md bg-muted">
          <div>
            <span className="text-muted-foreground">Sub:</span> {sub}
          </div>
          {nameOrEmail ? (
            <div>
              <span className="text-muted-foreground">User:</span> {nameOrEmail}
            </div>
          ) : null}
        </div>

        <Form {...form}>
          <form
            className="mt-4 space-y-3"
            onSubmit={form.handleSubmit(onConfirm)}
          >
            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type DELETE to confirm</FormLabel>
                  <FormControl>
                    <Input placeholder="DELETE" {...field} />
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
                variant="destructive"
                disabled={!form.formState.isValid || loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
