// components/skeletons/EmployeeDetailSkeleton.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeDetailSkeleton() {
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

      {/* Employee Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded" />
            <Skeleton className="w-32 h-6" />
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

      {/* Target Card */}
      <Card>
        <CardHeader>
          <Skeleton className="w-32 h-5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-24" />
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <Skeleton className="w-40 h-5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-64 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
