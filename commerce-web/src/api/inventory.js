import api from "./client";

// 전체 조회
export const getInventoryList = async () => {
    const res = await api.get("/inventory");
    return res.data;
};

// 단건 조회
export const getInventory = async (productId) => {
    const res = await api.get(`/inventory/${productId}`);
    return res.data;
};

// 수정 (adjust로 맞춰야 함)
export const updateInventory = async (productId, stock, reserved = 0) => {
    const res = await api.put(`/inventory/${productId}/adjust`, {
        stock,
        reserved
    });
    return res.data;
};