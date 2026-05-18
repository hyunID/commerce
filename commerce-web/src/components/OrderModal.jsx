import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyOrders, cancelPayment } from "../api/order";
import { getReviewPermission } from "../api/review";
import { getOrderItemReviewStatus } from "../api/review";

function OrderModal({ onClose }) {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);

    // productId -> 리뷰 가능 여부
    const [reviewStatusMap, setReviewStatusMap] = useState({});

    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8081";

    // 주문 조회
    const fetchOrders = async () => {

        try {

            const res = await getMyOrders();

            const filtered =
                (res.data.data || []).filter(order =>
                    order.status === "PAID" ||
                    order.status === "CANCELLED"
                );

            setOrders(filtered);

            // =========================
            // 리뷰 상태 조회
            // =========================

            const map = {};

            for (const order of filtered) {

                for (const item of order.items || []) {

                    try {
                        const statusRes =
                            await getOrderItemReviewStatus(item.orderItemId);

                        const status =
                            statusRes.data;

                        console.log("--------------------------");
                        console.log(item);
                        console.log(item.id);

                        map[item.orderItemId] = {
                            canWrite: status.canWrite,
                            reviewed: status.reviewed
                        };

                        // const permissionRes =
                        //     await getReviewPermission(item.productId);
                        //
                        // const permission =
                        //     permissionRes.data
                        // ;
                        //
                        // map[item.productId] = {
                        //
                        //     canWrite: permission.canWrite,
                        //
                        //     reviewed:
                        //         !permission.canWrite &&
                        //         permission.myReview != null
                        // };

                    } catch (e) {

                        console.error(e);

                        map[item.orderItemId] = {
                            canWrite: false,
                            reviewed: false
                        };
                    }
                }
            }

            setReviewStatusMap(map);

        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // 결제 취소
    const handleCancelPayment = async (order) => {

        if (!window.confirm("결제를 취소하시겠습니까?")) {
            return;
        }

        try {

            await cancelPayment(order.paymentKey);

            alert("결제 취소 완료");

            fetchOrders();

        } catch (e) {

            console.error(e);

            alert("결제 취소 실패");
        }
    };

    // 상품 상세 이동
    const moveProductPage = (productId) => {

        navigate(`/product/${productId}`);

        onClose?.();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

            <div className="bg-white w-[800px] max-h-[85vh] rounded-2xl overflow-hidden flex flex-col">

                {/* 헤더 */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold">📦 주문 내역</h2>

                    <button onClick={onClose}>
                        ✕
                    </button>
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
                            className="border rounded-xl p-5"
                        >

                            {/* 주문 정보 */}
                            <div className="flex justify-between">

                                <div>
                                    <p>주문번호: {order.id}</p>

                                    {order.status === "PAID" ? (

                                        <span
                                            className="
                                                text-xs
                                                px-2 py-1
                                                rounded-full
                                                bg-green-100
                                                text-green-700
                                                font-medium
                                            "
                                        >
                                            결제 완료
                                        </span>

                                    ) : (

                                        <span
                                            className="
                                                text-xs
                                                px-2 py-1
                                                rounded-full
                                                bg-red-100
                                                text-red-600
                                                font-medium
                                            "
                                        >
                                            결제 취소
                                        </span>

                                    )}
                                </div>

                                <div>
                                    <p>
                                        총액: ₩{order.totalPrice}
                                    </p>
                                </div>

                                {order.status === "PAID" && (
                                    <button
                                        onClick={() => handleCancelPayment(order)}
                                        className="
                                            bg-red-500
                                            text-white
                                            px-3
                                            py-1
                                            rounded
                                            hover:bg-red-600
                                        "
                                    >
                                        결제 취소
                                    </button>
                                )}

                            </div>

                            {/* 상품 리스트 */}
                            <div className="mt-4 space-y-3">

                                {order.items?.map((item) => {

                                    const status =
                                        reviewStatusMap[item.orderItemId];

                                    const isReviewed =
                                        status?.reviewed;

                                    const canWrite =
                                        status?.canWrite;

                                    return (

                                        <div
                                            key={`${order.id}-${item.productId}`}

                                            onClick={() =>
                                                moveProductPage(item.productId)
                                            }

                                            className="
                                                group
                                                flex
                                                justify-between
                                                items-center
                                                p-3
                                                rounded-xl
                                                cursor-pointer
                                                border
                                                border-transparent
                                                hover:border-black
                                                hover:bg-gray-50
                                                transition-all
                                                duration-200
                                            "
                                        >

                                            {/* 상품 정보 */}
                                            <div className="flex items-center gap-4">

                                                {/* 상품 이미지 */}
                                                <img
                                                    src={`${API_BASE_URL}/images/${item.imageUrl}`}
                                                    alt={item.productName}
                                                    className="
                                                        w-16 h-16
                                                        object-cover
                                                        rounded-lg
                                                        border
                                                        shrink-0
                                                    "
                                                />

                                                {/* 텍스트 */}
                                                <div>

                                                    <p className="
                                                        font-medium
                                                        group-hover:underline
                                                    ">
                                                        {item.productName}
                                                    </p>

                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {item.quantity}개 · ₩{item.price}
                                                    </p>

                                                    <p className="
                                                            text-xs
                                                            text-gray-400
                                                            mt-1
                                                            opacity-0
                                                            group-hover:opacity-100
                                                            transition
                                                    ">
                                                        클릭하여 상품 상세 보기
                                                    </p>

                                                </div>

                                            </div>

                                            {/* 리뷰 상태 */}
                                            {order.status === "PAID" && (

                                                isReviewed ? (

                                                    <span
                                                        className="
                                                            text-xs
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                            bg-gray-200
                                                            text-gray-700
                                                        "
                                                    >
                                                        리뷰 완료
                                                    </span>

                                                ) : canWrite ? (

                                                    <span
                                                        className="
                                                            text-xs
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                            bg-indigo-100
                                                            text-indigo-600
                                                        "
                                                    >
                                                        리뷰 작성 가능
                                                    </span>

                                                ) : (

                                                    <span
                                                        className="
                                                            text-xs
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                            bg-gray-100
                                                            text-gray-400
                                                        "
                                                    >
                                                        리뷰 불가
                                                    </span>

                                                )
                                            )}

                                        </div>
                                    );
                                })}

                            </div>

                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
}

export default OrderModal;