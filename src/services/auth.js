// src/services/auth.js
import axios from "axios";
import { API_BASE_URL } from "../config";

const CURRENT_USER = "spotnsort_current_user";

export function setCurrentUser(userData) {
  localStorage.setItem(CURRENT_USER, JSON.stringify(userData));
}

export function getCurrentUser() {
  const data = localStorage.getItem(CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function logout() {
  localStorage.removeItem(CURRENT_USER);
}

export async function register(userInfo) {
  const res = await axios.post(`${API_BASE_URL}/auth/register`, userInfo);
  setCurrentUser(res.data.user);
  return res.data;
}

export async function login(credentials) {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
  setCurrentUser(res.data.user);
  return res.data;
}