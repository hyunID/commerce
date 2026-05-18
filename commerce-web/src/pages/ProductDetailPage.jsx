import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getProductDetail } from "../api/product";
import { addToCart } from "../api/cart";

import { getOrderStatus } from "../api/order";
import { requestPayment } from "../api/payment";

import {
    createReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getReviewPermission

} from "../api/review";

function ProductDetailPage() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [product, setProduct] = useState(null);

    const [qty, setQty] = useState(1);

    const [widgets, setWidgets] = useState(null);

    const [paymentInfo, setPaymentInfo] = useState(null);

    const [selectedImage, setSelectedImage] = useState("");

    const pollingRef = useRef(null);

    const isPaymentPending = !!paymentInfo;

    const [reviews, setReviews] = useState([]);

    //const [reviewedSet, setReviewedSet] = useState(new Set());

    //const [orderItemId, setOrderItemId] = useState(null);

    const [reviewText, setReviewText] = useState("");

    const [rating, setRating] = useState(3);//별점 기본값3 셋팅

    const [editId, setEditId] = useState(null);

    const [editRating, setEditRating] = useState(3);

    const [reviewPermission, setReviewPermission] = useState(null);

    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8081";

    // 상품 조회
    useEffect(() => {

        const fetchProduct = async () => {

            try {

                const res = await getProductDetail(id);

                const data = res.data;

                setProduct(data);

                // 대표 이미지 기본 선택
                setSelectedImage(
                    `${API_BASE_URL}/images/${data.imageUrl}`
                );

            } catch (err) {
                alert(err);
                console.error(err);

                alert("상품 조회 실패");

                navigate("/");
            }
        };

        fetchProduct();

    }, [id]);

    // 토스 위젯 초기화
    useEffect(() => {

        const initWidget = async () => {

            if (!window.TossPayments) {
                return;
            }

            const tossPayments = window.TossPayments(
                "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"
            );

            const widgetInstance =
                tossPayments.widgets({
                    customerKey: "USER_" + Date.now()
                });

            setWidgets(widgetInstance);
        };

        initWidget();

    }, []);

    // polling 제거
    useEffect(() => {

        return () => {

            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };

    }, []);

    /*useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const oid = params.get("orderItemId");

        if (oid) {
            setOrderItemId(Number(oid));
        }
    }, []);*/


    const fetchReviewPermission = async () => {

        try {

            const res =
                await getReviewPermission(id);

            setReviewPermission(res.data);

        } catch (e) {

            console.error(e);
        }
    };


    const fetchReviews = async () => {
        try {
            const res = await getProductReviews(id);

            const list = res.data || [];

            //setReviews(list);

            // 이미 리뷰한 orderItemId Set 생성
            /*const reviewed = new Set(
                list.map(r => r.orderItemId)
            );*/

            setReviews(list);

        } catch (e) {

            console.error(e);
        }
    };

    useEffect(() => {
        fetchReviews();
        fetchReviewPermission();

    }, [id]);

    const handleCreateReview = async () => {

        try {

            if (!reviewPermission?.canWrite) {

                alert(
                    reviewPermission?.message ||
                    "리뷰 작성 권한이 없습니다."
                );

                return;
            }

            await createReview(product.id, {

                rating,
                content: reviewText
            });

            alert("리뷰 작성 완료");

            setReviewText("");

            setRating(3);

            fetchReviews();

            fetchReviewPermission();

        } catch (e) {

            console.error(e);

            alert("리뷰 실패");
        }
    };

    const handleUpdateReview = async (reviewId) => {
        try {
            await updateReview(reviewId, {
                content: reviewText,
                rating: editRating
            });

            alert("리뷰 수정 완료");

            setEditId(null);
            setReviewText("");
            setEditRating(3);

            fetchReviews();
            fetchReviewPermission();

        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteReview(reviewId);

            alert("삭제 완료");
            fetchReviews();
            fetchReviewPermission();

        } catch (e) {
            console.error(e);
        }
    };

    const changeQty = (delta) => {

        if (isPaymentPending) return;

        setQty(prev => Math.max(1, prev + delta));
    };

    // 장바구니 추가
    const handleAddCart = async () => {

        try {

            await addToCart({
                productId: product.id,
                quantity: qty
            });

            alert("장바구니 담기 완료");

        } catch (err) {

            console.error(err);

            alert("장바구니 실패");
        }
    };

    // 주문 상태 polling
    const startPolling = (orderId) => {

        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }

        pollingRef.current = setInterval(async () => {

            try {

                const pureOrderId =
                    String(orderId).split("_")[1];

                const statusRes =
                    await getOrderStatus(pureOrderId);

                const status =
                    statusRes.data.data;

                if (status === "FAILED") {

                    clearInterval(pollingRef.current);

                    alert("결제 시간이 만료되었습니다.");

                    window.location.href =
                        `/payment/fail-page?orderId=${orderId}`;
                }

            } catch (e) {
                console.error(e);
            }

        }, 10000);
    };

    // 주문 생성
    const handleBuy = async () => {

        if (isPaymentPending) {
            alert("이미 결제가 진행 중입니다.");
            return;
        }

        if (product.availableStock < qty) {
            alert("재고 부족");
            return;
        }

        if (!window.confirm("결제 진행하시겠습니까?")) {
            return;
        }

        try {

            const res = await requestPayment({
                items: [
                    {
                        productId: product.id,
                        quantity: qty
                    }
                ]
            });

            const {
                orderId,
                amount,
                orderName
            } = res.data.data;

            setPaymentInfo({
                orderId,
                amount,
                orderName
            });

            startPolling(orderId);

            if (!widgets) {
                alert("결제 위젯 로딩 중");
                return;
            }

            await widgets.setAmount({
                currency: "KRW",
                value: Number(amount),
            });

            await widgets.renderPaymentMethods({
                selector: "#payment-method",
                variantKey: "DEFAULT",
            });

            await widgets.renderAgreement({
                selector: "#agreement",
                variantKey: "AGREEMENT",
            });

        } catch (err) {

            console.error(err);

            alert("주문 생성 실패");
        }
    };

    // 실제 결제
    const handlePayment = async () => {

        if (!widgets || !paymentInfo) {
            alert("결제 정보 없음");
            return;
        }

        try {

            await widgets.requestPayment({

                orderId:
                    String(paymentInfo.orderId),

                orderName:
                paymentInfo.orderName,

                customerName: "테스트회원",

                customerEmail:
                    "test@test.com",

                // 기존 유지
                successUrl:
                    window.location.origin
                    + "/payment/success-page",

                failUrl:
                    window.location.origin
                    + "/payment/fail-page",
            });

            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }

        } catch (err) {

            console.error(err);

            alert("결제 실패");
        }
    };

    if (!product) {
        return (
            <div className="p-10">
                로딩중...
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* 뒤로가기 */}
                <button
                    onClick={() => navigate("/")}
                    className="mb-10 text-sm text-gray-500 hover:text-black"
                >
                    ← 뒤로가기
                </button>

                <div className="grid md:grid-cols-2 gap-14">

                    {/* 이미지 영역 */}
                    <div>

                        {/* 메인 이미지 */}
                        <img
                            src={selectedImage}
                            className="w-full rounded object-cover border"
                        />

                        {/* 기존 단일 이미지 방식 유지 */}
                        {/*
                        <img
                            src={`${API_BASE_URL}/images/${product.imageUrl}`}
                        />
                        */}

                        {/* 썸네일 */}
                        <div className="flex gap-3 mt-4 overflow-x-auto">

                            {/* 대표 이미지 */}
                            <img
                                src={`${API_BASE_URL}/images/${product.imageUrl}`}
                                onClick={() =>
                                    setSelectedImage(
                                        `${API_BASE_URL}/images/${product.imageUrl}`
                                    )
                                }
                                className="
                                    w-20 h-20
                                    object-cover
                                    border
                                    cursor-pointer
                                    rounded
                                "
                            />

                            {/* 다중 이미지 */}
                            {product.images?.map((img, idx) => (

                                <img
                                    key={idx}
                                    src={`${API_BASE_URL}/images/${img}`}
                                    onClick={() =>
                                        setSelectedImage(
                                            `${API_BASE_URL}/images/${img}`
                                        )
                                    }
                                    className="
                                        w-20 h-20
                                        object-cover
                                        border
                                        cursor-pointer
                                        rounded
                                    "
                                />
                            ))}

                        </div>

                    </div>

                    {/* 상품 정보 */}
                    <div>

                        <p className="text-sm text-gray-400">
                            COMMERCE
                        </p>

                        <h1 className="text-3xl font-bold mt-2">
                            {product.name}
                        </h1>

                        <p className="text-3xl font-semibold mt-6">
                            ₩{product.price.toLocaleString()}
                        </p>

                        <div className="mt-6 border-t pt-6">

                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-500">
                                    배송비
                                </span>

                                <span>
                                    무료배송
                                </span>
                            </div>

                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-500">
                                    구매 가능 재고
                                </span>

                                <span>
                                    {product.availableStock}개
                                </span>
                            </div>

                        </div>

                        {/* 수량 */}
                        <div className="mt-8">

                            <p className="font-medium mb-3">
                                수량
                            </p>

                            <div className="flex items-center gap-3">

                                <button
                                    onClick={() => changeQty(-1)}
                                    className="
                                        w-10 h-10
                                        border
                                    "
                                >
                                    -
                                </button>

                                <span className="text-lg w-10 text-center">
                                    {qty}
                                </span>

                                <button
                                    onClick={() => changeQty(1)}
                                    className="
                                        w-10 h-10
                                        border
                                    "
                                >
                                    +
                                </button>

                            </div>

                        </div>

                        {/* 버튼 */}
                        <div className="grid grid-cols-2 gap-3 mt-8">

                            <button
                                onClick={handleAddCart}
                                className="
                                    border
                                    py-4
                                    font-medium
                                    hover:bg-gray-100
                                "
                            >
                                장바구니
                            </button>

                            <button
                                disabled={isPaymentPending}
                                onClick={handleBuy}
                                className="
                                    bg-black
                                    text-white
                                    py-4
                                    font-medium
                                    hover:bg-gray-800
                                "
                            >
                                구매하기
                            </button>

                        </div>

                        {/* 결제 UI */}
                        <div
                            id="payment-method"
                            className="mt-8"
                        ></div>

                        <div
                            id="agreement"
                            className="mt-5"
                        ></div>

                        {paymentInfo && (
                            <button
                                onClick={handlePayment}
                                className="
                                    w-full
                                    bg-green-600
                                    text-white
                                    py-4
                                    rounded
                                    mt-6
                                "
                            >
                                실제 결제 진행
                            </button>
                        )}

                        {/* 상품 설명 */}
                        <div className="mt-16">

                            <h2 className="text-xl font-bold mb-6">
                                상품 설명
                            </h2>

                            <div className="leading-8 text-gray-700 whitespace-pre-wrap">
                                {product.description}
                            </div>

                        </div>

                        {/* 리뷰 영역 */}
                        <div className="mt-20">

                            <h2 className="text-xl font-bold mb-6">REVIEW</h2>

                            {/*  리뷰 작성 영역 (구매자만) */}
                            <div className="border p-4 mb-6 rounded-xl">

                                {/* 권한 안내 */}
                                <div className="mb-3 text-sm">

                                    {reviewPermission?.canWrite ? (

                                        <p className="text-indigo-600 font-medium">

                                            {reviewPermission?.lastPurchasedAt &&
                                                `${new Date(
                                                    reviewPermission.lastPurchasedAt
                                                ).toLocaleDateString()} 구매한 상품에 대한 리뷰입니다.`}

                                        </p>

                                    ) : (

                                        <p className="text-gray-400">

                                            {reviewPermission?.message ||
                                                "상품 구매 이력이 없습니다."}

                                        </p>

                                    )}
                                </div>

                                {/* 별점 */}
                                <div
                                    className={`
                                        flex gap-1 text-2xl mb-3
                                        ${reviewPermission?.canWrite
                                        ? "cursor-pointer"
                                        : "opacity-40 pointer-events-none"}
                                    `}
                                >

                                    {[1,2,3,4,5].map((star) => (

                                        <span
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={
                                                star <= rating
                                                    ? "text-yellow-400"
                                                    : "text-gray-300"
                                            }
                                        >
                                            ★
                                        </span>
                                    ))}

                                </div>

                                {/* textarea */}
                                <textarea

                                    disabled={!reviewPermission?.canWrite}

                                    className={`
                                        w-full border p-3 rounded resize-none
                                        ${reviewPermission?.canWrite
                                        ? "bg-white"
                                        : "bg-gray-100 text-gray-400"}
                                    `}

                                    rows={4}

                                    placeholder={
                                        reviewPermission?.canWrite
                                            ? "리뷰를 작성해주세요."
                                            : "상품 구매 이력이 없습니다."
                                    }

                                    value={reviewText}

                                    onChange={(e) =>
                                        setReviewText(e.target.value)
                                    }
                                />

                                {/* 버튼 */}
                                <button

                                    disabled={!reviewPermission?.canWrite}

                                    onClick={handleCreateReview}

                                    className={`
                                        px-4 py-2 mt-3 rounded text-white
                                        ${reviewPermission?.canWrite
                                        ? "bg-black hover:bg-gray-800"
                                        : "bg-gray-400 cursor-not-allowed"}
                                    `}
                                >
                                    리뷰 작성
                                </button>

                            </div>

                            {/* 리뷰 리스트 */}
                            <div className="space-y-4">
                                {reviews.map((r) => (
                                    <div key={r.id} className="border p-4">

                                        {/* 작성자 + 별점 */}
                                        <div className="flex justify-between items-center">

                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    {r.writer}
                                                </span>

                                                {/* 별점 표시 */}
                                                <span className="text-yellow-400 text-sm">
                                                     {"★".repeat(r.rating)}
                                                    {"☆".repeat(5 - r.rating)}
                                                 </span>
                                            </div>
                                            {r.mine && (
                                                <div className="space-x-2">

                                                    <button
                                                        onClick={() => {
                                                            setEditId(r.id);
                                                            setReviewText(r.content);
                                                            setEditRating(r.rating);
                                                        }}
                                                        className="text-blue-500"
                                                    >
                                                        수정
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteReview(r.id)}
                                                        className="text-red-500"
                                                    >
                                                        삭제
                                                    </button>

                                                </div>
                                            )}
                                        </div>

                                        {editId === r.id ? (
                                            <div className="mt-2">

                                                {/* 별점 수정 */}
                                                <div className="flex gap-1 text-2xl cursor-pointer mb-2">
                                                    {[1,2,3,4,5].map((star) => (
                                                        <span
                                                            key={star}
                                                            onClick={() => setEditRating(star)}
                                                            className={
                                                                star <= editRating
                                                                    ? "text-yellow-400"
                                                                    : "text-gray-300"
                                                            }
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* 내용 수정 */}
                                                <textarea
                                                    value={reviewText}
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    className="w-full border p-2"
                                                />

                                                <button
                                                    onClick={() => handleUpdateReview(r.id)}
                                                    className="bg-blue-500 text-white px-3 py-1 mt-2"
                                                >
                                                    수정 완료
                                                </button>

                                            </div>
                                        ) : (
                                            <p className="mt-2 text-gray-700">
                                                {r.content}
                                            </p>
                                        )}

                                    </div>
                                ))}
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ProductDetailPage;