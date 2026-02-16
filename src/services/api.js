import axios from "axios";
import { API_BASE_URL } from "../config";

export const getAssignedReports = async () => {
  const res = await axios.get(`${API_BASE_URL}/reports`);
  return res.data;
};

export const updateReport = async (id, data) => {
  const res = await axios.put(`${API_BASE_URL}/reports/${id}`, data);
  return res.data;
};

export const getUserReports = async () => {
  const res = await axios.get(`${API_BASE_URL}/reports`);
  return res.data;
};