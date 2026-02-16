// src/pages/User/ReportForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaUpload } from "react-icons/fa";
import BubblesBackground from "../../components/BubblesBackground";
import { API_BASE_URL } from "../../config";   // ✅ IMPORTANT

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
    { label: "Lack of Public Amenities", subtypes: ["Benches", "Public toilets", "Bus shelters"] },
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

  const geocodeArea = async (areaName) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          areaName + ", Telangana, India"
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      } else {
        alert("Could not find coordinates for this area.");
        return null;
      }
    } catch {
      alert("Geocoding failed.");
      return null;
    }
  };

  const handleLocationCheckbox = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    if (!useCurrentLocation) {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
        );
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setArea(`Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`);
        setUseCurrentLocation(true);
      } catch {
        alert("Unable to fetch location.");
      }
    } else {
      setUseCurrentLocation(false);
      setLat(null);
      setLng(null);
      setArea("");
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoData(reader.result);
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setStreaming(true);
    } catch {
      alert("Camera not accessible.");
    }
  };

  const capturePhoto = () => {
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, width, height);
    setPhotoData(canvasRef.current.toDataURL("image/jpeg", 0.9));
    videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    setStreaming(false);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!problem || !subtype || !priority || !description || !area || !photoData) {
      alert("Fill all required fields.");
      return;
    }

    let finalLat = lat;
    let finalLng = lng;

    if (!useCurrentLocation) {
      const coords = await geocodeArea(area);
      if (!coords) return;
      finalLat = coords.lat;
      finalLng = coords.lng;
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
      lat: finalLat,
      lng: finalLng,
      photo: photoData,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {   // ✅ FIXED HERE
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });

      if (!res.ok) throw new Error();

      alert("Report submitted successfully!");
      navigate("/user/home");
    } catch {
      alert("Error submitting report.");
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-y-auto">
      <BubblesBackground />

      <section className="pt-32 pb-24 px-6 w-full max-w-3xl mx-auto relative z-10">
        <form onSubmit={submit} className="flex flex-col gap-4 bg-white/10 p-8 rounded-2xl">

          <select value={problem} onChange={(e) => { setProblem(e.target.value); setSubtype(""); }} required>
            <option value="">-- Select Problem --</option>
            {problemOptions.map((p, i) => (
              <option key={i} value={p.label}>{p.label}</option>
            ))}
          </select>

          <select value={subtype} onChange={(e) => setSubtype(e.target.value)} required>
            <option value="">-- Select Subtype --</option>
            {problemOptions.find((p) => p.label === problem)?.subtypes.map((st, i) => (
              <option key={i} value={st}>{st}</option>
            ))}
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
            <option value="">Select Priority</option>
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

          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            required
          />

          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            disabled={useCurrentLocation}
            required
          />

          <label>
            <input type="checkbox" checked={useCurrentLocation} onChange={handleLocationCheckbox} />
            Use current location
          </label>

          <input type="file" accept="image/*" onChange={handleFile} required />

          <button type="submit" className="bg-yellow-400 text-black font-bold p-3 rounded">
            Submit Report
          </button>

        </form>
      </section>
    </div>
  );
}