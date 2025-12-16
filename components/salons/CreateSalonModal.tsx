"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import SalonFormFields, { type SalonFormValues } from "./SalonFormFields";
import { selectProductsMutationStatuses as _ignore } from "@/store/slices/products.slice";
import { createSalon as createSalonThunk } from "@/store/slices/salon.slice";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional().or(z.literal("")),
  mobile: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  status: z.string().optional().or(z.literal("")),
  visit: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  visitStatus: z.string().optional().or(z.literal("")),
  paymentAmount: z.number().nonnegative().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateSalonModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: FormValues) => {
    const payload: SalonFormValues = {
      name: values.name,
      address: values.address || undefined,
      mobile: values.mobile || undefined,
      state: values.state || undefined,
      status: values.status || undefined,
      visit: values.visit || undefined,
      location: values.location || undefined,
      visitStatus: values.visitStatus || undefined,
      paymentAmount:
        typeof values.paymentAmount === "number"
          ? values.paymentAmount
          : undefined,
    };
    // @ts-ignore
    dispatch(createSalonThunk(payload))
      .unwrap?.()
      .then(() => onOpenChange(false));
  };

  React.useEffect(() => {
    if (!open) form.reset({ name: "" });
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Salon</DialogTitle>
          <DialogDescription>Add a new salon record.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <SalonFormFields control={form.control} />
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
