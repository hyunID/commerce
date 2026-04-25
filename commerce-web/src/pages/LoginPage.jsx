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
        } catch (err) {
            setErrorMsg("등록되지 않은 이메일 입니다.");
        }
    };

    return (
        <div style={container}>
            <div style={card}>
                <h1>🛒 Commerce</h1>

                <input placeholder="이메일" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="비밀번호" onChange={(e) => setPassword(e.target.value)} />

                <button style={primaryBtn} onClick={handleLogin}>로그인</button>

                <button style={linkBtn} onClick={() => setShowSignup(true)}>
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

const container = {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6"
};

const card = {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
};

const primaryBtn = {
    background: "#4f46e5",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "6px"
};

const linkBtn = {
    background: "none",
    border: "none",
    color: "#4f46e5",
    cursor: "pointer"
};

export default LoginPage;