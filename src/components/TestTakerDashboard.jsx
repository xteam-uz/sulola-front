import { useState } from "react";
import { ChevronRight, Clock, FileText, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../api/axios-client";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { FadeContent } from "./ui";

export const TestTakerDashboard = () => {
    const [showModal, setShowModal] = useState(false);
    const [testCode, setTestCode] = useState("");
    const [checking, setChecking] = useState(false);
    const [activeTab, setActiveTab] = useState("created");
    const [currentPage, setCurrentPage] = useState(1);
    // const [pagination, setPagination] = useState(null);

    const { user, tests, testsLoading, pagination, fetchTestsPage } =
        useStateContext();

    const navigate = useNavigate();

    const filteredTests = (tests || []).filter((test) => {
        const now = new Date();
        const endTime = new Date(test.end_time);

        if (activeTab === "created") {
            return now < endTime;
        } else {
            return now >= endTime;
        }
    });

    const handlePageChange = (page) => {
        fetchTestsPage(page);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!testCode.trim()) return;

        setChecking(true);
        try {
            const res = await axiosClient.post("/tests/check/test", {
                code: testCode,
            });

            if (res.data.exists) {
                const testIdToSend = res.data.test_id;

                setShowModal(false);
                setTestCode("");

                // Record the start time when navigating to the test
                const startTime = new Date().toISOString();

                navigate(`/test_taking`, {
                    state: { testId: testIdToSend, startTime },
                });
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
    const handleTestClick = async (testCode) => {
        try {
            const res = await axiosClient.post("/tests/check/test", {
                code: testCode,
            });
            if (res.data.exists) {
                const testIdToSend = res.data.test_id;

                setTestCode("");

                // Record the start time when navigating to the test
                const startTime = new Date().toISOString();

                navigate(`/test_taking`, {
                    state: { testId: testIdToSend, startTime },
                });
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
                                // onClick={() => setActiveTab("created")}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === "created"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-600 hover:text-gray-800"
                                }`}
                            >
                                Qatnashgan testlar
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
                                <>
                                    {filteredTests.map((test, index) => (
                                        <div
                                            key={test.code || index}
                                            className="bg-white rounded-2xl p-4 mb-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div
                                                onClick={() =>
                                                    handleTestClick(test.code)
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
                                                                new Date() <
                                                                new Date(
                                                                    test.start_time,
                                                                )
                                                                    ? "bg-green-100 text-green-600"
                                                                    : new Date() <
                                                                        new Date(
                                                                            test.end_time,
                                                                        )
                                                                      ? "bg-blue-100 text-blue-600"
                                                                      : "bg-gray-200 text-gray-600"
                                                            }`}
                                                        >
                                                            {new Date() <
                                                            new Date(
                                                                test.start_time,
                                                            )
                                                                ? "Kutilmoqda"
                                                                : new Date() <
                                                                    new Date(
                                                                        test.end_time,
                                                                    )
                                                                  ? "Faol"
                                                                  : "Yopiq"}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm mb-2">
                                                        Fan: {test.science_name}
                                                    </p>
                                                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <FileText
                                                                size={14}
                                                            />
                                                            <span>
                                                                Kod: {test.code}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock size={14} />
                                                            <span>
                                                                Boshlanish:{" "}
                                                                {
                                                                    test.start_time
                                                                }
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
                                    ))}

                                    {/* Pagination */}
                                    {pagination && pagination.lastPage > 1 && (
                                        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                            <p className="text-sm text-gray-500">
                                                {pagination.from}-
                                                {pagination.to} /{" "}
                                                {pagination.total} ta
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handlePageChange(
                                                            currentPage - 1,
                                                        )
                                                    }
                                                    disabled={currentPage === 1}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        currentPage === 1
                                                            ? "text-gray-300 cursor-not-allowed"
                                                            : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>

                                                <div className="flex items-center gap-1">
                                                    {Array.from(
                                                        {
                                                            length: pagination.lastPage,
                                                        },
                                                        (_, i) => i + 1,
                                                    )
                                                        .filter((page) => {
                                                            return (
                                                                page === 1 ||
                                                                page ===
                                                                    pagination.lastPage ||
                                                                Math.abs(
                                                                    page -
                                                                        currentPage,
                                                                ) <= 1
                                                            );
                                                        })
                                                        .map(
                                                            (
                                                                page,
                                                                idx,
                                                                arr,
                                                            ) => (
                                                                <span
                                                                    key={page}
                                                                    className="flex items-center"
                                                                >
                                                                    {idx > 0 &&
                                                                        arr[
                                                                            idx -
                                                                                1
                                                                        ] !==
                                                                            page -
                                                                                1 && (
                                                                            <span className="px-1 text-gray-400">
                                                                                ...
                                                                            </span>
                                                                        )}
                                                                    <button
                                                                        onClick={() =>
                                                                            handlePageChange(
                                                                                page,
                                                                            )
                                                                        }
                                                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                                            currentPage ===
                                                                            page
                                                                                ? "bg-blue-500 text-white"
                                                                                : "text-gray-600 hover:bg-gray-100"
                                                                        }`}
                                                                    >
                                                                        {page}
                                                                    </button>
                                                                </span>
                                                            ),
                                                        )}
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        handlePageChange(
                                                            currentPage + 1,
                                                        )
                                                    }
                                                    disabled={
                                                        currentPage ===
                                                        pagination.lastPage
                                                    }
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        currentPage ===
                                                        pagination.lastPage
                                                            ? "text-gray-300 cursor-not-allowed"
                                                            : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
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
