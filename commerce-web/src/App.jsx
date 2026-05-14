import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { getMe } from "./api/auth";

import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import AuthModal from "./components/AuthModal";
import ProductDetailPage from "./pages/ProductDetailPage";
import SuccessPage from "./pages/payment/SuccessPage";
import FailPage from "./pages/payment/FailPage";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showAuth, setShowAuth] = useState(false);

    const navigate = useNavigate();

    // 로그인 상태 초기화
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await getMe();
                setUser(res.data);
            } catch {
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    // 로그아웃
    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    // 로그인 성공
    const handleLoginSuccess = async () => {
        try {
            const res = await getMe();
            setUser(res.data);
            setShowAuth(false);
            navigate("/");
        } catch {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    // 로그인 모달 열기 (UX용)
    const handleRequireLogin = () => {
        setShowAuth(true);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-gray-600">
                로딩중...
            </div>
        );
    }

    return (
        <>
            <Routes>

                {/* 메인 */}
                <Route
                    path="/"
                    element={
                        <MainPage
                            user={user}
                            onLogout={handleLogout}
                            onRequireLogin={handleRequireLogin}
                        />
                    }
                />

                {/* 로그인 페이지 (옵션 유지) */}
                <Route
                    path="/login"
                    element={
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    }
                />

                {/* 상품 상세 */}
                <Route
                    path="/product/:id"
                    element={<ProductDetailPage />}
                />

                {/* 결제 성공 */}
                <Route
                    path="/payment/success-page"
                    element={<SuccessPage />}
                />

                {/* 결제 실패 */}
                <Route
                    path="/payment/fail-page"
                    element={<FailPage />}
                />

            </Routes>

            {showAuth && (
                <AuthModal
                    onClose={() => setShowAuth(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </>
    );
}

export default App;