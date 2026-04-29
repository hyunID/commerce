import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getMe } from "./api/auth";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";

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


            {/*
            <Route
                path="/admin"
                element={<AdminPage user={user} />}
            />
            */}
        </Routes>
    );
}

export default App;