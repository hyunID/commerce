import { useEffect, useState } from "react";
import api from "../api/client";
import { addToCart } from "../api/cart";
import { createOrder } from "../api/order";
import AdminModal from "../components/AdminModal";
import CartModal from "../components/CartModal";
import OrderModal from "../components/OrderModal";

function MainPage({ user, onLogout }) {

    const [showAdmin, setShowAdmin] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showOrder, setShowOrder] = useState(false);

    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});

    // ✅ 상품 + 수량 초기화 같이 처리 (핵심)
    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            const data = res.data.data || [];

            setProducts(data);

            // 🔥 여기서 초기화 (useEffect 제거)
            const initQty = {};
            data.forEach(p => {
                initQty[p.id] = 1;
            });
            setQuantities(initQty);

        } catch (err) {
            console.error("상품 조회 실패", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 수량 변경
    const changeQty = (id, delta) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + delta)
        }));
    };

    const resetQty = (productId) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: 1
        }));
    };

    // 장바구니
    const handleAddCart = async (productId) => {
        try {
            await addToCart({
                productId,
                quantity: quantities[productId] || 1
            });

            alert("장바구니 담기 완료");
            resetQty(productId);

        } catch (err) {
            console.error(err);
            alert("실패");
        }
    };

    // 바로 구매
    const handleBuyNow = async (productId) => {
        if (!window.confirm("구매하시겠습니까?")) return;

        try {
            await createOrder([
                {
                    productId,
                    quantity: quantities[productId] || 1
                }
            ]);

            alert("구매 완료");
            resetQty(productId);

        } catch (err) {
            console.error(err);
            alert("구매 실패");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-indigo-600 text-white">
                <h1 className="text-xl font-bold">🛍️ Commerce</h1>

                <div className="flex items-center gap-3">
                    <span>{user.email}</span>

                    <button
                        onClick={() => setShowOrder(true)}
                        className="bg-white text-indigo-600 px-3 py-1 rounded"
                    >
                        주문 내역
                    </button>

                    <button
                        onClick={() => setShowCart(true)}
                        className="bg-green-500 px-3 py-1 rounded"
                    >
                        🛒 장바구니
                    </button>

                    {user.role === "ADMIN" && (
                        <button onClick={() => setShowAdmin(true)}>
                            관리자 메뉴
                        </button>
                    )}

                    <button onClick={onLogout}>로그아웃</button>
                </div>
            </div>

            {/* 상품 리스트 */}
            <div className="p-6 grid grid-cols-4 gap-4">
                {products.map((p) => (
                    <div key={p.id} className="bg-white p-4 rounded shadow">

                        <img
                            src={`http://localhost:8081/images/${p.imageUrl}`}
                            className="h-32 w-full object-cover mb-2"
                        />

                        <h2 className="font-bold">{p.name}</h2>
                        <p>₩{p.price}</p>

                        <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => changeQty(p.id, -1)} className="px-2 bg-gray-300">-</button>
                            <span>{quantities[p.id] || 1}</span>
                            <button onClick={() => changeQty(p.id, 1)} className="px-2 bg-gray-300">+</button>
                        </div>

                        <button
                            onClick={() => handleAddCart(p.id)}
                            className="mt-2 w-full bg-green-500 text-white p-2 rounded"
                        >
                            장바구니 담기
                        </button>

                        <button
                            onClick={() => handleBuyNow(p.id)}
                            className="mt-2 w-full bg-indigo-600 text-white p-2 rounded"
                        >
                            바로 구매
                        </button>
                    </div>
                ))}
            </div>

            {/* 모달 */}
            {showAdmin && (
                <AdminModal
                    onClose={() => setShowAdmin(false)}
                    onProductChange={fetchProducts}
                />
            )}

            {showCart && (
                <CartModal onClose={() => setShowCart(false)} />
            )}

            {showOrder && (
                <OrderModal onClose={() => setShowOrder(false)} />
            )}
        </div>
    );
}

export default MainPage;