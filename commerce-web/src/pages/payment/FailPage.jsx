import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {failPayment} from "../../api/payment";
//import api from "../../api/client";

function FailPage() {

    const [params] = useSearchParams();
    const navigate = useNavigate();
    const calledRef = useRef(false);

    useEffect(() => {

        // 이미 실행했으면 종료
        if (calledRef.current) return;

        calledRef.current = true;

        const processFailPayment = async () => {
            try {
                const orderId = params.get("orderId");

                console.log("결제 실패:", orderId);

                // 예약 재고 해제
                await failPayment({
                    orderId
                });

                alert("결제가 취소되었습니다.");

                navigate("/");

            } catch (e) {
                console.error(e);
                alert("실패 처리 오류");
                navigate("/");
            }
        };

        processFailPayment();

    }, []);

    return (
        <div className="flex justify-center items-center h-screen">
            <h2 className="text-xl font-bold">결제 실패 처리 중...</h2>
        </div>
    );
}

export default FailPage;