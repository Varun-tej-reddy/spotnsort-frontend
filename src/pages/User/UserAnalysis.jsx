// src/pages/User/UserAnalysis.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import BubblesBackground from "../../components/BubblesBackground";

export default function UserAnalysis() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ total: 0, progress: 0, resolved: 0 });
  const [submissions, setSubmissions] = useState([]);

  const loadReports = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("spotnsort_current_user"));
      if (!user) return;

      const res = await fetch("https://spotnsort-backend.onrender.com/api/reports");
      const all = await res.json();
      const userReports = all.filter((r) => r.userEmail === user.email);

      setSubmissions(userReports);

      const total = userReports.length;
      const progress = userReports.filter((r) => r.status === "In Progress").length;
      const resolved = userReports.filter((r) => r.status === "Resolved").length;

      setSummary({ total, progress, resolved });
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRating = async (id, rating) => {
    try {
      await fetch(`https://spotnsort-backend.onrender.com/api/reports/${id}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      loadReports();
    } catch (err) {
      console.error("Rating update failed:", err);
    }
  };

  // ✔ SOFT COLORS — SAFE FOR DARK BACKGROUND
const COLORS = ["#d36f50ff", "#f3e562ff", "#22C55E"];

  const pending = summary.total - summary.progress - summary.resolved;

  // ✔ Correct order maintained
  const pieData = [
    { name: "Pending", value: pending },
    { name: "In Progress", value: summary.progress },
    { name: "Resolved", value: summary.resolved },
  ];

  const formatDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    return dt.toLocaleString();
  };

  return (
    <div className="relative min-h-screen text-white">
      <BubblesBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50">
        <nav className="flex justify-between items-center px-8 py-4 bg-black bg-opacity-40 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/user/home")}
              className="text-black text-2xl font-bold hover:scale-110 transition bg-yellow-400 px-3 py-1 rounded-md border border-yellow-500"
            >
              ←
            </button>
            <h1 className="text-3xl font-extrabold text-yellow-400">
              Your Civic Issue Analysis
            </h1>
          </div>
        </nav>
      </header>

      <main className="pt-24 p-6">

        {/* SUMMARY CARDS — Soft pastel colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <div className="p-4 rounded text-center" style={{ background: "#d36f50ff" }}>
            <h2 className="text-black font-semibold">Pending</h2>
            <p className="text-2xl font-bold text-black">{pending}</p>
          </div>

          <div className="p-4 rounded text-center" style={{ background: "#f3e562ff" }}>
            <h2 className="text-black font-semibold">In Progress</h2>
            <p className="text-2xl font-bold text-black">{summary.progress}</p>
          </div>

          <div className="p-4 rounded text-center" style={{ background: "#22C55E" }}>
            <h2 className="text-black font-semibold">Resolved</h2>
            <p className="text-2xl font-bold text-black">{summary.resolved}</p>
          </div>

        </div>

        {/* PIE CHART — Colors match summary */}
        <div className="flex justify-center mb-6">
          <PieChart width={350} height={300}>
            <Pie data={pieData} dataKey="value" outerRadius={100}>
              {pieData.map((e, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* USER REPORTS */}
        <div className="bg-black bg-opacity-50 p-6 rounded-lg">
          <h2 className="text-xl text-yellow-400 mb-4">My Reports</h2>

          {submissions.length === 0 ? (
            <p>No reports found.</p>
          ) : (
            submissions.map((r) => (
              <div key={r._id} className="p-4 border-b border-gray-700 mb-4">
                <h3 className="text-lg font-semibold">{r.problem}</h3>
                <p>{r.description}</p>
                <p>Status: {r.status}</p>
                <p>Submitted: {formatDate(r.createdAt)}</p>

                {r.comment && <p>Comment: {r.comment}</p>}
                {r.scheduledAt && <p>Scheduled: {formatDate(r.scheduledAt)}</p>}

                {r.resolvedPic && (
                  <img
                    src={r.resolvedPic}
                    alt="Resolved"
                    className="mt-2 rounded-lg max-h-48"
                  />
                )}

                {r.status === "Resolved" && (
                  <div className="mt-2">
                    <span>Rate this work:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`ml-2 px-2 py-1 rounded ${
                          r.userRating >= star
                            ? "bg-yellow-400 text-black"
                            : "bg-gray-700 text-white"
                        }`}
                        onClick={() => handleRating(r._id, star)}
                      >
                        {star}★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
