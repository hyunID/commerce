import { useState } from "react";
import { login, signup } from "../api/auth";

function AuthModal({ onClose, onLoginSuccess }) {

    const [tab, setTab] = useState("login"); // login | signup

    // login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // signup state
    const [name, setName] = useState("");

    // 로그인
    const handleLogin = async () => {
        try {
            const res = await login(email, password);
            localStorage.setItem("token", res.data.token);
            onLoginSuccess?.();
            onClose?.();
        } catch {
            alert("로그인 실패");
        }
    };

    // 회원가입
    const handleSignup = async () => {
        try {
            await signup({ email, password, name });
            alert("회원가입 성공");
            setTab("login"); // 가입 후 로그인으로 전환
        } catch {
            alert("회원가입 실패");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white w-96 p-6 rounded-2xl shadow-xl">

                {/* TAB */}
                <div className="flex mb-6 border-b">

                    <button
                        onClick={() => setTab("login")}
                        className={`flex-1 py-2 text-center ${
                            tab === "login"
                                ? "border-b-2 border-indigo-600 font-bold"
                                : "text-gray-400"
                        }`}
                    >
                        로그인
                    </button>

                    <button
                        onClick={() => setTab("signup")}
                        className={`flex-1 py-2 text-center ${
                            tab === "signup"
                                ? "border-b-2 border-indigo-600 font-bold"
                                : "text-gray-400"
                        }`}
                    >
                        회원가입
                    </button>

                </div>

                {/* LOGIN */}
                {tab === "login" && (
                    <div className="flex flex-col gap-3">

                        <input
                            placeholder="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-2 rounded"
                        />

                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border p-2 rounded"
                        />

                        <button
                            onClick={handleLogin}
                            className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
                        >
                            로그인
                        </button>

                    </div>
                )}

                {/* SIGNUP */}
                {tab === "signup" && (
                    <div className="flex flex-col gap-3">

                        <input
                            placeholder="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-2 rounded"
                        />

                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border p-2 rounded"
                        />

                        <input
                            placeholder="이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border p-2 rounded"
                        />

                        <button
                            onClick={handleSignup}
                            className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                        >
                            회원가입
                        </button>

                    </div>
                )}

                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="w-full mt-4 bg-gray-200 p-2 rounded hover:bg-gray-300"
                >
                    닫기
                </button>

            </div>
        </div>
    );
}

export default AuthModal;