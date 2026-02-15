import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Custom arrow marker (place arrow-marker.png in /public)
const arrowIcon = new L.Icon({
  iconUrl: "/arrow-marker.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// ✅ Helper component to fix map resizing issue
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // Invalidate map size after short delay to ensure full render
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [map]);
  return null;
}

export default function ReportsMap({ role }) {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");

  const telanganaBounds = [
    [15.895, 77.156],
    [19.458, 81.676],
  ];
  const telanganaCenter = [17.5868, 78.1134];

  // Fetch reports
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
    const interval = setInterval(fetchReports, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const getColor = (status) => (status === "Resolved" ? "green" : "red");
  const displayedReports = reports.filter((r) =>
    filter === "all" ? true : r.problem === filter
  );

  return (
    <div className="relative min-h-screen text-white bg-[url('/assets/home-bg.jpg')] bg-cover bg-center bg-no-repeat">
      {/* ✅ Fixed Header */}
      <header className="fixed top-0 left-0 w-full z-50">
        <nav className="flex justify-between items-center px-8 py-4 bg-black bg-opacity-40 backdrop-blur-sm shadow-md">
          {/* Back Button + Title */}
          <div className="flex items-center gap-4">
            <button
  onClick={() => navigate("/user/home")}
  className="text-black text-2xl font-bold hover:scale-110 transition bg-yellow-400 px-3 py-1 rounded-md border border-yellow-500"
>
  ←
</button>

            <h1 className="text-3xl font-extrabold text-yellow-400">
              Telangana Reports Map
            </h1>
          </div>

          {/* Filter Dropdown */}
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 rounded bg-black bg-opacity-60 border border-yellow-400 text-yellow-300 focus:outline-none"
            >
              <option value="all">All Problems</option>
              <option value="Garbage">Garbage</option>
              <option value="Street Lights">Street Lights</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Trees">Trees</option>
              <option value="Potholes">Potholes</option>
              <option value="Traffic Congestion">Traffic Congestion</option>
              <option value="Public Amenities">Public Amenities</option>
            </select>
          </div>
        </nav>
      </header>

      {/* ✅ Fullscreen Map Section */}
      <div className="pt-20 w-full h-[calc(100vh-5rem)]">
        <MapContainer
          center={telanganaCenter}
          zoom={7.5}
          scrollWheelZoom={true}
          className="w-full h-full rounded-xl shadow-lg"
          maxBounds={telanganaBounds}
          maxBoundsViscosity={1.0}
        >
          {/* Fix resizing on first load */}
          <MapResizer />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Markers + Circles */}
          {displayedReports.map(
            (r) =>
              r.lat &&
              r.lng && (
                <React.Fragment key={r._id}>
                  <Marker position={[r.lat, r.lng]} icon={arrowIcon}>
                    <Popup className="bg-black text-white p-2 rounded-lg">
                      <strong>Problem:</strong> {r.problem} <br />
                      <strong>Subtype:</strong> {r.subtype} <br />
                      <strong>Priority:</strong> {r.priority} <br />
                      <strong>Description:</strong> {r.description} <br />
                      <strong>Status:</strong>{" "}
                      <span
                        className={
                          r.status === "Resolved"
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {r.status}
                      </span>
                      <br />
                      {r.name && (
                        <>
                          <strong>Reported by:</strong> {r.name} <br />
                        </>
                      )}
                    </Popup>
                    <Tooltip>{r.problem}</Tooltip>
                  </Marker>

                  <CircleMarker
                    center={[r.lat, r.lng]}
                    radius={12}
                    color={getColor(r.status)}
                    fillOpacity={0.3}
                  />
                </React.Fragment>
              )
          )}
        </MapContainer>
      </div>
    </div>
  );
}
