import { useState } from "react";
import { ChevronRight, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../api/axios-client";
import { Bounce, toast, ToastContainer, Zoom } from "react-toastify";
import { FadeContent } from "./ui";

export const TestTakerDashboard = () => {
    const [showModal, setShowModal] = useState(false);
    const [testCode, setTestCode] = useState("");
    const [checking, setChecking] = useState(false);
    const [activeTab, setActiveTab] = useState("created");

    const { user, tests, testsLoading } = useStateContext();

    const navigate = useNavigate();

    const filteredTests = (tests || []).filter((test) => {
        if (activeTab === "created") {
            return test.status === "upcoming" || test.status === "active";
        } else {
            return test.status === "finished" || test.status === "closed";
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!testCode.trim()) return;

        setChecking(true);
        try {
            const res = await axiosClient.post("/tests/check/test", {
                code: testCode,
            });

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

                // Record the start time when navigating to the test
                const startTime = new Date().toISOString();

                navigate(`/test_taking`, {
                    state: { testId: testIdToSend, startTime },
                });

                // ✅ DEBUG: Navigate qilgandan keyin
                console.log("Navigate bajarildi");
            } else {
                toast.warning("Bunday kodli test bazada mavjud emas", {
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
            }
        } catch (error) {
            console.error("API xatolik:", error);
            console.error("Response:", error.response?.data);
            toast.error(error.response?.data, {
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
            setChecking(false);
        }
    };
    const handleTestClick = (testId) => {
        const startTime = new Date().toISOString();

        // To'g'ridan-to'g'ri test sahifasiga o'tish
        navigate(`/test_taking`, {
            state: { testId: testId, startTime },
        });
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
                                {user[0]?.user_type === "test_taker"
                                    ? "Test topshiruvchi"
                                    : ""}
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
                    <div className="flex items-center justify-center mb-4">
                        {/* <h3 className="text-base font-bold text-gray-800">Jarayondagi testlar</h3> */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:bg-blue-600 transition-colors"
                        >
                            Test kodini kiritish
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Tabs */}
                        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-4">
                            <button
                                onClick={() => setActiveTab("created")}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === "created"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-600 hover:text-gray-800"
                                }`}
                            >
                                Jarayondagi testlar
                            </button>
                            <button
                                onClick={() => setActiveTab("taken")}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === "taken"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-600 hover:text-gray-800"
                                }`}
                            >
                                Yopilgan testlar
                            </button>
                        </div>

                        {/* Test List */}
                        <div className="space-y-3">
                            {testsLoading ? (
                                <div className="bg-white rounded-2xl p-12 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    </div>
                                    <p className="text-gray-500 mt-4">
                                        Yuklanmoqda...
                                    </p>
                                </div>
                            ) : filteredTests.length > 0 ? (
                                filteredTests.map((test) => (
                                    <div
                                        key={test.id}
                                        className="bg-white rounded-2xl p-4 mb-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <div
                                            onClick={() =>
                                                handleTestClick(test.id)
                                            }
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="font-semibold text-gray-800">
                                                        {test.name}
                                                    </h4>
                                                    <span
                                                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                                            test.status ===
                                                            "upcoming"
                                                                ? "bg-green-100 text-green-600"
                                                                : test.status ===
                                                                    "active"
                                                                  ? "bg-blue-100 text-blue-600"
                                                                  : "bg-gray-200 text-gray-600"
                                                        }`}
                                                    >
                                                        {test.status ===
                                                        "upcoming"
                                                            ? "Kutilmoqda"
                                                            : test.status ===
                                                                "active"
                                                              ? "Faol"
                                                              : "Yopiq"}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm mb-2">
                                                    Fan: {test.science_name}
                                                </p>
                                                <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                    <div className="flex items-center space-x-1">
                                                        <FileText size={14} />
                                                        <span>
                                                            Kod: {test.code}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock size={14} />
                                                        <span>
                                                            Boshlanish:{" "}
                                                            {test.start_time}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock size={14} />
                                                        <span>
                                                            Tugash:{" "}
                                                            {test.end_time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight
                                                className="text-gray-400 ml-2 flex-shrink-0"
                                                size={20}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-2xl p-8 text-center">
                                    <p className="text-gray-500">
                                        {activeTab === "created"
                                            ? "Hozircha jarayondagi testlar yo'q"
                                            : "Hozircha yopilgan testlar yo'q"}
                                    </p>
                                </div>
                            )}
                        </div>
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
                    <FadeContent
                        blur={true}
                        duration={300}
                        easing="ease-in"
                        initialOpacity={0}
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
                                autoFocus
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
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                        testCode.trim()
                                            ? "bg-blue-500 text-white hover:bg-blue-600"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {checking && (
                                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></span>
                                    )}
                                    {checking
                                        ? "Tekshirilmoqda..."
                                        : "Davom etish"}
                                </button>
                            </div>
                        </div>
                    </FadeContent>
                </form>
            )}
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </>
    );
};
