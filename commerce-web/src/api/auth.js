import api from "./client";

export const login = async (email) => {
    const res = await api.post("/users/login", { email });
    return res.data;
};