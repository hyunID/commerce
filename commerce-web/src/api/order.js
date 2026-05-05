import api from "./client";

// 카트에서 구매
export const cartOrder = async () => {
    return await api.post("/orders/cart");
};

//상세페이지에서 구매
export const directOrder = async (items) => {
    return await api.post("/orders/direct", { items });
};

// 내 주문 목록
export const getMyOrders = async () => {
    return await api.get("/orders");
};

// 관리자 전체 주문 조회
export const getOrders = async () => {
    return await api.get("/orders/admin");
};

// 주문 취소
export const cancelOrder = async (id) => {
    return await api.put(`/orders/${id}/cancel`);
};

// 관리자 삭제
export const deleteOrder = async (id) => {
    return await api.delete(`/orders/${id}`);
};