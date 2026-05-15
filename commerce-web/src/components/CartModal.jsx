import { useEffect, useRef, useState } from "react";
import {
    getCart,
    updateCartItem,
    deleteCartItem,
    clearCart
} from "../api/cart";
import { requestCartPayment } from "../api/payment";
import { getOrderStatus } from "../api/order";

function CartModal({ onClose, onCartChange }) {

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

        if (!data || !data.items) {
            setCart({ items: [] });
            return;
        }

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

        onCartChange?.();
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

        onCartChange?.();
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

        onCartChange?.();
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">

            <div className="bg-white w-[780px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* 헤더 */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold">🛒 장바구니</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">✕</button>
                </div>

                {/* 리스트 영역 */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">

                    {cart.items.length === 0 && (
                        <div className="text-center text-gray-400 py-10">
                            장바구니가 비어있습니다
                        </div>
                    )}

                    {cart.items.map(item => (
                        <div
                            key={item.cartItemId}
                            className="flex items-center justify-between border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                        >

                            {/* 상품 정보 */}
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {item.productName}
                                </p>
                                <p className="text-sm text-gray-500">
                                    ₩{item.price}
                                </p>
                            </div>

                            {/* 수량 영역 */}
                            <div className="flex items-center gap-2">

                                <input
                                    type="number"
                                    disabled={isPaymentPending}
                                    value={quantities[item.cartItemId] || 0}
                                    onChange={(e) =>
                                        handleChange(item.cartItemId, e.target.value)
                                    }
                                    className="w-16 border rounded-md px-2 py-1 text-center"
                                />

                                <button
                                    disabled={isPaymentPending}
                                    onClick={() => handleUpdate(item.cartItemId)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                                >
                                    저장
                                </button>

                                <button
                                    disabled={isPaymentPending}
                                    onClick={() => handleDelete(item.cartItemId)}
                                    className="text-red-500 hover:text-red-700 text-lg px-2"
                                >
                                    ✕
                                </button>
                            </div>

                        </div>
                    ))}
                </div>

                {/* 결제 영역 (하단 고정 느낌) */}
                <div className="border-t p-5 bg-white space-y-3">

                    {!paymentInfo && (
                        <button
                            onClick={handleOrder}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold"
                        >
                            결제하기
                        </button>
                    )}

                    <div id="payment-method"></div>
                    <div id="agreement"></div>

                    {paymentInfo && (
                        <button
                            onClick={handlePayment}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                        >
                            실제 결제 진행
                        </button>
                    )}

                    <div className="flex gap-2">
                        <button
                            disabled={isPaymentPending}
                            onClick={handleClear}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
                        >
                            전체 삭제
                        </button>

                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
                        >
                            닫기
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CartModal;