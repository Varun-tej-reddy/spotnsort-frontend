// frontend/src/pages/User/ReportForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaUpload } from "react-icons/fa";
import BubblesBackground from "../../components/BubblesBackground";
import { API_BASE_URL } from "../../config";

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
    { label: "Potholes", subtypes: ["Small", "Medium", "Large"] }
  ];

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

  // ===== LOCATION =====
  const handleLocationCheckbox = async () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    if (!useCurrentLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setArea(`Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`);
          setUseCurrentLocation(true);
        },
        () => alert("Unable to fetch location")
      );
    } else {
      setUseCurrentLocation(false);
      setLat(null);
      setLng(null);
      setArea("");
    }
  };

  // ===== CAMERA =====
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch {
      alert("Camera access denied");
    }
  };

  const capturePhoto = () => {
    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const image = canvasRef.current.toDataURL("image/jpeg");
    setPhotoData(image);

    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    setStreaming(false);
  };

  const handleFile = (e) => {
    const reader = new FileReader();
    reader.onload = () => setPhotoData(reader.result);
    reader.readAsDataURL(e.target.files[0]);
  };

  // ===== SUBMIT =====
  const submit = async (e) => {
    e.preventDefault();

    if (!problem || !subtype || !priority || !description || !area || !photoData) {
      return alert("Please fill all required fields");
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
      photo: photoData
    };

    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport)
      });

      if (!res.ok) throw new Error();

      alert("Report submitted successfully!");
      navigate("/user/home");
    } catch {
      alert("Error submitting report");
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <BubblesBackground />

      <div className="pt-28 px-6 max-w-3xl mx-auto">
        <form onSubmit={submit} className="flex flex-col gap-4">

          <select value={problem} onChange={(e) => { setProblem(e.target.value); setSubtype(""); }} required>
            <option value="">Select Problem</option>
            {problemOptions.map((p, i) => (
              <option key={i} value={p.label}>{p.label}</option>
            ))}
          </select>

          <select value={subtype} onChange={(e) => setSubtype(e.target.value)} required>
            <option value="">Select Subtype</option>
            {problemOptions.find((p) => p.label === problem)?.subtypes.map((s, i) => (
              <option key={i}>{s}</option>
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

          <input
            type="text"
            placeholder="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            disabled={useCurrentLocation}
            required
          />

          <label>
            <input type="checkbox" checked={useCurrentLocation} onChange={handleLocationCheckbox} />
            Use Current Location
          </label>

          {/* PHOTO */}
          <div className="flex gap-3">
            <input type="file" accept="image/*" onChange={handleFile} hidden id="fileInput" />
            <button type="button" onClick={() => document.getElementById("fileInput").click()}>
              <FaUpload /> Upload
            </button>
            {!streaming ? (
              <button type="button" onClick={startCamera}>
                <FaCamera /> Camera
              </button>
            ) : (
              <button type="button" onClick={capturePhoto}>
                Capture
              </button>
            )}
          </div>

          <video ref={videoRef} autoPlay style={{ display: streaming ? "block" : "none" }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {photoData && <img src={photoData} alt="preview" />}

          <button type="submit">Submit Report</button>
        </form>
      </div>
    </div>
  );
}