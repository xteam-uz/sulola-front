import { useState } from "react";
import {
    ChevronRight,
    ArrowLeft,
    Clock,
    Calendar,
    Check,
    Copy,
} from "lucide-react";
import { toast, Bounce, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios-client";
import { BackButton, BottomBar } from "@twa-dev/sdk/react";
import { useStateContext } from "../../contexts/ContextProvider";
import { TestTypeEnum } from "../../constants/testTypes";

export const Atestatsiya = () => {
    const { state } = useLocation();
    const testType = state?.testType;
    const [currentStep, setCurrentStep] = useState(1); // 1, 2
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdTestCode, setCreatedTestCode] = useState("");

    // Context api
    const { refreshTests } = useStateContext();

    // Step 1: Asosiy ma'lumotlar
    const [testName, setTestName] = useState("");
    const [scienceId, setScienceId] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Step 2: 50 ta savol (1-50)
    const [questions1_50, setQuestions1_50] = useState({});

    const { sciences } = useStateContext();
    const navigate = useNavigate();

    const handleAnswerChange = (questionNum, field, value) => {
        setQuestions1_50((prev) => ({
            ...prev,
            [questionNum]: {
                ...prev[questionNum],
                [field]: value,
            },
        }));
    };

    const handleStep1Submit = () => {
        if (!testName.trim()) {
            toast.error("Test nomini kiriting!", {
                position: "top-center",
                autoClose: 3000,
                transition: Bounce,
                className: "toast-width my-2"
            });
            return;
        }
        if (!scienceId) {
            toast.error("Fanni tanlang!", {
                position: "top-center",
                autoClose: 3000,
                transition: Bounce,
                className: "toast-width my-2",
            });
            return;
        }
        if (!startTime || !endTime) {
            toast.error("Boshlanish va tugash vaqtini kiriting!", {
                position: "top-center",
                autoClose: 3000,
                transition: Bounce,
                className: "toast-width my-2",
            });
            return;
        }
        if (new Date(startTime) >= new Date(endTime)) {
            toast.error(
                "Tugash vaqti boshlanish vaqtidan kechroq bo'lishi kerak!",
                {
                    position: "top-center",
                    autoClose: 3000,
                    transition: Bounce,
                    className: "toast-width my-2",
                },
            );
            return;
        }

        setCurrentStep(2);
    };

    const handleFinalSubmit = async () => {
        // 1-50 savollar to'ldirilganligini tekshirish
        const missingQuestions = [];
        for (let i = 1; i <= 50; i++) {
            if (!questions1_50[i]?.correct_answer) {
                missingQuestions.push(i);
            }
        }

        if (missingQuestions.length > 0) {
            toast.error(
                `${missingQuestions.slice(0, 5).join(", ")} savollar uchun to'g'ri javobni belgilang!`,
                {
                    position: "top-center",
                    autoClose: 4000,
                    transition: Bounce,
                    className: "toast-width my-2",
                },
            );
            return;
        }

        const testData = {
            name: testName,
            science_id: Number(scienceId),
            type: TestTypeEnum.ATTESTATSIYA,
            // price: 0, // Tekin testlar uchun narx 0
            start_time: startTime,
            end_time: endTime,
            details: {
                type: "atestatsiya",
                questions_1_50: questions1_50,
            },
        };

        console.log("Yuborilayotgan ma'lumotlar:", testData);

        setLoading(true);

        try {
            const response = await axiosClient.post("/tests", testData);
            console.log("Backend javobi:", response.data);

            refreshTests();

            // Success modal ko'rsatish
            setCreatedTestCode(response.data.test.code);
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Test yaratishda xatolik:", error);
            console.error("Xato tafsilotlari:", error.response?.data);

            // Validatsiya xatolarini ko'rsatish
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors)
                    .flat()
                    .join(", ");
                toast.error(errorMessages, {
                    position: "top-center",
                    autoClose: 5000,
                    transition: Bounce,
                    className: "toast-width my-2",
                });
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Test yaratishda xatolik yuz berdi!",
                    {
                        position: "top-center",
                        autoClose: 4000,
                        transition: Bounce,
                        className: "toast-width my-2",
                    },
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">
                    Test ma'lumotlari
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">
                            Test nomi *
                        </label>
                        <input
                            type="text"
                            value={testName}
                            onChange={(e) => setTestName(e.target.value)}
                            placeholder="Masalan: Atestatsiya Test #1"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">
                            Fan *
                        </label>
                        <select
                            value={scienceId}
                            onChange={(e) => setScienceId(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Fanni tanlang</option>
                            {sciences?.map((science) => (
                                <option key={science.id} value={science.id}>
                                    {science.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                            <Calendar size={16} />
                            Boshlanish vaqti *
                        </label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                            <Clock size={16} />
                            Tugash vaqti *
                        </label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleStep1Submit}
                className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center gap-2"
            >
                Davom etish
                <ChevronRight size={20} />
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">
                    1-50 savollar uchun to'g'ri javoblar
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Har bir savol uchun to'g'ri javobni belgilang (A, B, C yoki
                    D)
                </p>

                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                        <div
                            key={num}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                            <span className="font-medium text-gray-700 w-24">
                                {num}-savol:
                            </span>
                            <div className="grid grid-cols-4 gap-2 flex-1">
                                {["A", "B", "C", "D"].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() =>
                                            handleAnswerChange(
                                                num,
                                                "correct_answer",
                                                opt,
                                            )
                                        }
                                        className={`py-2 rounded-lg font-medium text-sm transition-all ${questions1_50[num]
                                            ?.correct_answer === opt
                                            ? "bg-blue-500 text-white shadow-md"
                                            : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400"
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                    Orqaga
                </button>
                <button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="flex-1 py-3.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-md flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Yuklanmoqda...
                        </>
                    ) : (
                        <>✓ Test yaratish</>
                    )}
                </button>
            </div>
        </div>
    );

    const handleCopyCode = () => {
        navigator.clipboard.writeText(createdTestCode);
        toast.success("Kod nusxalandi!", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
            className: "toast-width my-2",
        });
    };

    const SuccessModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeInUp">
                {/* Success Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center">
                        <Check
                            size={48}
                            className="text-white"
                            strokeWidth={3}
                        />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                    Test yaratildi
                </h2>

                {/* Description */}
                <p className="text-center text-orange-600 text-sm mb-6 leading-relaxed">
                    O'quvchilar telegram botga kirib ro'yxatdan o'tishi va test
                    javoblarini jo'natish uchun test kodini kiritishi kerak.
                </p>

                {/* Test Code */}
                <div className="mb-6">
                    <p className="text-center text-gray-600 text-sm mb-2">
                        Testga javob yuborish uchun kod:
                    </p>
                    <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-200">
                        <p className="text-center text-3xl font-bold text-gray-800 tracking-wider">
                            {createdTestCode}
                        </p>
                    </div>
                </div>

                {/* Copy Button */}
                <button
                    onClick={handleCopyCode}
                    className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-3"
                >
                    <Copy size={18} />
                    Nusxa olish
                </button>

                {/* Close Button */}
                <button
                    onClick={() => {
                        setShowSuccessModal(false);
                        navigate("/");
                    }}
                    className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                    Orqaga
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate("/")}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800">
                        📋 Atestatsiya testi qo'shish
                    </h1>
                    <div className="w-6"></div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2].map((step) => (
                            <div
                                key={step}
                                className={`flex-1 h-2 rounded-full mx-1 transition-all ${step <= currentStep
                                    ? "bg-blue-500"
                                    : "bg-gray-200"
                                    }`}
                            ></div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 text-center">
                        Qadam {currentStep} / 2
                    </p>
                </div>
            </div>
            {/* Content */}
            <div className="px-4 py-4">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
            </div>
            <BottomBar bgColor="#ffffff">
                <BackButton onClick={() => navigate("/")} />
            </BottomBar>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            {/* Success Modal */}
            {showSuccessModal && <SuccessModal />}
        </div>
    );
};
