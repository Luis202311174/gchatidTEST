"use client";

import { useState, useEffect } from "react";
import Map from "@/components/Map";

export default function PickupPage() {
  const [selected, setSelected] = useState<string>("main");
  const [waiting, setWaiting] = useState(false);
  const [fare, setFare] = useState<string>("₱50.00");

  useEffect(() => {
    const base = 50;
    const extra = selected === "annex" ? 20 : 0;
    setFare(`₱${(base + extra).toFixed(2)}`);
  }, [selected]);

  const toggle = (k: string) => setSelected(k);

  const makeRequest = () => {
    setWaiting(true);
    const req = { id: Date.now(), type: "pickup", location: selected, fare, timestamp: new Date().toISOString() };
    const q = JSON.parse(localStorage.getItem("all_requests_queue") || "[]");
    q.push(req);
    localStorage.setItem("all_requests_queue", JSON.stringify(q));
    setTimeout(() => {
      setWaiting(false);
      alert("Request queued — rider will be assigned shortly.");
    }, 2000);
  };

  return (
    <div className="container">
      <Map onUserLocationChange={() => {}} selectedDestinationKey={null} />

      <div className="sidebar">
        <div className="back-button-container">
          <button className="back-button" onClick={() => window.history.back()}>←</button>
        </div>

        <div className="section pick-up-location">
          <h3 className="sectionTitle">Pick-up</h3>
          <div className={`location-item ${selected === "main" ? "active" : ""}`} onClick={() => toggle("main")}>On Gordon College</div>
          <div className={`location-item ${selected === "annex" ? "active" : ""}`} onClick={() => toggle("annex")}>On Gordon College Annex</div>
          <div className={`location-item ${selected === "outside" ? "active" : ""}`} onClick={() => toggle("outside")}>Outside School Campus</div>
        </div>

        <div className="request-section">
          <div className="fare-display">
            <h3>Estimated Fare</h3>
            <p>{fare}</p>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="make-request-btn" onClick={makeRequest}>Get Rider</button>
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
    </div>
  );
}
