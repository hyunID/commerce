import api from "./client";

// 장바구니 조회
export const getCart = async () => {
    const res = await api.get("/cart");
    return res.data;
};

// 장바구니 추가
export const addToCart = async (data) => {
    const res = await api.post("/cart", data);
    return res.data;
};

// 수량 수정
export const updateCartItem = async (itemId, quantity) => {
    const res = await api.put(`/cart/${itemId}?quantity=${quantity}`);
    return res.data;
};

// 삭제
export const deleteCartItem = async (itemId) => {
    const res = await api.delete(`/cart/${itemId}`);
    return res.data;
};

// 전체 삭제
export const clearCart = async () => {
    const res = await api.delete("/cart/clear");
    return res.data;
};