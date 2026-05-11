import api from "./client";

// 바로구매 → 주문 생성 + reserve
export const requestPayment = async (data) => {
    return await api.post("/payment/request", data);
};

// 장바구니 → 주문 생성 + reserve
export const requestCartPayment = async () => {
    return await api.post("/payment/request/cart");
};

// 결제 성공 confirm
export const confirmPayment = async (data) => {
    return await api.post("/payment/confirm", data);
};

// 결제 실패 fail
export const failPayment = async (data) => {
    return await api.post("/payment/fail", data);
};