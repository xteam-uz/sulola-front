import { useRef, useState, useEffect } from "react";
import axiosClient from "../../api/axios-client";
import { useStateContext } from "../../contexts/ContextProvider";
import { getUserData, initTelegramApp } from "../../telegram/init";
export const Signup = () => {
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
                telegram_id: ["Telegram foydalanuvchi ma'lumoti topilmadi"],
            });
            return;
        }

        const payload = {
            // telegram_id: telegramUser?.id, //1367538109, // ,
            telegram_id: 1367538109,
            // username: telegramUser?.username, //"mirrrjr", //,
            username: "mirrrjr",
            first_name: firstNameRef.current.value,
            last_name: lastNameRef.current.value,
            role: role,
        };

        setErrors(null);

        axiosClient
            .post("/register", payload)
            .then(({ data }) => {
                console.log(data);
                setUser(data.user);
                setToken(data.token);
            })
            .catch((error) => {
                const response = error.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                }
            });
    };

    return (
        <form onSubmit={onSubmit} className="max-w-md mx-auto p-4">
            <h1 className="text-xl font-semibold mb-5 text-center">
                Ro'yxatdan o'tish
            </h1>

            {errors && (
                <div className="text-red-500 text-sm mb-4">
                    {Object.keys(errors).map((key) => (
                        <p key={key}>{errors[key][0]}</p>
                    ))}
                </div>
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
                        required
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
                        required
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
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300"
                            }`}
                    >
                        Test oluvchi
                    </button>

                    <button
                        type="button"
                        onClick={() => setRole("test_taker")}
                        className={`flex-1 py-2 rounded border text-xs transition-all ${role === "test_taker"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300"
                            }`}
                    >
                        Test topshiruvchi
                    </button>
                </div>
                <p className="text-xs text-orange-500 mt-2">
                    Agar test topshirayotgan bo‘lsangiz, “Test topshiruvchi”
                    rolini tanlang.
                </p>
            </div>

            {/* Submit tugmasi */}
            <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none cursor-pointer
                           focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center
                           dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
                Ro'yxatdan o'tish
            </button>
        </form>
    );
};
