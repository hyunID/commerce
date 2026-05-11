import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getMe } from "./api/auth";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";

// 결제 페이지 import
import SuccessPage from "./pages/payment/SuccessPage";
import FailPage from "./pages/payment/FailPage";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await getMe();
                setUser(res.data);
            } catch {
                localStorage.removeItem("token");
            }
        };

        init();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const handleLoginSuccess = async () => {
        const res = await getMe();
        setUser(res.data);
    };

    return (
        <Routes>

            {/* 메인 */}
            <Route
                path="/"
                element={
                    user ? (
                        <MainPage user={user} onLogout={handleLogout} />
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                }
            />

            {/* 결제 성공 페이지 */}
            <Route
                path="/payment/success-page"
                element={<SuccessPage />}
            />

            {/* 결제 실패 페이지 */}
            <Route
                path="/payment/fail-page"
                element={<FailPage />}
            />

        </Routes>
    );
}

export default App;