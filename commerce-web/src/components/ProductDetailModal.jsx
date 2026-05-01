import { useState } from "react";
import { createOrder } from "../api/order";

function ProductDetailModal({ product, onClose }) {

    const [qty, setQty] = useState(1);

    const changeQty = (delta) => {
        setQty(prev => Math.max(1, prev + delta));
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
            console.log(err);
            alert("구매 실패");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 w-[400px] rounded">

                <h2 className="text-xl font-bold mb-4">{product.name}</h2>

                <img
                    src={`http://localhost:8081/images/${product.imageUrl}`}
                    className="w-full h-40 object-cover mb-3"
                />

                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <p className="text-lg">₩{product.price}</p>

                {/* 수량 */}
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => changeQty(-1)} className="px-2 bg-gray-300">-</button>
                    <span>{qty}</span>
                    <button onClick={() => changeQty(1)} className="px-2 bg-gray-300">+</button>
                </div>

                <button
                    onClick={handleBuy}
                    className="w-full bg-indigo-600 text-white p-2 rounded"
                >
                    구매하기
                </button>

                <button onClick={onClose} className="mt-2 w-full">
                    닫기
                </button>
            </div>
        </div>
    );
}

export default ProductDetailModal;