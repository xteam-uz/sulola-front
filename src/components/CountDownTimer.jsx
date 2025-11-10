import { useEffect, useState } from "react";

export const CountdownTimer = () => {
    const deadline = new Date("2025-11-15T12:00:00").getTime();

    const [timeLeft, setTimeLeft] = useState(getTimeLeft(deadline));

    function getTimeLeft(target) {
        const now = new Date().getTime();
        const diff = target - now;

        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

        const totalHours = Math.floor(diff / (1000 * 60 * 60)); // jami soat
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        return { days, totalHours, minutes, seconds };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft(deadline));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <h3 className="font-semibold text-red-900 mb-1">Test hali boshlanmagan</h3>
            <p className="text-sm text-red-800 mb-2">
                Test boshlanganidan keyin javoblarni jo'natishingiz mumkin.
            </p>
            <p className="text-sm text-red-700">
                <span className="font-semibold">
                    Qolgan vaqt:{" "}
                    {timeLeft.days} kun,{" "}
                    {String(timeLeft.totalHours).padStart(2, "0")}:
                    {String(timeLeft.minutes).padStart(2, "0")}:
                    {String(timeLeft.seconds).padStart(2, "0")}
                </span>
            </p>
        </>
    );
}
