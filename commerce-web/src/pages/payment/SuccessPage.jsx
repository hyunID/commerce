import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {confirmPayment} from "../../api/payment";

function SuccessPage() {

    const [params] = useSearchParams();
    const navigate = useNavigate();
    const calledRef = useRef(false);

    useEffect(() => {

        // 이미 실행했으면 종료
        if (calledRef.current) return;

        calledRef.current = true;

        const processConfirmPayment = async () => {
            try {
                // 토스에서 넘겨주는 값
                const paymentKey = params.get("paymentKey");
                const orderId = params.get("orderId");
                const amount = params.get("amount");

                console.log("결제 성공:", { paymentKey, orderId, amount });

                //  서버에 결제 승인 요청 (confirm)
                await confirmPayment({
                    paymentKey,
                    orderId,
                    amount
                });

                alert("결제 완료!");

                // 메인으로 이동
                navigate("/");

            } catch (e) {
                console.error(e);
                alert("결제 승인 실패");
                navigate("/");
            }
        };

        processConfirmPayment();

    }, []);

    return (
        <div className="flex justify-center items-center h-screen">
            <h2 className="text-xl font-bold">결제 처리 중...</h2>
        </div>
    );
}

export default SuccessPage;