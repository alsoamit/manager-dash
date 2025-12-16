// components/skeletons/ProductDetailSkeleton.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-10" />
        <div className="flex gap-2">
          <Skeleton className="w-20 h-10" />
          <Skeleton className="w-20 h-10" />
        </div>
      </div>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="w-16 h-16 rounded" />
            <Skeleton className="w-48 h-6" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-32 h-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
