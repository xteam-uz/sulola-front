import { useEffect, useState, useRef } from "react";

export const CountdownTimer = ({ startTime, endTime, onStart, onExpire }) => {
    const [status, setStatus] = useState("loading");
    const [timeLeft, setTimeLeft] = useState(null);
    const prevStatusRef = useRef(null);

    useEffect(() => {
        const formatTime = (diff) => {
            if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            };
        };

        const calculate = () => {
            const now = Date.now();
            const start = new Date(startTime).getTime();
            const end = new Date(endTime).getTime();

            let newStatus, diff;

            if (now < start) {
                newStatus = "waiting";
                diff = start - now;
            } else if (now < end) {
                newStatus = "active";
                diff = end - now;
            } else {
                newStatus = "expired";
                diff = 0;
            }

            setStatus(newStatus);
            setTimeLeft(formatTime(diff));

            // Callback'larni faqat status o'zgarganda chaqirish
            if (prevStatusRef.current !== newStatus) {
                if (newStatus === "active" && onStart) {
                    onStart();
                }
                if (newStatus === "expired" && onExpire) {
                    onExpire();
                }
                prevStatusRef.current = newStatus;
            }
        };

        // Darhol hisoblash
        calculate();

        // Har soniyada yangilash
        const timer = setInterval(calculate, 1000);

        return () => clearInterval(timer);
    }, [startTime, endTime, onStart, onExpire]);

    if (!timeLeft) return null;

    const timeString = `${timeLeft.days > 0 ? `${timeLeft.days} kun, ` : ""}${String(timeLeft.hours).padStart(2, "0")}:${String(timeLeft.minutes).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`;

    // Test hali boshlanmagan
    if (status === "waiting") {
        return (
            <>
                <h3 className="font-semibold text-yellow-900 mb-1">
                    ⏳ Test hali boshlanmagan
                </h3>
                <p className="text-sm text-yellow-800 mb-2">
                    Test boshlanganidan keyin javoblarni jo'natishingiz mumkin.
                </p>
                <p className="text-sm text-yellow-700">
                    <span className="font-semibold">
                        Boshlanishiga: {timeString}
                    </span>
                </p>
            </>
        );
    }

    // Test davom etmoqda
    if (status === "active") {
        return (
            <>
                <h3 className="font-semibold text-green-900 mb-1">
                    ✅ Test davom etmoqda
                </h3>
                <p className="text-sm text-green-800 mb-2">
                    Javoblaringizni jo'natishingiz mumkin.
                </p>
                <p className="text-sm text-green-700">
                    <span className="font-semibold">
                        Tugashiga: {timeString}
                    </span>
                </p>
            </>
        );
    }

    // Test tugagan
    return (
        <>
            <h3 className="font-semibold text-red-900 mb-1">
                ⏰ Test vaqti tugadi!
            </h3>
            <p className="text-sm text-red-800">
                Test topshirish vaqti yakunlandi. Endi javob yuborib bo'lmaydi.
            </p>
        </>
    );
};
