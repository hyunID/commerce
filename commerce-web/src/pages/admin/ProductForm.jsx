import { useState } from "react";
import api from "../../api/client";

function ProductForm({ onSuccess }) {
    const [form, setForm] = useState({
        name: "",
        price: "",
        description: ""
    });

    const [image, setImage] = useState(null);

    const handleSubmit = async () => {
        if (!image) {
            alert("이미지를 선택하세요");
            return;
        }

        const data = new FormData();

        data.append(
            "data",
            new Blob([JSON.stringify(form)], { type: "application/json" })
        );

        data.append("image", image);

        await api.post("/products", data);

        alert("등록 완료");

        // 🔥 1. 부모 리스트 새로고침
        onSuccess?.();

        // 🔥 2. 폼 초기화
        setForm({ name: "", price: "", description: "" });
        setImage(null);

        // 🔥 3. 파일 input 리셋 핵심
        document.getElementById("product-image").value = "";
    };

    return (
        <div className="bg-white p-6 rounded shadow mb-6">

            <input
                placeholder="상품명"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 w-full mb-2"
            />

            <input
                placeholder="가격"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="border p-2 w-full mb-2"
            />

            <textarea
                placeholder="설명"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border p-2 w-full mb-2"
            />

            <input
                id="product-image"
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="mb-2"
            />

            <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
                등록
            </button>
        </div>
    );
}

export default ProductForm;