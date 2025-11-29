import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios-client";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { TopHeader } from "../../components/ui";
import { Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { BackButton, BottomBar } from "@twa-dev/sdk/react";

export const StudentTestChecking = () => {
    const { testId, studentId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    // States
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [testData, setTestData] = useState(state?.testData || null);
    const [studentAnswers, setStudentAnswers] = useState(null);
    const [scores, setScores] = useState({});
    const [isChecked, setIsChecked] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch student data and answers
    useEffect(() => {
        const fetchData = async () => {
            if (!testId || !studentId) return;

            setLoading(true);
            try {
                // Fetch student test answers
                const { data } = await axiosClient.get(
                    `/tests/${testId}/students/${studentId}/answers`
                );

                if (data.success) {
                    setStudentData(data.student);
                    setStudentAnswers(data.answers);
                    setIsChecked(data.checked || false);

                    // Load existing scores for questions 36-45
                    if (data.scores) {
                        setScores(data.scores);
                    }
                }

                // Fetch test data if not in state
                if (!testData) {
                    const testResponse = await axiosClient.get(`/tests/${testId}`);
                    setTestData(testResponse.data.test);
                }
            } catch (error) {
                console.error("Ma'lumotlarni yuklashda xatolik:", error);
                toast.error("Ma'lumotlarni yuklashda xatolik!", {
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

        fetchData();
    }, [testId, studentId]);

    // Handle score change for questions 36-45
    const handleScoreChange = (questionNum, value) => {
        const numValue = value === "" ? "" : Math.max(0, Math.min(parseInt(value) || 0, getMaxScore(questionNum)));
        setScores((prev) => ({
            ...prev,
            [questionNum]: numValue,
        }));
    };

    // Get max score for a question (36-45)
    const getMaxScore = (questionNum) => {
        // Default max scores - adjust based on your API response
        const maxScores = {
            36: 30,
            37: 30,
            38: 30,
            39: 30,
            40: 30,
            41: 30,
            42: 35,
            43: 10,
            44: 10,
            45: 10,
        };
        return maxScores[questionNum] || 30;
    };

    // Handle finish checking
    const handleFinishChecking = async () => {
        if (!testId || !studentId) return;

        // Validate that all scores are provided for questions 36-45
        const requiredQuestions = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
        const missingScores = requiredQuestions.filter(
            (qNum) => scores[qNum] === undefined || scores[qNum] === ""
        );

        if (missingScores.length > 0) {
            toast.warning(`Quyidagi savollar uchun ball kiriting: ${missingScores.join(", ")}`, {
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
            return;
        }

        setSubmitting(true);
        try {
            const response = await axiosClient.post(
                `/tests/${testId}/students/${studentId}/check`,
                {
                    scores,
                }
            );

            if (response.data.success) {
                toast.success("Tekshirish yakunlandi!", {
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
                setIsChecked(true);
                // Navigate back after a short delay
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            }
        } catch (error) {
            console.error("Tekshirishni yakunlashda xatolik:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Tekshirishni yakunlashda xatolik yuz berdi!";
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
        } finally {
            setSubmitting(false);
        }
    };

    // Get answer type for questions 36-45 (image or text)
    const getAnswerType = (questionNum) => {
        if (!studentAnswers?.questions_36_45) return null;
        const answer = studentAnswers.questions_36_45[questionNum];
        if (!answer) return null;

        // Check if answer has image
        if (answer.image_url || answer.image) return "image";
        // Check if answer has text
        if (answer.text_answer || answer.answer) return "text";
        return null;
    };

    // Get answer image URL
    const getAnswerImage = (questionNum) => {
        if (!studentAnswers?.questions_36_45) return null;
        const answer = studentAnswers.questions_36_45[questionNum];
        return answer?.image_url || answer?.image || null;
    };

    // Get answer text
    const getAnswerText = (questionNum) => {
        if (!studentAnswers?.questions_36_45) return null;
        const answer = studentAnswers.questions_36_45[questionNum];
        return answer?.text_answer || answer?.answer || null;
    };

    // Get automatic check result for questions 1-36
    const getAutoCheckResult = (questionNum) => {
        if (!studentAnswers) return null;

        // Check questions_1_32
        if (questionNum >= 1 && questionNum <= 32 && studentAnswers.questions_1_32) {
            const answer = studentAnswers.questions_1_32[questionNum];
            return answer?.is_correct !== undefined ? answer.is_correct : null;
        }

        // Check questions_33_35
        if (questionNum >= 33 && questionNum <= 35 && studentAnswers.questions_33_35) {
            const answer = studentAnswers.questions_33_35[questionNum];
            return answer?.is_correct !== undefined ? answer.is_correct : null;
        }

        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!studentData || !testData) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-700">
                Ma'lumotlar topilmadi.
            </div>
        );
    }

    const studentName = `${studentData.first_name || ""} ${studentData.last_name || ""}`.trim();
    const testCode = testData.code || "N/A";

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <TopHeader />

            <div className="px-4 py-4">
                {/* Student Info Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <div className="flex justify-between items-center">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">
                                {studentName}
                            </h3>
                            <p className="text-gray-600 text-sm">{testCode}</p>
                        </div>
                        <div className="ml-4">
                            <span
                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${isChecked
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-200 text-gray-600"
                                    }`}
                            >
                                {isChecked ? "Tekshirilgan" : "Tekshirilmagan"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Instructions Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                    <p className="text-blue-900 text-sm font-semibold mb-2">
                        Ko'rsatma:
                    </p>
                    <p className="text-blue-800 text-sm">
                        O'quvchi yuklagan rasmga qarab, to'g'ri javoblarni yashil
                        tugma bilan belgilang. Noto'g'ri javoblarni belgilamang
                        (kulrang holatda qoldiring).
                    </p>
                </div>

                {/* Questions 36-45 Section - Har bir savol alohida (rasmli yoki yozma) */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Yozma javoblar (36-45 savollar)
                    </h3>
                    <div className="space-y-4">
                        {Array.from({ length: 10 }, (_, i) => i + 36).map((questionNum) => {
                            const answerType = getAnswerType(questionNum);
                            const imageUrl = getAnswerImage(questionNum);
                            const answerText = getAnswerText(questionNum);

                            return (
                                <div
                                    key={questionNum}
                                    className="border border-gray-200 rounded-xl p-4"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-medium text-gray-700">
                                            {questionNum}-savol
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            Maksimal: {getMaxScore(questionNum)} ball
                                        </p>
                                    </div>

                                    {/* Rasmli javob */}
                                    {answerType === "image" && (
                                        <div className="mb-3">
                                            {imageUrl ? (
                                                <div className="mb-3">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`${questionNum}-savol javobi`}
                                                        className="w-full rounded-lg border border-gray-200"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                                    <ImageIcon
                                                        className="text-gray-400 mb-2"
                                                        size={48}
                                                    />
                                                    <p className="text-gray-500 text-sm">
                                                        O'quvchi hali rasm yuklamagan
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Yozma javob */}
                                    {answerType === "text" && (
                                        <div className="mb-3">
                                            {answerText ? (
                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                    <p className="text-sm text-gray-700">
                                                        {answerText}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                    <p className="text-sm text-gray-500 italic">
                                                        Javob berilmagan
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Agar javob bo'lmasa */}
                                    {answerType === null && (
                                        <div className="mb-3">
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <p className="text-sm text-gray-500 italic">
                                                    Javob berilmagan
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Ball input - har bir savol uchun */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ball (0-{getMaxScore(questionNum)})
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={getMaxScore(questionNum)}
                                            value={scores[questionNum] || ""}
                                            onChange={(e) =>
                                                handleScoreChange(
                                                    questionNum,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            disabled={isChecked}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Auto-checked Questions Summary (1-36) */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Avtomatik tekshirilgan savollar (1-36)
                    </h3>
                    <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: 36 }, (_, i) => i + 1).map((qNum) => {
                            const isCorrect = getAutoCheckResult(qNum);
                            return (
                                <div
                                    key={qNum}
                                    className={`flex items-center justify-center p-2 rounded-lg border ${isCorrect === true
                                        ? "bg-green-100 border-green-300"
                                        : isCorrect === false
                                            ? "bg-red-100 border-red-300"
                                            : "bg-gray-100 border-gray-300"
                                        }`}
                                >
                                    {isCorrect === true ? (
                                        <CheckCircle2
                                            className="text-green-600"
                                            size={20}
                                        />
                                    ) : isCorrect === false ? (
                                        <XCircle className="text-red-600" size={20} />
                                    ) : (
                                        <span className="text-gray-500 text-xs">
                                            {qNum}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Finish Checking Button */}
                {!isChecked && (
                    <button
                        onClick={handleFinishChecking}
                        disabled={submitting}
                        className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium mb-4 shadow-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Yakunlanmoqda..." : "Tekshirishni yakunlash"}
                    </button>
                )}
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
