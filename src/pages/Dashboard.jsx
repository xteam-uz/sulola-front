import { useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { TesterDashboard, TestTakerDashboard } from "../components";
import { TopHeader } from "../components/ui";

export const Dashboard = () => {

    const { user, setUser } = useStateContext();


    // useEffect(() => {
    //     setUser({
    //         id: 1,
    //         telegram_id: 1367538109,
    //         username: "o'qituvchi",
    //         first_name: "Mirsoli",
    //         last_name: "Mirsultonov",
    //         role: "test_taker",
    //         phone_number: null,
    //         balance: 0,
    //         status: 1,
    //         credits: 50,
    //     });
    // }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TopHeader />

            {user?.role === 'tester' ? <TesterDashboard /> : <TestTakerDashboard />}

        </div>
    );
};