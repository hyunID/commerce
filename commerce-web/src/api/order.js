import api from "./client";

// 주문 생성
export const createOrder = async (items) => {
    return await api.post("/orders", { items });
};

// 내 주문 목록
export const getMyOrders = async () => {
    return await api.get("/orders");
};

// 관리자 전체 주문
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