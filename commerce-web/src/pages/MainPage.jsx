import { useEffect, useState } from "react";
import api from "../api/client";
import AdminModal from "../components/AdminModal";

function MainPage({ user, onLogout }) {
    const [showAdmin, setShowAdmin] = useState(false);

    // 🔥 상품 상태 (여기가 핵심)
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data.data || []);
        } catch (err) {
            console.error("상품 조회 실패", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-indigo-600 text-white">
                <h1 className="text-xl font-bold">🛍️ Commerce</h1>

                <div className="flex items-center gap-3">
                    <span>{user.email}</span>

                    {user.role === "ADMIN" && (
                        <button onClick={() => setShowAdmin(true)}>
                            관리자 메뉴
                        </button>
                    )}

                    <button onClick={onLogout}>로그아웃</button>
                </div>
            </div>

            {/* 🔥 실제 상품 리스트 */}
            <div className="p-6 grid grid-cols-4 gap-4">
                {products.map((p) => (
                    <div key={p.id} className="bg-white p-4 rounded shadow">
                        <div className="h-32 bg-gray-200 mb-2 overflow-hidden">
                            {p.imageUrl ? (
                                <img
                                    src={`http://localhost:8081/images/${p.imageUrl}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No Image
                                </div>
                            )}
                        </div>

                        <h2>{p.name}</h2>
                        <p>₩{p.price}</p>
                    </div>
                ))}
            </div>

            {/* 🔥 AdminModal에 fetch 전달 */}
            {showAdmin && (
                <AdminModal
                    onClose={() => setShowAdmin(false)}
                    onProductChange={fetchProducts}
                />
            )}
        </div>
    );
}

export default MainPage;