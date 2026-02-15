// src/pages/Authority/Analytics.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const Analytics = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      const res = await axios.get("https://spotnsort-backend.onrender.com/api/reports");
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();

    // Optional: poll every 5 seconds for updates
    const interval = setInterval(fetchReports, 5000);

    return () => clearInterval(interval);
  }, []);

  // Prepare data for charts
  const statusData = [
    { name: "Pending", value: reports.filter((r) => r.status !== "Resolved").length },
    { name: "Resolved", value: reports.filter((r) => r.status === "Resolved").length },
  ];

  const problemTypes = [...new Set(reports.map((r) => r.problem))];
  const problemData = problemTypes.map((type) => ({
    name: type,
    value: reports.filter((r) => r.problem === type).length,
  }));

  const COLORS = ["#FF8042", "#00C49F", "#0088FE", "#FFBB28", "#A28EFF"];

  return (
    <div className="relative min-h-screen text-white">
      <header className="fixed top-0 left-0 w-full z-50">
        <nav className="flex justify-between items-center px-10 py-4 bg-black bg-opacity-40 backdrop-blur-sm shadow-md">
          {/* Arrow to go back home */}
          <div className="flex items-center gap-4">
            <button
              className="text-black text-2xl font-bold hover:scale-110 transition"
              onClick={() => navigate("/authority/home")}
            >
              ←
            </button>
            <h1
              className="text-3xl font-extrabold text-yellow-400 cursor-pointer"
              onClick={() => navigate("/authority/home")}
            >
              SpotnSort Analytics
            </h1>
          </div>
        </nav>
      </header> 

      <main className="pt-32 px-6 pb-24 max-w-6xl mx-auto space-y-16">
        {/* Pie Chart for Status */}
        <section className="bg-black bg-opacity-70 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Reports by Status</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </section>

        {/* Bar Chart for Problem Types */}
        <section className="bg-black bg-opacity-70 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Reports by Problem Type</h2>
          <BarChart width={600} height={300} data={problemData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </section>

        {/* Recent Reports with Resolved Images */}
        <section className="bg-black bg-opacity-70 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Recent Reports</h2>
          {reports.length === 0 && <p>No reports available.</p>}
          {reports
            .slice(-5)
            .reverse()
            .map((r) => (
              <div
                key={r._id} // use backend's report _id
                className="border-2 border-gray-600 rounded p-2 mb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div>
                    <p>
                      <strong>{r.problem}</strong> - {r.subtype}
                    </p>
                    <p>
                      <small>Reported by: {r.name || r.userName} ({r.userEmail})</small>
                    </p>
                    <p>
                      <small>Status: {r.status}</small>
                    </p>
                    {r.comment && <p><small>Comment: {r.comment}</small></p>}
                  </div>
                  {r.resolvedPic && (
                    <img
                      src={r.resolvedPic}
                      alt="Resolved"
                      className="rounded max-w-xs border-2 border-green-400"
                    />
                  )}
                </div>
                <p className="text-sm">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
            ))}
        </section>
      </main>
    </div>
  );
};

export default Analytics;
