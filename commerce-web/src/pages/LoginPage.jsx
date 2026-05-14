import { useState } from "react";
import { login } from "../api/auth";

function LoginPage({ onLoginSuccess }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const res = await login(email, password);
            localStorage.setItem("token", res.data.token);
            onLoginSuccess();
        } catch {
            alert("로그인 실패");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white p-8 rounded shadow w-80">

                <h1 className="text-xl font-bold mb-6 text-center">
                    🛍️ Commerce
                </h1>

                <input
                    placeholder="이메일"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 mb-2"
                />

                <input
                    type="password"
                    placeholder="비밀번호"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 mb-4"
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-indigo-600 text-white p-2 rounded"
                >
                    로그인
                </button>

            </div>

        </div>
    );
}

export default LoginPage;