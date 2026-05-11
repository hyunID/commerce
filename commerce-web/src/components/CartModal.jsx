import { useEffect, useRef, useState } from "react";
import {
    getCart,
    updateCartItem,
    deleteCartItem,
    clearCart
} from "../api/cart";
import { requestCartPayment } from "../api/payment";
import { getOrderStatus } from "../api/order";

function CartModal({ onClose }) {

    const [cart, setCart] = useState(null);

    const [quantities, setQuantities] = useState({});

    // 토스 위젯
    const [widgets, setWidgets] = useState(null);

    // 생성된 주문 정보
    const [paymentInfo, setPaymentInfo] = useState(null);

    // polling 저장
    const pollingRef = useRef(null);

    // 결제 진행중 여부
    // 결제 진행 시 장바구니 수정 막기
    const isPaymentPending = !!paymentInfo;

    // 장바구니 조회
    const fetchCart = async () => {

        const res = await getCart();

        const data = res.data;

        setCart(data);

        const qtyMap = {};

        data.items.forEach(item => {
            qtyMap[item.cartItemId] = item.quantity;
        });

        setQuantities(qtyMap);
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // 토스 위젯 초기화
    useEffect(() => {

        const initWidget = async () => {

            if (!window.TossPayments) {
                console.error("토스 SDK 없음");
                return;
            }

            const tossPayments = window.TossPayments(
                "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"
            );

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

    // 수량 변경
    const handleChange = (id, value) => {

        // 결제 진행중이면 수정 금지
        if (isPaymentPending) return;

        setQuantities({
            ...quantities,
            [id]: Number(value)
        });
    };

    // 수량 저장
    const handleUpdate = async (id) => {

        // 결제 진행중 수정 금지
        if (isPaymentPending) {
            alert("결제 진행 중에는 수정할 수 없습니다.");
            return;
        }

        await updateCartItem(id, quantities[id]);

        alert("수정되었습니다.");

        fetchCart();
    };

    // 삭제
    const handleDelete = async (id) => {

        // 결제 진행중 수정 금지
        if (isPaymentPending) {
            alert("결제 진행 중에는 삭제할 수 없습니다.");
            return;
        }

        await deleteCartItem(id);

        alert("삭제되었습니다.");

        fetchCart();
    };

    // 전체 삭제
    const handleClear = async () => {

        // 결제 진행중 수정 금지
        if (isPaymentPending) {
            alert("결제 진행 중에는 삭제할 수 없습니다.");
            return;
        }

        await clearCart();

        alert("전체 삭제되었습니다.");

        fetchCart();
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

                const status = statusRes.data.data;

                console.log("현재 주문 상태 =", status);

                // 만료 감지
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

    // 주문 생성 + reserve
    const handleOrder = async () => {

        if (!window.confirm("결제하시겠습니까?")) return;

        try {

            // UX 재고 체크
            for (const item of cart.items) {

                if (item.stock < item.quantity) {

                    alert(`${item.productName} 재고 부족`);

                    return;
                }
            }

            // 주문 생성
            const res = await requestCartPayment();

            console.log("장바구니 주문 생성 =", res);

            const {
                orderId,
                amount,
                orderName
            } = res.data.data;

            console.log(orderId);
            console.log(amount);
            console.log(orderName);

            // 주문 정보 저장
            setPaymentInfo({
                orderId,
                amount,
                orderName
            });

            // polling 시작
            startPolling(orderId);

            // widgets 체크
            if (!widgets) {
                alert("결제 위젯 로딩중");
                return;
            }

            // 금액 설정
            await widgets.setAmount({
                currency: "KRW",
                value: Number(amount),
            });

            // 결제 UI
            await widgets.renderPaymentMethods({
                selector: "#payment-method",
                variantKey: "DEFAULT",
            });

            // 약관 UI
            await widgets.renderAgreement({
                selector: "#agreement",
                variantKey: "AGREEMENT",
            });

        } catch (e) {

            console.error(e);

            alert("결제 요청 실패");
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

                customerEmail: "test@test.com",

                successUrl:
                    window.location.origin
                    + "/payment/success-page",

                failUrl:
                    window.location.origin
                    + "/payment/fail-page",
            });

            // polling 제거
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }

        } catch (err) {

            console.error(err);

            alert("결제 실패");
        }
    };

    if (!cart) return null;

    return (

        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

            <div className="bg-white p-6 w-[700px] rounded">

                <h2 className="text-xl mb-4">
                    🛒 장바구니
                </h2>

                {cart.items.length === 0 && (
                    <p>비어있음</p>
                )}

                {cart.items.map(item => (

                    <div
                        key={item.cartItemId}
                        className="flex justify-between mb-3"
                    >

                        <div>
                            {item.productName}
                            (₩{item.price})
                        </div>

                        <div className="flex gap-2 items-center">

                            <input
                                type="number"
                                disabled={isPaymentPending}
                                value={
                                    quantities[item.cartItemId] || 0
                                }
                                onChange={(e) =>
                                    handleChange(
                                        item.cartItemId,
                                        e.target.value
                                    )
                                }
                                className="w-16 border"
                            />

                            <button
                                disabled={isPaymentPending}
                                onClick={() =>
                                    handleUpdate(item.cartItemId)
                                }
                                className="bg-blue-500 text-white px-2 py-1 rounded"
                            >
                                저장
                            </button>

                            <button
                                disabled={isPaymentPending}
                                onClick={() =>
                                    handleDelete(item.cartItemId)
                                }
                            >
                                ❌
                            </button>

                        </div>
                    </div>
                ))}

                {/* 주문 생성 */}
                {!paymentInfo && (

                    <button
                        onClick={handleOrder}
                        className="mt-3 bg-indigo-600 text-white px-3 py-1"
                    >
                        결제하기
                    </button>
                )}

                {/* 토스 위젯 */}
                <div
                    id="payment-method"
                    className="mt-5"
                ></div>

                {/* 약관 */}
                <div
                    id="agreement"
                    className="mt-3"
                ></div>

                {/* 실제 결제 버튼 */}
                {paymentInfo && (

                    <button
                        onClick={handlePayment}
                        className="w-full bg-green-600 text-white p-2 rounded mt-5"
                    >
                        실제 결제 진행
                    </button>
                )}

                <button
                    disabled={isPaymentPending}
                    onClick={handleClear}
                    className="mt-3 ml-2 bg-red-500 text-white px-3 py-1"
                >
                    전체 삭제
                </button>

                <button
                    onClick={onClose}
                    className="ml-3"
                >
                    닫기
                </button>

            </div>
        </div>
    );
}

export default CartModal;