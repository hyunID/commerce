import { useEffect, useState } from "react";
import {
    getInventoryList,
    updateInventory
} from "../../api/inventory";

function InventoryList() {
    const [list, setList] = useState([]);
    const [editMap, setEditMap] = useState({}); //  입력값 관리

    const fetchInventory = async () => {
        const data = await getInventoryList();
        const items = data.data || [];

        setList(items);

        // 초기값 세팅
        const init = {};
        items.forEach(i => {
            init[i.productId] = {
                stock: i.stock,
                reserved: i.reserved
            };
        });
        setEditMap(init);
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleChange = (productId, field, value) => {
        setEditMap(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: Number(value)
            }
        }));
    };

    const handleUpdate = async (productId) => {
        const { stock, reserved } = editMap[productId];

        await updateInventory(productId, stock, reserved);

        alert("재고 수정 완료");
        fetchInventory();
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">📦 재고 관리</h2>

            {list.map(item => (
                <div key={item.productId} className="border p-3 mb-2 rounded">

                    <div className="flex justify-between items-center">

                        <div>
                            <p>상품ID: {item.productId}</p>
                            <p>상품명: {item.productName}</p>
                            <p>가용재고: {item.available}</p>
                        </div>

                        <div className="flex gap-2 items-center">

                            {/* stock */}
                            <input
                                type="number"
                                value={editMap[item.productId]?.stock || 0}
                                onChange={(e) =>
                                    handleChange(item.productId, "stock", e.target.value)
                                }
                                className="border w-20"
                            />

                            {/* reserved */}
                            <input
                                type="number"
                                value={editMap[item.productId]?.reserved || 0}
                                onChange={(e) =>
                                    handleChange(item.productId, "reserved", e.target.value)
                                }
                                className="border w-20"
                            />

                            <button
                                onClick={() => handleUpdate(item.productId)}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                수정
                            </button>

                        </div>

                    </div>

                </div>
            ))}
        </div>
    );
}

export default InventoryList;