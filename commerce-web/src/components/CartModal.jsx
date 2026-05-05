import { useEffect, useState } from "react";
import {
    getCart,
    updateCartItem,
    deleteCartItem,
    clearCart
} from "../api/cart";
import { cartOrder } from "../api/order";

function CartModal({ onClose , onOrderComplete}) {
    const [cart, setCart] = useState(null);
    const [quantities, setQuantities] = useState({});

    const fetchCart = async () => {
        const res = await getCart();
        const data = res.data;

        setCart(data);

        const qtyMap = {};
        data.items.forEach(item => {
            qtyMap[item.cartItemId] = item.quantity;
        });
        setQuantities(qtyMap);
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleChange = (id, value) => {
        setQuantities({
            ...quantities,
            [id]: Number(value)
        });
    };

    const handleUpdate = async (id) => {
        await updateCartItem(id, quantities[id]);
        alert("수정되었습니다.");
        fetchCart();
    };

    const handleDelete = async (id) => {
        await deleteCartItem(id);
        alert("삭제되었습니다.");
        fetchCart();
    };

    const handleClear = async () => {
        await clearCart();
        alert("전체 삭제되었습니다.");
        fetchCart();
    };

    // 주문하기
    const handleOrder = async () => {
        if (!window.confirm("주문하시겠습니까?")) return;

        try {

            for (const item of cart.items) {

                console.log("상품명 : "+item.productName+ "  재고 : "+ item.stock);
                console.log( "구매 : "+ item.quantity);
                if (item.stock < item.quantity) {
                    alert(`${item.productName} 재고 부족`);
                    return;
                }
            }

            // item 전달 안해도됨 jwt 필터에서 userid 값으로 불러와 사용할거임.
           /* const items = cart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }));*/

            await cartOrder();

            alert("주문 완료");

            await clearCart();
            fetchCart();
            onOrderComplete?.();
            onClose();

        } catch (e) {
            console.error(e);
            alert("주문 실패");
        }
    };

    if (!cart) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
            <div className="bg-white p-6 w-[600px] rounded">

                <h2 className="text-xl mb-4">🛒 장바구니</h2>

                {cart.items.length === 0 && <p>비어있음</p>}

                {cart.items.map(item => (
                    <div key={item.cartItemId} className="flex justify-between mb-3">
                        <div>
                            {item.productName} (₩{item.price})
                        </div>

                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                value={quantities[item.cartItemId] || 0}
                                onChange={(e) =>
                                    handleChange(item.cartItemId, e.target.value)
                                }
                                className="w-16 border"
                            />

                            <button
                                onClick={() => handleUpdate(item.cartItemId)}
                                className="bg-blue-500 text-white px-2 py-1 rounded"
                            >
                                저장
                            </button>

                            <button onClick={() => handleDelete(item.cartItemId)}>
                                ❌
                            </button>
                        </div>
                    </div>
                ))}

                <button onClick={handleOrder} className="mt-3 bg-indigo-600 text-white px-3 py-1">
                    주문하기
                </button>

                <button onClick={handleClear} className="mt-3 ml-2 bg-red-500 text-white px-3 py-1">
                    전체 삭제
                </button>

                <button onClick={onClose} className="ml-3">
                    닫기
                </button>
            </div>
        </div>
    );
}

export default CartModal;