import { useEffect, useState } from "react";
import api from "../api/client";
import { addToCart } from "../api/cart";
import AdminModal from "../components/AdminModal";
import CartModal from "../components/CartModal";
import OrderModal from "../components/OrderModal";
import ProductDetailModal from "../components/ProductDetailModal";

function MainPage({ user, onLogout }) {

    const [showAdmin, setShowAdmin] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showOrder, setShowOrder] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [products, setProducts] = useState([]);
    const [addedMap, setAddedMap] = useState({});

    const fetchProducts = async () => {
        const res = await api.get("/products");
        setProducts(res.data.data || []);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddCart = async (productId) => {
        try {
            await addToCart({ productId, quantity: 1 });

            setAddedMap(prev => ({ ...prev, [productId]: true }));

            setTimeout(() => {
                setAddedMap(prev => ({ ...prev, [productId]: false }));
            }, 2000);

        } catch (err) {
            console.log(err);
            alert("실패");
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
                {products.map((p) => {

                    const isSoldOut = p.status === "SOLD_OUT";

                    return (
                        <div
                            key={p.id}
                            className={`bg-white p-4 rounded shadow transition
                                ${isSoldOut ? "opacity-50" : "hover:shadow-md"}
                            `}
                        >

                            {/* 이미지 */}
                            <img
                                src={`http://localhost:8081/images/${p.imageUrl}`}
                                className="h-32 w-full object-cover mb-2"
                            />

                            {/* 이름 */}
                            <h2 className="font-bold">{p.name}</h2>

                            {/* 가격 */}
                            <p>₩{p.price}</p>

                            {/* 상태 */}
                            <p className={`text-sm font-bold
                                ${isSoldOut ? "text-red-500" : "text-green-600"}
                            `}>
                                {isSoldOut ? "품절" : "판매중"}
                            </p>

                            {/* 재고 */}
                            <p className="text-sm text-gray-500">
                                재고: {p.availableStock ?? 0}
                            </p>

                            {/* 장바구니 */}
                            <button
                                disabled={isSoldOut}
                                onClick={() => handleAddCart(p.id)}
                                className={`mt-2 w-full p-2 rounded text-white 
                                    ${isSoldOut
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : addedMap[p.id]
                                        ? "bg-gray-400"
                                        : "bg-green-500"
                                }
                                `}
                            >
                                {isSoldOut
                                    ? "품절"
                                    : addedMap[p.id]
                                        ? "✔ 담김!"
                                        : "장바구니 담기"}
                            </button>

                            {/* 구매 */}
                            <button
                                disabled={isSoldOut}
                                onClick={() => setSelectedProduct(p)}
                                className={`mt-2 w-full p-2 rounded text-white
                                    ${isSoldOut
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-indigo-600"
                                }
                                `}
                            >
                                {isSoldOut ? "품절" : "구매"}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* 모달 */}
            {showAdmin && (
                <AdminModal
                    onClose={() => setShowAdmin(false)}
                    onProductChange={fetchProducts}
                />
            )}

            {showCart && (
                <CartModal
                    onClose={() => setShowCart(false)}
                    onOrderComplete={fetchProducts}
                />
            )}

            {showOrder && (
                <OrderModal
                    onClose={() => setShowOrder(false)}
                />
            )}

            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onOrderComplete={fetchProducts}
                />
            )}
        </div>
    );
}

export default MainPage;