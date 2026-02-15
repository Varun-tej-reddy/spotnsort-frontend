// src/services/auth.js
const STORAGE_KEY = "spotnsort_users";        
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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const exists = users.find(u => u.email.toLowerCase() === userInfo.email.toLowerCase() && u.role === userInfo.role);
      if (exists) return reject({ message: "User already exists" });
      users.push(userInfo);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      setCurrentUser(userInfo);
      resolve({ user: userInfo });
    }, 700);
  });
}

export async function login(credentials) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password && u.role === credentials.role);
      if (!user) return reject({ message: "Invalid email, password, or role" });
      setCurrentUser(user);
      resolve({ user });
    }, 700);
  });
}
