import api from "../../services/api";

export const getJobs = async () => {
  const res = await api.get("/jobs");
  return res.data;
};