"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import SalonFormFields from "./SalonFormFields";
import type { IUpdateSalonPayload } from "@/services/salon.service";
import {
  selectSalonById,
  getSalon,
  updateSalon,
} from "@/store/slices/salon.slice";
import type { RootState } from "@/store";

const schema = z.object({
  name: z.string().optional(),
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

export default function EditSalonSheet({
  id,
  open,
  onOpenChange,
}: {
  id: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const salon = useAppSelector((s: RootState) =>
    id ? selectSalonById(s, id) : undefined
  );

  React.useEffect(() => {
    if (open && id && !salon) {
      dispatch(getSalon({ id }));
    }
  }, [open, id, salon, dispatch]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: salon?.name ?? "",
      address: salon?.address ?? "",
      mobile: salon?.mobile ?? "",
      state: salon?.state ?? "",
      status: salon?.status ?? "",
      visit: salon?.visit ?? "",
      location:
        typeof salon?.location === "string"
          ? salon.location
          : salon?.location
          ? `${salon.location.lat},${salon.location.lng}`
          : "",
      visitStatus: salon?.visitStatus ?? "",
      paymentAmount: salon?.paymentAmount ?? undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!id) return;

    // Parse location string "lat,lng" to object, only if provided and valid
    let locationObj: { lat: number; lng: number } | undefined = undefined;
    if (values.location && values.location.trim()) {
      const parts = values.location.trim().split(",");
      if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          locationObj = { lat, lng };
        }
      }
    }

    const changes: IUpdateSalonPayload = {
      name: values.name?.trim() ? values.name : "",
      address: values.address || undefined,
      mobile: values.mobile || undefined,
      state: values.state || undefined,
      status: (values.status as "active" | "inactive" | undefined) || undefined,
      visit:
        (values.visit as "visited" | "not_visited" | undefined) || undefined,
      // Only include location if it's actually provided and valid
      ...(locationObj ? { location: locationObj } : {}),
      visitStatus:
        (values.visitStatus as
          | "interested_yet_to_follow_up"
          | "owner_not_available"
          | "demo_booked"
          | "not_interested"
          | "product_sold"
          | undefined) || undefined,
      paymentAmount:
        typeof values.paymentAmount === "number"
          ? values.paymentAmount
          : undefined,
    };
    dispatch(updateSalon({ id, changes }))
      .unwrap?.()
      .then(() => onOpenChange(false));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Salon</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            className="py-4 space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <SalonFormFields control={form.control as any} />
            <SheetFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
