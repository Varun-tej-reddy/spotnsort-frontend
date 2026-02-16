// frontend/src/pages/User/ReportForm.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaUpload } from "react-icons/fa";
import BubblesBackground from "../../components/BubblesBackground";
import { API_BASE_URL } from "../../config";   // ✅ USE CONFIG

export default function ReportForm() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [problem, setProblem] = useState("");
  const [subtype, setSubtype] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [user, setUser] = useState(null);

  const problemOptions = [
    { label: "Garbage", subtypes: ["Overflow", "Illegal dumping", "Odor issues"] },
    { label: "Street Lights", subtypes: ["Not working", "Flickering", "Broken pole"] },
    { label: "Water Leakage", subtypes: ["Drainage", "Water management", "Plumbing"] },
    { label: "Trees", subtypes: ["Fallen tree", "Disease", "Obstruction"] },
    { label: "Potholes", subtypes: ["Small", "Medium", "Large"] },
    { label: "Traffic Congestion", subtypes: ["Peak hours", "Accident prone area", "Signal issues"] },
    { label: "Public Amenities", subtypes: ["Benches", "Public toilets", "Bus shelters"] },
  ];

  // Load logged user
  useEffect(() => {
    const cur = JSON.parse(localStorage.getItem("spotnsort_current_user"));
    if (!cur) {
      navigate("/login");
    } else {
      setUser(cur);
      setName(cur.name || "");
      setPhone(cur.phone || "");
    }
  }, [navigate]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoData(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLocationCheckbox = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setArea(
          `Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`
        );
        setUseCurrentLocation(true);
      },
      () => alert("Location permission denied.")
    );
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!problem || !subtype || !priority || !description || !area || !photoData) {
      alert("Please fill all required fields.");
      return;
    }

    const newReport = {
      userEmail: user.email,
      problem,
      subtype,
      priority,
      description,
      name,
      phone,
      area,
      lat,
      lng,
      photo: photoData,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {   // ✅ FIXED
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        throw new Error("Failed to submit report");
      }

      alert("Report submitted successfully!");
      navigate("/user/home");

    } catch (err) {
      console.error("Report error:", err);
      alert("Error submitting report.");
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <BubblesBackground />

      <section className="pt-32 pb-24 px-6 w-full max-w-3xl mx-auto">
        <form onSubmit={submit} className="flex flex-col gap-4 bg-white bg-opacity-10 p-8 rounded-2xl">

          <select value={problem} onChange={(e) => setProblem(e.target.value)} required>
            <option value="">Select Problem</option>
            {problemOptions.map((p, i) => (
              <option key={i} value={p.label}>{p.label}</option>
            ))}
          </select>

          <select value={subtype} onChange={(e) => setSubtype(e.target.value)} required>
            <option value="">Select Subtype</option>
            {problemOptions.find((p) => p.label === problem)?.subtypes.map((st, i) => (
              <option key={i} value={st}>{st}</option>
            ))}
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
            <option value="">Priority</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
          />

          <label>
            <input type="checkbox" onChange={handleLocationCheckbox} />
            Use Current Location
          </label>

          <input type="file" accept="image/*" onChange={handleFile} required />

          {photoData && <img src={photoData} alt="preview" className="w-full rounded" />}

          <button type="submit" className="bg-yellow-400 text-black p-3 rounded">
            Submit Report
          </button>

        </form>
      </section>
    </div>
  );
}