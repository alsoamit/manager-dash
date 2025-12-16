"use client";

import * as React from "react";
import { Plus, Package, DollarSign, Box } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAllProducts,
  selectProductsNextToken,
  listProducts,
} from "@/store/slices/products.slice";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

import CreateProductModal from "./CreateProductModal";
import ProductsListSkeleton from "@/components/skeletons/ProductsListSkeleton";
import { selectProductsListStatus } from "@/store/slices/products.slice";

export default function ProductTable() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectAllProducts);
  const nextToken = useAppSelector(selectProductsNextToken);
  const listStatus = useAppSelector(selectProductsListStatus);

  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    dispatch(listProducts({ limit: 20, mode: "replace" }));
  }, [dispatch]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Products</h2>
          <p className="text-sm text-muted-foreground">
            Manage your catalog items.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Product
        </Button>
      </div>

      {/* Grid of product cards */}
      {listStatus === "loading" && (!products || products.length === 0) ? (
        <ProductsListSkeleton />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((p) => {
            const price =
              typeof p.price === "number"
                ? `₹${p.price.toLocaleString()}`
                : "—";
            const stock = typeof p.stock === "number" ? p.stock : "—";
            const created = p.createdAt
              ? format(new Date(p.createdAt), "PP p")
              : "—";

            return (
              <Link key={p.id} href={`/products/${p.id}`} className="block">
                <Card className="transition-shadow shadow-sm hover:shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt={p.name}
                          className="object-cover w-16 h-16 rounded shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-muted shrink-0 flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold line-clamp-2">
                          {p.name || "Untitled"}
                        </CardTitle>
                        {p.description ? (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {p.description}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Unit badge */}
                    {p.unit && (
                      <div className="mt-2">
                        <Badge variant="secondary">{p.unit}</Badge>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {/* Price */}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex items-center justify-between flex-1">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-medium">{price}</span>
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="flex items-center gap-2 text-sm">
                      <Box className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex items-center justify-between flex-1">
                        <span className="text-muted-foreground">Stock</span>
                        <span className="font-medium">{stock}</span>
                      </div>
                    </div>

                    {/* Created date */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
                      <div>Created</div>
                      <div>{created}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {(!products || products.length === 0) && listStatus !== "loading" && (
            <div className="col-span-full text-center text-sm text-muted-foreground py-8">
              No products yet.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {nextToken && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => {
              // @ts-ignore
              dispatch(listProducts({ limit: 20, nextToken, mode: "append" }));
            }}
          >
            Load more
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateProductModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
