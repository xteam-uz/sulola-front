import { useContext, useState, createContext, useEffect, useCallback } from "react";
import axiosClient from "../api/axios-client";
import { toast } from "react-toastify";

const StateContext = createContext({
    user: null,
    token: null,
    tests: null,
    testResults: null,
    pagination: null,
    loading: false,
    testsLoading: false,

    setUser: () => { },
    setToken: () => { },
    refreshUser: () => { },

    fetchTestsResults: () => { },
    fetchTestsResultsPage: () => { },
    refreshTestResults: () => { },
    refreshTests: () => { },
    fetchUserTestAnswers: () => { },
    hasUserSubmittedTest: () => { },
    fetchTestStudents: () => { },
    finishTest: () => { },
    fetchAllStudents: () => { },
    testStudents: null,
    studentsLoading: false,
    allChecked: false,
    allStudents: null,
    allStudentsLoading: false,
    sciences: null,
});

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
    const [tests, setTests] = useState(null);
    const [testResults, setTestResults] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [testsLoading, setTestsLoading] = useState(false);
    const [sciences, setSciences] = useState([]);
    const [testStudents, setTestStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [allChecked, setAllChecked] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [allStudentsLoading, setAllStudentsLoading] = useState(false);

    const setToken = (token) => {
        _setToken(token);
        token
            ? localStorage.setItem("ACCESS_TOKEN", token)
            : localStorage.removeItem("ACCESS_TOKEN");
    };

    // ============================
    // USER DATA
    // ============================
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
            if (error.response?.status === 401) setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = () => fetchUser();

    // ============================
    // TESTS (user tests)
    // ============================
    const fetchTests = async (userId, page = 1) => {
        if (!userId) return;

        setTestsLoading(true);
        try {
            const { data } = await axiosClient.get("/tests/list", {
                params: { user_id: userId, page },
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
            setTests(null);
            setPagination(null);
        } finally {
            setTestsLoading(false);
        }
    };

    const refreshTests = () => {
        const userId = user?.[0]?.bot_user?.user_id;
        if (userId) fetchTests(userId, 1);
    };

    // ============================
    // TEST RESULTS
    // ============================
    const fetchTestsResults = async (userId, page = 1) => {
        if (!userId) return;

        setTestsLoading(true);
        try {
            const { data } = await axiosClient.get("/test/results", {
                params: { user_id: userId, page },
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
            console.error("Test results fetch error:", error);
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
        if (userId) fetchTestsResults(userId, 1);
    };

    // ===========================
    // Get user's answers for a specific test
    // ===========================
    const fetchUserTestAnswers = async (testCode, userId) => {
        if (!testCode || !userId) return null;

        try {
            // First, try to find in existing testResults
            if (testResults && testResults.length > 0) {
                const existingResult = testResults.find(
                    (result) => result.code === testCode,
                );
                if (existingResult) {
                    // If the result has full details, return it
                    if (existingResult.results) {
                        return existingResult;
                    }
                }
            }

            // If not found in cache, fetch all results and search
            const { data } = await axiosClient.get("/test/results", {
                params: { user_id: userId },
            });

            if (data.results && data.results.data) {
                const testResult = data.results.data.find(
                    (result) => result.code === testCode,
                );
                return testResult || null;
            }

            return null;
        } catch (error) {
            console.error("User test answers fetch error:", error);
            return null;
        }
    };

    // ===========================
    // Check if user has submitted test
    // ===========================
    const hasUserSubmittedTest = async (testCode, userId) => {
        if (!testCode || !userId) return false;
        const result = await fetchUserTestAnswers(testCode, userId);
        return result !== null && result.results !== undefined;
    };

    // ===========================
    // Check test
    // ===========================
    const checkTestCode = async (testCode, navigate) => {
        try {
            const res = await axiosClient.post("/tests/check/test", {
                code: testCode,
            });

            if (res.data.exists) {
                const testId = res.data.test_id;

                const startTime = new Date().toISOString();

                navigate(`/test_checking`, {
                    state: { testId, startTime },
                });

                return true;
            } else {
                toast.warning("Bunday kodli test bazada mavjud emas", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                });
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data || "Server xatosi", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });
            return false;
        }
    };

    // ============================
    // TEST STUDENTS (students who submitted a test)
    // ============================
    const fetchTestStudents = useCallback(async (testId) => {
        if (!testId) return null;

        setStudentsLoading(true);
        try {
            const { data } = await axiosClient.get(`/tests/${testId}/students`);

            if (data.success && data.students) {
                setTestStudents(data.students);
                setAllChecked(data.statistics?.all_written_checked || false);
                return {
                    students: data.students,
                    statistics: data.statistics,
                    allChecked: data.statistics?.all_written_checked || false,
                };
            }

            return null;
        } catch (error) {
            console.error("Test students fetch error:", error);
            setTestStudents([]);
            return null;
        } finally {
            setStudentsLoading(false);
        }
    }, []);

    // ============================
    // FINISH TEST
    // ============================
    const finishTest = async (testId) => {
        if (!testId) return false;

        try {
            const { data } = await axiosClient.post(`/tests/${testId}/finish`);

            if (data.success) {
                return true;
            }

            return false;
        } catch (error) {
            console.error("Finish test error:", error);
            throw error;
        }
    };

    // ============================
    // ALL STUDENTS (general students list)
    // ============================
    const fetchAllStudents = useCallback(async (userId) => {
        if (!userId) return;

        setAllStudentsLoading(true);
        try {
            // API endpoint to get all students for a tester
            const { data } = await axiosClient.get("/tests/students", {
                params: { user_id: userId },
            });

            if (data.success && data.students) {
                setAllStudents(data.students);
            } else {
                setAllStudents([]);
            }
        } catch (error) {
            console.error("All students fetch error:", error);
            setAllStudents([]);
        } finally {
            setAllStudentsLoading(false);
        }
    }, []);

    // ============================
    // SCIENCES
    // ============================
    const fetchSciences = async () => {
        try {
            const { data } = await axiosClient.get("/sciences");
            setSciences(data.sciences || []);
        } catch (error) {
            console.error("Sciences fetch error:", error);
        }
    };

    // ============================
    // EFFECTS
    // ============================
    useEffect(() => {
        fetchUser();
        fetchSciences();
    }, [token]);

    useEffect(() => {
        const userId = user?.[0]?.bot_user?.user_id;
        if (userId) {
            fetchTestsResults(userId);
            fetchTests(userId);
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
                setTests,
                testResults,
                pagination,
                testsLoading,
                checkTestCode,

                fetchTestsResults,
                fetchTestsResultsPage,
                refreshTestResults,
                refreshTests,
                fetchUserTestAnswers,
                hasUserSubmittedTest,
                fetchTestStudents,
                finishTest,
                fetchAllStudents,

                testStudents,
                studentsLoading,
                allChecked,
                allStudents,
                allStudentsLoading,

                sciences,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStateContext = () => useContext(StateContext);
