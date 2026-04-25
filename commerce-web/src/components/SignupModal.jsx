import { useState } from "react";
import { signup } from "../api/auth";

function SignupModal({ onClose }) {
    const [form, setForm] = useState({
        email: "",
        password: "",
        name: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSignup = async () => {
        try {
            await signup(form);
            alert("회원가입 성공!");
            onClose();
        } catch (err) {
            alert("회원가입 실패");
        }
    };

    return (
        <div style={overlay}>
            <div style={modal}>
                <h2>회원가입</h2>

                <input name="email" placeholder="이메일" onChange={handleChange} />
                <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} />
                <input name="name" placeholder="이름" onChange={handleChange} />

                <button style={primaryBtn} onClick={handleSignup}>가입하기</button>
                <button style={secondaryBtn} onClick={onClose}>닫기</button>
            </div>
        </div>
    );
}

const overlay = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center"
};

const modal = {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
};

const primaryBtn = {
    background: "#4f46e5", color: "#fff", padding: "10px", border: "none", borderRadius: "6px"
};

const secondaryBtn = {
    marginTop: "5px", padding: "8px"
};

export default SignupModal;