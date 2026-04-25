import { useEffect, useState } from "react";
import { getMe } from "./api/auth";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";

function App() {
    const [user, setUser] = useState(null);

    // 앱 시작 시 로그인 유지 체크
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await getMe();
                setUser(res.data); // { email, role }

            }  catch {
                console.error("토큰 만료 또는 오류");
                localStorage.removeItem("token");
            }
        };

        init();
    }, []);

    // 로그아웃
    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    // 로그인 성공 시
    const handleLoginSuccess = async () => {
        const res = await getMe();
        setUser(res.data);
    };

    return (
        <>
            {user ? (
                <MainPage
                    user={user}
                    onLogout={handleLogout}
                />
            ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            )}
        </>
    );
}

export default App;