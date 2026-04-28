import { useState } from "react";
import { login } from "../api/auth";
import SignupModal from "../components/SignupModal";
import AlertModal from "../components/AlertModal";

function LoginPage({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showSignup, setShowSignup] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async () => {
        try {
            const res = await login(email, password);
            localStorage.setItem("token", res.data.token);
            onLoginSuccess();
        } catch {
            setErrorMsg("등록되지 않은 이메일 입니다.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white w-80 p-8 rounded-2xl shadow-lg">

                <h1 className="text-2xl font-bold text-center mb-6">
                    🛍️ Commerce
                </h1>

                <input
                    type="email"
                    placeholder="이메일"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded mb-3"
                />

                <input
                    type="password"
                    placeholder="비밀번호"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 rounded mb-4"
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
                >
                    로그인
                </button>

                <button
                    onClick={() => setShowSignup(true)}
                    className="w-full mt-3 text-indigo-600"
                >
                    회원가입
                </button>
            </div>

            {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
            {errorMsg && (
                <AlertModal message={errorMsg} onClose={() => setErrorMsg("")} />
            )}
        </div>
    );
}

export default LoginPage;