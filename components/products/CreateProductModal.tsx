"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
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
  createProduct,
  selectProductsMutationStatuses,
  resetMutationState,
} from "@/store/slices/products.slice";
import { useToaster } from "react-hot-toast";
import { Upload, X, Loader2 } from "lucide-react";
import useUpload from "@/hooks/useUpload";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be non-negative"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  unit: z.string().optional().or(z.literal("")),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const UNIT_OPTIONS = [
  { value: "100gm", label: "100gm" },
  { value: "250gm", label: "250gm" },
  { value: "500gm", label: "500gm" },
  { value: "1kg", label: "1kg" },
  { value: "2kg", label: "2kg" },
  { value: "5kg", label: "5kg" },
  { value: "1ltr", label: "1ltr" },
  { value: "2ltr", label: "2ltr" },
  { value: "5ltr", label: "5ltr" },
];

export default function CreateProductModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useDispatch();
  const { createStatus, createError } = useSelector(
    selectProductsMutationStatuses
  );
  const toast = useToaster();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      unit: "",
      image: "",
    },
    mode: "onChange",
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { upload, isUploading, uploadProgress } = useUpload({
    type: "PRODUCT",
    onSuccess: (url) => {
      form.setValue("image", url);
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload(file);
  };

  const handleRemoveImage = () => {
    form.setValue("image", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  React.useEffect(() => {
    if (!open) {
      form.reset();
      // reset mutation status when closing
      dispatch(resetMutationState());
    }
  }, [open, dispatch, form]);

  React.useEffect(() => {
    if (createStatus === "succeeded") {
      //   toast({ title: "Product created", description: "Your product has been added." });
      onOpenChange(false);
    }
    if (createStatus === "failed" && createError) {
      //   toast({ title: "Create failed", description: createError, variant: "destructive" });
    }
  }, [createStatus, createError, onOpenChange, toast]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      price: values.price,
      stock: values.stock,
      unit: values.unit || undefined,
      image: values.image || undefined,
    };
    // @ts-ignore
    dispatch(createProduct(payload));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Add a new product to your catalog.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value ? (
                        <div className="relative inline-block">
                          <Avatar className="w-24 h-24">
                            <AvatarImage src={field.value} alt="Product" />
                            <AvatarFallback>IMG</AvatarFallback>
                          </Avatar>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={handleRemoveImage}
                            disabled={isUploading}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                            isUploading
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-8 h-8 animate-spin mb-2" />
                              <p className="text-sm">Uploading... {uploadProgress}%</p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mb-2" />
                              <p className="text-sm">Click to upload image</p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG or WebP. Max 10MB
                              </p>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => {
                const [displayValue, setDisplayValue] = React.useState(
                  field.value === 0 ? "" : String(field.value)
                );

                React.useEffect(() => {
                  setDisplayValue(field.value === 0 ? "" : String(field.value));
                }, [field.value]);

                return (
                  <FormItem>
                    <FormLabel>Price (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        value={displayValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDisplayValue(value);
                          // Update form value only if valid number
                          if (value === "" || value === "-") {
                            field.onChange(0);
                          } else {
                            const num = parseFloat(value);
                            if (!isNaN(num) && num >= 0) {
                              field.onChange(num);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          // On blur, if empty, set to 0
                          if (
                            value === "" ||
                            value === "-" ||
                            isNaN(parseFloat(value))
                          ) {
                            field.onChange(0);
                            setDisplayValue("");
                          } else {
                            const num = parseFloat(value);
                            if (!isNaN(num) && num >= 0) {
                              field.onChange(num);
                              setDisplayValue(String(num));
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Stock */}
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => {
                const [displayValue, setDisplayValue] = React.useState(
                  field.value === 0 ? "" : String(field.value)
                );

                React.useEffect(() => {
                  setDisplayValue(field.value === 0 ? "" : String(field.value));
                }, [field.value]);

                return (
                  <FormItem>
                    <FormLabel>Stock *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        value={displayValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDisplayValue(value);
                          // Update form value only if valid number
                          if (value === "" || value === "-") {
                            field.onChange(0);
                          } else {
                            const num = parseInt(value, 10);
                            if (!isNaN(num) && num >= 0) {
                              field.onChange(num);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          // On blur, if empty, set to 0
                          if (
                            value === "" ||
                            value === "-" ||
                            isNaN(parseInt(value, 10))
                          ) {
                            field.onChange(0);
                            setDisplayValue("");
                          } else {
                            const num = parseInt(value, 10);
                            if (!isNaN(num) && num >= 0) {
                              field.onChange(num);
                              setDisplayValue(String(num));
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Unit */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      // Convert "__none__" back to empty string for form
                      field.onChange(value === "__none__" ? "" : value);
                    }}
                    value={field.value || "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {UNIT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button type="submit" disabled={createStatus === "loading"}>
                {createStatus === "loading" ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
