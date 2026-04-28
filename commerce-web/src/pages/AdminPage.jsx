import { useState } from "react";
import ProductForm from "./admin/ProductForm";
import ProductList from "./admin/ProductList";

function AdminPage() {
    const [menu, setMenu] = useState("product");
    const [refreshKey, setRefreshKey] = useState(0);

    const reloadProducts = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="flex min-h-screen">

            {/* 좌측 메뉴 */}
            <div className="w-64 bg-gray-800 text-white p-5">
                <h2 className="text-lg font-bold mb-6">관리자</h2>

                <ul className="space-y-3">
                    <li onClick={() => setMenu("product")}>상품 관리</li>
                    <li onClick={() => setMenu("user")}>회원 관리</li>
                </ul>
            </div>

            {/* 우측 */}
            <div className="flex-1 p-6 bg-gray-100">

                {menu === "product" && (
                    <>
                        <ProductForm onSuccess={reloadProducts} />
                        <ProductList key={refreshKey} />
                    </>
                )}

                {menu === "user" && (
                    <div>회원 관리 페이지 (추후)</div>
                )}

            </div>
        </div>
    );
}

export default AdminPage;