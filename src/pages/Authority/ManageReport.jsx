import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ManageReport() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filterProblem, setFilterProblem] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [commentInputs, setCommentInputs] = useState(() => {
    return JSON.parse(localStorage.getItem("commentInputs")) || {};
  });
  const [scheduleInputs, setScheduleInputs] = useState(() => {
    return JSON.parse(localStorage.getItem("scheduleInputs")) || {};
  });
  const [timeInputs, setTimeInputs] = useState(() => {
    return JSON.parse(localStorage.getItem("timeInputs")) || {};
  });
  const [estimatedDaysInputs, setEstimatedDaysInputs] = useState(() => {
    return JSON.parse(localStorage.getItem("estimatedDaysInputs")) || {};
  });
  const [stats, setStats] = useState({ total: 0, progress: 0, resolved: 0 });
  const [uploadedPhotos, setUploadedPhotos] = useState({});
  const navigate = useNavigate();

  const pastelRed = "#FCA5A5";     // Pending
  const pastelYellow = "#FDE68A";  // In Progress
  const pastelGreen = "#A7F3D0";   // Resolved

  const inputStyle =
    "p-2 rounded bg-black bg-opacity-60 text-white border border-yellow-400";
  const glassCard =
    "bg-black bg-opacity-50 border border-yellow-400 shadow-lg rounded-xl p-6";
  const yellowBtn =
    "px-3 py-2 bg-yellow-400 text-black border border-yellow-400 rounded-md hover:bg-white hover:text-yellow-400 transition-all duration-150 font-semibold";
  const slateBtn =
    "px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-all duration-150";

  const fetchReports = async () => {
    try {
      const res = await axios.get("https://spotnsort-backend.onrender.com/api/reports");
      const all = res.data || [];

      const active = all.filter(
        (r) => r.status === "Pending" || r.status === "In Progress"
      );
      setReports(active);

      const total = all.length;
      const progress = all.filter((r) => r.status === "In Progress").length;
      const resolved = all.filter((r) => r.status === "Resolved").length;
      setStats({ total, progress, resolved });
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let temp = [...reports];

    if (filterProblem) {
      const p = filterProblem.toLowerCase();
      temp = temp.filter(
        (r) =>
          (r.problem && r.problem.toLowerCase() === p) ||
          (r.subtype && r.subtype.toLowerCase() === p)
      );
    }

    if (filterArea) {
      const areaLower = filterArea.toLowerCase().trim();
      temp = temp.filter((r) => {
        const areaFields = [
          r.area || "",
          r.locality || "",
          r.city || "",
          String(r.lat || ""),
          String(r.lng || ""),
        ]
          .map((v) => String(v).toLowerCase())
          .join(" ");
        return areaFields.includes(areaLower);
      });
    }

    setFilteredReports(temp);
  }, [filterProblem, filterArea, reports]);

  const updateReport = async (id, data) => {
    try {
      await axios.put(`https://spotnsort-backend.onrender.com/api/reports/${id}`, data);
      fetchReports();
      alert("Report updated!");
    } catch (err) {
      alert("Failed to update!");
    }
  };

  const openMap = (r) => {
    if (r.lat && r.lng) {
      window.open(`https://www.google.com/maps?q=${r.lat},${r.lng}`, "_blank");
    }
  };

  const handlePhotoUpload = (e, id) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPhotos((prev) => ({ ...prev, [id]: reader.result }));
      alert("Photo selected!");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (r) => {
    if (!uploadedPhotos[r._id]) {
      return alert("Upload a photo first!");
    }

    const combinedDate =
      (scheduleInputs[r._id] || "") + " " + (timeInputs[r._id] || "00:00");

    updateReport(r._id, {
      comment: commentInputs[r._id] || "",
      scheduledAt: combinedDate,
      estimatedDays: estimatedDaysInputs[r._id] || "",
      resolvedPic: uploadedPhotos[r._id],
      status: "Resolved",
    });
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[url('/assets/home-bg.jpg')] bg-cover bg-center text-white pt-24">

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50">
        <nav className="flex justify-between items-center px-8 py-4 bg-black bg-opacity-40 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/authority/home")} className={yellowBtn}>
              ←
            </button>
            <h1
              className="text-3xl font-extrabold text-yellow-400 cursor-pointer"
              onClick={() => navigate("/authority/home")}
            >
              Manage Civic Reports
            </h1>
          </div>
        </nav>
      </header>

      {/* CONTENT */}
      <div className="p-6 max-w-6xl mx-auto">

        {/* STATS */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 mt-6">
          <div className="px-4 py-2 rounded-xl shadow" style={{ background: pastelRed, color: "#000" }}>
            Total Reports: <b>{stats.total}</b>
          </div>
          <div className="px-4 py-2 rounded-xl shadow" style={{ background: pastelYellow, color: "#000" }}>
            In Progress: <b>{stats.progress}</b>
          </div>
          <div className="px-4 py-2 rounded-xl shadow" style={{ background: pastelGreen, color: "#000" }}>
            Resolved: <b>{stats.resolved}</b>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-10 justify-center">
          <select
            value={filterProblem}
            onChange={(e) => setFilterProblem(e.target.value)}
            className={inputStyle}
            style={{ minWidth: 220 }}
          >
            <option value="">-- Problem Type --</option>
            <option value="Garbage">Garbage</option>
            <option value="Street Lights">Street Lights</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Trees">Trees</option>
            <option value="Potholes">Potholes</option>
            <option value="Traffic Congestion">Traffic Congestion</option>
            <option value="Lack of Public Amenities">Lack of Public Amenities</option>
          </select>

          <input
            type="text"
            placeholder="Filter by Area / Lat / Lng"
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className={inputStyle}
            style={{ minWidth: 260 }}
          />

          <button className={slateBtn}>Use Current Location</button>
          <button
            onClick={() => {
              setFilterProblem("");
              setFilterArea("");
            }}
            className={slateBtn}
          >
            Clear Filters
          </button>
        </div>

        {/* REPORT CARDS */}
        {filteredReports.length === 0 ? (
          <p className="text-center text-gray-300">No pending reports found.</p>
        ) : (
          filteredReports.map((r) => (
            <div key={r._id} className={glassCard}>
              
              <h2 className="text-2xl font-semibold mb-2">{r.problem}</h2>
              <p><b>Category:</b> {r.subtype}</p>
              <p><b>Area:</b> {r.area}</p>
              <p><b>Status:</b> {r.status}</p>
              <p><b>Description:</b> {r.description}</p>

              {r.photo && (
                <img
                  src={r.photo}
                  alt="Reported"
                  className="mt-3 rounded max-w-xs border"
                />
              )}

              <div className="mt-4 flex flex-col gap-3">

                <button className={slateBtn} onClick={() => openMap(r)}>
                  View Map
                </button>

                <input
                  type="text"
                  placeholder="Add Comment"
                  value={commentInputs[r._id] || ""}
                  onChange={(e) =>
                    setCommentInputs((p) => ({ ...p, [r._id]: e.target.value }))
                  }
                  className="p-2 rounded bg-white text-black border border-yellow-400"
                />

                <div className="flex gap-2">
                  <input
                    type="date"
                    min={minDate}
                    value={scheduleInputs[r._id] || ""}
                    onChange={(e) =>
                      setScheduleInputs((p) => ({ ...p, [r._id]: e.target.value }))
                    }
                    className="p-2 rounded bg-white text-black border border-yellow-400 text-sm"
                  />
                  <input
                    type="time"
                    value={timeInputs[r._id] || ""}
                    onChange={(e) =>
                      setTimeInputs((p) => ({ ...p, [r._id]: e.target.value }))
                    }
                    className="p-2 rounded bg-white text-black border border-yellow-400 text-sm"
                  />
                </div>

                <input
                  type="number"
                  placeholder="Estimated Days"
                  min={1}
                  value={estimatedDaysInputs[r._id] || ""}
                  onChange={(e) =>
                    setEstimatedDaysInputs((p) => ({ ...p, [r._id]: e.target.value }))
                  }
                  className="p-2 rounded bg-white text-black border border-yellow-400"
                />

                <label className="cursor-pointer px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded text-white text-sm shadow-md">
                  📸 Upload Photo
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, r._id)}
                  />
                </label>

                <button
                  className={yellowBtn}
                  onClick={() =>
                    updateReport(r._id, {
                      status: "In Progress",
                    })
                  }
                >
                  Mark In Progress
                </button>

                <button
                  style={{ background: pastelGreen }}
                  className="px-3 py-2 rounded-md text-black hover:bg-white hover:text-yellow-400 border border-yellow-400 transition-all duration-150"
                  onClick={() => handleSubmit(r)}
                >
                  Submit (Resolve)
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
