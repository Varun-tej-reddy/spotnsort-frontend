// src/pages/Authority/AuthHome.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { FaClipboardList, FaCheckCircle, FaMapMarkerAlt, FaLightbulb, FaCity } from "react-icons/fa";
import "../../styles/main.css";

const reportData = [
  { name: "Jan", ReportsAssigned: 10, ReportsResolved: 7 },
  { name: "Feb", ReportsAssigned: 15, ReportsResolved: 12 },
  { name: "Mar", ReportsAssigned: 12, ReportsResolved: 10 },
  { name: "Apr", ReportsAssigned: 8, ReportsResolved: 6 },
  { name: "May", ReportsAssigned: 20, ReportsResolved: 18 },
];

const categoryData = [
  { category: "Potholes", count: 12 },
  { category: "Garbage", count: 20 },
  { category: "Streetlights", count: 8 },
  { category: "Water Leakage", count: 6 },
];

const AuthorityHome = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const scrollToTop = () => {
    heroRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Unified section padding
  const sectionPadding = "px-6 py-24"; // same for all sections

  return (
    <div className="relative text-white overflow-y-auto scroll-smooth min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50">
        <nav className="flex justify-between items-center px-10 py-4 bg-black bg-opacity-20 backdrop-blur-sm shadow-md">
          <h1
            className="text-3xl font-extrabold text-yellow-400 cursor-pointer hover:scale-105 transition-transform"
            onClick={scrollToTop}
          >
            SpotnSort Authority
          </h1>
          <ul className="flex space-x-6 font-semibold text-white">
            {["Home", "Manage Reports", "Analytics", "Map"].map((item, idx) => (
              <li
                key={idx}
                className="px-4 py-2 cursor-pointer hover:text-yellow-400 hover:scale-105 transition"
                onClick={() => {
                  switch (item) {
                    case "Home":
                      scrollToTop();
                      break;
                    case "Manage Reports":
                      navigate("/authority/manage");
                      break;
                    case "Analytics":
                      navigate("/authority/analysis");
                      break;
                    case "Map":
                      navigate("/authority/map");
                      break;
                    default:
                      break;
                  }
                }}
              >
                {item}
              </li>
            ))}
            <li
              className="px-4 py-2 cursor-pointer text-red-400 hover:text-red-500 hover:scale-105 transition"
              onClick={() => navigate("/login")}
            >
              Logout
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`min-h-screen flex flex-col justify-center items-center text-center relative z-10 ${sectionPadding}`}
      >
        <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">
          Manage Civic Issues, <span className="text-yellow-400">Resolve the City</span>
        </h2>
        <p className="text-lg max-w-3xl mb-8 drop-shadow-md">
          Welcome to <span className="text-yellow-400">SpotnSort Authority</span>.  
          View assigned reports, track progress, and ensure timely resolutions to make your city safer and cleaner.
        </p>
        <button
          onClick={() => navigate("/authority/manage")}
          className="mt-4 px-8 py-3 bg-white text-black font-bold rounded-full shadow-lg hover:bg-yellow-400 hover:text-black hover:scale-105 transition"
        >
          View Assigned Reports
        </button>
      </section>

      {/* How It Works */}
      <section className={`flex flex-col justify-center items-center text-center w-full relative z-10 ${sectionPadding}`}>
        <h3 className="text-4xl font-bold mb-12 text-yellow-400">How Authorities Work with SpotnSort</h3>
        <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto text-left">
          {[
            { icon: FaClipboardList, title: "Receive Reports", desc: "Get real-time notifications of civic issues reported by citizens in your area." },
            { icon: FaMapMarkerAlt, title: "Locate & Inspect", desc: "Visit the problem location or coordinate with your team for assessment." },
            { icon: FaCheckCircle, title: "Take Action", desc: "Resolve issues like garbage, potholes, street lights, and update status in the system." },
            { icon: FaLightbulb, title: "Track & Verify", desc: "Monitor reported problems, verify resolutions, and maintain accountability." },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center bg-white bg-opacity-10 p-6 rounded-xl shadow-lg hover:scale-105 transition"
              >
                <Icon className="text-yellow-400 text-4xl mb-4" />
                <h4 className="text-2xl font-semibold mb-2 text-yellow-400">{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Analytics Graphs */}
      <section className={`flex flex-col justify-center items-center text-center w-full relative z-10 ${sectionPadding}`}>
        <h3 className="text-4xl font-bold text-yellow-400 mb-12">Assigned Reports & Trends</h3>
        <div className="w-full max-w-4xl h-80 mx-auto mb-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#FFD700" />
              <YAxis stroke="#FFD700" />
              <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #FFD700" }} />
              <CartesianGrid stroke="#444" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="ReportsAssigned" stroke="#FFD700" strokeWidth={2} />
              <Line type="monotone" dataKey="ReportsResolved" stroke="#00FFAA" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full max-w-4xl h-80 mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <XAxis dataKey="category" stroke="#FFD700" />
              <YAxis stroke="#FFD700" />
              <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #FFD700" }} />
              <Legend wrapperStyle={{ color: "#FFD700" }} />
              <Bar dataKey="count" fill="#FFD700" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Tips & Benefits */}
      <section className={`flex flex-col justify-center items-center text-center w-full relative z-10 ${sectionPadding}`}>
        <h3 className="text-4xl font-bold mb-12 text-yellow-400">Why Authorities Use SpotnSort?</h3>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto text-left">
          {[
            { icon: FaLightbulb, title: "Be Efficient", desc: "Manage civic issues more efficiently and reduce delays in resolution." },
            { icon: FaCity, title: "Serve the City", desc: "Ensure a cleaner, safer, and smarter city for citizens." },
            { icon: FaCheckCircle, title: "Accountability", desc: "Track your actions and maintain transparency with the community." },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center bg-white bg-opacity-10 p-6 rounded-xl shadow-lg hover:scale-105 transition"
              >
                <Icon className="text-yellow-400 text-4xl mb-4" />
                <h4 className="text-2xl font-semibold mb-2 text-yellow-400">{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 relative z-10">
        <p className="text-sm">&copy; {new Date().getFullYear()} SpotnSort. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthorityHome;
