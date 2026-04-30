import { useState } from "react";
import { addToCart } from "../api/cart";
import { createOrder } from "../api/order";

function ProductDetailModal({ product, onClose }) {
    const [qty, setQty] = useState(1);

    const changeQty = (delta) => {
        setQty(prev => Math.max(1, prev + delta));
    };

    const handleAddCart = async () => {
        try {
            await addToCart({
                productId: product.id,
                quantity: qty
            });

            alert("장바구니 담기 완료");
            onClose();
        } catch (err) {
            console.error(err);
            alert("실패");
        }
    };

    const handleBuy = async () => {
        if (!window.confirm("구매하시겠습니까?")) return;

        try {
            await createOrder([
                {
                    productId: product.id,
                    quantity: qty
                }
            ]);

            alert("구매 완료");
            onClose();
        } catch (err) {
            console.error(err);
            alert("구매 실패");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white w-[500px] p-6 rounded">

                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">상품 상세</h2>
                    <button onClick={onClose}>닫기</button>
                </div>

                <img
                    src={`http://localhost:8081/images/${product.imageUrl}`}
                    className="w-full h-48 object-cover mb-4"
                />

                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <p className="text-lg">₩{product.price}</p>

                {/* 수량 */}
                <div className="flex items-center gap-3 mt-4">
                    <button onClick={() => changeQty(-1)} className="px-3 bg-gray-300">-</button>
                    <span>{qty}</span>
                    <button onClick={() => changeQty(1)} className="px-3 bg-gray-300">+</button>
                </div>

                {/* 총 금액 */}
                <p className="mt-3 font-bold">
                    총 금액: ₩{product.price * qty}
                </p>

                {/* 버튼 */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleAddCart}
                        className="flex-1 bg-green-500 text-white p-2 rounded"
                    >
                        장바구니
                    </button>

                    <button
                        onClick={handleBuy}
                        className="flex-1 bg-indigo-600 text-white p-2 rounded"
                    >
                        구매하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailModal;