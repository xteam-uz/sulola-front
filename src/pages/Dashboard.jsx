import { useEffect, useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { TesterDashboard, TestTakerDashboard } from "../components";
import { TopHeader } from "../components/ui";

export const Dashboard = () => {
    const { user } = useStateContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            if (user && user.length > 0) {
                setLoading(false);
            }
        }, 1500);
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const currentUser = user[0];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TopHeader />
            {currentUser.user_type === "tester" ? (
                <TesterDashboard />
            ) : (
                <TestTakerDashboard />
            )}
        </div>
    );
};
