import React, { useState, useEffect } from "react";
import {
    User,
    CreditCard,
    Award,
    ChevronRight,
    Plus,
    FileText,
    Clock,
} from "lucide-react";

export const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [tests, setTests] = useState([]);
    const [activeTab, setActiveTab] = useState("created");
    const [loading, setLoading] = useState(true);

    // Mock data - bu yerda real API dan ma'lumot keladi
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setUser({
                id: 1,
                telegram_id: 1367538109,
                username: "o'qituvchi",
                first_name: "Mirsoli",
                last_name: "Mirsultonov",
                role: "tester",
                phone_number: null,
                balance: 0,
                status: 1,
                credits: 50,
            });

            setTests([
                {
                    id: 1,
                    name: "Test 2",
                    code: "EB9202",
                    subject: "Biologiya",
                    status: "Ochiq",
                    statusColor: "green",
                    created_at: "04.11.2025 - 18:17",
                },
                {
                    id: 2,
                    name: "Test",
                    code: "4E5F54",
                    subject: "Ona tili va adabiyot",
                    status: "Ochiq",
                    statusColor: "green",
                    created_at: "04.11.2025 - 18:12",
                },
            ]);

            setLoading(false);
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold">Rash yordamchi</h1>
                    <button className="p-2">
                        <div className="w-6 h-1 bg-white rounded mb-1"></div>
                        <div className="w-6 h-1 bg-white rounded mb-1"></div>
                        <div className="w-6 h-1 bg-white rounded"></div>
                    </button>
                </div>

                {/* User Info Card */}
                <div className="bg-white text-gray-800 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-lg font-semibold">
                                {user.first_name} {user.last_name}
                            </h2>
                            <p className="text-blue-600 text-sm">
                                {user.username}
                            </p>
                        </div>
                        <button className="text-blue-600">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="text-sm text-gray-600">
                        <span>Telegram ID: </span>
                        <span className="font-semibold text-gray-800">
                            {user.telegram_id}
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
                                    Balansingiz: {user.balance} so'm
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
                                    Kredit balansi: {user.credits} ta
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
            <div className="px-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Testlar</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 shadow-md hover:bg-blue-700 transition-colors">
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
                    {tests.map((test) => (
                        <div
                            key={test.id}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h4 className="font-semibold text-gray-800">
                                            {test.name}
                                        </h4>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                                            {test.status === "Ochiq"
                                                ? "Ochiq test"
                                                : test.status}
                                        </span>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                                            {test.statusColor === "green"
                                                ? "Ochiq"
                                                : test.statusColor}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm mb-2">
                                        {test.subject}
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <FileText size={14} />
                                            <span>Test kodi: {test.code}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Clock size={14} />
                                            <span>{test.created_at}</span>
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
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 shadow-lg">
                <div className="flex items-center justify-around max-w-md mx-auto">
                    <button className="flex flex-col items-center space-y-1 text-blue-600">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <FileText size={20} />
                        </div>
                        <span className="text-xs font-medium">Bosh sahifa</span>
                    </button>
                    <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600">
                        <User size={24} />
                        <span className="text-xs">O'quvchilar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
