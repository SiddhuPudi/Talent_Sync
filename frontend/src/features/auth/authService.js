import api from "../../services/api";

export const registerUser = async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
}

export const loginUser = async (data) => {
    const res = await api.post("/auth/login", data);
    return res.data;
}

export const verifyOtp = async (data) => {
    const res = await api.post("/auth/verify-otp", data);
    return res.data;
}