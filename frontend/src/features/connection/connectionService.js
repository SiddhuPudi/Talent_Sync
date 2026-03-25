import api from "../../services/api";

export const getConnections = async () => {
  const res = await api.get("/connections");
  return res.data;
};

export const sendConnectionRequest = async (userId) => {
  const res = await api.post("/connections/request", { receiverId: userId });
  return res.data;
};

export const updateConnectionStatus = async (id, status) => {
  const res = await api.patch(`/connections/${id}`, { status });
  return res.data;
};