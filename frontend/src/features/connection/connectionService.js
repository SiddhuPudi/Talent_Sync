import api from "../../services/api";

export const getConnections = async () => {
  const res = await api.get("/connections");
  return res.data;
};