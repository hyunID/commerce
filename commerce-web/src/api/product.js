import api from "./client";

// 상품 목록
export const getProducts = async () => {
    const res = await api.get("/products");
    return res.data;
};

// 상품 등록
export const createProduct = async (formData) => {
    const res = await api.post("/products", formData);
    return res.data;
};

// 상품 삭제
export const deleteProduct = async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
};