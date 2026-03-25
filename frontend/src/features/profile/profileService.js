import api from "../../services/api";

export const getProfile = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const getUserProfile = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const getMyConnections = async () => {
  const res = await api.get("/connections");
  return res.data;
};

export const searchUsers = async (query) => {
  const res = await api.get(`/users/search?q=${query}`);
  return res.data;
};

export const getProfileStats = async (id) => {
  try {
     const res = await api.get(`/profile/stats/${id || 'me'}`);
     return res.data;
  } catch(e) {
     return null;
  }
};