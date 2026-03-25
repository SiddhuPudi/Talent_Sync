import api from "../../services/api";

export const getProfile = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const getMyConnections = async () => {
  const res = await api.get("/connections");
  return res.data;
};