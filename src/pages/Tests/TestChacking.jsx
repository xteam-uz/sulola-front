import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios-client";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { TopHeader } from "../../components/ui";
import { Search, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { BackButton, BottomBar } from "@twa-dev/sdk/react";
import { useStateContext } from "../../contexts/ContextProvider";

export const TestChecking = () => {
    // states
    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState(null);
    const [testStatus, setTestStatus] = useState("waiting");
    const [searchQuery, setSearchQuery] = useState("");
    const [finishing, setFinishing] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    const [allWrittenChecked, setAllWrittenChecked] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState("loading"); // loading | checking | ready | processing | done

    // Context
    const {
        testStudents,
        studentsLoading,
        fetchTestStudents,
        finishTest,
    } = useStateContext();

    // props
    const location = useLocation();
    const testId = location.state?.testId;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const { data } = await axiosClient.get(`/tests/${testId}`);
                setTestData(data.test);

                // Test holatini aniqlash
                const now = Date.now();
                const start = new Date(data.test.start_time).getTime();
                const end = new Date(data.test.end_time).getTime();

                if (now < start) {
                    setTestStatus("waiting");
                } else if (now < end) {
                    setTestStatus("active");
                } else {
                    setTestStatus("expired");
                }
            } catch (error) {
                console.error("Test yuklashda xatolik:", error);
                toast.error("Test ma'lumotlarini yuklashda xatolik!", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    className: "toast-width my-2",
                });
            } finally {
                setLoading(false);
            }
        };
        if (testId) {
            fetchTest();
        }
    }, [testId]);

    // Function to load students and check status
    const loadStudentsAndCheckStatus = useCallback(async () => {
        if (!testData || !testId) return;

        setCheckingStatus("loading");
        try {
            const result = await fetchTestStudents(testId);
            if (result) {
                // Backend returns all_written_checked specifically for THIS test
                const isAllChecked = result.allChecked || result.statistics?.all_written_checked || false;
                setAllWrittenChecked(isAllChecked);
                setCheckingStatus(isAllChecked ? "ready" : "checking");
            } else {
                setAllWrittenChecked(false);
                setCheckingStatus("checking");
            }
        } catch (error) {
            console.error("Error loading students:", error);
            setAllWrittenChecked(false);
            setCheckingStatus("checking");
        }
    }, [testId, testData, fetchTestStudents]);

    // Fetch students who submitted the test and check if all written answers are checked
    // location.key changes when user navigates, triggering a refresh
    useEffect(() => {
        loadStudentsAndCheckStatus();
    }, [loadStudentsAndCheckStatus, location.key]);

    // Refresh data when page becomes visible (user navigates back from student page)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadStudentsAndCheckStatus();
            }
        };

        const handleFocus = () => {
            loadStudentsAndCheckStatus();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
        };
    }, [loadStudentsAndCheckStatus]);

    // Filter students based on search query
    const filteredStudents = (testStudents || []).filter((student) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const fullName = `${student.first_name || ""} ${student.last_name || ""}`.toLowerCase();
        return fullName.includes(query);
    });

    // Calculate statistics
    const submittedCount = (testStudents || []).filter((s) => s.submitted).length;
    const pendingCount = (testStudents || []).length - submittedCount;
    const checkedCount = (testStudents || []).filter((s) => s.written_checked || !s.has_written_answers).length;
    const uncheckedCount = (testStudents || []).filter((s) => s.has_written_answers && !s.written_checked).length;

    // Test holatlari uchun qisqa o'zgaruvchilar
    const isTestNotStarted = testStatus === "waiting";
    const isTestExpired = testStatus === "expired";
    const isTestActive = testStatus === "active";

    // Get status label
    const getStatusLabel = () => {
        if (isTestNotStarted) return "Kutilmoqda";
        if (isTestExpired) return "Yopiq";
        if (isTestActive) return "Ochiq";
        return "";
    };

    // Get status color
    const getStatusColor = () => {
        if (isTestNotStarted) return "bg-yellow-100 text-yellow-600";
        if (isTestExpired) return "bg-gray-200 text-gray-600";
        if (isTestActive) return "bg-green-100 text-green-600";
        return "bg-gray-200 text-gray-600";
    };

    const handleFinishTest = async () => {
        if (!allWrittenChecked || finishing) return;
        setFinishing(true);
        setCheckingStatus("processing");
        setResultUrl(null);
        try {
            const result = await finishTest(testId);
            // Try to extract pdf url from common keys
            // Backend should return: { success: true, file_url: "https://...", job_id: "..." }
            const pdfUrl =
                result?.file_url ||
                result?.pdf_url ||
                result?.data?.file_url ||
                result?.data?.pdf_url ||
                result?.data?.url;

            if (pdfUrl) {
                setResultUrl(pdfUrl);
                setCheckingStatus("done");
                toast.success("Natijalar tayyor, yuklab oling!", {
                    position: "top-center",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    className: "toast-width my-2",
                });
            } else if (result?.job_id) {
                // Backend started a job to generate PDF, poll for status
                setCheckingStatus("processing");
                toast.info("Natijalar tayyorlanmoqda, iltimos kuting...", {
                    position: "top-center",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    className: "toast-width my-2",
                });
                // TODO: Implement polling for job status when backend is ready
                // pollJobStatus(result.job_id);
            } else if (result?.success) {
                setCheckingStatus("done");
                toast.success("Test yakunlandi!", {
                    position: "top-center",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    className: "toast-width my-2",
                });
            }

            // Refresh students list after finishing
            if (testId) {
                const refreshResult = await fetchTestStudents(testId);
                if (refreshResult) {
                    setAllWrittenChecked(refreshResult.allChecked || refreshResult.statistics?.all_written_checked || false);
                }
            }
        } catch (error) {
            console.error("Testni yakunlashda xatolik:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Testni yakunlashda xatolik yuz berdi!";
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
                className: "toast-width my-2",
            });
            setCheckingStatus("ready");
        } finally {
            setFinishing(false);
        }
    };

    const handleStudentClick = (student) => {
        // Navigate to student's test result page
        navigate(`/test/${testId}/student/${student.id}`, {
            state: { student, testData },
        });
    };

    // Spinner
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // check if test data is available
    if (!testData) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-700">
                Test topilmadi.
            </div>
        );
    }

    const { code, name } = testData;

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <TopHeader testName={name} />

            <div className="px-4 py-4">
                {/* Test completed btn */}
                <button
                    onClick={
                        resultUrl
                            ? () => window.open(resultUrl, "_blank", "noopener,noreferrer")
                            : handleFinishTest
                    }
                    disabled={!allWrittenChecked || finishing || checkingStatus === "processing"}
                    className={`w-full py-3 rounded-xl font-medium mb-4 shadow-md transition-colors flex items-center justify-center gap-2 ${resultUrl
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : allWrittenChecked && checkingStatus !== "processing"
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-200 text-gray-600 cursor-not-allowed"
                        }`}
                >
                    {checkingStatus === "loading" ? (
                        <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            Tekshirilmoqda...
                        </>
                    ) : checkingStatus === "processing" || finishing ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Ma'lumotlar tayyorlanmoqda...
                        </>
                    ) : resultUrl ? (
                        "Yuklab olish"
                    ) : !allWrittenChecked ? (
                        "Avval barcha javoblarni tekshiring"
                    ) : (
                        "Testni yakunlash"
                    )}
                </button>
                {/* Test Status Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <span
                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor()}`}
                        >
                            {getStatusLabel()}
                        </span>

                        <span className="text-gray-700 text-sm">
                            <b>Kod:</b> {code}
                        </span>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full mt-4">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="text-gray-400" size={18} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 text-sm text-gray-900 bg-transparent
                                       border-0 border-b-2 border-gray-300 appearance-none
                                       focus:outline-none focus:ring-0 focus:border-blue-600"
                            placeholder="O'quvchi ismi yoki familiyasi bo'yicha qidirish..."
                        />
                    </div>
                </div>

                {/* Info Message */}
                {allWrittenChecked && checkingStatus === "ready" && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                        <p className="text-green-800 text-sm text-center">
                            Barcha o'quvchilarning yozma javoblari tekshirilgan. Testni yakunlab natijalarni olishingiz mumkin.
                        </p>
                    </div>
                )}
                {!allWrittenChecked && checkingStatus !== "loading" && (testStudents || []).length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
                        <p className="text-yellow-800 text-sm text-center">
                            Hali tekshirilmagan javoblar mavjud. Har bir o'quvchining javoblarini tekshiring.
                        </p>
                    </div>
                )}

                {/* Students Section */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        O'quvchilar ({(testStudents || []).length} ta)
                    </h3>

                    {/* Statistics */}
                    <div className="flex flex-col gap-2 mb-4">
                        <p className="text-blue-600 text-sm font-medium">
                            Javoblarni yuborgan - {submittedCount} ta
                        </p>
                        <p className="text-orange-600 text-sm font-medium">
                            Javoblar kutilmoqda - {pendingCount} ta
                        </p>
                        <div className="flex gap-4 mt-1">
                            <p className="text-green-600 text-sm font-medium">
                                ✓ Tekshirilgan - {checkedCount} ta
                            </p>
                            {uncheckedCount > 0 && (
                                <p className="text-red-600 text-sm font-medium">
                                    ✗ Tekshirilmagan - {uncheckedCount} ta
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Students List */}
                    {studentsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredStudents.length > 0 ? (
                        <div className="space-y-3">
                            {filteredStudents.map((student, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleStudentClick(student)}
                                    className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-gray-800">
                                                    {student.first_name} {student.last_name}
                                                </h4>
                                                {/* Written answer check status */}
                                                {student.has_written_answers && (
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${student.written_checked
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {student.written_checked ? "✓ Tekshirilgan" : "✗ Tekshirilmagan"}
                                                    </span>
                                                )}
                                            </div>
                                            {student.submitted_at && (
                                                <p className="text-blue-600 text-sm">
                                                    Javoblar yuborilgan -{" "}
                                                    {format(
                                                        new Date(student.submitted_at),
                                                        "dd.MM.yyyy - HH:mm",
                                                    )}
                                                </p>
                                            )}
                                            {!student.submitted && (
                                                <p className="text-orange-600 text-sm">
                                                    Javoblar kutilmoqda
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight
                                            className="text-gray-400 ml-2 shrink-0"
                                            size={20}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            O'quvchilar topilmadi
                        </div>
                    )}

                    {/* Load Status */}
                    {!studentsLoading && (testStudents || []).length > 0 && (
                        <p className="text-center text-gray-500 text-xs mt-4">
                            Barcha o'quvchilar yuklandi
                        </p>
                    )}
                </div>
            </div>

            <BottomBar bgColor="#ffffff">
                <BackButton onClick={() => navigate(-1)} />
            </BottomBar>

            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </div>
    );
};
