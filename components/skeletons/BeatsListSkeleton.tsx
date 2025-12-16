// components/skeletons/BeatsListSkeleton.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BeatsListSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="h-full px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex items-center gap-2 flex-wrap">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
