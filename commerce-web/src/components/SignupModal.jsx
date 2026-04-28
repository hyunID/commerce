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
        } catch {
            alert("회원가입 실패");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white w-96 p-8 rounded-2xl shadow-xl">

                <h2 className="text-xl font-bold mb-6 text-center">
                    회원가입
                </h2>

                {/* 🔥 핵심: flex-col + gap + w-full */}
                <div className="flex flex-col gap-4">

                    <input
                        name="email"
                        placeholder="이메일"
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="비밀번호"
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg"
                    />

                    <input
                        name="name"
                        placeholder="이름"
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg"
                    />

                    <button
                        onClick={handleSignup}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                    >
                        가입하기
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                    >
                        닫기
                    </button>

                </div>
            </div>
        </div>
    );
}

export default SignupModal;