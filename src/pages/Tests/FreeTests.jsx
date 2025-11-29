import { useState } from "react";
import {
    Camera,
    FileText,
    ChevronRight,
    Plus,
    Minus,
    ArrowLeft,
    Clock,
    DollarSign,
    Calendar,
    Check,
    Copy,
} from "lucide-react";
import { toast, Bounce, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios-client";
import { BackButton, MainButton, BottomBar } from "@twa-dev/sdk/react";
import { useStateContext } from "../../contexts/ContextProvider";
import { TestTypeEnum } from "../../constants/testTypes";

export const FreeTests = () => {
    const { state } = useLocation();
    const testType = state?.testType;
    const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3, 4
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdTestCode, setCreatedTestCode] = useState("");

    // Context api
    const { refreshTests } = useStateContext();

    // Step 1: Asosiy ma'lumotlar
    const [testName, setTestName] = useState("");
    const [scienceId, setScienceId] = useState("");
    const [price, setPrice] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Step 2: 36-45 savollar rejimi
    const [selectedMode, setSelectedMode] = useState("write");
    const [variantCounts, setVariantCounts] = useState({
        36: 2,
        37: 2,
        38: 2,
        39: 2,
        40: 2,
        41: 2,
        42: 2,
        43: 2,
        44: 2,
        45: 2,
    });
    const [autoCheck, setAutoCheck] = useState(false);

    // Step 3 & 4: Savollar
    const [questions1_32, setQuestions1_32] = useState({});
    const [questions33_35, setQuestions33_35] = useState({});

    const { sciences } = useStateContext();
    const navigate = useNavigate();

    const handleVariantChange = (questionNum, delta) => {
        setVariantCounts((prev) => ({
            ...prev,
            [questionNum]: Math.max(1, Math.min(10, prev[questionNum] + delta)),
        }));
    };

    const handleStep1Submit = () => {
        if (!testName.trim()) {
            toast.error("Test nomini kiriting!", {
                position: "top-center",
                autoClose: 3000,
                transition: Bounce,
            });
            return;
        }
        if (!scienceId) {
            toast.error("Fanni tanlang!", {
                position: "top-center",
                autoClose: 3000,
                transition: Bounce,
            });
            return;
        }
        if (!price || Number(price) <= 0) {
            toast.error("To'g'ri narx kiriting!", {
                position: "top-center",
                autoClose: 3000,
                transition: Bounce,
            });
            return;
        }
        if (!startTime || !endTime) {
            toast.error("Boshlanish va tugash vaqtini kiriting!", {
                position: "top-center",
                autoClose: 3000,
                transition: Bounce,
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
                },
            );
            return;
        }

        setCurrentStep(2);
    };

    const handleStep2Submit = () => {
        if (selectedMode === "write") {
            const hasVariants = Object.values(variantCounts).some(
                (count) => count > 0,
            );
            if (!hasVariants) {
                toast.error(
                    "Kamida bitta savol uchun variant soni belgilang!",
                    {
                        position: "top-center",
                        autoClose: 3000,
                        transition: Bounce,
                    },
                );
                return;
            }
        }
        setCurrentStep(3);
    };

    const handleAnswerChange = (questionNum, field, value) => {
        if (questionNum <= 32) {
            setQuestions1_32((prev) => ({
                ...prev,
                [questionNum]: {
                    ...prev[questionNum],
                    [field]: value,
                },
            }));
        } else {
            setQuestions33_35((prev) => ({
                ...prev,
                [questionNum]: {
                    ...prev[questionNum],
                    [field]: value,
                },
            }));
        }
    };

    const handleStep3Submit = () => {
        // 1-32 savollar to'ldirilganligini tekshirish
        const missingQuestions = [];
        for (let i = 1; i <= 32; i++) {
            if (!questions1_32[i]?.correct_answer) {
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
                },
            );
            return;
        }

        setCurrentStep(4);
    };

    const handleFinalSubmit = async () => {
        // 33-35 savollar to'ldirilganligini tekshirish
        const missingQuestions = [];
        for (let i = 33; i <= 35; i++) {
            if (!questions33_35[i]?.correct_answer) {
                missingQuestions.push(i);
            }
        }

        if (missingQuestions.length > 0) {
            toast.error(
                `${missingQuestions.join(", ")} savollar uchun to'g'ri javoblarni belgilang!`,
                {
                    position: "top-center",
                    autoClose: 4000,
                    transition: Bounce,
                },
            );
            return;
        }

        const questions36_45Data = {
            mode: selectedMode,
            ...(selectedMode === "write" && {
                auto_check: autoCheck,
                questions: Object.entries(variantCounts).reduce(
                    (acc, [qNum, count]) => {
                        acc[qNum] = { variant_count: count };
                        return acc;
                    },
                    {},
                ),
            }),
        };

        const testData = {
            name: testName,
            science_id: Number(scienceId),
            type: TestTypeEnum.RASH_TEST,
            price: Number(price),
            start_time: startTime,
            end_time: endTime,
            details: {
                type: "dtm",
                questions_1_32: questions1_32,
                questions_33_35: questions33_35,
                questions_36_45: questions36_45Data,
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
                });
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Test yaratishda xatolik yuz berdi!",
                    {
                        position: "top-center",
                        autoClose: 4000,
                        transition: Bounce,
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
                            placeholder="Masalan: DTM Test #1"
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
                        <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <DollarSign size={16} />
                            Test narxi (so'm) *
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Masalan: 10000"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            O'quvchilar Click yoki Payme orqali to'laydi
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
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
                        <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
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
                    36-45 savollar uchun javob berish usuli
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    O'quvchilar 36-45 gacha bo'lgan savollarga qanday javob
                    berishini tanlang
                </p>

                <div className="space-y-3">
                    <label
                        className={`flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedMode === "write"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                            }`}
                    >
                        <input
                            type="radio"
                            name="mode"
                            value="write"
                            checked={selectedMode === "write"}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <FileText size={20} className="text-blue-600" />
                                <p className="font-semibold text-gray-800">
                                    Yozish
                                </p>
                            </div>
                            <p className="text-xs text-gray-600">
                                O'quvchilar 36-45 savollarni yozma javob
                                berishadi.
                            </p>
                        </div>
                    </label>

                    <label
                        className={`flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedMode === "image"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                            }`}
                    >
                        <input
                            type="radio"
                            name="mode"
                            value="image"
                            checked={selectedMode === "image"}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <Camera size={20} className="text-green-600" />
                                <p className="font-semibold text-gray-800">
                                    Rasmga olish
                                </p>
                            </div>
                            <p className="text-xs text-gray-600">
                                O'quvchilar javoblarini rasmga olib yuborishadi.
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {selectedMode === "write" && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800">
                            Javoblar soni
                        </h3>
                    </div>

                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={autoCheck}
                                onChange={(e) => setAutoCheck(e.target.checked)}
                                className="w-5 h-5 mt-0.5"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">
                                    Yozma javoblarni avtomatik tekshirish
                                </span>
                                <p className="text-xs text-gray-600 mt-1">
                                    Bu funksiya yoqilgan bo'lsa, o'quvchi javob
                                    yuborgan keyincha siz ruxsat bergan javoblar
                                    bilan avtomatik solishtiriladi.
                                </p>
                            </div>
                        </label>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        Har bir savol uchun nechta variant borligini belgilang
                    </p>

                    <div className="space-y-3">
                        {Object.entries(variantCounts).map(([qNum, count]) => (
                            <div
                                key={qNum}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                            >
                                <span className="font-medium text-gray-700">
                                    {qNum}-savol
                                </span>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">
                                        Javoblar soni:
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                handleVariantChange(qNum, -1)
                                            }
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-semibold">
                                            {count}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleVariantChange(qNum, 1)
                                            }
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                    Orqaga
                </button>
                <button
                    onClick={handleStep2Submit}
                    className="flex-1 py-3.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                    Davom etish
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">
                    1-32 savollar uchun to'g'ri javoblar
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Har bir savol uchun to'g'ri javobni belgilang (A, B, C yoki
                    D)
                </p>

                <div className="space-y-3">
                    {Array.from({ length: 32 }, (_, i) => i + 1).map((num) => (
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
                                        className={`py-2 rounded-lg font-medium text-sm transition-all ${questions1_32[num]
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
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-3.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                    Orqaga
                </button>
                <button
                    onClick={handleStep3Submit}
                    className="flex-1 py-3.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                    Davom etish
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">
                    33-35 savollar uchun to'g'ri javoblar
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Har bir savol uchun to'g'ri javobni belgilang (A, B, C, D, E
                    yoki F)
                </p>

                <div className="space-y-3">
                    {[33, 34, 35].map((num) => (
                        <div
                            key={num}
                            className="border border-gray-200 rounded-lg p-3"
                        >
                            <span className="font-medium text-gray-700 block mb-3">
                                {num}-savol:
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                                {["A", "B", "C", "D", "E", "F"].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() =>
                                            handleAnswerChange(
                                                num,
                                                "correct_answer",
                                                opt,
                                            )
                                        }
                                        className={`py-2 rounded-lg font-medium text-sm transition-all ${questions33_35[num]
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
                    onClick={() => setCurrentStep(3)}
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
                        {testType === "paid" ? "💰 Pullik test qo'shish" : "🎓 Tekin test qo'shish"}
                    </h1>
                    <div className="w-6"></div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3, 4].map((step) => (
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
                        Qadam {currentStep} / 4
                    </p>
                </div>
            </div>
            {/* Content */}
            <div className="px-4 py-4">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
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
