import { useState } from "react";
import {
    CreditCard,
    Award,
    ChevronRight,
    Plus,
    FileText,
    Clock,
    X,
} from "lucide-react";
import { useStateContext } from "../contexts/ContextProvider";
import { FadeContent } from "./ui";
import { FooterNavbar } from "./FooterNavbar";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axios-client";
import { toast } from "react-toastify";
import { Bounce } from "react-toastify/unstyled";
import { format } from "date-fns";

export const TesterDashboard = () => {
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState("created");

    const {
        user,
        tests,
        checkTestCode,
        loading,
        pagination,
        fetchTestsResultsPage,
    } = useStateContext();

    const navigate = useNavigate();

    const handlePageChange = (page) => {
        fetchTestsResultsPage(page);
    };

    const handleTestClick = async (testCode) => {
        await checkTestCode(testCode, navigate);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const testType = formData.get("testType");

        setShowModal(false);

        if (testType === "paid") {
            navigate("/add_paid_test", { state: { testType } });
        } else if (testType === "free") {
            navigate("/add_free_test", { state: { testType } });
        } else if (testType === "atestat") {
            navigate("/add_atestat", { state: { testType } });
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    };

    return (
        <>
            {/* User Info Card */}
            <div className="px-4 mt-4 space-y-3">
                <div className="bg-white text-gray-800 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-lg font-semibold">
                                {user[0]?.first_name} {user[0]?.last_name}
                            </span>
                            <span className="text-blue-600 text-sm ml-3">
                                {user[0]?.user_type === "tester" &&
                                    "Test oluvchi"}
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

            {/* Balance & Credits Cards */}
            <div className="px-4 mt-4 space-y-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <CreditCard className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">
                                Balansingiz: {user[0]?.bot_user?.balance || 0}{" "}
                                so'm
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Pullik testlardan tushgan daromad
                            </p>
                        </div>
                    </div>
                    <button className="w-full mt-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors">
                        Pul yechish
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-3 rounded-xl">
                            <Award className="text-green-600" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">
                                Kredit balansi: {user[0]?.credits || 0} ta
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Har bir o'quvchi natijasi uchun 1 kredit
                                sarflanadi
                            </p>
                        </div>
                    </div>
                    <button className="w-full mt-3 py-2.5 bg-green-50 text-green-600 rounded-xl font-medium text-sm hover:bg-green-100 transition-colors">
                        Kredit sotib olish
                    </button>
                </div>
            </div>

            {/* Tests Section */}
            <div className="px-4 my-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Testlar</h3>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center space-x-2 shadow-md hover:bg-blue-600 transition-colors"
                    >
                        <Plus size={18} />
                        <span className="text-sm font-medium">
                            Test qo'shish
                        </span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-4">
                    <button
                        onClick={() => setActiveTab("created")}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "created"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        Mening testlarim
                    </button>
                </div>

                {/* Test List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                            <p className="text-gray-500 mt-4">Yuklanmoqda...</p>
                        </div>
                    ) : (tests || []).length > 0 ? (
                        <>
                            {(tests || []).map((test, index) => (
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
                                                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${new Date() <
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
                                                        new Date(test.start_time)
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
                                                    <FileText size={14} />
                                                    <span>
                                                        Kod: {test.code}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock size={14} />
                                                    <span>
                                                        Boshlanish:{" "}
                                                        {format(
                                                            new Date(
                                                                test.start_time,
                                                            ),
                                                            "dd.MM.yyyy HH:mm",
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock size={14} />
                                                    <span>
                                                        Tugash:{" "}
                                                        {format(
                                                            new Date(
                                                                test.end_time,
                                                            ),
                                                            "dd.MM.yyyy HH:mm",
                                                        )}
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
                                        {pagination.from}-{pagination.to} /{" "}
                                        {pagination.total} ta
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    pagination.from -
                                                    pagination.perPage,
                                                )
                                            }
                                            disabled={pagination.currentPage}
                                            className={`p-2 rounded-lg transition-colors ${pagination.currentPage === 1
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
                                                            pagination.currentPage,
                                                        ) <= 1
                                                    );
                                                })
                                                .map((page, idx, arr) => (
                                                    <span
                                                        key={page}
                                                        className="flex items-center"
                                                    >
                                                        {idx > 0 &&
                                                            arr[idx - 1] !==
                                                            page - 1 && (
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
                                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pagination.currentPage ===
                                                                page
                                                                ? "bg-blue-500 text-white"
                                                                : "text-gray-600 hover:bg-gray-100"
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    </span>
                                                ))}
                                        </div>

                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    pagination.currentPage + 1,
                                                )
                                            }
                                            disabled={
                                                pagination.currentPage ===
                                                pagination.lastPage
                                            }
                                            className={`p-2 rounded-lg transition-colors ${pagination.currentPage ===
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
                                {tests === null &&
                                    "Hozircha jarayondagi testlar yo'q"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
                    onClick={handleOverlayClick}
                >
                    <FadeContent
                        blur={true}
                        duration={300}
                        easing="ease-in"
                        initialOpacity={0}
                    >
                        <form
                            onSubmit={handleFormSubmit}
                            className="bg-white w-80 rounded-2xl shadow-lg p-6 relative animate-fadeInUp"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm text-center text-gray-800">
                                    Test turini tanlang
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-500 rounded-lg hover:bg-gray-100 text-sm"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 border rounded-xl p-3 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="testType"
                                        value="paid"
                                        defaultChecked
                                    />
                                    <div>
                                        <p className="font-medium">
                                            💰 Pullik test
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            O'quvchilar Click yoki Payme orqali
                                            to'laydi.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 border rounded-xl p-3 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="testType"
                                        value="free"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            🎓 Tekin test
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            O'quvchilar uchun bepul test.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 border rounded-xl p-3 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="testType"
                                        value="atestat"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            🎓 Atestatsiya
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            O'qituvchilar uchun atestatsiya.
                                        </p>
                                    </div>
                                </label>
                            </div>

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
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                                >
                                    Boshlash
                                </button>
                            </div>
                        </form>
                    </FadeContent>
                </div>
            )}

            <FooterNavbar />
        </>
    );
};
