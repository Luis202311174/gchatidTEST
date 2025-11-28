"use client";

import { useState, useEffect } from "react";
import Map, { destinations } from "@/components/Map";

export default function PahatidPage() {
  const [selectedLocation, setSelectedLocation] = useState<"main" | "annex">("main");
  const [description, setDescription] = useState("");
  const [estimatedFare, setEstimatedFare] = useState<string>("₱50.00");
  const [waiting, setWaiting] = useState(false);
  const [riderFound, setRiderFound] = useState(false);

  useEffect(() => {
    // Simple fare calculation similar to the HTML version (placeholder)
    const base = 50;
    let extra = 0;
    if (selectedLocation === "annex") extra = 20;
    const fare = (base + extra).toFixed(2);
    setEstimatedFare(`₱${fare}`);
  }, [selectedLocation]);

  const toggleLocation = (key: "main" | "annex") => {
    setSelectedLocation(key);
  };

  const handleMakeRequest = () => {
    setWaiting(true);

    const req = {
      id: Date.now(),
      type: "pahatid",
      location: selectedLocation,
      description,
      fare: estimatedFare,
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    const queue = JSON.parse(localStorage.getItem("all_requests_queue") || "[]");
    queue.push(req);
    localStorage.setItem("all_requests_queue", JSON.stringify(queue));

    const t = setTimeout(() => {
      setWaiting(false);
      setRiderFound(true);
      setTimeout(() => setRiderFound(false), 3500);
      clearTimeout(t);
    }, 2500);
  };

  return (
    <div className="container">
      <Map onUserLocationChange={() => {}} selectedDestinationKey={null} />

      <div className="sidebar">
        <div className="back-button-container">
          <button className="back-button" onClick={() => window.history.back()}>←</button>
        </div>

        <div className="section pick-up-location">
          <h3 className="sectionTitle">Choose Pick-up Location</h3>
          <div
            className={`location-item ${selectedLocation === "main" ? "active" : ""}`}
            onClick={() => toggleLocation("main")}
          >
            Gordon College Main Campus
          </div>
          <div
            className={`location-item ${selectedLocation === "annex" ? "active" : ""}`}
            onClick={() => toggleLocation("annex")}
          >
            Gordon College ANNEX Campus
          </div>
        </div>

        <div className="section description-box">
          <h3 className="sectionTitle">Ride Description</h3>
          <textarea
            id="rideDescription"
            placeholder="Add details (optional), e.g. pickup landmark, items..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="request-section">
          <div className="fare-display">
            <h3>Estimated Fare</h3>
            <p id="estimatedFare">{estimatedFare}</p>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="make-request-btn" onClick={handleMakeRequest}>Request Ride</button>
          </div>
        </div>
      </div>

      {waiting && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="loader" />
            <h3>Requesting Ride...</h3>
            <p id="waitingMessage">Waiting for Rider...</p>
            <button className="cancel-btn-style" onClick={() => setWaiting(false)}>Cancel</button>
          </div>
        </div>
      )}

      {riderFound && (
        <div id="riderFoundNotification" className="visible">
          <p style={{ fontSize: "1.1em", margin: 0, fontWeight: "bold" }}>Rider is on its way!</p>
          <p style={{ fontSize: "0.9em", margin: "5px 0 0" }}>Check your status on the map.</p>
        </div>
      )}
    </div>
  );
}
