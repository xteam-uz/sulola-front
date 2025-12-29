import { useRef, useState, useEffect } from "react";
import axiosClient from "../../api/axios-client";
import { useStateContext } from "../../contexts/ContextProvider";
import { getUserData, initTelegramApp } from "../../telegram/init";
import Lottie from "lottie-react";
import TelegramAnimation from "../../assets/Telegram.json";
import ErrorAnimation from "../../assets/error.json";
import { Link, Navigate } from "react-router-dom";

// Xatoliklarni tarjima qilish uchun
const errorTranslations = {
    "The first name field must be at least 3 characters.":
        "Ism kamida 3 ta harfdan iborat bo'lishi kerak.",
    "The last name field must be at least 3 characters.":
        "Familiya kamida 3 ta harfdan iborat bo'lishi kerak.",
    "The first name field is required.": "Ism maydoni to'ldirilishi shart.",
    "The last name field is required.": "Familiya maydoni to'ldirilishi shart.",
    "The telegram user id field is required.":
        "Telegram foydalanuvchi IDsi topilmadi.",
};

// Xatolikni tarjima qilish funksiyasi
const translateError = (error) => {
    return errorTranslations[error] || error;
};

export const Signup = () => {
    const { setUser, setToken, token, user } = useStateContext();
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const [role, setRole] = useState("tester");
    const [errors, setErrors] = useState(null);
    const [telegramUser, setTelegramUser] = useState(null);

    useEffect(() => {
        initTelegramApp();

        // WebApp SDK to'liq yuklanishini kutish
        const checkUserData = () => {
            const user = getUserData();
            console.log("Signup: Telegram User Data:", user);
            if (user) {
                setTelegramUser(user);
                console.log("Signup: Telegram User ID:", user.id);
            } else {
                console.warn("Signup: Telegram user data topilmadi!");
                // Qisqa vaqtdan keyin qayta urinib ko'rish
                setTimeout(() => {
                    const retryUser = getUserData();
                    if (retryUser) {
                        setTelegramUser(retryUser);
                        console.log("Signup Retry: Telegram User ID:", retryUser.id);
                    }
                }, 1000);
            }
        };

        // Darhol tekshirish
        checkUserData();

        // WebApp ready event'ini kutish
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
    }, []);

    // URL'dan token kelganda avtomatik tekshirish
    if (token && user) {
        // Token va user mavjud bo'lsa, dashboard'ga yo'naltirish
        return <Navigate to="/dashboard" replace />;
    }

    const onSubmit = (e) => {
        e.preventDefault();

        // Telegram user ID ni olish - WebApp'dan yoki URL'dan
        let telegramUserId = telegramUser?.id;

        // Agar WebApp'dan user topilmasa, URL'dan user_id ni olish
        if (!telegramUserId) {
            const params = new URLSearchParams(window.location.search);
            telegramUserId = params.get("user_id") || localStorage.getItem("USER_ID");
        }

        if (!telegramUserId) {
            setErrors({
                telegram_user_id: ["Telegram foydalanuvchi IDsi topilmadi"],
            });
            console.error("Telegram user ID topilmadi. WebApp user:", telegramUser, "URL user_id:", telegramUserId);
            return;
        }

        const payload = {
            first_name: firstNameRef.current.value,
            last_name: lastNameRef.current.value,
            telegram_user_id: telegramUserId,
            user_type: role,
        };

        console.log("Signup payload:", payload);

        setErrors(null);

        axiosClient
            .post("/register", payload)
            .then(({ data }) => {
                setUser(data.user);
                setToken(data.token);
            })
            .catch((error) => {
                const response = error.response;
                if (response && response.data) {
                    if (response.data.data) {
                        setErrors(response.data.data);
                    } else if (response.data.errors) {
                        setErrors(response.data.errors);
                    } else {
                        setErrors({ general: ["Xatolik yuz berdi"] });
                    }
                } else {
                    setErrors({ general: ["Tarmoq xatosi yuz berdi"] });
                }
            });
    };

    return (
        <form onSubmit={onSubmit} className="max-w-md mx-auto p-4">
            <div className="flex flex-col items-center gap-5">
                {(errors && errors.general) || errors?.telegram_user_id ? (
                    <Lottie
                        width={300}
                        height={300}
                        className="size-32"
                        animationData={ErrorAnimation}
                    />
                ) : (
                    <Lottie
                        width={300}
                        height={300}
                        className="size-42"
                        animationData={TelegramAnimation}
                    />
                )}

                <h1 className="text-xl font-semibold mb-5 text-center">
                    Ro'yxatdan o'tish
                </h1>
            </div>

            {/* Umumiy xatoliklarni ko'rsatish */}
            {errors && errors.general ? (
                <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
                    {errors.general.map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </div>
            ) : (
                errors?.telegram_user_id && (
                    <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
                        <p>{translateError(errors.telegram_user_id[0])}</p>
                    </div>
                )
            )}

            <div className="grid md:grid-cols-2 md:gap-6">
                {/* Ism */}
                <div className="relative z-0 w-full mb-5 group">
                    <input
                        ref={firstNameRef}
                        type="text"
                        id="floating_first_name"
                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2
                               border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500
                               focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        defaultValue={telegramUser?.first_name || ""}
                    />
                    <label
                        htmlFor="floating_first_name"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300
                               transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0
                               peer-focus:text-blue-600 peer-focus:dark:text-blue-500
                               peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
                               peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Ism
                    </label>
                    {/* Xatolikni ko'rsatish */}
                    {errors?.first_name && (
                        <p className="text-red-500 text-xs mt-1">
                            {translateError(errors.first_name[0])}
                        </p>
                    )}
                </div>

                {/* Familiya */}
                <div className="relative z-0 w-full mb-5 group">
                    <input
                        ref={lastNameRef}
                        type="text"
                        id="floating_last_name"
                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2
                               border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500
                               focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        defaultValue={telegramUser?.last_name || ""}
                    />
                    <label
                        htmlFor="floating_last_name"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300
                               transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0
                               peer-focus:text-blue-600 peer-focus:dark:text-blue-500
                               peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
                               peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Familiya
                    </label>
                    {/* Xatolikni ko'rsatish */}
                    {errors?.last_name && (
                        <p className="text-red-500 text-xs mt-1">
                            {translateError(errors.last_name[0])}
                        </p>
                    )}
                </div>
            </div>

            {/* Rol tanlash */}
            <div className="mb-5 text-center">
                <p className="mb-2 font-medium">Rolni tanlang</p>
                <div className="flex gap-2 w-full max-w-xs mx-auto">
                    <button
                        type="button"
                        onClick={() => setRole("tester")}
                        className={`flex-1 py-2 rounded border text-xs transition-all ${role === "tester"
                            ? "bg-blue-500 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300"
                            }`}
                    >
                        Test oluvchi
                    </button>

                    <button
                        type="button"
                        onClick={() => setRole("test_taker")}
                        className={`flex-1 py-2 rounded border text-xs transition-all ${role === "test_taker"
                            ? "bg-blue-500 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300"
                            }`}
                    >
                        Test topshiruvchi
                    </button>
                </div>
            </div>

            {/* Submit tugmasi */}
            <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none cursor-pointer
                           focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center
                           dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
                Ro'yxatdan o'tish
            </button>
            <p className="text-sm text-center mt-4">
                Agar allaqachon ro'yxatdan o'tgan bo'lsangiz, <Link className="text-blue-500" to="/login">
                    kiring
                </Link>
            </p>
        </form>
    );
};
