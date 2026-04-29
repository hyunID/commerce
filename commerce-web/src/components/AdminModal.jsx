import { useState } from "react";
import ProductForm from "../pages/admin/ProductForm";
import ProductList from "../pages/admin/ProductList";

function AdminModal({ onClose, onProductChange }) {
    const [menu, setMenu] = useState("product");
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
        onProductChange?.();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-[900px] h-[600px] rounded-xl flex overflow-hidden">

                {/* 좌측 메뉴 */}
                <div className="w-56 bg-gray-800 text-white p-4">
                    <h2 className="text-lg font-bold mb-6">관리자</h2>

                    <ul className="space-y-3">
                        <li onClick={() => setMenu("product")} className="cursor-pointer">
                            상품 관리
                        </li>
                        <li onClick={() => setMenu("user")} className="cursor-pointer">
                            회원 관리
                        </li>
                    </ul>
                </div>

                {/* 우측 컨텐츠 */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-xl font-bold">
                            {menu === "product" ? "상품 관리" : "회원 관리"}
                        </h2>

                        <button onClick={onClose} className="text-red-500">
                            닫기
                        </button>
                    </div>

                    {menu === "product" && (
                        <>
                            <ProductForm onSuccess={handleRefresh} />
                            <ProductList key={refreshKey} onChange={handleRefresh} />
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

export default AdminModal;