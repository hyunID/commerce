import { useEffect, useState } from "react";

// ❌ 기존 주문 취소 API 제거
// import { cancelOrder } from "../api/order";

// ✅ 결제 취소 API 사용
 import {
     getMyOrders,
     cancelPayment
 } from "../api/order";

function OrderModal({ onClose }) {

    const [orders, setOrders] = useState([]);

    // 주문 조회
    const fetchOrders = async () => {

        try {

            const res = await getMyOrders();

            // ✅ FAILED 제외
            // 화면에는
            // PAID / CANCELLED 만 표시
            const filtered =
                (res.data.data || []).filter(order =>
                    order.status === "PAID"
                    || order.status === "CANCELLED"
                );

            setOrders(filtered);

        } catch (e) {

            console.error(e);
        }
    };

    useEffect(() => {

        fetchOrders();

    }, []);


    // 현재는 결제 취소 기능 사용
    const handleCancelPayment = async (order) => {

        if (!window.confirm("결제를 취소하시겠습니까?")) {
            return;
        }

        try {
            console.log(order);
            console.log(order.id);
            console.log(order.paymentKey);
            // 결제 취소 API 호출
            await cancelPayment(order.paymentKey);

            alert("결제 취소 완료");

            fetchOrders();

        } catch (e) {

            console.error(e);

            alert("결제 취소 실패");
        }
    };

    return (

        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

            <div className="bg-white w-[700px] max-h-[80vh] overflow-y-auto p-6 rounded">

                {/* header */}
                <div className="flex justify-between mb-4">

                    <h2 className="text-xl font-bold">
                        📦 주문 내역
                    </h2>

                    <button onClick={onClose}>
                        닫기
                    </button>

                </div>

                {orders.length === 0 && (
                    <p>주문 내역이 없습니다.</p>
                )}

                {orders.map(order => (

                    <div
                        key={order.id}
                        className="border p-4 mb-4 rounded"
                    >

                        <div className="flex justify-between mb-2">

                            <div>

                                <p>
                                    주문번호: {order.id}
                                </p>

                                <p>
                                    총 금액: ₩{order.totalPrice}
                                </p>

                                <p>
                                    상태:
                                    {" "}

                                    {/* 상태 한글화 */}
                                    {order.status === "PAID" && "결제 완료"}

                                    {order.status === "CANCELLED"
                                        && "결제 취소"}
                                </p>

                            </div>

                            {/*  결제 완료 상태만 취소 가능 */}
                            {order.status === "PAID" && (

                                <button
                                    onClick={() =>
                                        handleCancelPayment(order)
                                    }
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    결제 취소
                                </button>
                            )}

                        </div>

                        {/* 주문 상품 */}
                        {order.items.map((item, idx) => (

                            <div
                                key={idx}
                                className="flex justify-between text-sm mt-1"
                            >

                                <span>
                                    {item.productName}
                                </span>

                                <span>
                                    {item.quantity}개
                                    /
                                    ₩{item.price}
                                </span>

                            </div>
                        ))}

                    </div>
                ))}

            </div>
        </div>
    );
}

export default OrderModal;