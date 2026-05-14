import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getProductDetail } from "../api/product";
import { addToCart } from "../api/cart";

import { getOrderStatus } from "../api/order";
import { requestPayment } from "../api/payment";

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

    // 상품 조회
    useEffect(() => {

        const fetchProduct = async () => {

            try {

                const res = await getProductDetail(id);

                const data = res.data;

                setProduct(data);

                // 대표 이미지 기본 선택
                setSelectedImage(
                    `http://localhost:8081/images/${data.imageUrl}`
                );

            } catch (err) {

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
                            src={`http://localhost:8081/images/${product.imageUrl}`}
                        />
                        */}

                        {/* 썸네일 */}
                        <div className="flex gap-3 mt-4 overflow-x-auto">

                            {/* 대표 이미지 */}
                            <img
                                src={`http://localhost:8081/images/${product.imageUrl}`}
                                onClick={() =>
                                    setSelectedImage(
                                        `http://localhost:8081/images/${product.imageUrl}`
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
                                    src={`http://localhost:8081/images/${img}`}
                                    onClick={() =>
                                        setSelectedImage(
                                            `http://localhost:8081/images/${img}`
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

                            <h2 className="text-xl font-bold mb-6">
                                REVIEW
                            </h2>

                            {/* 추후 실제 API 연결 */}
                            <div className="space-y-4">

                                <div className="border rounded p-4">

                                    <div className="flex justify-between">

                                        <span className="font-semibold">
                                            user1
                                        </span>

                                        <span className="text-sm text-gray-400">
                                            2026-05-14
                                        </span>

                                    </div>

                                    <p className="mt-3 text-gray-700">
                                        핏이 좋고 재질이 괜찮습니다.
                                    </p>

                                </div>

                                <div className="border rounded p-4">

                                    <div className="flex justify-between">

                                        <span className="font-semibold">
                                            user2
                                        </span>

                                        <span className="text-sm text-gray-400">
                                            2026-05-10
                                        </span>

                                    </div>

                                    <p className="mt-3 text-gray-700">
                                        배송 빨라요.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ProductDetailPage;