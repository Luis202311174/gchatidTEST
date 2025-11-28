"use client";

import { useState, useEffect } from "react";
import Map, { destinations, MIN_FARE, RATE_PER_KM } from "@/components/Map";

type DestinationKey = "main" | "annex";

export default function LocationPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<DestinationKey | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [requestTimeout, setRequestTimeout] = useState<NodeJS.Timeout | null>(null);
  const [aiETA, setAiETA] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Handle user location update from Map component
  const handleUserLocationChange = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
  };

  // Handle route update from Map component (distance and fare)
  const handleRouteUpdate = (distanceKm: number, fareAmount: number) => {
    setDistance(distanceKm);
    setFare(fareAmount);
  };

  const handleDestinationClick = (key: DestinationKey) => {
    setSelectedDestination(key);
  };

  const handleMakeRequest = () => {
    if (!userLocation) return alert("Click on the map to set your current location first.");
    if (!selectedDestination) return alert("Select a destination first.");

    setWaiting(true);

    const newRequest = {
      id: Date.now(),
      user_lat: userLocation.lat,
      user_lng: userLocation.lng,
      location: destinations[selectedDestination].name,
      fare: fare?.toFixed(2),
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    // Save to localStorage queue
    const queue = JSON.parse(localStorage.getItem("all_requests_queue") || "[]");
    queue.push(newRequest);
    localStorage.setItem("all_requests_queue", JSON.stringify(queue));

    const timeout = setTimeout(() => {
      setWaiting(false);
      alert(`Rider found! Your request to ${destinations[selectedDestination].name} has been queued.`);
    }, 3000);

    setRequestTimeout(timeout);
  };

  const cancelRequest = () => {
    if (requestTimeout) clearTimeout(requestTimeout);
    setWaiting(false);
    alert("Request cancelled.");
  };

  useEffect(() => {
    return () => {
      if (requestTimeout) clearTimeout(requestTimeout);
    };
  }, [requestTimeout]);

  useEffect(() => {
    if (!userLocation || !selectedDestination || !distance) return;

    const fetchETA = async () => {
      setAiLoading(true);
      setAiETA(null);

      const res = await fetch("/api/eta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distanceKm: distance,
          origin: `${userLocation.lat}, ${userLocation.lng}`,
          destination: destinations[selectedDestination].name,
        }),
      });

      const data = await res.json();

      setAiETA(data.eta || "AI failed.");
      setAiLoading(false);
    };

  fetchETA();
}, [userLocation, selectedDestination, distance]);

  return (
    <div className="container">
      {/* Map Component */}
      <Map 
        onUserLocationChange={handleUserLocationChange}
        selectedDestinationKey={selectedDestination}
        onRouteUpdate={handleRouteUpdate}
      />

      {/* Sidebar */}
      <div className="sidebar">
        {/* Back Button */}
        <div className="section back-button-container">
          <button onClick={() => window.history.back()} className="back-button">←</button>
        </div>

        {/* User Location Section */}
        <div className="section">
          <h3 className="sectionTitle">Your Pick-up Location</h3>
          <div id="userLocationDisplay">
            {userLocation
              ? `Location Set: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
              : "Click on the map to set location"}
          </div>
        </div>

        {/* Destination Selection */}
        <div className="section destination-location">
          <h3 className="sectionTitle">Select Your Destination</h3>
          {Object.entries(destinations).map(([key, dest]) => (
            <div
              key={key}
              onClick={() => handleDestinationClick(key as DestinationKey)}
              className={`location-item ${selectedDestination === key ? "active" : ""}`}
            >
              {dest.name}
            </div>
          ))}
        </div>

        {/* Distance Display */}
        <div className="section">
          <h3 className="sectionTitle">Distance to Destination</h3>
          <p className="distanceText">{distance ? `${distance.toFixed(2)} km` : "-- km"}</p>
        </div>

        {/* Fare Display */}
        <div className="section">
          <h3 className="sectionTitle">Estimated Fare</h3>
          <p className="fareText">{fare ? `₱${fare.toFixed(2)}` : "₱0.00"}</p>
        </div>

        {/* AI ETA Display */}
        <div className="section">
          <h3 className="sectionTitle">AI Estimated Travel Time</h3>

          <div className="eta-display">
            <h4>Estimated Time</h4>
            {aiLoading && <p>Calculating ETA...</p>}
            {aiETA && <p>{aiETA}</p>}
            {!aiLoading && !aiETA && <p>-- ETA unavailable --</p>}
          </div>
        </div>

        {/* Request Button */}
        <button onClick={handleMakeRequest} className="make-request-btn">Request Ride</button>
      </div>

      {/* Waiting Modal */}
      {waiting && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="loader" />
            <h3 style={{ fontSize: "1.3em", marginBottom: 10 }}>Requesting Ride...</h3>
            <p style={{ margin: "0 0 25px 0" }}>Waiting for Rider...</p>
            <button onClick={cancelRequest} className="cancel-button">Cancel Request</button>
          </div>
        </div>
      )}


    </div>
  );
}
