"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createBeat,
  selectBeatCreateStatus,
} from "@/store/slices/beats.slice";
import toast from "react-hot-toast";

const schema = z.object({
  beatname: z.string().min(1, "Beat name is required"),
  code: z.string().optional(),
  state: z.enum(["West Bengal", "Jharkhand"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateBeatModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const createStatus = useAppSelector(selectBeatCreateStatus);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      beatname: "",
      code: "",
      state: undefined,
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  React.useEffect(() => {
    if (createStatus === "succeeded") {
      toast.success("Beat created successfully");
      onOpenChange(false);
      form.reset();
    }
    if (createStatus === "failed") {
      toast.error("Failed to create beat");
    }
  }, [createStatus, onOpenChange, form]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      beatname: values.beatname,
      code: values.code || undefined,
      state: values.state || undefined,
    };
    dispatch(createBeat(payload));
  };

  const isLoading = createStatus === "loading";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Beat</DialogTitle>
          <DialogDescription>
            Add a new beat route to your system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Beat Name */}
            <FormField
              control={form.control}
              name="beatname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beat Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., South Mumbai Route 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SM-R1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* State */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="West Bengal">West Bengal</SelectItem>
                      <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Beat"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
