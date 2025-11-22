import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosClient from "../../api/axios-client";
import { Bounce, toast } from "react-toastify";
import { TopHeader } from "../../components/ui";
import { Search } from "lucide-react";

export const TestChecking = () => {
    // states
    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState(null);
    const [testStatus, setTestStatus] = useState("waiting");

    // props
    const { state } = useLocation();
    const testId = state?.testId;

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const { data } = await axiosClient.get(`/tests/${testId}`);
                setTestData(data.test);

                // Test holatini aniqlash
                const now = Date.now();
                const start = new Date(data.test.start_time).getTime();
                const end = new Date(data.test.end_time).getTime();

                if (now < start) {
                    setTestStatus("waiting");
                } else if (now < end) {
                    setTestStatus("active");
                } else {
                    setTestStatus("expired");
                }
            } catch (error) {
                console.error("Test yuklashda xatolik:", error);
                toast.error("Test ma'lumotlarini yuklashda xatolik!", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    className: "toast-width my-2",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId]);

    // Spinner
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // check if test data is available
    if (!testData) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-700">
                Test topilmadi.
            </div>
        );
    }

    const { code, name } = testData;

    // Test holatlari uchun qisqa o'zgaruvchilar
    const isTestNotStarted = testStatus === "waiting";
    const isTestExpired = testStatus === "expired";
    const isTestActive = testStatus === "active";

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <TopHeader testName={name} />

            <div className="px-4 py-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <div className="flex justify-between items-center mb-5">
                        {isTestNotStarted ? (
                            <span className="bg-red-500 rounded px-2 py-2  text-white text-sm">
                                Test boshlanmagan
                            </span>
                        ) : isTestExpired ? (
                            <span className="bg-amber-500 rounded px-2 py-2  text-white text-sm">
                                Test muddati tugagan
                            </span>
                        ) : isTestActive ? (
                            <span className="bg-green-500 rounded px-2 py-2  text-white text-sm">
                                Test davom etmoqda
                            </span>
                        ) : null}

                        <span className="text-gray-700 text-sm">
                            <b>Test kodi:</b> {code}
                        </span>
                    </div>

                    <form className="flex items-center gap-2 relative w-full mt-5">
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="floating_name"
                                className="block w-full py-2.5 pl-0 pr-0 text-sm text-gray-900 bg-transparent
                                           border-0 border-b-2 border-gray-300 appearance-none
                                           focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                            />

                            <label
                                htmlFor="floating_name"
                                className="absolute text-sm text-gray-500 duration-300 transform
                                           -translate-y-6 scale-75 top-3 -z-10 origin-[0]
                                           peer-focus:text-blue-600 peer-placeholder-shown:scale-100
                                           peer-placeholder-shown:translate-y-0 peer-focus:scale-75
                                           peer-focus:-translate-y-6 z-50"
                            >
                                O'quvchi ismi yoki familiyasi bo'yicha qidirish
                            </label>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
