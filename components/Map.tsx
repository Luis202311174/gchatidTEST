"use client";

import { useEffect, useRef, useCallback } from "react";

type DestinationKey = "main" | "annex";

interface MapProps {
  onUserLocationChange: (lat: number, lng: number) => void;
  selectedDestinationKey: DestinationKey | null;
  onRouteUpdate?: (distanceKm: number, fare: number) => void;
}

export const destinations = {
  main: { name: "Gordon College Main Campus", coords: [14.8324, 120.2833] as [number, number] },
  annex: { name: "Gordon College ANNEX Campus", coords: [14.8372648, 120.2798648] as [number, number] },
};

export const MIN_FARE = 50;
export const RATE_PER_KM = 15;

export default function Map({ onUserLocationChange, selectedDestinationKey, onRouteUpdate }: MapProps) {
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routeControlRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const userLocationRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const drawRouteRef = useRef<any>(null);

  // Create drawRoute function with useCallback
  const drawRoute = useCallback(
    (pickup: { lat: number; lng: number }, destCoords: [number, number]) => {
      if (!mapRef.current || !LRef.current) return;

      const L = LRef.current;
      const LR = L.Routing;

      if (!LR || !LR.control) {
        console.warn("Leaflet Routing not available yet");
        return;
      }

      // Remove old route if exists
      if (routeControlRef.current) {
        mapRef.current.removeControl(routeControlRef.current);
        routeControlRef.current = null;
      }

      // Add or update destination marker
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setLatLng(destCoords);
      } else {
        destinationMarkerRef.current = L.marker(destCoords).addTo(mapRef.current);
      }

      routeControlRef.current = LR.control({
        waypoints: [L.latLng(pickup.lat, pickup.lng), L.latLng(destCoords[0], destCoords[1])],
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        show: false,
        lineOptions: {
          styles: [{ color: "#15c8ff", weight: 6, opacity: 0.9 }],
        },
      }).addTo(mapRef.current);

      // Notify parent of distance & fare
      routeControlRef.current.on("routesfound", (e: any) => {
        const route = e.routes[0];
        const distanceInKm = route.summary.totalDistance / 1000;
        const fare = Math.max(MIN_FARE + distanceInKm * RATE_PER_KM, MIN_FARE);

        if (onRouteUpdate) onRouteUpdate(distanceInKm, fare);
      });
    },
    [onRouteUpdate]
  );

  // Store drawRoute in ref so it can be called from map click handler
  useEffect(() => {
    drawRouteRef.current = drawRoute;
  }, [drawRoute]);

  useEffect(() => {
    let isMounted = true;

    // Load Leaflet via CDN
    const leafletScript = document.createElement("script");
    leafletScript.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
    leafletScript.onload = () => {
      // Load Leaflet CSS
      const leafletCss = document.createElement("link");
      leafletCss.rel = "stylesheet";
      leafletCss.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
      document.head.appendChild(leafletCss);

      // Load Leaflet Routing Machine script
      const routingScript = document.createElement("script");
      routingScript.src = "https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js";
      routingScript.onload = () => {
        // Load Leaflet Routing Machine CSS
        const routingCss = document.createElement("link");
        routingCss.rel = "stylesheet";
        routingCss.href = "https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css";
        document.head.appendChild(routingCss);

        if (!isMounted) return;

        const L = (window as any).L;
        LRef.current = L;

        // Initialize map
        if (!mapRef.current) {
          mapRef.current = L.map("map").setView([14.8314775, 120.2819695], 16);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(mapRef.current);

          mapRef.current.on("click", (e: any) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            // Place or move user marker
            if (userMarkerRef.current) userMarkerRef.current.setLatLng(e.latlng);
            else {
              const userIcon = L.divIcon({
                className: "user-marker-icon",
                html: "<div></div>",
                iconSize: [26, 26],
                iconAnchor: [13, 13],
              });
              userMarkerRef.current = L.marker(e.latlng, { icon: userIcon }).addTo(mapRef.current);
            }

            // Store user location
            userLocationRef.current = { lat, lng };

            // Notify parent of user location
            onUserLocationChange(lat, lng);

            // Draw route if destination selected
            if (selectedDestinationKey && drawRouteRef.current) {
              const destCoords = destinations[selectedDestinationKey].coords;
              drawRouteRef.current({ lat, lng }, destCoords);
            }
          });
        }
      };
      document.body.appendChild(routingScript);
    };
    document.body.appendChild(leafletScript);

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onUserLocationChange, selectedDestinationKey]);

  // Handle destination change - redraw route
  useEffect(() => {
    if (!mapRef.current || !selectedDestinationKey || !userLocationRef.current || !LRef.current) return;

    const destCoords = destinations[selectedDestinationKey].coords;
    drawRoute(userLocationRef.current, destCoords);
  }, [selectedDestinationKey, drawRoute]);

  return <div id="map" style={{ flex: 1, height: "100%" }}></div>;
}
