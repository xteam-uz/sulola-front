import { useEffect, useState } from "react";

export const CountdownTimer = ({ deadline, onExpire }) => {
    const deadlineTime = new Date(deadline).getTime();
    const [timeLeft, setTimeLeft] = useState(getTimeLeft(deadlineTime));
    const [isExpired, setIsExpired] = useState(false);

    function getTimeLeft(target) {
        const now = new Date().getTime();
        const diff = target - now;

        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
        }

        const totalHours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        return { days, totalHours, minutes, seconds, isExpired: false };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = getTimeLeft(deadlineTime);
            setTimeLeft(newTimeLeft);

            // Agar vaqt tugasa
            if (newTimeLeft.isExpired && !isExpired) {
                setIsExpired(true);
                if (onExpire) {
                    onExpire(); // Callback chaqirish
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [deadlineTime, isExpired, onExpire]);

    // Agar vaqt tugagan bo'lsa
    if (timeLeft.isExpired) {
        return (
            <>
                <h3 className="font-semibold text-red-900 mb-1">⏰ Test vaqti tugadi!</h3>
                <p className="text-sm text-red-800">
                    Test topshirish vaqti yakunlandi. Endi javob yuborib bo'lmaydi.
                </p>
            </>
        );
    }

    // Agar test hali boshlanmagan bo'lsa
    return (
        <>
            <h3 className="font-semibold text-yellow-900 mb-1">⏳ Test hali boshlanmagan</h3>
            <p className="text-sm text-yellow-800 mb-2">
                Test boshlanganidan keyin javoblarni jo'natishingiz mumkin.
            </p>
            <p className="text-sm text-yellow-700">
                <span className="font-semibold">
                    Qolgan vaqt:{" "}
                    {timeLeft.days > 0 && `${timeLeft.days} kun, `}
                    {String(timeLeft.totalHours % 24).padStart(2, "0")}:
                    {String(timeLeft.minutes).padStart(2, "0")}:
                    {String(timeLeft.seconds).padStart(2, "0")}
                </span>
            </p>
        </>
    );
};