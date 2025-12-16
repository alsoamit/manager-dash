// components/skeletons/SalonDetailSkeleton.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalonDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-10" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-10" />
          <Skeleton className="w-20 h-10" />
        </div>
      </div>

      {/* Salon Details */}
      <Card>
        <CardHeader>
          <Skeleton className="w-40 h-6" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-32 h-4" />
            </div>
            <div className="space-y-1">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-40 h-4" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-full h-4" />
            </div>
            <div className="space-y-1">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-24 h-4" />
            </div>
            <div className="space-y-1">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="w-16 h-6" />
              <Skeleton className="w-20 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <Skeleton className="w-32 h-5" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <Skeleton className="w-48 h-4" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-10 h-4" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-8 h-3" />
              </div>
              <Skeleton className="w-full h-3" />
            </div>
          </div>
          <Skeleton className="w-40 h-3" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* Visits List */}
      <Card>
        <CardHeader>
          <Skeleton className="w-32 h-5" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-start justify-between p-3 border rounded"
            >
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="w-32 h-3" />
                <Skeleton className="w-48 h-3" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-16 h-5" />
                <Skeleton className="w-16 h-5" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <Skeleton className="w-24 h-5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-64 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
