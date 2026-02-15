import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function ViewReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const storedReports = JSON.parse(localStorage.getItem("reports")) || [];
    setReports(storedReports);
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-y-auto scroll-smooth">
      
      <header className="fixed top-0 left-0 w-full z-50">
        <nav className="flex items-center px-8 py-4 bg-black bg-opacity-40 backdrop-blur-sm shadow-md">
          <FaArrowLeft className="text-yellow-400 text-2xl mr-4 cursor-pointer hover:scale-110 transition" onClick={() => navigate("/user/home")} />
          <h1 className="text-3xl font-extrabold text-yellow-400">Submitted Reports</h1>
        </nav>
      </header>

      <section className="pt-32 pb-24 px-6 w-full max-w-4xl mx-auto relative z-10">
        {reports.length === 0 ? (
          <p className="text-gray-300 text-lg">No reports submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-600 text-sm">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-600 p-2">Name</th>
                  <th className="border border-gray-600 p-2">Email</th>
                  <th className="border border-gray-600 p-2">Problem</th>
                  <th className="border border-gray-600 p-2">Subtype</th>
                  <th className="border border-gray-600 p-2">Priority</th>
                  <th className="border border-gray-600 p-2">Area</th>
                  <th className="border border-gray-600 p-2">Status</th>
                  <th className="border border-gray-600 p-2">Photo</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-700">
                    <td className="border border-gray-600 p-2">{r.name}</td>
                    <td className="border border-gray-600 p-2">{r.userEmail}</td>
                    <td className="border border-gray-600 p-2">{r.problem}</td>
                    <td className="border border-gray-600 p-2">{r.subtype}</td>
                    <td className="border border-gray-600 p-2">{r.priority}</td>
                    <td className="border border-gray-600 p-2">{r.area}</td>
                    <td className="border border-gray-600 p-2">{r.status}</td>
                    <td className="border border-gray-600 p-2">
                      {r.photo ? <img src={r.photo} alt="report" className="w-20 h-20 object-cover rounded" /> : "No Photo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
