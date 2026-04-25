import api from "./client";

//회원가입
export const signup = async (data) => {
    const res = await api.post("/users", data);
    return res.data;
};
//로그인
export const login = async (email, password) => {
    const res = await api.post("/users/login", { email, password });
    return res.data;
};

//정보
export const getMe = async () => {
    const res = await api.get("/users/me");
    return res.data;
};