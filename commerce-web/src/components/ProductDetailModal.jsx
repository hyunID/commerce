import { useEffect, useRef, useState } from "react";
import { getOrderStatus } from "../api/order";

// ❌ 기존 즉시 구매 방식 제거
// import { directOrder } from "../api/order";
//
// 기존 구조:
// 구매 클릭
// → 즉시 주문 완료
// → 재고 즉시 차감
//
// 현재 구조:
// 구매 클릭
// → 주문 생성(PENDING)
// → reserve 처리
// → 결제 성공 시 confirm
// → 결제 실패/만료 시 cancelReserve

import { requestPayment } from "../api/payment";

function ProductDetailModal({ product, onClose }) {

    const [qty, setQty] = useState(1);

    // 토스 결제 위젯 객체 저장
    const [widgets, setWidgets] = useState(null);

    // 주문 생성 후 받은 정보 저장
    const [paymentInfo, setPaymentInfo] = useState(null);

    // polling interval 저장용
    // 기존 interval 변수 방식은
    // 렌더링마다 setInterval 생성 위험 있음
    const pollingRef = useRef(null);

    //  신규 추가
    // 결제 진행중 여부
    // paymentInfo 생성되면 이미 reserve 완료 상태이므로
    // 수량 변경 및 재주문 막기
    const isPaymentPending = !!paymentInfo;

    //  수정
    // 결제 진행중이면 수량 변경 금지
    const changeQty = (delta) => {

        if (isPaymentPending) {
            return;
        }

        setQty(prev => Math.max(1, prev + delta));
    };

    // 토스 결제 위젯 초기화
    useEffect(() => {

        const initWidget = async () => {

            // SDK 체크
            if (!window.TossPayments) {
                console.error("토스 SDK 없음");
                return;
            }

            // v2 standard SDK 사용
            const tossPayments = window.TossPayments(
                "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"
            );

            // customerKey 생성
            // 실제 서비스에서는 userId 추천
            const widgetInstance = tossPayments.widgets({
                customerKey: "USER_" + Date.now()
            });

            setWidgets(widgetInstance);
        };

        initWidget();

    }, []);

    // 컴포넌트 종료 시 polling 제거
    useEffect(() => {

        return () => {

            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };

    }, []);

    // 주문 상태 polling 시작
    const startPolling = (orderId) => {

        // 기존 polling 제거
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }

        pollingRef.current = setInterval(async () => {

            try {

                // ORDER_4_1778423408655
                const pureOrderId =
                    String(orderId).split("_")[1];

                const statusRes =
                    await getOrderStatus(pureOrderId);

                const status = statusRes.data.data;

                console.log("현재 주문 상태 =", status);

                // 결제 만료 감지
                // scheduler 에서 FAILED 처리됨
                if (status === "FAILED") {

                    clearInterval(pollingRef.current);

                    alert("결제 시간이 만료되었습니다.");

                    // 실패 페이지 이동
                    window.location.href =
                        `/payment/fail-page?orderId=${orderId}`;
                }

            } catch (e) {
                console.error(e);
            }

        }, 10000);
    };

    // 기존:
    // directOrder() 즉시 구매
    //
    // 현재:
    // 주문 생성 + reserve 처리만 진행
    const handleBuy = async () => {

        //  신규 추가
        // 이미 결제 진행중이면 중복 주문 방지
        if (isPaymentPending) {
            alert("이미 결제가 진행 중입니다.");
            return;
        }

        console.log("재고=" + product.stock);
        console.log("구매 수량=" + qty);

        // UX용 재고 체크
        if (product.stock < qty) {
            alert("재고 부족");
            return;
        }

        if (!window.confirm("결제 진행하시겠습니까?")) return;

        try {

            // 1. 주문 생성
            // 상태:
            // PENDING
            //
            // reserve 처리 완료됨
            const res = await requestPayment({
                items: [
                    {
                        productId: product.id,
                        quantity: qty
                    }
                ]
            });

            console.log("주문 생성 응답:", res);

            const { orderId, amount, orderName }
                = res.data.data;

            console.log("orderId:", orderId);
            console.log("amount:", amount);
            console.log("orderName:", orderName);

            // 주문 정보 저장
            setPaymentInfo({
                orderId,
                amount,
                orderName
            });

            // 주문 상태 polling 시작
            startPolling(orderId);

            // widgets 준비 안됐으면 종료
            if (!widgets) {
                alert("결제 위젯 로딩 중");
                return;
            }

            // 결제 금액 설정
            await widgets.setAmount({
                currency: "KRW",
                value: Number(amount),
            });

            // 결제 UI 렌더링
            await widgets.renderPaymentMethods({
                selector: "#payment-method",
                variantKey: "DEFAULT",
            });

            // 약관 UI 렌더링
            await widgets.renderAgreement({
                selector: "#agreement",
                variantKey: "AGREEMENT",
            });

        } catch (err) {

            console.error(err);

            alert("주문 생성 실패");
        }
    };

    // 실제 결제 진행
    const handlePayment = async () => {

        if (!widgets || !paymentInfo) {
            alert("결제 정보 없음");
            return;
        }

        try {

            // 토스 결제 요청
            await widgets.requestPayment({

                orderId: String(paymentInfo.orderId),

                orderName: paymentInfo.orderName,

                customerName: "테스트회원",

                customerEmail: "test@test.com",

                successUrl:
                    window.location.origin
                    + "/payment/success-page",

                failUrl:
                    window.location.origin
                    + "/payment/fail-page",
            });

            // polling 종료
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }

        } catch (err) {

            console.error(err);

            alert("결제 실패");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

            <div className="bg-white p-6 w-[500px] rounded">

                <h2 className="text-xl font-bold mb-4">
                    {product.name}
                </h2>

                <img
                    src={`http://localhost:8081/images/${product.imageUrl}`}
                    className="w-full h-40 object-cover mb-3"
                />

                <p className="text-lg">
                    ₩{product.price}
                </p>

                {/* 수량 선택 */}
                <div className="flex items-center gap-2 mb-4">

                    {/*  수정 */}
                    {/* 결제 진행중이면 수량 변경 불가 */}
                    <button
                        disabled={isPaymentPending}
                        onClick={() => changeQty(-1)}
                        className={`
                            px-2
                            ${isPaymentPending
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-gray-300"
                        }
                        `}
                    >
                        -
                    </button>

                    <span>{qty}</span>

                    {/*  수정 */}
                    {/* 결제 진행중이면 수량 변경 불가 */}
                    <button
                        disabled={isPaymentPending}
                        onClick={() => changeQty(1)}
                        className={`
                            px-2
                            ${isPaymentPending
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-gray-300"
                        }
                        `}
                    >
                        +
                    </button>
                </div>

                {/* 결제 진행중이면 재주문 방지 */}
                <button
                    disabled={isPaymentPending}
                    onClick={handleBuy}
                    className={`
                        w-full text-white p-2 rounded
                        ${isPaymentPending
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600"
                    }
                    `}
                >
                    {isPaymentPending
                        ? "결제 진행중"
                        : "결제"}
                </button>

                {/* 신규 추가 */}
                {/* 토스 결제 수단 UI */}
                <div
                    id="payment-method"
                    className="mt-5"
                ></div>

                {/* 신규 추가 */}
                {/* 약관 UI */}
                <div
                    id="agreement"
                    className="mt-3"
                ></div>

                {/* 신규 추가 */}
                {/* 실제 결제 진행 버튼 */}
                {paymentInfo && (
                    <button
                        onClick={handlePayment}
                        className="w-full bg-green-600 text-white p-2 rounded mt-5"
                    >
                        실제 결제 진행
                    </button>
                )}

                {/* 수정 */}
                {/* 결제 진행중이면 모달 닫기 방지 */}
                <button
                    disabled={isPaymentPending}
                    onClick={onClose}
                    className={`
                        mt-3 w-full
                        ${isPaymentPending
                        ? "text-gray-400 cursor-not-allowed"
                        : ""
                    }
                    `}
                >
                    닫기
                </button>

            </div>
        </div>
    );
}

export default ProductDetailModal;