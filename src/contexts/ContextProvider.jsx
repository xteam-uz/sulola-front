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
    fetchTest: () => { },
    fetchStudentTestData: () => { },
    fetchTeacherScores: () => { },
    checkStudentAnswers: () => { },
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
                    // Check both results and user_answer fields
                    const answerData = existingResult.results || existingResult.user_answer;
                    if (answerData) {
                        console.log("Found in cache:", existingResult);
                        return {
                            ...existingResult,
                            results: typeof answerData === 'string' ? JSON.parse(answerData) : answerData
                        };
                    }
                }
            }

            // If not found in cache, fetch all results and search
            // Fetch without pagination to get all results
            const { data } = await axiosClient.get("/test/results", {
                params: { user_id: userId },
            });

            console.log("Fetched test results:", data);

            if (data.results) {
                // Handle both paginated and non-paginated responses
                const resultsArray = data.results.data || data.results || [];
                const testResult = resultsArray.find(
                    (result) => result.code === testCode,
                );

                console.log("Found test result:", testResult);

                if (testResult) {
                    // Check both results and user_answer fields
                    const answerData = testResult.results || testResult.user_answer;
                    if (answerData) {
                        return {
                            ...testResult,
                            results: typeof answerData === 'string' ? JSON.parse(answerData) : answerData
                        };
                    }
                }
            }

            return null;
        } catch (error) {
            console.error("User test answers fetch error:", error);
            console.error("Error details:", error.response?.data);
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
                    className: "toast-width my-2"
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
                className: "toast-width my-2"
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
    // TEST DATA
    // ============================
    const fetchTest = useCallback(async (testId) => {
        if (!testId) return null;

        try {
            const { data } = await axiosClient.get(`/tests/${testId}`);
            return data.test || null;
        } catch (error) {
            console.error("Test fetch error:", error);
            return null;
        }
    }, []);

    // ============================
    // STUDENT TEST DATA (answers and student info)
    // ============================
    const fetchStudentTestData = useCallback(async (testId, studentId) => {
        if (!testId || !studentId) return null;

        try {
            const { data } = await axiosClient.get(
                `/tests/${testId}/students/${studentId}/answers`
            );

            if (data.success) {
                // Parse teacher scores from all_result JSON field
                let teacherScores = null;
                let checked = data.checked || false;

                // Parse all_result JSON if it exists
                if (data.all_result) {
                    let allResult = data.all_result;

                    // Parse if it's a string
                    if (typeof allResult === 'string') {
                        try {
                            allResult = JSON.parse(allResult);
                        } catch (e) {
                            console.error("Error parsing all_result:", e);
                            allResult = null;
                        }
                    }

                    if (allResult && typeof allResult === 'object') {
                        // Extract teacher_scores from all_result.teacher_scores
                        if (allResult.teacher_scores && typeof allResult.teacher_scores === 'object') {
                            teacherScores = {};
                            Object.entries(allResult.teacher_scores).forEach(([qNum, score]) => {
                                // Convert question number to Number key
                                const qNumNum = Number(qNum);
                                if (!isNaN(qNumNum)) {
                                    teacherScores[qNumNum] = parseFloat(score) || 0;
                                }
                            });

                            // If we have teacher scores, test is checked
                            if (Object.keys(teacherScores).length > 0) {
                                checked = true;
                            }
                        }
                    }
                }

                // Parse answers FIRST - backend dan answers yoki user_answer kelishi mumkin
                let parsedAnswers = data.answers || data.user_answer || null;

                // Debug: log backend response
                console.log("Backend response data:", {
                    hasAnswers: !!data.answers,
                    hasUserAnswer: !!data.user_answer,
                    answersType: typeof data.answers,
                    userAnswerType: typeof data.user_answer,
                });

                // Agar answers string bo'lsa, parse qilish
                if (parsedAnswers && typeof parsedAnswers === 'string') {
                    try {
                        parsedAnswers = JSON.parse(parsedAnswers);
                    } catch (e) {
                        console.error("Error parsing answers:", e);
                        parsedAnswers = null;
                    }
                }

                // Extract scores from answers.questions_36_45.questions if available
                // (This is the format where scores are stored in questions field)
                if (!teacherScores && parsedAnswers?.questions_36_45?.questions) {
                    teacherScores = {};
                    Object.entries(parsedAnswers.questions_36_45.questions).forEach(([qNum, qData]) => {
                        const qNumNum = Number(qNum);
                        if (!isNaN(qNumNum) && qData && typeof qData === 'object') {
                            // Check for score field
                            if (qData.score !== undefined) {
                                teacherScores[qNumNum] = parseFloat(qData.score) || 0;
                                checked = true;
                            }
                            // Check for points array (sum them up)
                            if (qData.points && Array.isArray(qData.points)) {
                                const totalScore = qData.points.reduce((sum, point) => sum + (parseFloat(point) || 0), 0);
                                teacherScores[qNumNum] = totalScore;
                                checked = true;
                            }
                        }
                    });
                }

                // Fallback: also check data.scores if all_result doesn't have teacher_scores
                if (!teacherScores && data.scores && typeof data.scores === 'object') {
                    teacherScores = {};
                    Object.entries(data.scores).forEach(([qNum, score]) => {
                        const qNumNum = Number(qNum);
                        if (!isNaN(qNumNum)) {
                            teacherScores[qNumNum] = parseFloat(score) || 0;
                        }
                    });
                }

                // Debug: log parsed answers structure
                if (parsedAnswers) {
                    console.log("Parsed answers structure:", parsedAnswers);
                    console.log("Questions 36-45:", parsedAnswers.questions_36_45);
                }

                return {
                    student: data.student,
                    answers: parsedAnswers,
                    checked: checked,
                    scores: teacherScores || null,
                    all_result: data.all_result || null,
                };
            }

            return null;
        } catch (error) {
            console.error("Student test data fetch error:", error);
            return null;
        }
    }, []);

    // ============================
    // TEACHER SCORES (scores for questions 36-45 from all_result)
    // ============================
    const fetchTeacherScores = useCallback(async (testId, studentId) => {
        if (!testId || !studentId) return null;

        try {
            // Fetch from same endpoint as fetchStudentTestData to get all_result
            const { data } = await axiosClient.get(
                `/tests/${testId}/students/${studentId}/answers`
            );

            if (data.success) {
                const scores = {};
                let checked = false;

                // Parse all_result JSON if it exists
                if (data.all_result) {
                    let allResult = data.all_result;

                    // Parse if it's a string
                    if (typeof allResult === 'string') {
                        try {
                            allResult = JSON.parse(allResult);
                        } catch (e) {
                            console.error("Error parsing all_result:", e);
                            allResult = null;
                        }
                    }

                    if (allResult && typeof allResult === 'object') {
                        // Extract teacher_scores from all_result.teacher_scores
                        if (allResult.teacher_scores && typeof allResult.teacher_scores === 'object') {
                            Object.entries(allResult.teacher_scores).forEach(([qNum, score]) => {
                                const qNumNum = Number(qNum);
                                if (!isNaN(qNumNum)) {
                                    scores[qNumNum] = parseFloat(score) || 0;
                                }
                            });

                            if (Object.keys(scores).length > 0) {
                                checked = true;
                            }
                        }
                    }
                }

                return {
                    scores: Object.keys(scores).length > 0 ? scores : null,
                    checked: checked || data.checked || false,
                };
            }

            return null;
        } catch (error) {
            console.error("Teacher scores fetch error:", error);
            return null;
        }
    }, []);

    // ============================
    // CHECK STUDENT ANSWERS (finish checking - save to all_result)
    // ============================
    const checkStudentAnswers = useCallback(async (testId, studentId, scores) => {
        if (!testId || !studentId || !scores) return null;

        try {
            // Backend will save scores to all_result JSON field automatically
            // We just send scores, backend should save it in all_result.teacher_scores
            const { data } = await axiosClient.post(
                `/tests/${testId}/students/${studentId}/check`,
                {
                    scores,
                    teacher_scores: scores, // For backward compatibility
                }
            );

            return data.success ? data : null;
        } catch (error) {
            console.error("Check student answers error:", error);
            throw error;
        }
    }, []);

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
                fetchTest,
                fetchStudentTestData,
                fetchTeacherScores,
                checkStudentAnswers,

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
