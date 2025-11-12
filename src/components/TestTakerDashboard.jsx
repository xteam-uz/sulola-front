import { useState, useEffect } from "react";
import { ChevronRight, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../api/axios-client";
import { toast, ToastContainer, Zoom } from "react-toastify";

export const TestTakerDashboard = () => {
    const [activeTests, setActiveTests] = useState([]);
    const [completedTests, setCompletedTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [testCode, setTestCode] = useState("");
    const [checking, setChecking] = useState(false);
    const { user } = useStateContext();

    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setActiveTests([]);
            setCompletedTests([]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!testCode.trim()) return;

        setChecking(true);
        try {
            const res = await axiosClient.post("/tests/check/test", { code: testCode });

            // ✅ DEBUG: Javobni ko'ring
            console.log("API javob:", res.data);
            console.log("exists:", res.data.exists);
            console.log("test_id:", res.data.test_id);

            if (res.data.exists) {
                const testIdToSend = res.data.test_id;

                // ✅ DEBUG: Navigate qilishdan oldin
                console.log("Navigate qilinyapti, testId:", testIdToSend);

                setShowModal(false);
                setTestCode("");

                navigate(
                    `/test_taking`,
                    {
                        state: { testId: testIdToSend }
                    });

                // ✅ DEBUG: Navigate qilgandan keyin
                console.log("Navigate bajarildi");
            } else {
                toast.warning('Bunday kodli test bazada mavjud emas', {
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Zoom,
                });
            }
        } catch (error) {
            console.error("API xatolik:", error);
            console.error("Response:", error.response?.data);
            toast.error(error.response?.data, {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Zoom,
            });
        } finally {
            setChecking(false);
        }
    };

    return (
        <>
            <div className="px-4 mt-4 space-y-3">
                <div className="bg-white text-gray-800 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-lg font-semibold">
                                {user[0]?.first_name} {user[0]?.last_name}
                            </span>
                            <span className="text-blue-600 text-sm ml-3">
                                {user[0]?.user_type === "test_taker" ? "Test topshiruvchi" : ""}
                            </span>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        <span>Telegram ID: </span>
                        <span className="font-semibold text-gray-800">
                            {user[0]?.bot_user?.user_id}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-4 my-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-800">Jarayondagi testlar</h3>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:bg-blue-700 transition-colors">
                            Test kodini kiritish
                        </button>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="bg-white rounded-2xl p-12 text-center">
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                                <p className="text-gray-500 mt-4">Yuklanmoqda...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                                <p className="text-gray-500">
                                    Hozircha sizga hech qanday test belgilanmagan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <form
                    onSubmit={handleSubmit}
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-80 rounded-2xl shadow-lg p-6 relative animate-fadeInUp"
                    >
                        <h2 className="text-xl text-center text-gray-800 mb-2">
                            Test kodini kiriting
                        </h2>
                        <p className="text-xs text-gray-500 text-center mb-4">
                            O‘qituvchidan olgan test kodingizni kiriting
                        </p>

                        <input
                            className="border rounded-xl p-3 w-full focus:border-blue-500 focus:outline-none"
                            type="text"
                            value={testCode}
                            onChange={(e) => setTestCode(e.target.value)}
                            placeholder="Masalan: ABC123"
                            required
                        />

                        <div className="flex justify-end mt-5 space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-500 rounded-lg hover:bg-gray-100 text-sm"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="submit"
                                disabled={!testCode.trim() || checking}
                                className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${testCode.trim()
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {checking && (
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></span>
                                )}
                                {checking ? "Tekshirilmoqda..." : "Davom etish"}
                            </button>
                        </div>
                    </div>
                </form>
            )}
            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Zoom}
            />
        </>
    );
};
