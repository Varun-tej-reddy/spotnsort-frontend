// src/pages/User/UserRewards.jsx
import React, { useEffect, useState } from "react";
import { FaGift, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function UserRewards() {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, target: 10 });
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });
  const [reports, setReports] = useState([]);

  const loadReports = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("spotnsort_current_user"));
      if (!currentUser) return;

      const res = await fetch("https://spotnsort-backend.onrender.com/api/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();

      const userReports = data.filter((r) => r.userEmail === currentUser.email);
      setReports(userReports);

      // Calculate points
      let totalPoints = 0;
      userReports.forEach((r) => {
        let base = 10;
        let extraPriority = r.priority === "High" ? 5 : 0;
        let resolvedBonus = r.status === "Resolved" ? 5 : 0;
        totalPoints += base + extraPriority + resolvedBonus;
      });
      setPoints(totalPoints);

      // Badges
      const earnedBadges = [];
      if (userReports.length >= 1)
        earnedBadges.push({
          title: "First Report",
          description: "Congrats! You submitted your first report.",
          color: "bg-yellow-400",
        });
      if (userReports.length >= 10)
        earnedBadges.push({
          title: "Community Helper",
          description: "You submitted 10 reports helping your community.",
          color: "bg-indigo-500",
        });
      if (userReports.some((r) => r.status === "Resolved"))
        earnedBadges.push({
          title: "Resolved Hero",
          description: "Your report helped resolve a local issue!",
          color: "bg-green-500",
        });
      setBadges(earnedBadges);

      // Progress tracker
      setProgress({ completed: userReports.length, target: 10 });
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 3000); // live refresh every 3s
    return () => clearInterval(interval);
  }, []);

  // Reward offers
  const offers = [
    { title: "Coffee Voucher", points: 50, description: "Redeem 50 points for a free coffee" },
    { title: "Discount Coupon", points: 100, description: "Redeem 100 points for a discount" },
    { title: "Free Event Ticket", points: 200, description: "Redeem 200 points for an event entry" },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-y-auto scroll-smooth">

      {/* Header (same as other pages) */}
      <header className="fixed top-0 left-0 w-full z-50">
        <nav className="flex items-center px-8 py-4 bg-black bg-opacity-40 backdrop-blur-sm shadow-md">
          <button
            onClick={() => navigate("/user/home")}
            className="text-black text-2xl font-bold hover:scale-110 transition bg-yellow-400 px-3 py-1 rounded-md border border-yellow-500 mr-4"
          >
            ←
          </button>
          <h1 className="text-3xl font-extrabold text-yellow-400">Rewards & Achievements</h1>
        </nav>
      </header>

      <div className="relative z-10 p-6 pt-28 space-y-6">

        {/* Total Points */}
        <div className="rounded-2xl shadow-md bg-black bg-opacity-50 p-6 text-center hover:scale-105 transition-transform duration-300">
          <h2 className="text-xl font-semibold mb-2 text-yellow-400">Your Points</h2>
          <div className="text-5xl font-bold text-yellow-400">{points}</div>
          <p className="mt-2 text-gray-300">Earn points for submitting reports.</p>
        </div>

        {/* Points Breakdown */}
        <div className="rounded-2xl shadow-md bg-black bg-opacity-50 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Points Breakdown</h2>
          <ul className="space-y-2 text-gray-300">
            {reports.map((r) => {
              const base = 10;
              const extraPriority = r.priority === "High" ? 5 : 0;
              const resolvedBonus = r.status === "Resolved" ? 5 : 0;
              return (
                <li key={r._id} className="flex justify-between items-center p-2 rounded hover:bg-gray-800 transition">
                  <div>{r.problem} ({r.subtype})</div>
                  <div
                    className="flex items-center gap-1 cursor-pointer relative"
                    onMouseEnter={(e) => {
                      const tooltipX = e.clientX + 10;
                      const tooltipY = e.clientY + 10;
                      setTooltip({
                        show: true,
                        text: `Base: 10, Priority: ${extraPriority}, Resolved: ${resolvedBonus}`,
                        x: tooltipX,
                        y: tooltipY,
                      });
                    }}
                    onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                  >
                    <span>{base + extraPriority + resolvedBonus} pts</span>
                    <FaInfoCircle className="text-gray-400" />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Badges */}
        <div className="rounded-2xl shadow-md bg-black bg-opacity-50 p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Badges</h2>
          {badges.length === 0 ? (
            <p className="text-gray-400">Submit reports to start earning badges!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl shadow-md ${badge.color} bg-opacity-70 hover:scale-110 transition transform duration-300 animate-bounce`}
                  title={badge.description}
                >
                  <h3 className="text-lg font-bold text-black">{badge.title}</h3>
                  <p className="text-black text-sm mt-1">{badge.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="rounded-2xl shadow-md bg-black bg-opacity-50 p-6">
          <h2 className="text-xl font-semibold mb-2 text-yellow-400">Progress to Next Badge</h2>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-yellow-400 h-4 transition-all duration-500"
              style={{ width: `${Math.min((progress.completed / progress.target) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-gray-300 mt-2">
            {progress.completed}/{progress.target} reports submitted
          </p>
        </div>

        {/* Reward Offers */}
        <div className="rounded-2xl shadow-md bg-black bg-opacity-50 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400 flex items-center gap-2">
            <FaGift /> Redeem Rewards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {offers.map((offer, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl shadow-md bg-yellow-400 text-black hover:scale-105 transition transform duration-300 cursor-pointer flex flex-col justify-between"
                onClick={() => alert(`Redeem ${offer.title} for ${offer.points} points!`)}
              >
                <h3 className="text-lg font-bold">{offer.title}</h3>
                <p className="text-sm mt-1">{offer.description}</p>
                <div className="mt-2 font-bold">{offer.points} pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip.show && (
          <div
            className="absolute bg-black bg-opacity-90 text-white text-sm p-2 rounded shadow-md pointer-events-none z-50 max-w-xs break-words"
            style={{
              top: tooltip.y,
              left: tooltip.x + 10 > window.innerWidth - 200 ? window.innerWidth - 210 : tooltip.x + 10,
            }}
          >
            {tooltip.text}
          </div>
        )}

        {/* Motivational Text */}
        <div className="rounded-2xl shadow-md bg-black bg-opacity-50 p-6 text-center hover:scale-105 transition-transform duration-300">
          <p className="text-gray-300 italic">
            Every report helps keep your locality clean and safe. Submit more issues and earn points, badges, and exciting rewards!
          </p>
        </div>
      </div>
    </div>
  );
}