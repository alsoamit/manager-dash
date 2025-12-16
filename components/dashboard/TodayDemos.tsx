"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { listTodayDemos, type IDemo } from "@/services/demo.service";
import { format } from "date-fns";
import { MapPin, Clock, User, Package, FileText } from "lucide-react";

interface TodayDemosCardProps {
  demo: IDemo;
}

function TodayDemosCard({ demo }: TodayDemosCardProps) {
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "h:mm a").toLowerCase();
    } catch {
      return "—";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "demo_done":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      case "cancelled":
        return "bg-orange-500/20 text-orange-600 border-orange-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getOutcomeBadgeVariant = (outcome?: string) => {
    switch (outcome) {
      case "interested":
        return "default";
      case "not_interested":
        return "destructive";
      case "price_too_high":
        return "secondary";
      case "reschedule_requested":
        return "outline";
      case "no_show":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getOutcomeLabel = (outcome?: string) => {
    if (!outcome) return "Pending";
    return outcome
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card className="transition-shadow shadow-sm hover:shadow p-0">
      <CardContent className="p-2 space-y-2">
        {/* Header: Salon Name and Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <h3 className="font-semibold text-xs line-clamp-1">
                {demo.salon?.name || "Unknown Salon"}
              </h3>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs px-1.5 py-0.5 border ${getStatusColor(demo.status)}`}
          >
            {getStatusLabel(demo.status)}
          </Badge>
        </div>

        {/* Details Grid - 2 rows */}
        <div className="space-y-1.5">
          {/* Row 1: Time, Beat, User */}
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">
                {formatTime(demo.demoDateApproved)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">
                {demo.beat?.beatname || demo.beatId || "—"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">
                {demo.assignedUser?.name
                  ? demo.assignedUser.name.split(" ")[0]
                  : demo.assignedUser?.email
                  ? demo.assignedUser.email.split("@")[0]
                  : "—"}
              </span>
            </div>
          </div>

          {/* Row 2: Amount Used, Products, Outcome */}
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {demo.amountUsed ? (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="font-medium truncate">{demo.amountUsed}</span>
              </div>
            ) : (
              <div className="text-muted-foreground">—</div>
            )}
            {demo.products && demo.products.length > 0 ? (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="font-medium truncate">
                  {demo.products.length} product{demo.products.length > 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <div className="text-muted-foreground">—</div>
            )}
            <div className="flex items-center justify-center">
              <Badge
                variant={getOutcomeBadgeVariant(demo.outcome)}
                className="text-xs px-1.5 py-0.5"
              >
                {getOutcomeLabel(demo.outcome).split(" ")[0]}
              </Badge>
            </div>
          </div>

          {/* Notes */}
          {demo.notes && (
            <div className="flex items-start gap-1 text-xs pt-1 border-t">
              <FileText className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-muted-foreground line-clamp-2 flex-1">
                {demo.notes}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TodayDemosProps {
  // No props needed
}

export default function TodayDemos({}: TodayDemosProps) {
  const [demos, setDemos] = React.useState<IDemo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDemos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listTodayDemos();
        if (response.data.status === 0) {
          throw new Error(response.data.msg || "Failed to fetch demos");
        }
        setDemos(response.data.data.items || []);
      } catch (err: any) {
        console.error("Error fetching today's demos:", err);
        setError(err.message || "Failed to load demos");
      } finally {
        setLoading(false);
      }
    };

    fetchDemos();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="">
          <CardTitle>Today&apos;s Demos</CardTitle>
        </div>
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="transition-shadow shadow-sm p-0">
                <CardContent className="p-2 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-3 gap-1.5">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-12 bg-muted animate-pulse rounded flex-1" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-12 bg-muted animate-pulse rounded flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="">
          <CardTitle>Today&apos;s Demos</CardTitle>
        </div>
        <div>
          <div className="text-sm text-destructive">{error}</div>
        </div>
      </div>
    );
  }

  if (demos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="">
          <CardTitle>Today&apos;s Demos</CardTitle>
        </div>
        <div>
          <Card className="h-40 flex items-center justify-center">
            <CardContent className="text-center">
              <div className="text-sm text-muted-foreground">
                No demos scheduled for today.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="">
        <CardTitle>Today&apos;s Demos</CardTitle>
      </div>
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {demos.map((demo) => (
            <TodayDemosCard key={demo.id} demo={demo} />
          ))}
        </div>
      </div>
    </div>
  );
}
