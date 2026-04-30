import { useEffect, useState } from "react";
import {
    getOrders,
    deleteOrder,
    cancelOrder
} from "../../api/order";

function OrderList() {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await getOrders();
            setOrders(res.data.data || []);
        } catch (e) {
            console.error(e);
            alert("주문 조회 실패");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // 삭제
    const handleDelete = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;

        await deleteOrder(id);
        alert("삭제 완료");
        fetchOrders();
    };

    // 취소
    const handleCancel = async (id) => {
        if (!window.confirm("취소하시겠습니까?")) return;

        await cancelOrder(id);
        alert("주문 취소 완료");
        fetchOrders();
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">📦 주문 관리</h2>

            {orders.length === 0 && <p>주문 없음</p>}

            {orders.map(order => (
                <div key={order.id} className="border p-4 mb-3 rounded">

                    <div className="flex justify-between">
                        <div>
                            <p>주문ID: {order.id}</p>
                            <p>총액: ₩{order.totalPrice}</p>
                            <p>상태: {order.status}</p>
                            <p>일시: {order.createdAt}</p>
                        </div>

                        <div className="flex gap-2">
                            {order.status === "PENDING" && (
                                <button
                                    onClick={() => handleCancel(order.id)}
                                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                                >
                                    취소
                                </button>
                            )}

                            <button
                                onClick={() => handleDelete(order.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                                삭제
                            </button>
                        </div>
                    </div>

                    {/* 상품 목록 */}
                    <div className="mt-3 border-t pt-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span>
                                    {item.productName} (₩{item.price})
                                </span>
                                <span>수량: {item.quantity}</span>
                            </div>
                        ))}
                    </div>

                </div>
            ))}
        </div>
    );
}

export default OrderList;