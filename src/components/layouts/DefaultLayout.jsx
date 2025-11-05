import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import axiosClient from "../../axios-client";

export const DefaultLayout = () => {
    const { user, token, setUser, setToken } = useStateContext();

    if (!token) {
        return <Navigate to="/login" />;
    }

    const onLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem("ACCESS_TOKEN");

        axiosClient.post("/logout").finally(() => {
            setUser(null);
            setToken(null);
        });

        setUser(null);
        setToken(null);
    };

    return (
        <main>
            <Outlet />
        </main>
    );
};
