import { useState } from "react";
import { TopHeader } from "../components/ui";


export const Profile = () => {
    const [firstName, setFirstName] = useState("Mirsoli");
    const [lastName, setLastName] = useState("Mirsultonov");
    const [selectedRole, setSelectedRole] = useState("tester");
    const [telegramId] = useState("1367538109");
    const [showChanges, setShowChanges] = useState(false);
    const [originalRole, setOriginalRole] = useState("tester");

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        // setShowChanges(true);
    };

    const handleSave = () => {
        // Save logic here
        console.log("Saving:", { firstName, lastName, selectedRole });
        setShowChanges(false);
    };

    const handleCancel = () => {
        setShowChanges(false);
        // Reset to original values if needed
    };

    // O'zgarish bor yoki yo'qligini tekshirish
    const hasRoleChanged = selectedRole !== originalRole;

    // O'zgarish matnini olish
    const getRoleChangeText = () => {
        const roleNames = {
            "tester": "Test topshiruvchi",
            "test_taker": "Test oluvchi"
        };
        return {
            from: roleNames[originalRole],
            to: roleNames[selectedRole]
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <TopHeader />

            {/* Content */}
            <div className="px-4 mt-6">
                {/* Current Info Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Joriy ma'lumotlar</h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Ism:</span>
                            <span className="font-medium text-gray-800">{firstName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Familiya:</span>
                            <span className="font-medium text-gray-800">{lastName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Rol:</span>
                            <span className="font-medium text-blue-600">
                                {selectedRole === "tester" ? "Test oluvchi" : "Test topshiruvchi"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Telegram ID:</span>
                            <span className="font-medium text-gray-800">{telegramId}</span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Tahrirlash</h3>

                    {/* First Name Input */}
                    <div className="mb-4">
                        <label className="block text-xs text-gray-600 mb-2">Ism</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ism"
                        />
                    </div>

                    {/* Last Name Input */}
                    <div className="mb-4">
                        <label className="block text-xs text-gray-600 mb-2">Familiya</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Familiya"
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Rolni tanlang</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleRoleChange("tester")}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${selectedRole === "tester"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                                    }`}
                            >
                                Test oluvchi
                            </button>
                            <button
                                onClick={() => handleRoleChange("test_taker")}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${selectedRole === "test_taker"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                                    }`}
                            >
                                Test topshiruvchi
                            </button>

                        </div>
                    </div>

                    {/* Telegram ID (Read-only) */}
                    <div className="mb-4">
                        <label className="block text-xs text-gray-600 mb-2">Telegram ID</label>
                        <div className="px-4 py-3 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                            <p className="text-sm text-gray-700">{telegramId}</p>
                            <p className="text-xs text-gray-500 mt-1">Telegram ID o'zgartirib bo'lmaydi</p>
                        </div>
                    </div>
                </div>

                {/* Changes Info */}
                {hasRoleChanged && (
                    <div className="bg-blue-50 rounded-2xl p-4 shadow-sm border border-blue-100 mb-6">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">O'zgarishlar:</h3>
                        <div className="text-sm text-blue-700">
                            <p>
                                <span className="font-medium">Rol:</span>{" "}
                                <span className="line-through">{getRoleChangeText().from}</span> → {getRoleChangeText().to}
                            </p>
                        </div>
                    </div>
                )}
                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-md"
                    >
                        O'zgarishlarni saqlash
                    </button>
                    <button
                        onClick={handleCancel}
                        className="flex-1 py-3 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                        Bekor qilish
                    </button>

                </div>
            </div>
        </div>
    );
}