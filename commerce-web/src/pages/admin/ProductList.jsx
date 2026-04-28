import { useEffect, useState } from "react";
import api from "../../api/client";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔥 상품 조회
    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");

            setProducts(res.data.data || []);
            console.log("----------------------");
            console.log(res.data.data);
        } catch (err) {
            console.error("상품 조회 실패", err);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 상품 삭제
    const handleDelete = async (id) => {
        const confirm = window.confirm("정말 삭제하시겠습니까?");
        if (!confirm) return;

        try {
            await api.delete(`/products/${id}`);
            alert("삭제 완료");
            fetchProducts(); // 새로고침
        }catch (err) {
            console.error("상품 조회 실패", err);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchProducts();
        };

        init();
    }, []);

    if (loading) {
        return <div className="p-4">로딩중...</div>;
    }

    return (
        <div className="bg-white p-6 rounded shadow">

            <h2 className="text-xl font-bold mb-4">📦 상품 목록</h2>

            <div className="grid grid-cols-3 gap-4">
                {products.map((p) => (
                    <div
                        key={p.id}
                        className="border rounded p-4 shadow-sm hover:shadow-md transition"
                    >
                        {/* 이미지 */}
                        <div className="h-32 bg-gray-100 mb-3 flex items-center justify-center">

                            {p.imageUrl ? (
                                <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400">No Image</span>
                            )}
                        </div>

                        {/* 정보 */}
                        <h3 className="font-bold">{p.name}</h3>
                        <p className="text-gray-500">₩{p.price}</p>

                        {/* 버튼 */}
                        <div className="flex gap-2 mt-3">
                            <button
                                className="flex-1 bg-blue-500 text-white py-1 rounded"
                                onClick={() => alert("수정 기능 연결 예정")}
                            >
                                수정
                            </button>

                            <button
                                className="flex-1 bg-red-500 text-white py-1 rounded"
                                onClick={() => handleDelete(p.id)}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default ProductList;