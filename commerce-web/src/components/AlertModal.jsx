function AlertModal({ message, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-80 p-6 rounded-2xl shadow-lg text-center">

                <p className="text-gray-800 mb-6">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                    확인
                </button>
            </div>
        </div>
    );
}

export default AlertModal;