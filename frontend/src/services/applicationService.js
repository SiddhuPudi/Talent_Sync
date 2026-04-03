import api from "./api";

export const applyToJob = async (jobId, resume) => {
  const res = await api.post("/applications/apply", {
    jobId,
    resume,
  });
  return res.data;
};

export const getMyApplications = async () => {
  const res = await api.get("/applications/my");
  return res.data;
};

export const getMyProfile = async () => {
  const res = await api.get("/profile/me");
  return res.data;
};