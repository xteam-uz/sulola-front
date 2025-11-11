import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";

export const DefaultLayout = () => {
    const { token } = useStateContext();

    if (!token) {
        return <Navigate to="/register" />;
    }
    return (
        <main>
            <Outlet />
        </main>
    );
};
