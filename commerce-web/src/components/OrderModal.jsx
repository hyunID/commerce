import { useEffect, useState } from "react";

// ❌ 기존 주문 취소 API 제거
// import { cancelOrder } from "../api/order";

//  결제 취소 API 사용
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

            //  FAILED 제외
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">

            <div className="bg-white w-[800px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* 헤더 */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold">📦 주문 내역</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">✕</button>
                </div>

                {/* 리스트 */}
                <div className="p-6 overflow-y-auto space-y-5">

                    {orders.length === 0 && (
                        <p className="text-center text-gray-400 py-10">
                            주문 내역이 없습니다
                        </p>
                    )}

                    {orders.map(order => (
                        <div
                            key={order.id}
                            className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
                        >

                            {/* 상단 */}
                            <div className="flex justify-between items-start">

                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">
                                        주문번호
                                    </p>
                                    <p className="font-semibold">{order.id}</p>

                                    <p className="mt-2 text-gray-700">
                                        총 금액: <span className="font-bold">₩{order.totalPrice}</span>
                                    </p>

                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold
                                    ${order.status === "PAID"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-200 text-gray-600"
                                    }
                                `}>
                                    {order.status === "PAID" && "결제 완료"}
                                        {order.status === "CANCELLED" && "결제 취소"}
                                </span>
                                </div>

                                {order.status === "PAID" && (
                                    <button
                                        onClick={() => handleCancelPayment(order)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                                    >
                                        결제 취소
                                    </button>
                                )}

                            </div>

                            {/* 상품 리스트 */}
                            <div className="mt-4 border-t pt-3 space-y-1">
                                {order.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between text-sm text-gray-600"
                                    >
                                        <span>{item.productName}</span>
                                        <span>
                                        {item.quantity}개 · ₩{item.price}
                                    </span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))}

                </div>

            </div>
        </div>
    );
}

export default OrderModal;