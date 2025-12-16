"use client";

import * as React from "react";
import { format, subDays } from "date-fns";
import { listPingsByUser, type IPing } from "@/services/ping.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface EmployeeDayLocationMapProps {
  employeeId: string;
}

export default function EmployeeDayLocationMap({
  employeeId,
}: EmployeeDayLocationMapProps) {
  const [selectedDay, setSelectedDay] = React.useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [pings, setPings] = React.useState<IPing[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Generate last 7 days options
  const dayOptions = React.useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, i);
      const dayStr = format(date, "yyyy-MM-dd");
      const label =
        i === 0 ? "Today" : i === 1 ? "Yesterday" : format(date, "EEE, MMM d");
      return { value: dayStr, label };
    });
  }, []);

  // Load pings for selected day
  React.useEffect(() => {
    if (!employeeId || !selectedDay) return;

    const loadDayPings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listPingsByUser({
          sub: employeeId,
          day: selectedDay,
        });
        const items = response.data.data.items || [];
        // Filter for valid location data and sort by timestamp
        const validPings = items
          .filter(
            (ping: IPing) =>
              typeof ping.lat === "number" &&
              typeof ping.lng === "number" &&
              !isNaN(ping.lat) &&
              !isNaN(ping.lng)
          )
          .sort(
            (a: IPing, b: IPing) =>
              new Date(a.ts).getTime() - new Date(b.ts).getTime()
          );
        setPings(validPings);
      } catch (err: any) {
        setError(err?.response?.data?.msg || "Failed to load location data");
        console.error("Error loading day pings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDayPings();
  }, [employeeId, selectedDay]);

  // Calculate center point and bounds for map view
  const mapCenter = React.useMemo(() => {
    if (pings.length === 0) return null;
    const avgLat =
      pings.reduce((sum, ping) => sum + ping.lat, 0) / pings.length;
    const avgLng =
      pings.reduce((sum, ping) => sum + ping.lng, 0) / pings.length;
    return [avgLat, avgLng] as [number, number];
  }, [pings]);

  // Calculate bounds to fit all markers
  const bounds = React.useMemo(() => {
    if (pings.length === 0) return null;
    const lats = pings.map((p) => p.lat);
    const lngs = pings.map((p) => p.lng);
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ] as [[number, number], [number, number]];
  }, [pings]);

  // Create polyline coordinates
  const polylineCoordinates = React.useMemo(() => {
    return pings.map((ping) => [ping.lat, ping.lng] as [number, number]);
  }, [pings]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <Skeleton className="h-96 w-full" />
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

  if (pings.length === 0) {
    return (
      <div className="space-y-3">
        <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No location data for{" "}
            {selectedDay === format(new Date(), "yyyy-MM-dd")
              ? "today"
              : selectedDay === format(subDays(new Date(), 1), "yyyy-MM-dd")
              ? "yesterday"
              : format(new Date(selectedDay), "EEE, MMM d")}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {dayOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="w-full h-96 rounded-lg overflow-hidden border z-20">
        {mapCenter && pings.length > 0 ? (
          <MapContainer
            center={mapCenter}
            zoom={bounds ? undefined : 13}
            bounds={bounds || undefined}
            boundsOptions={{ padding: [20, 20] }}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Draw polyline connecting all points in order */}
            {polylineCoordinates.length > 1 && (
              <Polyline
                positions={polylineCoordinates}
                pathOptions={{
                  color: "#3b82f6",
                  weight: 3,
                  opacity: 0.7,
                }}
              />
            )}
            {/* Add markers for each ping */}
            {pings.map((ping, index) => (
              <Marker
                key={`${ping.ts}-${index}`}
                position={[ping.lat, ping.lng]}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">
                      Point {index + 1} of {pings.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(ping.ts), "h:mm:ss a")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ping.lat.toFixed(6)}, {ping.lng.toFixed(6)}
                    </div>
                    {ping.accuracy && (
                      <div className="text-xs text-muted-foreground">
                        Accuracy: {ping.accuracy.toFixed(0)}m
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Unable to load map</p>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div>
          Showing {pings.length} location point{pings.length !== 1 ? "s" : ""}{" "}
          on{" "}
          {selectedDay === format(new Date(), "yyyy-MM-dd")
            ? "today"
            : selectedDay === format(subDays(new Date(), 1), "yyyy-MM-dd")
            ? "yesterday"
            : format(new Date(selectedDay), "EEE, MMM d")}
        </div>
        {pings.length > 0 && (
          <>
            <div>
              First: {pings[0].lat.toFixed(6)}, {pings[0].lng.toFixed(6)} at{" "}
              {format(new Date(pings[0].ts), "h:mm a")}
            </div>
            {pings.length > 1 && (
              <div>
                Last: {pings[pings.length - 1].lat.toFixed(6)},{" "}
                {pings[pings.length - 1].lng.toFixed(6)} at{" "}
                {format(new Date(pings[pings.length - 1].ts), "h:mm a")}
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-[180px] z-30">
            <SelectValue placeholder="Select a day" />
          </SelectTrigger>
          <SelectContent className="z-30">
            {dayOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
