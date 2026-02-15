// src/pages/ReportForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaUpload } from "react-icons/fa";
import BubblesBackground from "../../components/BubblesBackground";

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

  // ✅ Load user info from localStorage when page opens
  useEffect(() => {
    const cur = JSON.parse(localStorage.getItem("spotnsort_current_user"));
    if (!cur) {
      navigate("/login");
    } else {
      setUser(cur);
      setName(cur.name || "");
      setPhone(cur.phone || ""); // ✅ Auto-fill phone if present
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

  const handleAreaChange = (e) => {
    const value = e.target.value;
    setArea(value);
    if (!useCurrentLocation) {
      setLat(null);
      setLng(null);
    }
  };

  const handleLocationCheckbox = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported. Please enter manually.");
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
        alert("Unable to fetch current location. Please enter manually.");
        setUseCurrentLocation(false);
        setLat(null);
        setLng(null);
      }
    } else {
      setUseCurrentLocation(false);
      setLat(null);
      setLng(null);
      setArea("");
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera not supported.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setStreaming(true);
    } catch (err) {
      alert("Could not access camera: " + err.message);
    }
  };

  const capturePhoto = () => {
    if (!streaming) return;
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, width, height);
    setPhotoData(canvasRef.current.toDataURL("image/jpeg", 0.9));
    videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    videoRef.current.srcObject = null;
    setStreaming(false);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoData(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!problem || !subtype || !priority || !description || !area || !photoData) {
      alert("Please fill all mandatory fields and provide a photo.");
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
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("https://spotnsort-backend.onrender.com/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });

      if (!res.ok) throw new Error("Failed to submit report");

      alert("Report submitted successfully!");
      setProblem("");
      setSubtype("");
      setPriority("");
      setDescription("");
      setPhotoData(null);
      if (!useCurrentLocation) setArea("");
      setLat(null);
      setLng(null);
      navigate("/user/home");
    } catch (err) {
      console.error(err);
      alert("Error submitting report. Try again.");
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-y-auto scroll-smooth">
      <BubblesBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50">
        <nav className="flex items-center px-8 py-4 bg-black bg-opacity-40 backdrop-blur-sm shadow-md">
          <button
            onClick={() => navigate("/user/home")}
            className="text-black text-2xl font-bold hover:scale-110 transition bg-yellow-400 px-3 py-1 rounded-md border border-yellow-500 mr-4"
          >
            ←
          </button>
          <h1 className="text-3xl font-extrabold text-yellow-400">Report an Issue</h1>
        </nav>
      </header>

      <section className="pt-32 pb-24 px-6 w-full max-w-3xl mx-auto relative z-10">
        <form
          onSubmit={submit}
          className="flex flex-col gap-4 bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/10"
        >
          {/* Problem & Subtype */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={problem}
              onChange={(e) => {
                setProblem(e.target.value);
                setSubtype("");
              }}
              className="p-3 rounded bg-transparent border border-gray-400 text-white"
              required
            >
              <option value="">-- Select Problem --</option>
              {problemOptions.map((p, i) => (
                <option key={i} value={p.label}>{p.label}</option>
              ))}
            </select>

            <select
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
              className="p-3 rounded bg-transparent border border-gray-400 text-white"
              required
            >
              <option value="">-- Select Subtype --</option>
              {problemOptions.find((p) => p.label === problem)?.subtypes.map((st, idx) => (
                <option key={idx} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="p-3 rounded bg-transparent border border-gray-400 text-white"
            required
          >
            <option value="">Select Priority</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          {/* Description */}
          <textarea
            placeholder="Description"
            className="p-3 rounded bg-transparent border border-gray-400 text-white"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* ✅ Name & Auto-filled editable Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your Name"
              className="p-3 rounded bg-transparent border border-gray-400 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone (10 digits)"
              className="p-3 rounded bg-transparent border border-gray-400 text-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              maxLength={10}
              required
            />
          </div>

          {/* Area */}
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              placeholder="Area / Locality"
              className="p-3 rounded bg-transparent border border-gray-400 text-white flex-1"
              value={area}
              onChange={handleAreaChange}
              required
              disabled={useCurrentLocation}
            />
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={useCurrentLocation} onChange={handleLocationCheckbox} />
              Use current location
            </label>
          </div>

          {lat && lng && (
            <span className="text-sm ml-auto text-gray-300">
              Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
            </span>
          )}

          {/* Photo Upload */}
          <div>
            <label className="block font-semibold mb-1">Upload / Capture Photo (Mandatory)</label>
            <div className="flex gap-3 items-center mb-3">
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="fileInput"/>
              <button
                type="button"
                className="px-3 py-2 bg-yellow-400 text-black rounded flex items-center gap-2"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <FaUpload/> Upload
              </button>
              {!streaming ? (
                <button
                  type="button"
                  className="px-3 py-2 bg-yellow-400 text-black rounded flex items-center gap-2"
                  onClick={startCamera}
                >
                  <FaCamera/> Open Camera
                </button>
              ) : (
                <button
                  type="button"
                  className="px-3 py-2 bg-green-600 text-white rounded"
                  onClick={capturePhoto}
                >
                  Capture
                </button>
              )}
              {streaming && (
                <button type="button" className="px-3 py-2 border rounded text-white" onClick={stopCamera}>
                  Stop
                </button>
              )}
            </div>
            <video ref={videoRef} className="w-full rounded border mb-2" style={{display: streaming ? 'block' : 'none'}} />
            <canvas ref={canvasRef} style={{display: 'none'}} />
            {photoData ? (
              <img src={photoData} alt="preview" className="w-full rounded border"/>
            ) : (
              <div className="w-full h-40 rounded border flex items-center justify-center text-gray-400">
                No photo yet
              </div>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-yellow-400 text-black rounded-full font-bold hover:scale-105 transition"
          >
            Submit Report
          </button>
        </form>
      </section>
    </div>
  );
}