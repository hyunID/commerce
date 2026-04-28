import { useNavigate } from "react-router-dom";

function MainPage({ user, onLogout }) {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-indigo-600 text-white">
                <h1 className="text-xl font-bold">🛍️ Commerce</h1>

                <div className="flex items-center gap-3">
                    <span className="text-sm">{user.email}</span>

                    {/* 🔥 관리자만 버튼 노출 → 페이지 이동 */}
                    {user.role === "ADMIN" && (
                        <button
                            onClick={() => navigate("/admin")}
                            className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-300"
                        >
                            관리자 페이지
                        </button>
                    )}

                    <button
                        onClick={onLogout}
                        className="bg-red-500 px-3 py-1 rounded hover:bg-red-400"
                    >
                        로그아웃
                    </button>
                </div>
            </div>

            {/* 상품 리스트 */}
            <div className="p-6 grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="bg-white p-4 rounded-xl shadow">
                        <div className="h-32 bg-gray-200 mb-3 rounded"></div>
                        <h2 className="font-bold">상품 {item}</h2>
                        <p className="text-sm text-gray-500">₩10,000</p>

                        <button className="mt-2 w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                            장바구니
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default MainPage;