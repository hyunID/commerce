import { useEffect, useState } from "react";
import { getMyOrders, cancelOrder } from "../api/order";

function OrderModal({ onClose }) {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await getMyOrders();
            setOrders(res.data.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm("주문 취소하시겠습니까?")) return;

        try {
            await cancelOrder(id);
            alert("주문 취소 완료");
            fetchOrders();
        } catch (e) {
            console.error(e);
            alert("취소 실패");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white w-[700px] max-h-[80vh] overflow-y-auto p-6 rounded">

                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">📦 주문 내역</h2>
                    <button onClick={onClose}>닫기</button>
                </div>

                {orders.length === 0 && <p>주문 내역이 없습니다.</p>}

                {orders.map(order => (
                    <div key={order.id} className="border p-4 mb-4 rounded">

                        <div className="flex justify-between mb-2">
                            <div>
                                <p>주문번호: {order.id}</p>
                                <p>총 금액: ₩{order.totalPrice}</p>
                                <p>상태: {order.status}</p>
                            </div>

                            {order.status === "PENDING" && (
                                <button
                                    onClick={() => handleCancel(order.id)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    취소
                                </button>
                            )}
                        </div>

                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm mt-1">
                                <span>{item.productName}</span>
                                <span>{item.quantity}개 / ₩{item.price}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrderModal;