function AdminModal({ onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl">
                <h2 className="text-xl font-bold">관리자 메뉴</h2>

                <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">
                    상품 등록
                </button>

                <button onClick={onClose} className="ml-2">
                    닫기
                </button>
            </div>
        </div>
    );
}

export default AdminModal;