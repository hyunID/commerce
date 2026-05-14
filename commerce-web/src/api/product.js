import api from "./client";

// 상품 목록
export const getProducts = async () => {
    const res = await api.get("/products");
    return res.data;
};

// 상품 상세 조회 추가
export const getProductDetail = async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
};

// 관리자용 상품 목록 (삭제 포함)
export const getAdminProducts = async () => {
    const res = await api.get("/products/admin");
    return res.data;
};

// 상품 등록
export const createProduct = async (formData) => {
    const res = await api.post("/products", formData);
    return res.data;
};

// 상품 수정
export const updateProduct = async (id, formData) => {

    const res = await api.put(
        `/products/${id}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return res.data;
};

// 상품 삭제
export const deleteProduct = async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
};