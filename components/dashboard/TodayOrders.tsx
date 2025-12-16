"use client";

import * as React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listTodayOrders, type IOrder } from "@/services/order.service";
import { format } from "date-fns";
import { MapPin, Clock, User, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface TodayOrdersCardProps {
  order: IOrder;
}

function TodayOrdersCard({ order }: TodayOrdersCardProps) {
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
      case "completed":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const itemsCount = order.items?.length || 0;
  const totalQty = order.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;

  return (
    <Card className="transition-shadow shadow-sm hover:shadow">
      <CardContent className="p-3 space-y-2">
        {/* Header: Salon Name and Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <h3 className="font-semibold text-sm line-clamp-1">
                {order.salon?.name || "Unknown Salon"}
              </h3>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0.5 border ${getStatusColor(order.status)}`}
          >
            {getStatusLabel(order.status)}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="space-y-2">
          {/* Row 1: Time, User, Items */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">
                {formatTime(order.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">
                {order.user?.name
                  ? order.user.name.split(" ")[0]
                  : order.user?.email
                  ? order.user.email.split("@")[0]
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">
                {itemsCount} item{itemsCount !== 1 ? "s" : ""} ({totalQty} qty)
              </span>
            </div>
          </div>

          {/* Row 2: Amount */}
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-1">
              <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-bold text-sm">
                ₹{order.totalAfter.toLocaleString()}
              </span>
              {order.totalBefore > order.totalAfter && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{order.totalBefore.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Payment Status */}
          {order.paidAmount !== undefined && order.remainingAmount !== undefined && (
            <div className="flex items-center justify-between text-xs pt-1 border-t">
              <span className="text-muted-foreground">Payment</span>
              <div className="flex items-center gap-2">
                <span className={order.remainingAmount > 0 ? "text-yellow-600" : "text-green-600"}>
                  ₹{order.paidAmount.toLocaleString()} / ₹{order.totalAfter.toLocaleString()}
                </span>
                {order.recoveredPct !== undefined && (
                  <Badge variant={order.remainingAmount > 0 ? "secondary" : "default"} className="text-xs">
                    {order.recoveredPct}%
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TodayOrdersProps {
  // No props needed
}

export default function TodayOrders({}: TodayOrdersProps) {
  const [orders, setOrders] = React.useState<IOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listTodayOrders();
        if (response.data.status === 0) {
          throw new Error(response.data.msg || "Failed to fetch orders");
        }
        setOrders(response.data.data.items || []);
      } catch (err: any) {
        console.error("Error fetching today's orders:", err);
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Today's Orders</CardTitle>
        </div>
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="transition-shadow shadow-sm">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="flex items-center gap-1">
                          <div className="w-3.5 h-3.5 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-12 bg-muted animate-pulse rounded flex-1" />
                        </div>
                      ))}
                    </div>
                    <div className="h-8 bg-muted animate-pulse rounded" />
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
        <div className="flex items-center justify-between">
          <CardTitle>Today's Orders</CardTitle>
        </div>
        <div>
          <div className="text-sm text-destructive">{error}</div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Today's Orders</CardTitle>
        </div>
        <div>
          <Card className="h-40 flex items-center justify-center">
            <CardContent className="text-center">
              <div className="text-sm text-muted-foreground">
                No orders placed today.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle>Today's Orders</CardTitle>
        <Link
          href="/orders"
          className="text-sm text-primary hover:underline font-medium"
        >
          See more →
        </Link>
      </div>
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <TodayOrdersCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
