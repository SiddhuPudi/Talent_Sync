import api from "../../services/api";

export const getJobs = async () => {
  const res = await api.get("/jobs");
  return res.data;
};

export const createJob = async (jobData) => {
  const res = await api.post("/jobs", jobData);
  return res.data;
};