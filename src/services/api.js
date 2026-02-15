// src/services/api.js
import axios from "axios";

// Existing
export const getAssignedReports = async () => {
  const res = await axios.get("/api/authority/reports");
  return res.data;
};

export const updateReport = async (id, status) => {
  const res = await axios.put(`/api/authority/reports/${id}`, { status });
  return res.data;
};

// 👇 ADD THIS FOR USER REPORTS
export const getUserReports = async () => {
  const res = await axios.get("/api/user/reports");
  return res.data;
};
