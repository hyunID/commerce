import { useEffect, useState } from "react";
import {
    getAdminProducts,
    updateProduct,
    deleteProduct
} from "../../api/product";

function ProductList({ onChange }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 수정 상태
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        price: "",
        description: ""
    });
    const [editImage, setEditImage] = useState(null);

    //  상품 조회
    const fetchProducts = async () => {
        setLoading(true); //  재조회 시 로딩 다시 ON
        try {
            const res = await getAdminProducts();
            console.log("상품 조회 성공");
            console.log(res);
            setProducts(res.data || []);
        } catch (err) {
            console.error("상품 조회 실패", err);
        } finally {
            setLoading(false);
        }
    };

    //  삭제
    const handleDelete = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await deleteProduct(id);
            alert("삭제 완료");
            fetchProducts();
            onChange?.();
        } catch (err) {
            console.error("삭제 실패", err);
            alert("삭제 실패");
        }
    };

    //  수정
    const handleUpdate = async (id) => {
        try {
            const data = new FormData();

            data.append(
                "data",
                new Blob([JSON.stringify(editForm)], {
                    type: "application/json"
                })
            );

            if (editImage) {
                data.append("image", editImage);
            }

            await updateProduct(id,data);
            alert("수정 완료");

            // 상태 초기화
            setEditId(null);
            setEditImage(null);
            setEditForm({
                name: "",
                price: "",
                description: ""
            });

            fetchProducts();
            onChange?.();
        } catch (err) {
            console.error("수정 실패", err);
            alert("수정 실패");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) {
        return <div className="p-4">로딩중...</div>;
    }

    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">📦 상품 목록</h2>

            <div className="grid grid-cols-3 gap-4">
                {products.map((p) => {

                    const isDeleted = p.status === "DELETED";

                    return (
                        <div
                            key={p.id}
                            className={`border rounded p-4 shadow-sm transition 
                        ${isDeleted ? "opacity-50 bg-gray-100" : "hover:shadow-md"}
                    `}
                        >
                            {/* 상태 */}
                            <div className="mb-2 text-sm font-semibold">
                                상태:
                                <span className={`ml-1 px-2 py-1 rounded text-white text-xs
                            ${p.status === "ACTIVE" && "bg-green-500"}
                            ${p.status === "SOLD_OUT" && "bg-yellow-500"}
                            ${p.status === "DELETED" && "bg-red-500"}
                        `}>
                            {p.status}
                        </span>
                            </div>

                            {/* 이미지 */}
                            <div className="h-32 bg-gray-100 mb-3 flex items-center justify-center">
                                {p.imageUrl ? (
                                    <img
                                        src={`http://localhost:8081/images/${p.imageUrl}`}
                                        alt={p.name}
                                        className="h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-400">No Image</span>
                                )}
                            </div>

                            {/* 수정 모드 */}
                            {editId === p.id && !isDeleted ? (
                                <>
                                    <input
                                        value={editForm.name}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                name: e.target.value
                                            })
                                        }
                                        className="border p-1 w-full mb-1"
                                    />

                                    <input
                                        value={editForm.price}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                price: e.target.value
                                            })
                                        }
                                        className="border p-1 w-full mb-1"
                                    />

                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                description: e.target.value
                                            })
                                        }
                                        className="border p-1 w-full mb-1"
                                    />

                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            setEditImage(e.target.files[0])
                                        }
                                        className="mb-2"
                                    />

                                    <div className="flex gap-2 mt-2">
                                        <button
                                            className="flex-1 bg-green-500 text-white py-1 rounded"
                                            onClick={() => handleUpdate(p.id)}
                                        >
                                            저장
                                        </button>

                                        <button
                                            className="flex-1 bg-gray-400 text-white py-1 rounded"
                                            onClick={() => {
                                                setEditId(null);
                                                setEditImage(null);
                                            }}
                                        >
                                            취소
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="font-bold">{p.name}</h3>
                                    <p className="text-gray-500">₩{p.price}</p>

                                    <div className="flex gap-2 mt-3">

                                        {/* DELETED면 버튼 제거 */}
                                        {!isDeleted ? (
                                            <>
                                                <button
                                                    className="flex-1 bg-blue-500 text-white py-1 rounded"
                                                    onClick={() => {
                                                        setEditId(p.id);
                                                        setEditForm({
                                                            name: p.name,
                                                            price: p.price,
                                                            description: p.description
                                                        });
                                                    }}
                                                >
                                                    수정
                                                </button>

                                                <button
                                                    className="flex-1 bg-red-500 text-white py-1 rounded"
                                                    onClick={() => handleDelete(p.id)}
                                                >
                                                    삭제
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center w-full text-gray-500 text-sm">
                                                🚫 삭제된 상품
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ProductList;