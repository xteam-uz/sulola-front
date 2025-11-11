import { useState } from "react";
import { TopHeader } from "../components/ui";
import { useStateContext } from "../contexts/ContextProvider";
import { toast, ToastContainer, Zoom } from "react-toastify";

export const Profile = () => {
    const { user, setUser } = useStateContext();

    const [selectedRole, setSelectedRole] = useState(user?.user_type || "tester");
    const [originalRole, setOriginalRole] = useState(user?.user_type || "tester");
    const [showChanges, setShowChanges] = useState(false);

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setShowChanges(true);
    };

    const handleSave = () => {
        console.log("Saving:", { firstName: user?.first_name, lastName: user?.last_name, selectedRole });

        setUser({
            ...user,
            role: selectedRole,
        });

        setOriginalRole(selectedRole);
        setShowChanges(false);

        toast.success('Malumotlar saqlandi', {
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
    };

    const handleCancel = () => {
        setSelectedRole(originalRole);
        setShowChanges(false);
    };

    const hasRoleChanged = selectedRole !== originalRole;

    const getRoleChangeText = () => {
        const roleNames = {
            tester: "Test oluvchi",
            test_taker: "Test topshiruvchi",
        };
        return {
            from: roleNames[originalRole],
            to: roleNames[selectedRole],
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TopHeader />

            <div className="px-4 mt-6">
                {/* Current Info */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Joriy ma'lumotlar</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Ism:</span>
                            <span className="font-medium text-gray-800">{user?.first_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Familiya:</span>
                            <span className="font-medium text-gray-800">{user?.last_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Rol:</span>
                            <span className="font-medium text-blue-600">
                                {selectedRole === "tester" ? "Test oluvchi" : "Test topshiruvchi"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Telegram ID:</span>
                            <span className="font-medium text-gray-800">{user?.telegram_user_id}</span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Tahrirlash</h3>

                    {/* First Name */}
                    <div className="mb-4">
                        <label className="block text-xs text-gray-600 mb-2">Ism</label>
                        <input
                            type="text"
                            value={user?.first_name || ""}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    first_name: e.target.value,
                                })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ism"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="mb-4">
                        <label className="block text-xs text-gray-600 mb-2">Familiya</label>
                        <input
                            type="text"
                            value={user?.last_name || ""}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    last_name: e.target.value,
                                })
                            }
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

                    {/* Telegram ID */}
                    <div className="mb-4">
                        <label className="block text-xs text-gray-600 mb-2">Telegram ID</label>
                        <div className="px-4 py-3 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                            <p className="text-sm text-gray-700">{user?.telegram_user_id}</p>
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
};
