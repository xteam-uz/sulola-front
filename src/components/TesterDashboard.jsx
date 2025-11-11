
import { useState, useEffect } from "react";
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
import { FadeContent, AnimatedContent } from "./ui";
import { FooterNavbar } from "./FooterNavbar";
import axiosClient from "../api/axios-client";

export const TesterDashboard = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState("created");

    const { user } = useStateContext();

    const toggleTestsTab = () => {
        setActiveTab(activeTab === "created" ? "taken" : "created");
    }

    const filteredTests = tests.filter(test => {
        if (activeTab === "created") {
            return test.status === "Ochiq";
        } else {
            return test.status === "Yopiq";
        }
    });

    useEffect(() => {
        axiosClient.get("tests/list")
            .then(({ data }) => {
                setTests(data.tests);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Testlarni olishda xatolik:", error);
                setLoading(false);
            });
    }, []);

    return (
        <>

            {/* User Info Card */}
            <div className="px-4 mt-4 space-y-3">
                <div className="bg-white text-gray-800 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-lg font-semibold">
                                {user?.first_name} {user?.last_name}
                            </span>
                            <span className="text-blue-600 text-sm ml-3">
                                {user?.user_type}
                            </span>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        <span>Telegram ID: </span>
                        <span className="font-semibold text-gray-800">
                            {user?.telegram_user_id}
                        </span>
                    </div>
                </div>
            </div>

            {/* Balance & Credits Cards */}
            <div className="px-4 mt-4 space-y-3">
                {/* Balance Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <CreditCard
                                    className="text-blue-600"
                                    size={24}
                                />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">
                                    Balansingiz: {user?.balance} so'm
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Pullik testlardan tushgan daromad
                                </p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors">
                        Pul yechish
                    </button>
                </div>

                {/* Credits Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-3 rounded-xl">
                                <Award className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">
                                    Kredit balansi: {user?.credits} ta
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Har bir o'quvchi natijasi uchun 1 kredit
                                    sarflanadi
                                </p>
                            </div>
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
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 shadow-md hover:bg-blue-700 transition-colors">
                        <Plus size={18} />
                        <span className="text-sm font-medium">
                            Test qo'shish
                        </span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-4">
                    <button
                        onClick={toggleTestsTab}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "created"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        Jarayondagi testlar
                    </button>
                    <button
                        onClick={toggleTestsTab}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "taken"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        Yopilgan testlar
                    </button>
                </div>

                {/* Test List */}
                <div className="space-y-3">
                    {/* <AnimatedContent
                        key={activeTab}  // Bu eng muhim qism!
                        distance={450}
                        direction="vertical"
                        reverse={false}  // Yopilgan testlar uchun teskari yo'nalish
                        duration={0.5}
                        ease="power3.out"
                        initialOpacity={0.2}
                        animateOpacity
                        scale={1.1}
                        threshold={0.2}
                        delay={0.3}
                    > */}
                    {loading ? (
                        // Loading spinner - faqat test list uchun
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                            <p className="text-gray-500 mt-4">Yuklanmoqda...</p>
                        </div>
                    ) : filteredTests.length > 0 ? (
                        // Test list
                        filteredTests.map((test) => (
                            <div
                                key={test.id}
                                className="bg-white rounded-2xl p-4 mb-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h4 className="font-semibold text-gray-800">
                                                {test.name}
                                            </h4>
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                                                {test.status === "Ochiq"
                                                    ? "Ochiq test"
                                                    : "Yopiq test"}
                                            </span>
                                            <span className={`px-2 py-0.5 ${test.statusColor === "green"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-red-100 text-red-600"
                                                } text-xs rounded-full font-medium`}>
                                                {test.statusColor === "green"
                                                    ? "Ochiq"
                                                    : "Yopiq"}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm mb-2">
                                            {test.subject}
                                        </p>
                                        <div className="flex flex-col items-start gap-1 text-xs text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <FileText size={14} />
                                                <span>Test kodi: {test.code}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Clock size={14} />
                                                <span>Yaratilgan vaqti: {test.created_at}</span>
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
                        // Empty state
                        <div className="bg-white rounded-2xl p-8 text-center">
                            <p className="text-gray-500">
                                {activeTab === "created"
                                    ? "Hozircha jarayondagi testlar yo'q"
                                    : "Hozircha yopilgan testlar yo'q"}
                            </p>
                        </div>
                    )}
                    {/* </AnimatedContent> */}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
                    onClick={() => setShowModal(false)}
                >
                    <FadeContent blur={true} duration={300} easing="ease-in" initialOpacity={0}>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-80 rounded-2xl shadow-lg p-6 relative animate-fadeInUp"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm text-center text-gray-800">
                                    Test turini tanlang
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-500 rounded-lg hover:bg-gray-100 text-sm"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 border rounded-xl p-3 cursor-pointer hover:bg-gray-50">
                                    <input type="radio" name="testType" defaultChecked />
                                    <div>
                                        <p className="font-medium">💰 Pullik test</p>
                                        <p className="text-xs text-gray-500">
                                            O'quvchilar Click yoki Payme orqali to'laydi.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 border rounded-xl p-3 cursor-pointer hover:bg-gray-50">
                                    <input type="radio" name="testType" />
                                    <div>
                                        <p className="font-medium">🎓 Tekin test</p>
                                        <p className="text-xs text-gray-500">
                                            O'quvchilar uchun bepul test.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-end mt-5 space-x-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-500 rounded-lg hover:bg-gray-100 text-sm"
                                >
                                    Bekor qilish
                                </button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                    Boshlash
                                </button>
                            </div>
                        </div>
                    </FadeContent>
                </div>
            )}


            {/* Bottom Navigation */}
            <FooterNavbar />
        </>
    );
};