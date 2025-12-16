"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Form } from "@/components/ui/form";
import ProductFormFields, { type ProductFormValues } from "./ProductFormFields";
import {
  selectProductById,
  updateProduct,
  selectProductsMutationStatuses,
  getProduct,
} from "@/store/slices/products.slice";
import type { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";

const schema = z.object({
  name: z.string().optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
  price: z.number().nonnegative().optional(),
  unit: z.string().max(20).optional().or(z.literal("")),
  stock: z.number().int().nonnegative().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function EditProductSheet({
  id,
  open,
  onOpenChange,
}: {
  id: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useDispatch();
  //   const { toast } = useToast();
  const { updateStatus, updateError } = useAppSelector(
    selectProductsMutationStatuses
  );
  const product = useSelector((s: RootState) =>
    id ? selectProductById(s, id) : undefined
  );

  // fetch if not present
  React.useEffect(() => {
    if (open && id && !product) {
      // @ts-ignore
      dispatch(getProduct({ id }));
    }
  }, [open, id, product, dispatch]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      image: product?.image ?? "",
      description: product?.description ?? "",
      price: product?.price ?? undefined,
      unit: product?.unit ?? "",
      stock: product?.stock ?? undefined,
    },
    values: {
      name: product?.name ?? "",
      image: product?.image ?? "",
      description: product?.description ?? "",
      price: product?.price ?? undefined,
      unit: product?.unit ?? "",
      stock: product?.stock ?? undefined,
    },
  });

  React.useEffect(() => {
    if (updateStatus === "succeeded") {
      //   toast({ title: "Product updated", description: "Changes saved." });
      onOpenChange(false);
    }
    if (updateStatus === "failed" && updateError) {
      //   toast({ title: "Update failed", description: updateError, variant: "destructive" });
    }
  }, [updateStatus, updateError, onOpenChange]);

  const onSubmit = (values: FormValues) => {
    if (!id) return;
    const payload: ProductFormValues = {
      name: values.name?.trim() ? values.name : "",
      image: values.image || undefined,
      description: values.description || undefined,
      price: typeof values.price === "number" ? values.price : undefined,
      unit: values.unit || undefined,
      stock: typeof values.stock === "number" ? values.stock : undefined,
    };
    // @ts-ignore
    dispatch(updateProduct({ id, changes: payload }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Product</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            className="py-4 space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <ProductFormFields control={form.control as any} />

            <SheetFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateStatus === "loading"}>
                {updateStatus === "loading" ? "Saving..." : "Save changes"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
