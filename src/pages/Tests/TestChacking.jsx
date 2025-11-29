import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios-client";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { TopHeader } from "../../components/ui";
import { Search, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { BackButton, BottomBar } from "@twa-dev/sdk/react";

export const TestChecking = () => {
    // states
    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState(null);
    const [testStatus, setTestStatus] = useState("waiting");
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [allChecked, setAllChecked] = useState(false);

    // props
    const { state } = useLocation();
    const testId = state?.testId;
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

    // Fetch students who submitted the test
    useEffect(() => {
        const fetchStudents = async () => {
            if (!testId) return;

            setStudentsLoading(true);
            try {
                // API endpoint to get students who submitted the test
                const { data } = await axiosClient.get(`/tests/${testId}/students`);

                if (data.students) {
                    setStudents(data.students);

                    // Check if all students' written answers are checked
                    const allWrittenChecked = data.students.every((student) => {
                        // Assuming there's a field indicating if written answers are checked
                        return student.written_checked || !student.has_written_answers;
                    });
                    setAllChecked(allWrittenChecked);
                }
            } catch (error) {
                console.error("O'quvchilarni yuklashda xatolik:", error);
                // Silent fail - might not have endpoint yet
            } finally {
                setStudentsLoading(false);
            }
        };

        if (testData) {
            fetchStudents();
        }
    }, [testId, testData]);

    // Filter students based on search query
    const filteredStudents = students.filter((student) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const fullName = `${student.first_name || ""} ${student.last_name || ""}`.toLowerCase();
        return fullName.includes(query);
    });

    // Calculate statistics
    const submittedCount = students.filter((s) => s.submitted).length;
    const pendingCount = students.length - submittedCount;

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
        try {
            // API call to finish test and get results
            await axiosClient.post(`/tests/${testId}/finish`);
            toast.success("Test yakunlandi va natijalar tayyor!", {
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
            // Navigate to results page or refresh
        } catch (error) {
            console.error("Testni yakunlashda xatolik:", error);
            toast.error("Testni yakunlashda xatolik yuz berdi!", {
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

                {/* Finish Test Button */}
                {allChecked && (
                    <button
                        onClick={handleFinishTest}
                        className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium mb-4 shadow-md hover:bg-blue-600 transition-colors"
                    >
                        Yakunlash va natijalarni olish
                    </button>
                )}

                {/* Info Message */}
                {allChecked && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                        <p className="text-green-800 text-sm text-center">
                            Barcha o'quvchilarning yozma javoblari tekshirilgan. Testni yakunlab natijalarni olishingiz mumkin.
                        </p>
                    </div>
                )}

                {/* Students Section */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        O'quvchilar ({students.length} ta)
                    </h3>

                    {/* Statistics */}
                    <div className="flex flex-col gap-2 mb-4">
                        <p className="text-blue-600 text-sm font-medium">
                            Javoblarni yuborgan - {submittedCount} ta
                        </p>
                        <p className="text-orange-600 text-sm font-medium">
                            Javoblar kutilmoqda - {pendingCount} ta
                        </p>
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
                                            <h4 className="font-semibold text-gray-800 mb-1">
                                                {student.first_name} {student.last_name}
                                            </h4>
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
                    {!studentsLoading && students.length > 0 && (
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
