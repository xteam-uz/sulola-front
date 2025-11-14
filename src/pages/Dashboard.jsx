import { useStateContext } from "../contexts/ContextProvider";
import { TesterDashboard, TestTakerDashboard } from "../components";
import { TopHeader } from "../components/ui";

export const Dashboard = () => {
    const { user, loading } = useStateContext();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    // Agar user ma'lumotlari yo'q bo'lsa
    if (!user || user.length === 0 || !user[0] || !user[0].user_type) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600">Ma'lumotlar yuklanmadi</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Qayta yuklash
                    </button>
                </div>
            </div>
        );
    }

    const currentUser = user[0];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TopHeader />
            {currentUser?.user_type === "tester" ? (
                <TesterDashboard />
            ) : (
                <TestTakerDashboard />
            )}
        </div>
    );
};