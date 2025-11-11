import { useStateContext } from "../contexts/ContextProvider";
import { TesterDashboard, TestTakerDashboard } from "../components";
import { TopHeader } from "../components/ui";

export const Dashboard = () => {

    const { user } = useStateContext();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TopHeader />

            {user?.user_type === 'tester' ? <TesterDashboard /> : <TestTakerDashboard />}

        </div>
    );
};