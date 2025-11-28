"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple validation: check for Gmail address
    if (!email.endsWith("@gmail.com")) {
      setError("Please use a Gmail address");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    // On success, redirect to options page
    router.push("/options");
  };

  return (
    <div className="landing-body">
      <img src="/bike.png" alt="Bike" className="bike-bg" />
      <div className="logo">
        <img src="/GCHatid_Logo.png" alt="GCHatid Logo" />
      </div>
      <div className="circle"></div>
      <div className="landing-container">
        <div className="landing-title">WELCOME!</div>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              className="input-field"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: "#ff6b6b", textAlign: "center" }}>{error}</p>}
          <button type="submit" className="login-btn">
            LOGIN
          </button>
        </form>
        <div className="admin-link">
          <a href="#" onClick={(e) => {e.preventDefault(); router.push("/admin");}}>Admin Login</a>
        </div>
      </div>
    </div>
  );
}
