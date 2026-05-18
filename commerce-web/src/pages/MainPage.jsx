import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { addToCart, getCartCount } from "../api/cart";

import AdminModal from "../components/AdminModal";
import CartModal from "../components/CartModal";
import OrderModal from "../components/OrderModal";

import { useNavigate } from "react-router-dom";

function MainPage({ user, onLogout, onRequireLogin }) {

    const [showAdmin, setShowAdmin] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showOrder, setShowOrder] = useState(false);

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [addedMap, setAddedMap] = useState({});
    const [slideIndex, setSlideIndex] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    // =========================
    // 상품별 독립 슬라이드 상태
    // =========================
    const [productSlideMap, setProductSlideMap] = useState({});

    // =========================
    // 필터 상태
    // =========================
    const [selectedGender, setSelectedGender] = useState("ALL");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const genders = [
        { label: "전체", value: "ALL" },
        { label: "MEN", value: "MEN" },
        { label: "WOMEN", value: "WOMEN" },
        { label: "UNISEX", value: "UNISEX" },
    ];

    const categories = [
        { label: "전체", value: "ALL" },
        { label: "TOP", value: "TOP" },
        { label: "BOTTOM", value: "BOTTOM" },
        { label: "OUTER", value: "OUTER" },
        { label: "SHOES", value: "SHOES" },
    ];

    const banners = [
        "/banner1.jpg",
        "/banner2.jpg",
        "/banner3.jpg",
    ];

    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8081";

    // 상품 조회
    const fetchProducts = async () => {

        try {

            const res = await api.get("/products");

            setProducts(res.data.data || []);

        } catch (err) {

            console.log("상품 조회 실패", err);
        }
    };

    const fetchCartCount = async () => {
        try {
            const res = await getCartCount();
            setCartCount(res.data || 0);
        } catch (err) {
            console.log("cart count 실패", err);
        }
    };

    useEffect(() => {

        if (user) {
            fetchCartCount();
        } else {
            setCartCount(0);
        }

        fetchProducts();

    }, [user]);

    // =========================
    // 메인 배너 슬라이드
    // =========================
    useEffect(() => {

        const timer = setInterval(() => {

            setSlideIndex(prev =>
                (prev + 1) % banners.length
            );

        }, 4000);

        return () => clearInterval(timer);

    }, []);

    // =========================
    // 상품별 독립 슬라이드
    // =========================
    useEffect(() => {

        if (products.length === 0) {
            return;
        }

        const timer = setInterval(() => {

            setProductSlideMap(prev => {

                const nextMap = { ...prev };

                products.forEach(product => {

                    const images =
                        product.images?.length > 0
                            ? product.images
                            : [product.imageUrl];

                    nextMap[product.id] =
                        ((prev[product.id] || 0) + 1)
                        % images.length;
                });

                return nextMap;
            });

        }, 2000);

        return () => clearInterval(timer);

    }, [products]);

    // 장바구니
    const handleAddCart = async (productId) => {

        if (!user) {

            onRequireLogin?.();

            return;
        }

        try {

            await addToCart({
                productId,
                quantity: 1
            });

            fetchCartCount();

            setAddedMap(prev => ({
                ...prev,
                [productId]: true
            }));

            setTimeout(() => {

                setAddedMap(prev => ({
                    ...prev,
                    [productId]: false
                }));

            }, 1200);

        } catch (err) {

            console.log(err);

            alert("장바구니 실패");
        }
    };

    // =========================
    // 필터 적용 상품
    // =========================
    const filteredProducts = useMemo(() => {

        return products.filter(p => {

            if (p.status === "DELETED") {
                return false;
            }

            const genderMatch =
                selectedGender === "ALL"
                || p.gender === selectedGender;

            const categoryMatch =
                selectedCategory === "ALL"
                || p.category === selectedCategory;

            return genderMatch && categoryMatch;
        });

    }, [
        products,
        selectedGender,
        selectedCategory
    ]);

    return (

        <div className="bg-gray-50 min-h-screen">

            {/* =========================
                HEADER
            ========================= */}
            <div
                className="
                    sticky
                    top-0
                    z-50
                    bg-white/90
                    backdrop-blur
                    border-b
                    px-6
                    py-4
                    flex
                    justify-between
                    items-center
                "
            >

                <h1
                    className="
                        text-2xl
                        font-black
                        tracking-tight
                        cursor-pointer
                    "
                >
                    🛍️ Commerce
                </h1>

                <div className="flex items-center gap-3">

                    {!user ? (

                        <button
                            onClick={onRequireLogin}
                            className="
                                bg-black
                                text-white
                                px-5
                                py-2
                                rounded-full
                                hover:bg-gray-800
                                transition
                            "
                        >
                            로그인
                        </button>

                    ) : (

                        <>
                            <span
                                className="
                                    text-sm
                                    font-medium
                                    text-gray-700
                                "
                            >
                                {user.email}
                            </span>

                            <button
                                onClick={() => setShowOrder(true)}
                                className="
                                    hover:bg-gray-100
                                    px-4
                                    py-2
                                    rounded-full
                                    transition
                                "
                            >
                                주문
                            </button>

                            <button
                                onClick={() => setShowCart(true)}
                                className="
                                    relative
                                    hover:bg-gray-100
                                    px-4
                                    py-2
                                    rounded-full
                                    transition
                                "
                            >
                                장바구니

                                {cartCount > 0 && (
                                    <span className="
                                        absolute
                                        -top-1
                                        -right-1
                                        bg-red-500
                                        text-white
                                        text-[11px]
                                        w-5
                                        h-5
                                        flex
                                        items-center
                                        justify-center
                                        rounded-full
                                        font-bold
                                    ">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {user.role === "ADMIN" && (

                                <button
                                    onClick={() => setShowAdmin(true)}
                                    className="
                                        hover:bg-gray-100
                                        px-4
                                        py-2
                                        rounded-full
                                        transition
                                    "
                                >
                                    관리자
                                </button>
                            )}

                            <button
                                onClick={onLogout}
                                className="
                                    bg-gray-100
                                    hover:bg-gray-200
                                    px-4
                                    py-2
                                    rounded-full
                                    transition
                                "
                            >
                                로그아웃
                            </button>
                        </>
                    )}

                </div>

            </div>

            {/* =========================
                HERO
            ========================= */}
            <div
                className="
                    relative
                    w-full
                    aspect-[16/5]
                    sm:aspect-[21/6]
                    md:aspect-[24/7]
                    overflow-hidden
                "
            >

                <img
                    src={banners[slideIndex]}
                    className="
                        w-full
                        h-full
                        object-cover
                        object-center
                        scale-105
                        transition-all
                        duration-700
                    "
                />

                <div className="absolute inset-0 bg-black/35" />

                <div
                    className="
                        absolute
                        bottom-6
                        sm:bottom-20
                        left-4
                        sm:left-16
                        text-white
                    "
                >

                    <p
                        className="
                            text-[10px]
                            sm:text-sm
                            tracking-[0.3em]
                        "
                    >
                        NEW COLLECTION
                    </p>

                    <h1
                        className="
                            text-2xl
                            sm:text-5xl
                            font-black
                            mt-3
                            leading-tight
                        "
                    >
                        2026
                        <br />
                        SPRING / SUMMER
                    </h1>

                    <button
                        className="
                            mt-5
                            px-6
                            py-3
                            border
                            border-white
                            hover:bg-white
                            hover:text-black
                            transition
                        "
                    >
                        SHOP NOW
                    </button>

                </div>

                {/* indicator */}
                <div
                    className="
                        absolute
                        bottom-4
                        left-1/2
                        -translate-x-1/2
                        flex
                        gap-2
                    "
                >

                    {banners.map((_, idx) => (

                        <div
                            key={idx}
                            className={`
                                h-2
                                rounded-full
                                transition-all
                                duration-300
                                ${
                                idx === slideIndex
                                    ? "w-8 bg-white"
                                    : "w-2 bg-white/40"
                            }
                            `}
                        />
                    ))}

                </div>

            </div>

            {/* =========================
                FILTER BAR
            ========================= */}
            <div
                className="
                    sticky
                    top-[73px]
                    z-40
                    bg-white/95
                    backdrop-blur
                    border-b
                "
            >

                <div
                    className="
                        max-w-7xl
                        mx-auto
                        px-6
                        py-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            overflow-x-auto
                            scrollbar-hide
                            whitespace-nowrap
                        "
                    >

                        {/* 성별 */}
                        {genders.map(g => (

                            <button
                                key={g.value}
                                onClick={() =>
                                    setSelectedGender(g.value)
                                }
                                className={`
                                    px-6
                                    py-3
                                    rounded-full
                                    text-[15px]
                                    font-semibold
                                    transition-all
                                    duration-200
                                    border
                                    shrink-0
                                ${
                                    selectedGender === g.value
                                        ? `
                                    bg-black
                                    text-white
                                    border-black
                                    shadow-md
                                    scale-105
                                  `
                                        : `
                                    bg-white
                                    text-gray-700
                                    border-gray-200
                                    hover:border-black
                                    hover:text-black
                                  `
                                }
                    `}
                            >
                                {g.label}
                            </button>

                        ))}

                        {/* 구분선 */}
                        <div
                            className="
                                w-px
                                h-8
                                bg-gray-200
                                mx-1
                                shrink-0
                            "
                        />

                        {/* 카테고리 */}
                        {categories.map(c => (

                            <button
                                key={c.value}
                                onClick={() =>
                                    setSelectedCategory(c.value)
                                }
                                className={`
                                    px-6
                                    py-3
                                    rounded-full
                                    text-[15px]
                                    font-semibold
                                    transition-all
                                    duration-200
                                    border
                                    shrink-0
                                ${
                                    selectedCategory === c.value
                                        ? `
                                    bg-indigo-600
                                    text-white
                                    border-indigo-600
                                    shadow-md
                                    scale-105
                                  `
                                        : `
                                    bg-white
                                    text-gray-700
                                    border-gray-200
                                    hover:border-indigo-400
                                    hover:text-indigo-600
                                  `
                                }
                    `}
                            >
                                {c.label}
                            </button>

                        ))}

                    </div>

                </div>

            </div>

            {/* =========================
                추천 상품
            ========================= */}
            <div className="px-6 mt-12">

                <div
                    className="
                        flex
                        justify-between
                        items-center
                        mb-5
                    "
                >

                    <h2
                        className="
                            text-2xl
                            font-black
                            tracking-tight
                        "
                    >
                        🔥 추천 상품
                    </h2>

                    <span className="text-sm text-gray-500">
                        {filteredProducts.length}개의 상품
                    </span>

                </div>

                <div
                    className="
                        grid
                        grid-cols-2
                        sm:grid-cols-4
                        gap-5
                    "
                >

                    {filteredProducts
                        .slice(0, 4)
                        .map(p => {

                            const isSoldOut =
                                p.status === "SOLD_OUT";

                            const images =
                                p.images?.length > 0
                                    ? p.images
                                    : [p.imageUrl];

                            const currentIndex =
                                productSlideMap[p.id] || 0;

                            const currentImage =
                                images[currentIndex];

                            return (

                                <div
                                    key={p.id}
                                    className="
                                        relative
                                        bg-white
                                        rounded-2xl
                                        overflow-hidden
                                        shadow-sm
                                        hover:shadow-2xl
                                        transition-all
                                        duration-300
                                        cursor-pointer
                                        group
                                    "
                                    onClick={() =>
                                        navigate(`/product/${p.id}`)
                                    }
                                >

                                    {/* 품절 */}
                                    {isSoldOut && (

                                        <div
                                            className="
                                                absolute
                                                inset-0
                                                bg-black/60
                                                z-20
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >
                                            <span
                                                className="
                                                    text-white
                                                    text-2xl
                                                    font-black
                                                    tracking-[0.2em]
                                                "
                                            >
                                                SOLD OUT
                                            </span>
                                        </div>
                                    )}

                                    {/* 이미지 */}
                                    <div
                                        className="
                                            overflow-hidden
                                            bg-gray-100
                                        "
                                    >

                                        <img
                                            src={`${API_BASE_URL}/images/${currentImage}`}
                                            className="
                                                h-[420px]
                                                w-full
                                                object-cover
                                                group-hover:scale-105
                                                transition-all
                                                duration-700
                                            "
                                        />

                                    </div>

                                    {/* 내용 */}
                                    <div className="p-4">

                                        <div
                                            className="
                                                flex
                                                gap-2
                                                mb-2
                                            "
                                        >

                                            <span
                                                className="
                                                    text-xs
                                                    bg-gray-100
                                                    px-2
                                                    py-1
                                                    rounded-full
                                                "
                                            >
                                                {p.gender}
                                            </span>

                                            <span
                                                className="
                                                    text-xs
                                                    bg-indigo-50
                                                    text-indigo-600
                                                    px-2
                                                    py-1
                                                    rounded-full
                                                "
                                            >
                                                {p.category}
                                            </span>

                                        </div>

                                        <p
                                            className="
                                                font-bold
                                                text-lg
                                            "
                                        >
                                            {p.name}
                                        </p>

                                        <p
                                            className="
                                                text-gray-500
                                                mt-1
                                            "
                                        >
                                            ₩{p.price}
                                        </p>

                                    </div>

                                </div>
                            );
                        })}

                </div>

            </div>

            {/* =========================
                전체 상품
            ========================= */}
            <div className="px-6 mt-14 pb-20">

                <h2
                    className="
                        text-2xl
                        font-black
                        tracking-tight
                        mb-5
                    "
                >
                    전체 상품
                </h2>

                {filteredProducts.length === 0 && (

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            p-20
                            text-center
                            shadow-sm
                        "
                    >
                        <p
                            className="
                                text-gray-500
                                text-lg
                            "
                        >
                            해당 조건의 상품이 없습니다.
                        </p>
                    </div>
                )}

                <div
                    className="
                        grid
                        grid-cols-2
                        sm:grid-cols-4
                        gap-5
                    "
                >

                    {filteredProducts.map(p => {

                        const isSoldOut =
                            p.status === "SOLD_OUT";

                        const images =
                            p.images?.length > 0
                                ? p.images
                                : [p.imageUrl];

                        const currentIndex =
                            productSlideMap[p.id] || 0;

                        const currentImage =
                            images[currentIndex];

                        return (

                            <div
                                key={p.id}
                                className="
                                    relative
                                    bg-white
                                    rounded-2xl
                                    overflow-hidden
                                    shadow-sm
                                    hover:shadow-2xl
                                    transition-all
                                    duration-300
                                    cursor-pointer
                                    group
                                "
                                onClick={() =>
                                    navigate(`/product/${p.id}`)
                                }
                            >

                                {/* 품절 */}
                                {isSoldOut && (

                                    <div
                                        className="
                                            absolute
                                            inset-0
                                            bg-black/60
                                            z-20
                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >
                                        <span
                                            className="
                                                text-white
                                                text-3xl
                                                font-black
                                                tracking-[0.2em]
                                            "
                                        >
                                            SOLD OUT
                                        </span>
                                    </div>
                                )}

                                {/* 이미지 */}
                                <div
                                    className="
                                        overflow-hidden
                                        bg-gray-100
                                    "
                                >

                                    <img
                                        src={`${API_BASE_URL}/images/${currentImage}`}
                                        className="
                                            h-[420px]
                                            w-full
                                            object-cover
                                            group-hover:scale-105
                                            transition-all
                                            duration-700
                                        "
                                    />

                                </div>

                                {/* 내용 */}
                                <div className="p-4">

                                    {/* 태그 */}
                                    <div
                                        className="
                                            flex
                                            gap-2
                                            mb-2
                                        "
                                    >

                                        <span
                                            className="
                                                text-xs
                                                bg-gray-100
                                                px-2
                                                py-1
                                                rounded-full
                                            "
                                        >
                                            {p.gender}
                                        </span>

                                        <span
                                            className="
                                                text-xs
                                                bg-indigo-50
                                                text-indigo-600
                                                px-2
                                                py-1
                                                rounded-full
                                            "
                                        >
                                            {p.category}
                                        </span>

                                    </div>

                                    <h2
                                        className="
                                            font-bold
                                            text-lg
                                        "
                                    >
                                        {p.name}
                                    </h2>

                                    <p
                                        className="
                                            text-gray-700
                                            mt-1
                                            text-base
                                        "
                                    >
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
                                                    mt-4
                                                    w-full
                                                    bg-gray-200
                                                    text-gray-500
                                                    py-3
                                                    rounded-xl
                                                    cursor-not-allowed
                                                  `
                                                : `
                                                    mt-4
                                                    w-full
                                                    bg-black
                                                    text-white
                                                    py-3
                                                    rounded-xl
                                                    hover:bg-gray-800
                                                    transition
                                                  `
                                        }
                                    >
                                        {isSoldOut
                                            ? "품절"
                                            : addedMap[p.id]
                                                ? "담김 완료"
                                                : "장바구니"}
                                    </button>

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

            {/* =========================
                MODAL
            ========================= */}
            {showAdmin && (

                <AdminModal
                    onClose={() => setShowAdmin(false)}
                    onProductChange={fetchProducts}
                />
            )}

            {showCart && (

                <CartModal
                    onClose={() => setShowCart(false)}
                    onCartChange={fetchCartCount}
                />
            )}

            {showOrder && (

                <OrderModal
                    onClose={() => setShowOrder(false)}
                />
            )}

        </div>
    );
}

export default MainPage;