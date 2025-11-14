import { useState, useEffect } from "react";
import { TopHeader } from "../components/ui";
import { useStateContext } from "../contexts/ContextProvider";
import { toast, ToastContainer, Zoom } from "react-toastify";
import axiosClient from "../api/axios-client";
import { useNavigate } from "react-router-dom";
import { MainButton, BackButton } from "@twa-dev/sdk/react";

export const Profile = () => {
    const { user, refreshUser } = useStateContext();

    const [selectedRole, setSelectedRole] = useState(user[0]?.user_type || "tester");
    const [originalRole, setOriginalRole] = useState(user[0]?.user_type || "tester");

    const [formData, setFormData] = useState({
        first_name: user[0]?.first_name || "",
        last_name: user[0]?.last_name || ""
    });

    const [saving, setSaving] = useState(false);

    const handleRoleChange = (role) => {
        setSelectedRole(role);
    };

    const navigate = useNavigate();

    const hasChanges = () => {
        return (
            selectedRole !== originalRole ||
            formData.first_name !== user[0]?.first_name ||
            formData.last_name !== user[0]?.last_name
        );
    };

    const handleSave = async () => {
        const firstName = formData.first_name?.trim() || "";
        const lastName = formData.last_name?.trim() || "";

        if (!firstName || !lastName) {
            toast.error("Ism va familiya to'ldirilishi shart!");
            return;
        }

        setSaving(true);

        try {
            await axiosClient.put("/user", {
                user_type: selectedRole,
                first_name: firstName,
                last_name: lastName,
            });

            toast.success('Malumotlar saqlandi', {
                position: "bottom-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Zoom,
            });

            // User ma'lumotlarini yangilash
            await refreshUser();

            // Original rolni yangilash
            setOriginalRole(selectedRole);

            // Qisqa timeout bilan navigate
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (error) {
            console.error("Save error:", error);
            const errorMsg = error.response?.data?.message || "Xatolik yuz berdi!";
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setSelectedRole(originalRole);
        setFormData({
            first_name: user[0]?.first_name || "",
            last_name: user[0]?.last_name || ""
        });
    };

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
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopHeader />

            <div className="px-4 mt-6">
                {/* Current Info */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Joriy ma'lumotlar</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Ism:</span>
                            <span className="font-medium text-gray-800">{user[0]?.first_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Familiya:</span>
                            <span className="font-medium text-gray-800">{user[0]?.last_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Rol:</span>
                            <span className="font-medium text-blue-600">
                                {user[0]?.user_type === "tester" ? "Test oluvchi" : "Test topshiruvchi"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Telegram ID:</span>
                            <span className="font-medium text-gray-800">{user[0]?.bot_user?.user_id}</span>
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
                            value={formData.first_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    first_name: e.target.value,
                                })
                            }
                            disabled={saving}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Ism"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="mb-4">
                        <label className="block text-xs text-gray-600 mb-2">Familiya</label>
                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    last_name: e.target.value,
                                })
                            }
                            disabled={saving}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Familiya"
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Rolni tanlang</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleRoleChange("tester")}
                                disabled={saving}
                                className={`flex-1 py-2 px-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${selectedRole === "tester"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                                    }`}
                            >
                                Test oluvchi
                            </button>
                            <button
                                onClick={() => handleRoleChange("test_taker")}
                                disabled={saving}
                                className={`flex-1 py-2 px-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${selectedRole === "test_taker"
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
                            <p className="text-sm text-gray-700">{user[0]?.bot_user?.user_id}</p>
                            <p className="text-xs text-gray-500 mt-1">Telegram ID o'zgartirib bo'lmaydi</p>
                        </div>
                    </div>
                </div>

                {/* Changes Info */}
                {hasChanges() && (
                    <div className="bg-blue-50 rounded-2xl p-4 shadow-sm border border-blue-100 mb-6">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">O'zgarishlar:</h3>
                        <div className="text-sm text-blue-700 space-y-1">
                            {formData.first_name !== user[0]?.first_name && (
                                <p>
                                    <span className="font-medium">Ism:</span>{" "}
                                    <span className="line-through">{user[0]?.first_name}</span> → {formData.first_name}
                                </p>
                            )}
                            {formData.last_name !== user[0]?.last_name && (
                                <p>
                                    <span className="font-medium">Familiya:</span>{" "}
                                    <span className="line-through">{user[0]?.last_name}</span> → {formData.last_name}
                                </p>
                            )}
                            {selectedRole !== originalRole && (
                                <p>
                                    <span className="font-medium">Rol:</span>{" "}
                                    <span className="line-through">{getRoleChangeText().from}</span> → {getRoleChangeText().to}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Telegram MainButton va BackButton */}
            {hasChanges() && !saving && (
                <>
                    <MainButton
                        bgColor="#0055ff"
                        text="O'zgarishlarni saqlash"
                        onClick={handleSave}
                        progress={false}
                    />
                    <BackButton onClick={handleCancel} />
                </>
            )}

            {/* Loading overlay */}
            {saving && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-700 font-medium">Saqlanmoqda...</span>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
};