import { useContext, useState, createContext, useEffect } from "react";
import axiosClient from "../api/axios-client";

const StateContext = createContext({
    user: null,
    token: null,
    tests: null,
    pagination: null,
    loading: false,
    testsLoading: false,
    setUser: () => {},
    setToken: () => {},
    refreshUser: () => {},
    fetchTests: () => {},
    fetchTestsPage: () => {},
    refreshTests: () => {},
});

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
    const [tests, setTests] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [testsLoading, setTestsLoading] = useState(false);

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("ACCESS_TOKEN", token);
        } else {
            localStorage.removeItem("ACCESS_TOKEN");
        }
    };

    const fetchUser = async () => {
        if (!token) {
            setUser(null);
            return;
        }

        setLoading(true);
        try {
            const { data } = await axiosClient.get("/user");
            setUser(data);
        } catch (error) {
            console.error("User fetch error:", error);
            setUser(null);
            if (error.response?.status === 401) {
                setToken(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = () => {
        fetchUser();
    };

    const fetchTests = async (userId, page = 1) => {
        if (!userId) {
            setTests(null);
            setPagination(null);
            return;
        }

        setTestsLoading(true);
        try {
            const { data } = await axiosClient.get("/test/results", {
                params: {
                    user_id: userId,
                    page: page,
                },
            });
            setTests(data.results.data);
            setPagination({
                currentPage: data.results.current_page,
                lastPage: data.results.last_page,
                total: data.results.total,
                from: data.results.from,
                to: data.results.to,
            });
        } catch (error) {
            console.error("Tests fetch error:", error);
            setTests(null);
            setPagination(null);
        } finally {
            setTestsLoading(false);
        }
    };

    const fetchTestsPage = (page) => {
        const userId = user?.[0]?.bot_user?.user_id;
        if (userId && page >= 1 && page <= (pagination?.lastPage || 1)) {
            fetchTests(userId, page);
        }
    };

    const refreshTests = () => {
        const userId = user?.[0]?.bot_user?.user_id;
        if (userId) {
            fetchTests(userId, 1);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [token]);

    useEffect(() => {
        if (user?.[0]?.bot_user?.user_id) {
            fetchTests(user[0].bot_user.user_id);
        }
    }, [user]);

    return (
        <StateContext.Provider
            value={{
                user,
                token,
                loading,
                setUser,
                setToken,
                refreshUser,
                tests,
                pagination,
                testsLoading,
                fetchTests,
                fetchTestsPage,
                refreshTests,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
