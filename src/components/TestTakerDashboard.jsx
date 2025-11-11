import { useState, useEffect } from "react";
import { ChevronRight, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { MainButton } from "@twa-dev/sdk/react";

export const TestTakerDashboard = () => {
    const [activeTests, setActiveTests] = useState([]);
    const [completedTests, setCompletedTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useStateContext();
    const [showModal, setShowModal] = useState(false);
    const [testCode, setTestCode] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setActiveTests([]);
            setCompletedTests([]);

            setLoading(false);
        }, 1500);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (testCode.trim()) {
            console.log("Test kodi:", testCode);
            navigate("/test_taking");
        }
    }

    return (
        <>
            {/* <MainButton text="Testlarni ko'rish" onClick={() => console.log('Main button clicked')} /> */}

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
                            {user?.telegram_id}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tests Sections */}
            <div className="px-4 my-6">
                {/* Jarayondagi testlar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-800">Jarayondagi testlar</h3>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:bg-blue-700 transition-colors">
                            Javoblarni jo'natish
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
                        ) : activeTests.length > 0 ? (
                            activeTests.map((test) => (
                                <div
                                    key={test.id}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 mb-2">
                                                {test.name}
                                            </h4>
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
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                                <p className="text-gray-500">
                                    Hozircha sizga hech qanday test belgilanmagan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Yakunlangan testlar */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Yakunlangan testlar</h3>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="bg-white rounded-2xl p-12 text-center">
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                                <p className="text-gray-500 mt-4">Yuklanmoqda...</p>
                            </div>
                        ) : completedTests.length > 0 ? (
                            completedTests.map((test) => (
                                <div
                                    key={test.id}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 mb-2">
                                                {test.name}
                                            </h4>
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
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                                <p className="text-gray-500">
                                    Siz hali birorta ham testni tugatmagansiz.
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
                        <div className="flex flex-col items-center justify-center mb-4">
                            <h2 className="text-xl text-center text-gray-800">
                                Test kodini kiriting
                            </h2>
                            <p className="text-xs text-gray-500">
                                O'qituvchidan olgan test kodingizni kiriting
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <input
                                className="border rounded-xl p-3 w-full focus:border-blue-500 focus:outline-none"
                                type="text"
                                value={testCode}
                                onChange={(e) => setTestCode(e.target.value)}
                                placeholder="Test kodi"
                                required
                            />
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
                                disabled={!testCode.trim()}
                                className={`px-4 py-2 rounded-lg text-sm transition-colors ${testCode.trim()
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                Davom etish
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </>
    );
}