"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import { deleteProduct } from "@/store/slices/products.slice";
import { useRouter } from "next/navigation";

export default function ConfirmDeleteProductModal({
  id,
  name,
  open,
  onOpenChange,
}: {
  id: string | null;
  name?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  // Schema that validates against the product name
  const schema = React.useMemo(
    () =>
      z.object({
        confirm: z.string().refine(
          (val) => {
            if (!name) return false;
            // Case-insensitive comparison with product name
            return val.trim().toLowerCase() === name.trim().toLowerCase();
          },
          { message: `Type the product name "${name}" to confirm` }
        ),
      }),
    [name]
  );

  type FormValues = { confirm: string };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    mode: "onChange",
    defaultValues: { confirm: "" },
  });

  React.useEffect(() => {
    if (!open) form.reset({ confirm: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onConfirm = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await dispatch(deleteProduct({ id })).unwrap();
      onOpenChange(false);
      toast.success("Product deleted successfully");
      router.push("/products");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            product.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 text-sm rounded-md bg-muted">
          <div>
            <span className="text-muted-foreground">ID:</span> {id}
          </div>
          {name ? (
            <div>
              <span className="text-muted-foreground">Name:</span> {name}
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
                  <FormLabel>
                    Type the product name to confirm: &quot;{name}&quot;
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={name || "Product name"} {...field} />
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
