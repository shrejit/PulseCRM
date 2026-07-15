import api from "../../api/api";

export const loginUser = (data) =>
  api.post("/api/auth/login", data);

export const registerUser = (data) =>
  api.post("/api/auth/register", data);

export const forgotPassword = (data) =>
  api.post("/api/auth/forgot-password", data);

export const resetPassword = (token, data) =>
  api.post(`/api/auth/reset-password/${token}`, data);

export const verifyEmail = (token) =>
  api.get(`/api/auth/verify-email/${token}`);

export const logoutUser = () =>
  api.post("/api/auth/logout");