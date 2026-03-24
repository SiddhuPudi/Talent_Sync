import api from "./api";

export const applyToJob = async (jobId) => {
  const res = await api.post("/applications/apply", {
    jobId,
  });
  return res.data;
};

export const getMyApplications = async () => {
  const res = await api.get("/applications/my");
  return res.data;
};