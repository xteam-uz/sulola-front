import { useContext, useState, createContext, useEffect } from "react";
import axiosClient from "../api/axios-client";

const StateContext = createContext({
    user: null,
    token: null,
    test: null,
    tests: null,
    testResults: null,
    pagination: null,
    loading: false,
    testsLoading: false,
    setUser: () => {},
    setToken: () => {},
    refreshUser: () => {},
    fetchTestById: () => {},
    fetchTestsResults: () => {},
    fetchTestsResultsPage: () => {},
    refreshTestResults: () => {},
    refreshTests: () => {},
    sciences: null,
});

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
    const [tests, setTests] = useState(null);
    const [test, setTest] = useState(null);
    const [testResults, setTestResults] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [testsLoading, setTestsLoading] = useState(false);
    const [sciences, setSciences] = useState([]);

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("ACCESS_TOKEN", token);
        } else {
            localStorage.removeItem("ACCESS_TOKEN");
        }
    };

    // user data
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

    // tests data
    const fetchTestById = async (testId) => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/tests/${testId}`);
            setTest(data);
        } catch (error) {
            console.error("Test fetch error:", error);
            setTest(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchTests = async (userId, page = 1) => {
        if (!userId) {
            setPagination(null);
            return;
        }

        setTestsLoading(true);
        try {
            const { data } = await axiosClient.get("/tests/list", {
                params: {
                    user_id: userId,
                    page: page,
                },
            });

            setTests(data.tests.data);
            setPagination({
                currentPage: data.tests.current_page,
                lastPage: data.tests.last_page,
                total: data.tests.total,
                from: data.tests.from,
                to: data.tests.to,
            });
        } catch (error) {
            console.error("Tests fetch error:", error);
            setPagination(null);
        } finally {
            setTestsLoading(false);
        }
    };

    const refreshTests = () => {
        const userId = user?.[0]?.bot_user?.user_id;
        if (userId) {
            fetchTests(userId, 1);
        }
    };

    const fetchTestsResults = async (userId, page = 1) => {
        if (!userId) {
            setTestResults(null);
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
            setTestResults(data.results.data);
            setPagination({
                currentPage: data.results.current_page,
                lastPage: data.results.last_page,
                total: data.results.total,
                from: data.results.from,
                to: data.results.to,
            });
        } catch (error) {
            console.error("Tests fetch error:", error);
            setTestResults(null);
            setPagination(null);
        } finally {
            setTestsLoading(false);
        }
    };

    const fetchTestsResultsPage = (page) => {
        const userId = user?.[0]?.bot_user?.user_id;
        if (userId && page >= 1 && page <= (pagination?.lastPage || 1)) {
            fetchTestsResults(userId, page);
        }
    };

    const refreshTestResults = () => {
        const userId = user?.[0]?.bot_user?.user_id;
        if (userId) {
            fetchTestsResults(userId, 1);
        }
    };

    const fetchSciences = async () => {
        try {
            const { data } = await axiosClient.get("/sciences");
            setSciences(data.sciences || []);
        } catch (error) {
            console.error("Sciences fetch error:", error);
            // Default qiymatlar agar backend ishlamasa
            // setSciences([
            //     { id: 1, name: "Biologiya" },
            //     { id: 2, name: "Matematika" },
            //     { id: 3, name: "Fizika" },
            // ]);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchSciences();
    }, [token]);

    useEffect(() => {
        if (user?.[0]?.bot_user?.user_id) {
            fetchTestsResults(user[0].bot_user.user_id);
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
                test,
                tests,
                setTests,
                testResults,
                pagination,
                testsLoading,
                fetchTestsResults,
                fetchTestsResultsPage,
                fetchTestById,
                refreshTestResults,
                refreshTests,
                sciences, // ✅ To'g'ri yozildi
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
