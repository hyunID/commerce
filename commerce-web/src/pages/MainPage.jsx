import { useEffect, useState } from "react";
import api from "../api/client";
import { addToCart } from "../api/cart";

import AdminModal from "../components/AdminModal";
import CartModal from "../components/CartModal";
import OrderModal from "../components/OrderModal";
//import ProductDetailModal from "../components/ProductDetailModal"; 모달에서 페이지로 변경
import { useNavigate } from "react-router-dom";

function MainPage({ user, onLogout, onRequireLogin }) {

    const [showAdmin, setShowAdmin] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showOrder, setShowOrder] = useState(false);

    //const [selectedProduct, setSelectedProduct] = useState(null); 모달에서 페이지로 변경
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [addedMap, setAddedMap] = useState({});
    const [slideIndex, setSlideIndex] = useState(0);


    const banners = [
        "/banner1.jpg",
        "/banner2.jpg",
        "/banner3.jpg",
    ];

    // 상품 조회
    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data.data || []);
        } catch (err) {
            console.log("상품 조회 실패", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 배너 자동 슬라이드
    useEffect(() => {
        const timer = setInterval(() => {
            setSlideIndex(prev => (prev + 1) % banners.length);
        }, 4000);

        return () => clearInterval(timer);
    }, []);

    // 장바구니
    const handleAddCart = async (productId) => {

        if (!user) {
            onRequireLogin?.();
            return;
        }

        try {
            await addToCart({ productId, quantity: 1 });

            setAddedMap(prev => ({ ...prev, [productId]: true }));

            setTimeout(() => {
                setAddedMap(prev => ({ ...prev, [productId]: false }));
            }, 1200);

        } catch (err) {
            console.log(err);
            alert("장바구니 실패");
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">

            {/* HEADER */}
            <div className="sticky top-0 z-50 bg-white shadow px-6 py-4 flex justify-between items-center">

                <h1 className="text-xl font-bold cursor-pointer">
                    🛍️ Commerce
                </h1>

                <div className="flex items-center gap-3">

                    {!user ? (
                        <button
                            onClick={onRequireLogin}
                            className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                        >
                            로그인
                        </button>
                    ) : (
                        <>
                            <span className="font-medium">
                                {user.email}
                            </span>

                            <button onClick={() => setShowOrder(true)}>
                                주문
                            </button>

                            <button onClick={() => setShowCart(true)}>
                                장바구니
                            </button>

                            {user.role === "ADMIN" && (
                                <button onClick={() => setShowAdmin(true)}>
                                    관리자
                                </button>
                            )}

                            <button onClick={onLogout}>
                                로그아웃
                            </button>
                        </>
                    )}

                </div>
            </div>

            {/* HERO BANNER (최종 UX 버전) */}
            <div className="relative w-full aspect-[16/5] sm:aspect-[21/6] md:aspect-[24/7] overflow-hidden">

                <img
                    src={banners[slideIndex]}
                    className="w-full h-full object-cover object-center scale-105 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-black/30"/>

                <div className="absolute bottom-6 sm:bottom-20 left-4 sm:left-16 text-white">

                    <p className="text-[10px] sm:text-sm tracking-widest">
                        NEW COLLECTION
                    </p>

                    <h1 className="text-lg sm:text-4xl font-bold mt-2">
                        2026 SPRING / SUMMER
                    </h1>

                    <button
                        className="mt-3 sm:mt-5 px-4 sm:px-6 py-2 border border-white hover:bg-white hover:text-black transition">
                        SHOP NOW
                    </button>

                </div>

                {/* indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {banners.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition ${
                                idx === slideIndex ? "bg-white" : "bg-white/40"
                            }`}
                        />
                    ))}
                </div>

            </div>

            {/* 추천 상품 */}
            <div className="px-6 mt-10">

                <h2 className="text-xl font-bold mb-4">🔥 추천 상품</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                    {products
                        .filter(p => p.status !== "DELETED")
                        .slice(0, 4)
                        .map(p => {

                            const isSoldOut =
                                p.status === "SOLD_OUT";

                            return (

                                <div
                                    key={p.id}
                                    className="
                                                relative
                                                bg-white
                                                rounded
                                                shadow
                                                p-3
                                                hover:scale-105
                                                transition
                                                cursor-pointer
                                               "
                                    onClick={() => navigate(`/product/${p.id}`)}
                                >

                                    {/* 품절 오버레이 */}
                                    {isSoldOut && (
                                        <div className="
                                                        absolute
                                                        inset-0
                                                        bg-black/50
                                                        z-10
                                                        flex
                                                        items-center
                                                        justify-center
                                                        rounded
                                                       "
                                        >
                                            <span className="
                                                text-white
                                                text-2xl
                                                font-extrabold
                                                tracking-widest
                                            ">
                                                SOLD OUT
                                            </span>
                                        </div>
                                    )}

                                    <img
                                        src={`http://localhost:8081/images/${p.imageUrl}`}
                                        className="
                                                    h-75
                                                    w-full
                                                    object-cover
                                                    rounded
                                                  "
                                    />

                                    <p className="font-bold mt-2">
                                        {p.name}
                                    </p>

                                    <p className="text-gray-500">
                                        ₩{p.price}
                                    </p>

                                </div>

                            );
                        })}

                </div>
            </div>

            {/* 전체 상품 */}
            <div className="px-6 mt-10">

                <h2 className="text-xl font-bold mb-4">전체 상품</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                    {products
                        .filter(p => p.status !== "DELETED")
                        .map(p => {

                            const isSoldOut =
                                p.status === "SOLD_OUT";

                            return (

                                <div
                                    key={p.id}
                                    className="
                                                relative
                                                bg-white
                                                p-4
                                                rounded
                                                shadow
                                                hover:shadow-lg
                                                hover:scale-105
                                                transition
                                                cursor-pointer
                                              "
                                    onClick={() => navigate(`/product/${p.id}`)}
                                >

                                    {/* 품절 오버레이 */}
                                    {isSoldOut && (
                                        <div className="
                                            absolute
                                            inset-0
                                            bg-black/50
                                            z-10
                                            flex
                                            items-center
                                            justify-center
                                            rounded
                                        ">
                                            <span className="
                                                text-white
                                                text-3xl
                                                font-extrabold
                                                tracking-widest
                                            ">
                                                SOLD OUT
                                            </span>
                                        </div>
                                    )}

                                    <img
                                        src={`http://localhost:8081/images/${p.imageUrl}`}
                                        className="
                                                    h-75
                                                    w-full
                                                    object-cover
                                                    mb-2
                                                    rounded
                                                  "
                                    />

                                    <h2 className="font-bold">
                                        {p.name}
                                    </h2>

                                    <p className="text-gray-700">
                                        ₩{p.price}
                                    </p>

                                    <button
                                        disabled={isSoldOut}
                                        onClick={(e) => {

                                            e.stopPropagation();

                                            if (isSoldOut) {
                                                return;
                                            }

                                            handleAddCart(p.id);
                                        }}
                                        className={
                                            isSoldOut
                                                ? `
                                                    mt-2
                                                    w-full
                                                    bg-gray-300
                                                    text-gray-500
                                                    p-2
                                                    rounded
                                                    cursor-not-allowed
                                                  `
                                                : `
                                                    mt-2
                                                    w-full
                                                    bg-indigo-600
                                                    text-white
                                                    p-2
                                                    rounded
                                                    hover:bg-indigo-700
                                                  `
                                        }
                                    >
                                        {isSoldOut
                                            ? "품절"
                                            : addedMap[p.id]
                                                ? "담김"
                                                : "장바구니"}
                                    </button>

                                </div>

                            );
                        })}

                </div>
            </div>

            {/* MODAL */}
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

            {/*{selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}*/}

        </div>
    );
}

export default MainPage;