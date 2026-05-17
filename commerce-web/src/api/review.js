import api from "./client";

// =========================
// 상품 리뷰 전체 조회
// GET /reviews/product/{productId}
// =========================
export const getProductReviews = async (productId) => {
    const res = await api.get(
        `/reviews/product/${productId}`
    );

    return res.data;
};

// =========================
// 리뷰 작성 가능 여부 조회
// GET /reviews/product/{productId}/permission
// =========================
export const getReviewPermission = async (productId) => {
    const res = await api.get(
        `/reviews/product/${productId}/permission`
    );

    return res.data;
};

// =========================
// 리뷰 작성
// POST /reviews/product/{productId}
// data: { rating, content }
// =========================
export const createReview = async (productId, data) => {
    const res = await api.post(
        `/reviews/product/${productId}`,
        data
    );

    return res.data;
};

// =========================
// 리뷰 수정
// PUT /reviews/{reviewId}
// data: { rating, content }
// =========================
export const updateReview = async (reviewId, data) => {
    const res = await api.put(
        `/reviews/${reviewId}`,
        data
    );

    return res.data;
};

// =========================
// 리뷰 삭제
// DELETE /reviews/{reviewId}
// =========================
export const deleteReview = async (reviewId) => {
    const res = await api.delete(
        `/reviews/${reviewId}`
    );

    return res.data;
};

// =========================
// 리뷰 작성 상태
// GET /reviews/order-item/${orderItemId}/status
// =========================
export const getOrderItemReviewStatus = async (orderItemId) => {
    const res = await api.get(
        `/reviews/order-item/${orderItemId}/status`
    );

    return res.data;
};