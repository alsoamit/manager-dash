// components/skeletons/SalonEditSkeleton.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalonEditSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-10" />
      </div>

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

          {/* Address */}
          <div className="space-y-2">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-full h-20" />
          </div>

          {/* Mobile and Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-full h-10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-full h-10" />
            </div>
          </div>

          {/* State and ZIP */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-full h-10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-full h-10" />
            </div>
          </div>

          {/* Location Lat/Lng */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-full h-10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-full h-10" />
            </div>
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
