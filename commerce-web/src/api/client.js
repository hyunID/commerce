import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081",
    headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터 (JWT 자동 주입)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// 🔥 응답 인터셉터 (토큰 만료 처리)
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            alert("세션이 만료되었습니다. 다시 로그인 해주세요.");

            localStorage.removeItem("token");
            window.location.href = "/"; // 로그인 페이지 이동
        }
        return Promise.reject(err);
    }
);

export default api;