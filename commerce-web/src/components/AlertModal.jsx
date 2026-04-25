function AlertModal({ message, onClose }) {
    return (
        <div style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex", justifyContent: "center", alignItems: "center"
        }}>
            <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
                <p>{message}</p>
                <button onClick={onClose}>확인</button>
            </div>
        </div>
    );
}
export default AlertModal;