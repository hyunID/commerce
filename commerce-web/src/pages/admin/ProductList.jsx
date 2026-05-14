import { useEffect, useState } from "react";
import {
    getAdminProducts,
    updateProduct,
    deleteProduct
} from "../../api/product";

function ProductList({ onChange }) {

    const [products, setProducts] = useState([]);

    const [preview, setPreview] = useState(null);

    const [editId, setEditId] = useState(null);

    const [editForm, setEditForm] = useState({
        name: "",
        price: "",
        description: "",
        gender: "",
        category: ""
    });

    const [mainImage, setMainImage] = useState(null);

    const [subImages, setSubImages] = useState([]);

    // =========================
    // ProductForm 동일 UI용 추가
    // =========================
    const [previewMain, setPreviewMain] = useState(null);

    const [previewSubs, setPreviewSubs] = useState([]);

    const [selectedImage, setSelectedImage] = useState("");

    const fetchProducts = async () => {

        const res = await getAdminProducts();
        console.log("관리자 상품 조회.");
        console.log(res.data);

        setProducts(res.data || []);
    };

    useEffect(() => {

        fetchProducts();

    }, []);

    // =========================
    // 삭제
    // =========================
    const handleDelete = async (id) => {

        if (!window.confirm("삭제하시겠습니까?")) {
            return;
        }

        await deleteProduct(id);

        fetchProducts();

        onChange?.();
    };

    // =========================
    // 수정
    // =========================
    const handleUpdate = async (id) => {

        const data = new FormData();

        data.append(
            "data",
            new Blob(
                [JSON.stringify(editForm)],
                {
                    type: "application/json"
                }
            )
        );

        // =========================
        // 기존 유지
        // mainImage 키 유지
        // =========================
        if (mainImage) {
            data.append("mainImage", mainImage);
        }

        // =========================
        // 기존 유지
        // images 키 유지
        // =========================
        subImages.forEach(file => {
            data.append("images", file);
        });

        for (const [key, value] of data.entries()) {

            if (value instanceof File) {

                console.log(
                    key,
                    {
                        name: value.name,
                        size: value.size,
                        type: value.type
                    }
                );

            } else {

                console.log(key, value);
            }
        }

        await updateProduct(id, data);

        // 초기화
        setEditId(null);

        setMainImage(null);

        setSubImages([]);

        setPreviewMain(null);

        setPreviewSubs([]);

        setSelectedImage("");

        fetchProducts();

        onChange?.();
    };

    return (
        <div className="bg-white p-6 rounded">

            <h2 className="text-xl font-bold mb-4">
                상품 목록
            </h2>

            <div className="grid grid-cols-3 gap-4">

                {products.map(p => {

                    const isDeleted =
                        p.status === "DELETED";

                    return (

                        <div
                            key={p.id}
                            className="border p-3"
                        >

                            {/* 상태 표시 */}
                            <div className="mb-3">

                                {p.status === "ACTIVE" && (

                                    <span className="
                                        inline-block
                                        text-xs
                                        px-2 py-1
                                        rounded
                                        bg-green-100
                                        text-green-700
                                        font-bold
                                    ">
                                        ACTIVE
                                    </span>

                                )}

                                {p.status === "SOLD_OUT" && (

                                    <span className="
                                        inline-block
                                        text-xs
                                        px-2 py-1
                                        rounded
                                        bg-yellow-100
                                        text-yellow-700
                                        font-bold
                                    ">
                                        SOLD OUT
                                    </span>

                                )}

                                {p.status === "DELETED" && (

                                    <div className="
                                        bg-red-600
                                        text-white
                                        text-center
                                        py-2
                                        rounded
                                        font-extrabold
                                        tracking-widest
                                        shadow
                                    ">
                                        삭제된 상품
                                    </div>

                                )}

                            </div>

                            {/* 상품 이미지 */}
                            <div
                                className="cursor-pointer"
                                onClick={() => setPreview(p)}
                            >

                                <img
                                    src={`http://localhost:8081/images/${p.imageUrl}`}
                                    className="
                                        h-40
                                        w-full
                                        object-cover
                                    "
                                />

                            </div>

                            <p className="font-bold mt-2">
                                {p.name}
                            </p>

                            <p>
                                ₩{p.price}
                            </p>

                            {/* =========================
                                수정 UI
                            ========================= */}
                            {editId === p.id ? (

                                <div className="mt-4">

                                    {/* 상품명 */}
                                    <input
                                        value={editForm.name}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                name: e.target.value
                                            })
                                        }
                                        className="
                                            border
                                            p-2
                                            w-full
                                            mb-2
                                        "
                                        placeholder="상품명"
                                    />

                                    {/* 가격 */}
                                    <input
                                        value={editForm.price}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                price: e.target.value
                                            })
                                        }
                                        className="
                                            border
                                            p-2
                                            w-full
                                            mb-2
                                        "
                                        placeholder="가격"
                                    />

                                    {/* 설명 */}
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                description: e.target.value
                                            })
                                        }
                                        className="
                                            border
                                            p-2
                                            w-full
                                            mb-4
                                        "
                                        placeholder="설명"
                                    />

                                    {/* 성별 */}
                                    <select
                                        value={editForm.gender}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                gender: e.target.value
                                            })
                                        }
                                        className="border p-2 w-full mb-2"
                                    >
                                        <option value="">성별 선택</option>
                                        <option value="MEN">남성</option>
                                        <option value="WOMEN">여성</option>
                                        <option value="UNISEX">공용</option>
                                    </select>

                                    {/* 카테고리 */}
                                    <select
                                        value={editForm.category}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                category: e.target.value
                                            })
                                        }
                                        className="border p-2 w-full mb-2"
                                    >
                                        <option value="">카테고리 선택</option>
                                        <option value="TOP">상의</option>
                                        <option value="BOTTOM">하의</option>
                                        <option value="OUTER">아우터</option>
                                        <option value="SHOES">신발</option>
                                    </select>

                                    {/* =========================
                                        메인 이미지
                                    ========================= */}
                                    <div className="border p-4 mb-4">

                                        <p className="font-bold mb-2">
                                            메인 이미지
                                        </p>

                                        <input
                                            type="file"
                                            onChange={(e) => {

                                                const file =
                                                    e.target.files[0];

                                                if (!file) {
                                                    return;
                                                }

                                                setMainImage(file);

                                                const imageUrl =
                                                    URL.createObjectURL(file);

                                                setPreviewMain(imageUrl);

                                                // ProductForm 동일 처리
                                                setSelectedImage(imageUrl);
                                            }}
                                        />

                                    </div>

                                    {/* =========================
                                        서브 이미지
                                    ========================= */}
                                    <div className="border p-4 mb-4">

                                        <p className="font-bold mb-2">
                                            서브 이미지
                                        </p>

                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => {

                                                const files =
                                                    Array.from(
                                                        e.target.files
                                                    );

                                                setSubImages(files);

                                                const imageUrls =
                                                    files.map(f =>
                                                        URL.createObjectURL(f)
                                                    );

                                                setPreviewSubs(imageUrls);
                                            }}
                                        />

                                    </div>

                                    {/* =========================
                                        ProductForm 동일 미리보기
                                    ========================= */}
                                    <div className="
                                        border
                                        p-4
                                        bg-white
                                        shadow-inner
                                    ">

                                        <h3 className="font-bold mb-3">
                                            👀 상세 미리보기
                                        </h3>

                                        {/* 메인 이미지 */}
                                        {(selectedImage
                                            || previewMain
                                            || p.imageUrl) && (

                                            <img
                                                src={
                                                    selectedImage
                                                    || previewMain
                                                    || `http://localhost:8081/images/${p.imageUrl}`
                                                }
                                                className="
                                                    w-full
                                                    h-80
                                                    rounded
                                                    object-cover
                                                    border
                                                "
                                            />

                                        )}

                                        {/* 썸네일 */}
                                        <div className="
                                            flex
                                            gap-3
                                            mt-4
                                            overflow-x-auto
                                        ">

                                            {/* 기존 대표 이미지 유지 */}
                                            {/* ProductForm 방식 맞춤 */}
                                            <img
                                                src={
                                                    previewMain
                                                        ? previewMain
                                                        : `http://localhost:8081/images/${p.imageUrl}`
                                                }
                                                onClick={() =>
                                                    setSelectedImage(
                                                        previewMain
                                                            ? previewMain
                                                            : `http://localhost:8081/images/${p.imageUrl}`
                                                    )
                                                }
                                                className="
                                                    w-20
                                                    h-20
                                                    object-cover
                                                    border
                                                    cursor-pointer
                                                    rounded
                                                "
                                            />

                                            {/* 기존 서브 이미지 유지 */}
                                            {/* 수정 안한 기존 이미지 */}
                                            {(!previewSubs.length
                                                && p.images?.map((img, idx) => (

                                                    <img
                                                        key={idx}
                                                        src={`http://localhost:8081/images/${img}`}
                                                        onClick={() =>
                                                            setSelectedImage(
                                                                `http://localhost:8081/images/${img}`
                                                            )
                                                        }
                                                        className="
                                                            w-20
                                                            h-20
                                                            object-cover
                                                            border
                                                            cursor-pointer
                                                            rounded
                                                        "
                                                    />

                                                ))
                                            )}

                                            {/* 새로 선택한 서브 이미지 */}
                                            {previewSubs.map((img, idx) => (

                                                <img
                                                    key={idx}
                                                    src={img}
                                                    onClick={() =>
                                                        setSelectedImage(img)
                                                    }
                                                    className="
                                                        w-20
                                                        h-20
                                                        object-cover
                                                        border
                                                        cursor-pointer
                                                        rounded
                                                    "
                                                />

                                            ))}

                                        </div>

                                        <p className="text-2xl font-bold mt-6">
                                            {editForm.name}
                                        </p>

                                        <p className="text-xl mt-2">
                                            ₩{editForm.price}
                                        </p>

                                        <p className="mt-4 whitespace-pre-wrap">
                                            {editForm.description}
                                        </p>

                                    </div>

                                    {/* 저장 버튼 */}
                                    <button
                                        onClick={() => handleUpdate(p.id)}
                                        className="
                                            w-full
                                            bg-green-600
                                            text-white
                                            mt-4
                                            py-3
                                        "
                                    >
                                        저장
                                    </button>

                                </div>

                            ) : (

                                // DELETED 상품이면 버튼 숨김
                                !isDeleted && (

                                    <div className="flex gap-2 mt-2">

                                        <button
                                            onClick={() => {

                                                setEditId(p.id);

                                                setEditForm({
                                                    name: p.name,
                                                    price: p.price,
                                                    description: p.description,
                                                    gender: p.gender,
                                                    category: p.category
                                                });

                                                // =========================
                                                // 기존 이미지 초기 세팅
                                                // ProductForm 동일 처리
                                                // =========================
                                                setPreviewMain(
                                                    `http://localhost:8081/images/${p.imageUrl}`
                                                );

                                                setSelectedImage(
                                                    `http://localhost:8081/images/${p.imageUrl}`
                                                );

                                                setPreviewSubs([]);

                                                setMainImage(null);

                                                setSubImages([]);
                                            }}
                                            className="
                                                bg-blue-500
                                                text-white
                                                px-2
                                                py-1
                                            "
                                        >
                                            수정
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(p.id)
                                            }
                                            className="
                                                bg-red-500
                                                text-white
                                                px-2
                                                py-1
                                            "
                                        >
                                            삭제
                                        </button>

                                    </div>

                                )

                            )}

                        </div>

                    );
                })}
            </div>

            {/* =========================
                상세 미리보기
            ========================= */}
            {preview && (

                <div className="
                    fixed
                    inset-0
                    bg-black/60
                    flex
                    items-center
                    justify-center
                    z-50
                ">

                    <div className="
                        bg-white
                        w-[900px]
                        p-6
                        rounded
                    ">

                        {/* 닫기 */}
                        <div className="flex justify-end mb-4">

                            <button
                                onClick={() => setPreview(null)}
                                className="
                                    text-gray-500
                                    hover:text-black
                                "
                            >
                                ✕
                            </button>

                        </div>

                        {/* ProductDetailPage 스타일 */}
                        <div className="
                            grid
                            md:grid-cols-2
                            gap-10
                        ">

                            {/* 이미지 */}
                            <div>

                                <img
                                    src={
                                        preview.selectedPreviewImage
                                        || `http://localhost:8081/images/${preview.imageUrl}`
                                    }
                                    className="
                                        w-full
                                        h-[500px]
                                        object-cover
                                        border
                                        rounded
                                    "
                                />

                                <div className="
                                    flex
                                    gap-3
                                    mt-4
                                    overflow-x-auto
                                ">

                                    {/* 대표 */}
                                    <img
                                        src={`http://localhost:8081/images/${preview.imageUrl}`}
                                        onClick={() =>
                                            setPreview({
                                                ...preview,
                                                selectedPreviewImage:
                                                    `http://localhost:8081/images/${preview.imageUrl}`
                                            })
                                        }
                                        className="
                                            w-20
                                            h-20
                                            object-cover
                                            border
                                            rounded
                                            cursor-pointer
                                        "
                                    />

                                    {/* 서브 */}
                                    {preview.images?.map((img, idx) => (

                                        <img
                                            key={idx}
                                            src={`http://localhost:8081/images/${img}`}
                                            onClick={() =>
                                                setPreview({
                                                    ...preview,
                                                    selectedPreviewImage:
                                                        `http://localhost:8081/images/${img}`
                                                })
                                            }
                                            className="
                                                w-20
                                                h-20
                                                object-cover
                                                border
                                                rounded
                                                cursor-pointer
                                            "
                                        />

                                    ))}

                                </div>

                            </div>

                            {/* 정보 */}
                            <div>

                                <p className="text-sm text-gray-400">
                                    COMMERCE
                                </p>

                                <h2 className="text-3xl font-bold mt-2">
                                    {preview.name}
                                </h2>

                                <p className="text-2xl font-semibold mt-6">
                                    ₩{preview.price}
                                </p>

                                <div className="mt-10 border-t pt-6">

                                    <div className="
                                        flex
                                        justify-between
                                        py-3
                                        border-b
                                    ">

                                        <span className="text-gray-500">
                                            배송비
                                        </span>

                                        <span>
                                            무료배송
                                        </span>

                                    </div>

                                </div>

                                <div className="mt-10">

                                    <h3 className="
                                        text-xl
                                        font-bold
                                        mb-4
                                    ">
                                        상품 설명
                                    </h3>

                                    <div className="
                                        leading-8
                                        text-gray-700
                                        whitespace-pre-wrap
                                    ">
                                        {preview.description}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default ProductList;