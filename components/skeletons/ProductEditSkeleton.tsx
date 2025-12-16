// components/skeletons/ProductEditSkeleton.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductEditSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-10" />
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <Skeleton className="w-32 h-6" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-full h-10" />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-full h-10" />
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-full h-10" />
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-full h-10" />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <Skeleton className="w-20 h-10" />
            <Skeleton className="w-32 h-10" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
