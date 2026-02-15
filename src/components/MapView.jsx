import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issues with React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapView({ reports = [], center = [17.385044, 78.486671], zoom = 7 }) {
  return (
    <div className="rounded-lg shadow-md">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((r) => {
          // Assuming location is "lat,lng" string
          const [lat, lng] = r.location.split(",").map(Number);
          return (
            <Marker key={r._id} position={[lat, lng]}>
              <Popup>
                <p><b>Category:</b> {r.category}</p>
                <p>{r.description}</p>
                <p><b>Status:</b> {r.status}</p>
                {r.proof && <img src={r.proof} alt="Proof" className="mt-2 w-32 h-20 object-cover rounded" />}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
