import { useState } from "react";
import { createProduct  } from "../../api/product";
//import api from "../../api/client";

function ProductForm({ onSuccess }) {

    const [form, setForm] = useState({
        name: "",
        price: "",
        description: "",
        gender: "",
        category: ""
    });

    const [mainImage, setMainImage] = useState(null);
    const [subImages, setSubImages] = useState([]);

    const [previewMain, setPreviewMain] = useState(null);
    const [previewSubs, setPreviewSubs] = useState([]);

    // =========================
    // ProductDetailPage 방식 추가
    // 현재 선택된 이미지
    // =========================
    const [selectedImage, setSelectedImage] = useState("");

    const handleSubmit = async () => {

        const data = new FormData();

        data.append(
            "data",
            new Blob([JSON.stringify(form)], { type: "application/json" })
        );

        //  백엔드 매칭: mainImage
        data.append("mainImage", mainImage);


        subImages.forEach(file => {
            data.append("images", file);
        });

        console.log("---등록데이터-----");
        console.log(data);


        await createProduct(data);

        alert("등록 완료");

        onSuccess?.();

        setForm({ name: "", price: "", description: "" });

        setMainImage(null);
        setSubImages([]);

        setPreviewMain(null);
        setPreviewSubs([]);

        // 추가
        setSelectedImage("");
    };

    return (
        <div className="bg-white p-6 rounded shadow mb-6">

            <h2 className="text-xl font-bold mb-4">
                📦 상품 등록
            </h2>

            <input
                placeholder="상품명"
                value={form.name}
                onChange={(e) =>
                    setForm({
                        ...form,
                        name: e.target.value
                    })
                }
                className="border p-2 w-full mb-2"
            />

            <input
                placeholder="가격"
                value={form.price}
                onChange={(e) =>
                    setForm({
                        ...form,
                        price: e.target.value
                    })
                }
                className="border p-2 w-full mb-2"
            />

            <textarea
                placeholder="설명"
                value={form.description}
                onChange={(e) =>
                    setForm({
                        ...form,
                        description: e.target.value
                    })
                }
                className="border p-2 w-full mb-4"
            />

            {/* 성별 */}
            <select
                value={form.gender}
                onChange={(e) =>
                    setForm({
                        ...form,
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
                value={form.category}
                onChange={(e) =>
                    setForm({
                        ...form,
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

            {/* 메인 이미지 */}
            <div className="border p-4 mb-4">

                <p className="font-bold mb-2">
                    메인 이미지
                </p>

                <input
                    type="file"
                    onChange={(e) => {

                        const file = e.target.files[0];

                        setMainImage(file);

                        const imageUrl =
                            URL.createObjectURL(file);

                        setPreviewMain(imageUrl);

                        // ProductDetailPage 동일 처리
                        setSelectedImage(imageUrl);
                    }}
                />

                {/* 기존 단일 미리보기 유지 */}
                {/*
                {previewMain && (
                    <img
                        src={previewMain}
                        className="h-40 mt-3 object-cover"
                    />
                )}
                */}
            </div>

            {/* 서브 이미지 */}
            <div className="border p-4 mb-4">

                <p className="font-bold mb-2">
                    서브 이미지
                </p>

                <input
                    type="file"
                    multiple
                    onChange={(e) => {

                        const files =
                            Array.from(e.target.files);

                        setSubImages(files);

                        const imageUrls =
                            files.map(f =>
                                URL.createObjectURL(f)
                            );

                        setPreviewSubs(imageUrls);
                    }}
                />

                {/* 기존 방식 유지 */}
                {/*
                <div className="grid grid-cols-4 gap-2 mt-2">
                    {previewSubs.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            className="h-20 w-20 object-cover"
                        />
                    ))}
                </div>
                */}
            </div>

            {/* =========================
                ProductDetailPage 스타일 미리보기
            ========================= */}
            <div className="border p-4 bg-white shadow-inner">

                <h3 className="font-bold mb-3">
                    👀 상세 미리보기
                </h3>

                {/* 메인 이미지 */}
                {selectedImage && (
                    <img
                        src={selectedImage}
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
                <div className="flex gap-3 mt-4 overflow-x-auto">

                    {/* 대표 이미지 */}
                    {previewMain && (
                        <img
                            src={previewMain}
                            onClick={() =>
                                setSelectedImage(previewMain)
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
                    )}

                    {/* 서브 이미지 */}
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
                    {form.name}
                </p>

                <p className="text-xl mt-2">
                    ₩{form.price}
                </p>

                <p className="mt-4 whitespace-pre-wrap">
                    {form.description}
                </p>

            </div>

            <button
                onClick={handleSubmit}
                className="
                    bg-indigo-600
                    text-white
                    w-full
                    py-3
                    mt-4
                "
            >
                등록
            </button>

        </div>
    );
}

export default ProductForm;