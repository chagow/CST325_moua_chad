'use client';
import { useState } from "react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setEmail("");
        setPassword("");
      } else {
        if (data.detail === "Email already registered") {
          setError("This email is already registered. Please use another.");
        } else {
          setError(data.detail || "Signup failed.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Signup form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          aria-describedby="emailError"
        />
      </div>
      <div>
        <label htmlFor="password">Password (min 8 characters)</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          aria-describedby="passwordError"
        />
      </div>
      <button type="submit" disabled={!email || password.length < 8}>
        Sign Up
      </button>
      <div aria-live="polite" style={{ color: "red" }} id="emailError">
        {error}
      </div>
      <div aria-live="polite" style={{ color: "green" }}>
        {success}
      </div>
    </form>
  );
}