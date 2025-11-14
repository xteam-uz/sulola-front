import { useContext, useState, createContext, useEffect } from "react";
import axiosClient from "../api/axios-client";

const StateContext = createContext({
    user: null,
    token: null,
    tests: null,
    loading: false,
    testsLoading: false,
    setUser: () => { },
    setToken: () => { },
    refreshUser: () => { },
    fetchTests: () => { },
    refreshTests: () => { },
});

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
    const [tests, setTests] = useState(null);
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

    // User ma'lumotlarini olish funksiyasi
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
            // Agar token yaroqsiz bo'lsa, uni o'chirish
            if (error.response?.status === 401) {
                setToken(null);
            }
        } finally {
            setLoading(false);
        }
    };

    // User ma'lumotlarini yangilash funksiyasi (komponentlardan chaqirish uchun)
    const refreshUser = () => {
        fetchUser();
    };

    const fetchTests = async () => {
        if (!token) {
            setTests(null);
            return;
        }

        setTestsLoading(true);
        try {
            const { data } = await axiosClient.get("/tests");
            setTests(data.data);
        } catch (error) {
            console.error("Tests fetch error:", error);
            setTests(null);
        } finally {
            setTestsLoading(false);
        }
    };

    const refreshTests = () => {
        fetchTests();
    };

    // Token o'zgarganda user ma'lumotlarini olish
    useEffect(() => {
        fetchUser();
        fetchTests();
    }, [token]);

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
                testsLoading,
                fetchTests,
                refreshTests,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStateContext = () => useContext(StateContext);