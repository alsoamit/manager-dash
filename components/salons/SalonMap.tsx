"use client";

import * as React from "react";

interface SalonMapProps {
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
    source?: string;
    ts?: number;
  } | null;
}

export default function SalonMap({ location }: SalonMapProps) {
  if (
    !location ||
    typeof location.lat !== "number" ||
    typeof location.lng !== "number"
  ) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No location data available
        </p>
      </div>
    );
  }

  // Use Google Maps embed - this format should work
  // Note: Google Maps embed may require API key for some use cases
  // If it doesn't work, you may need to set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}&hl=en&z=15&output=embed`;

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title="Salon location"
      />
    </div>
  );
}
