"use client";

import * as React from "react";
import { format } from "date-fns";
import type { IPing } from "@/services/ping.service";
import socket from "@/lib/socket";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";

interface EmployeeLocationMapProps {
  employeeId: string; // The sub of the employee
  pings: IPing[]; // Historical pings
  loading: boolean;
  error: string | null;
}

export default function EmployeeLocationMap({
  employeeId,
  pings,
  loading,
  error,
}: EmployeeLocationMapProps) {
  const [livePing, setLivePing] = React.useState<IPing | null>(null);
  const [isLive, setIsLive] = React.useState(false);
  const [socketConnected, setSocketConnected] = React.useState(false);

  // Filter and sort historical pings with valid location data
  const validPings = React.useMemo(() => {
    return pings
      .filter(
        (ping) =>
          typeof ping.lat === "number" &&
          typeof ping.lng === "number" &&
          !isNaN(ping.lat) &&
          !isNaN(ping.lng)
      )
      .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  }, [pings]);

  // Get the latest ping (either live or from history)
  const latestPing = React.useMemo(() => {
    if (livePing && livePing.lat && livePing.lng) {
      return livePing;
    }
    if (validPings.length === 0) return null;
    return validPings[validPings.length - 1];
  }, [livePing, validPings]);

  // Calculate center point for the map
  const centerPoint = React.useMemo(() => {
    if (!latestPing) return null;
    return { lat: latestPing.lat, lng: latestPing.lng };
  }, [latestPing]);

  // Build Google Maps URL
  const mapUrl = React.useMemo(() => {
    if (!centerPoint) return null;
    return `https://www.google.com/maps?q=${centerPoint.lat},${centerPoint.lng}&hl=en&z=15&output=embed`;
  }, [centerPoint]);

  // Socket connection and ping listening
  React.useEffect(() => {
    if (!employeeId) return;

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setSocketConnected(true);
      // Join the employee's room to listen for their pings
      socket.emit("join", { sub: employeeId });
      console.log("[map] Joined room for employee:", employeeId);
    };

    const onDisconnect = () => {
      setSocketConnected(false);
      setIsLive(false);
    };

    const onPing = (data: {
      sub: string;
      ts: string;
      loc?: { lat: number; lng: number; accuracy?: number };
    }) => {
      console.log("[map] Received ping event:", data);
      console.log("[map] Employee ID:", employeeId);
      console.log("[map] Match:", data.sub === employeeId);

      if (data.sub === employeeId && data.loc) {
        console.log("[map] Processing live ping for employee");
        const ping: IPing = {
          sub: data.sub,
          ts: data.ts,
          lat: data.loc.lat,
          lng: data.loc.lng,
          accuracy: data.loc.accuracy,
          day: data.ts.slice(0, 10),
        };
        setLivePing(ping);
        setIsLive(true);

        // Reset live status after 2 minutes of no pings
        setTimeout(() => {
          setIsLive(false);
        }, 120000);
      } else {
        console.log("[map] Ping ignored - sub mismatch or no location");
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("ping", onPing);

    // Listen to all events for debugging (if available)
    if (typeof socket.onAny === "function") {
      socket.onAny((eventName, ...args) => {
        console.log("[map] Socket event received:", eventName, args);
      });
    }

    // If already connected, join immediately
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("ping", onPing);
      // Socket will automatically leave rooms on disconnect
    };
  }, [employeeId]);

  // Get time range for historical pings
  const timeRange = React.useMemo(() => {
    if (validPings.length === 0) return null;
    const first = new Date(validPings[0].ts);
    const last = new Date(validPings[validPings.length - 1].ts);
    return {
      start: format(first, "PPp"),
      end: format(last, "PPp"),
    };
  }, [validPings]);

  if (loading) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading location trail...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!latestPing || (!centerPoint && validPings.length === 0)) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No location data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isLive ? (
            <Badge variant="default" className="bg-green-500">
              <Radio className="w-3 h-3 mr-1 animate-pulse" />
              Live
            </Badge>
          ) : (
            <Badge variant="secondary">Last Known Location</Badge>
          )}
        </div>
        {socketConnected ? (
          <Badge variant="outline" className="text-xs">
            Connected
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Disconnected
          </Badge>
        )}
      </div>
      <div className="w-full h-96 rounded-lg overflow-hidden border">
        {mapUrl ? (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
            title="Employee location"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Unable to load map</p>
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        {isLive && livePing ? (
          <>
            <div>
              <span className="font-medium text-green-500">Live Location</span>
            </div>
            <div>
              {livePing.lat.toFixed(6)}, {livePing.lng.toFixed(6)} at{" "}
              {format(new Date(livePing.ts), "PPp")}
            </div>
            {livePing.accuracy && (
              <div>Accuracy: {livePing.accuracy.toFixed(0)}m</div>
            )}
          </>
        ) : (
          <>
            <div>
              Showing {validPings.length} location point
              {validPings.length !== 1 ? "s" : ""}
              {timeRange && (
                <>
                  {" "}
                  from {timeRange.start} to {timeRange.end}
                </>
              )}
            </div>
            <div>
              Latest: {latestPing.lat.toFixed(6)}, {latestPing.lng.toFixed(6)}{" "}
              at {format(new Date(latestPing.ts), "PPp")}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
