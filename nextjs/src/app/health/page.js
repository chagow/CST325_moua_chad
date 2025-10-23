'use client';
import { useEffect, useState } from "react";

export default function HealthCheck() {
  const apiUrl = "http://localhost:8000/api/health";
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setHealthData(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>API Health Check</h1>
      <p>Checking health status at: {apiUrl}</p>
      {loading && <p>Loading...</p>}
      {error && <p style={{color: "red"}}>Error: {error}</p>}
      {healthData && (
        <pre>{JSON.stringify(healthData, null, 2)}</pre>
      )}
    </div>
  );
}