import { useState, useRef, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import axiosClient from "../../api/axios-client";
import { initTelegramApp, getUserData } from "../../telegram/init";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import TelegramAnimation from "../../assets/Telegram.json";
import ErrorAnimation from "../../assets/error.json";

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

export const Login = () => {
    const { setUser, setToken } = useStateContext();
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const [role, setRole] = useState("test_taker");
    const [errors, setErrors] = useState(null);
    const [telegramUser, setTelegramUser] = useState(null);

    useEffect(() => {
        initTelegramApp();
        const user = getUserData();
        if (user) setTelegramUser(user);
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();

        if (!telegramUser?.id) {
            setErrors({
                telegram_user_id: ["Telegram foydalanuvchi ma'lumoti topilmadi"],
            });
            return;
        }

        const payload = {
            telegram_user_id: telegramUser.id,
            first_name: firstNameRef.current.value,
            last_name: lastNameRef.current.value,
            role: role,
        };

        setErrors(null);

        axiosClient
            .post("/login", payload)
            .then(({ data }) => {
                console.log(data);
                setUser(data.user);
                setToken(data.token); // Token avtomatik ravishda localStorage'ga saqlanadi
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
                    Kirish
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
                Kirish
            </button>
            <p className="text-sm text-center mt-4">
                Agar ro'yxatdan o'tmagan bo'lsangiz, <Link className="text-blue-500" to="/register">
                    ro'yxatdan o'tish
                </Link>
            </p>
        </form>
    );
};