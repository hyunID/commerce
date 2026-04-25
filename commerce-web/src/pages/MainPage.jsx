import { useState } from "react";
import AdminModal from "../components/AdminModal";

function MainPage({ user , onLogout }) {

    console.log("user:", user);
    console.log("role:", user.role);


    const [showAdmin, setShowAdmin] = useState(user.role === "ADMIN");


    return (
        <div>

            <div className="flex justify-between p-4 bg-indigo-600 text-white">
                <h1>🛍️ Commerce</h1>
                <button onClick={onLogout}>로그아웃</button>
            </div>

            <div className="p-6">상품 리스트</div>

            {showAdmin && (
                <AdminModal onClose={() => setShowAdmin(false)} />
            )}
        </div>
    );
}

export default MainPage;