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

                    // Debug: log the answers structure (optional)
                    console.log("Student answers from backend:", data.answers);
                    console.log("Scores from backend:", data.scores);

                    // Load existing scores for questions 36-45
                    const loadedScores = {};

                    // First, try to load from data.scores (backend format)
                    if (data.scores && typeof data.scores === 'object') {
                        Object.entries(data.scores).forEach(([qNum, score]) => {
                            loadedScores[Number(qNum)] = parseFloat(score) || 0;
                        });
                    }

                    // Also check in answers.questions_36_45.questions for scores
                    // This is needed because backend might store scores there
                    if (data.answers?.questions_36_45?.questions) {
                        Object.entries(data.answers.questions_36_45.questions).forEach(([qNum, qData]) => {
                            const qNumInt = Number(qNum);
                            if (qData && typeof qData === "object") {
                                // For image mode: single score per question
                                if (qData.score !== undefined) {
                                    loadedScores[qNumInt] = parseFloat(qData.score) || 0;
                                }
                                // For write mode: points array - sum them up
                                if (qData.points && Array.isArray(qData.points)) {
                                    const totalScore = qData.points.reduce((sum, point) => sum + (parseFloat(point) || 0), 0);
                                    loadedScores[qNumInt] = totalScore;
                                }
                            }
                        });
                    }

                    if (Object.keys(loadedScores).length > 0) {
                        console.log("Loaded scores:", loadedScores);
                        setScores(loadedScores);
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

        const q36_45 = studentAnswers.questions_36_45;
        const questionNumStr = String(questionNum);

        // Check if format is { mode: "write", answers: {...} } or { mode: "image", images: {...} }
        if (q36_45.mode === "write" && q36_45.answers) {
            const answer = q36_45.answers[questionNumStr] || q36_45.answers[questionNum];
            if (answer && (typeof answer === "object" && Object.keys(answer).length > 0)) {
                return "text";
            }
        } else if (q36_45.mode === "image" && q36_45.images) {
            const image = q36_45.images[questionNumStr] || q36_45.images[questionNum];
            if (image) return "image";
        }

        // Check direct format: { 36: { type: "text", text_answer: ... }, ... }
        // Try both string and number keys
        const answer = q36_45[questionNumStr] || q36_45[questionNum] || q36_45[Number(questionNum)];
        if (!answer) return null;

        // Check if answer has type field
        if (answer.type === "text" || answer.type === "image") {
            return answer.type;
        }

        // Check if answer has image
        if (answer.image_url || answer.image) return "image";
        // Check if answer has text
        if (answer.text_answer || answer.answer) return "text";
        // Check if answer is an object with variant indices (text format)
        if (typeof answer === "object" && !Array.isArray(answer) && Object.keys(answer).length > 0) {
            return "text";
        }
        return null;
    };

    // Get answer image URL
    const getAnswerImage = (questionNum) => {
        if (!studentAnswers?.questions_36_45) return null;

        const q36_45 = studentAnswers.questions_36_45;
        const questionNumStr = String(questionNum);

        // Check if format is { mode: "image", images: {...} }
        if (q36_45.mode === "image" && q36_45.images) {
            const image = q36_45.images[questionNumStr] || q36_45.images[questionNum];
            if (image) {
                // Handle both string URL and object with url property
                return typeof image === "string" ? image : (image.url || image.image_url || image.image || null);
            }
        }

        // Fallback: check direct format
        const answer = q36_45[questionNumStr] || q36_45[questionNum];
        return answer?.image_url || answer?.image || null;
    };

    // Get answer text
    const getAnswerText = (questionNum) => {
        if (!studentAnswers?.questions_36_45) return null;

        const q36_45 = studentAnswers.questions_36_45;
        const questionNumStr = String(questionNum);

        // Check if format is { mode: "write", answers: {...} }
        if (q36_45.mode === "write" && q36_45.answers) {
            const answer = q36_45.answers[questionNumStr] || q36_45.answers[questionNum];
            if (answer) {
                // If answer is an object with variant indices { 0: "answer1", 1: "answer2" }
                if (typeof answer === "object" && !Array.isArray(answer)) {
                    // Convert object to formatted string showing all variants
                    const variants = Object.keys(answer)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((idx) => `Variant ${Number(idx) + 1}: ${answer[idx]}`)
                        .join("\n\n");
                    return variants;
                }
                // If answer is a string
                if (typeof answer === "string") {
                    return answer;
                }
            }
        }

        // Check direct format: { 36: { type: "text", text_answer: ... }, ... }
        // Try both string and number keys
        const answer = q36_45[questionNumStr] || q36_45[questionNum] || q36_45[Number(questionNum)];
        if (!answer) return null;

        // Check for text_answer field (backend format)
        if (answer.text_answer !== null && answer.text_answer !== undefined) {
            // If text_answer is a string, return it
            if (typeof answer.text_answer === "string") {
                return answer.text_answer;
            }
            // If text_answer is an array ["answer1", "answer2", ...]
            if (Array.isArray(answer.text_answer)) {
                if (answer.text_answer.length === 0) {
                    return null; // Empty array
                }
                const variants = answer.text_answer
                    .filter(text => text && text.trim()) // Filter out empty strings
                    .map((text, idx) => `Variant ${idx + 1}: ${text}`)
                    .join("\n\n");
                return variants || null;
            }
            // If text_answer is an object with variant indices { 0: "answer1", 1: "answer2" }
            if (typeof answer.text_answer === "object" && !Array.isArray(answer.text_answer)) {
                const variants = Object.keys(answer.text_answer)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((idx) => `Variant ${Number(idx) + 1}: ${answer.text_answer[idx]}`)
                    .join("\n\n");
                return variants;
            }
        }

        // Fallback: check for answer field
        if (answer.answer) {
            if (typeof answer.answer === "string") {
                return answer.answer;
            }
            if (typeof answer.answer === "object" && !Array.isArray(answer.answer)) {
                const variants = Object.keys(answer.answer)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((idx) => `Variant ${Number(idx) + 1}: ${answer.answer[idx]}`)
                    .join("\n\n");
                return variants;
            }
        }

        // Check if answer itself is an object with variant indices (direct format)
        if (typeof answer === "object" && !Array.isArray(answer) && Object.keys(answer).length > 0) {
            // Skip if it's the backend format object with type field
            if (answer.type) {
                return null; // Backend didn't parse it correctly
            }
            const variants = Object.keys(answer)
                .sort((a, b) => Number(a) - Number(b))
                .map((idx) => `Variant ${Number(idx) + 1}: ${answer[idx]}`)
                .join("\n\n");
            return variants;
        }

        return null;
    };

    // Get automatic check result for questions 1-35
    const getAutoCheckResult = (questionNum) => {
        if (!studentAnswers) {
            return null;
        }

        const questionNumStr = String(questionNum);
        const questionNumNum = Number(questionNum);

        // Check questions_1_32
        if (questionNum >= 1 && questionNum <= 32 && studentAnswers.questions_1_32) {
            // Try both string and number keys
            const answer = studentAnswers.questions_1_32[questionNumStr]
                || studentAnswers.questions_1_32[questionNumNum]
                || studentAnswers.questions_1_32[questionNum];

            if (answer) {
                // If is_correct is explicitly set (true or false), use it
                if (answer.is_correct === true || answer.is_correct === false) {
                    return answer.is_correct;
                }

                // If is_correct is null or undefined, try to check manually using test data
                if (testData && testData.details && testData.details.questions_1_32) {
                    // Get correct answer from test data
                    const qData = testData.details.questions_1_32[questionNumStr]
                        || testData.details.questions_1_32[questionNumNum]
                        || testData.details.questions_1_32[questionNum];
                    const correctAnswer = qData?.correct_answer;

                    // Get student answer
                    const studentAnswer = answer.answer || answer.correct_answer;

                    if (correctAnswer && studentAnswer) {
                        // Compare answers (case-insensitive)
                        return correctAnswer.toString().toUpperCase() === studentAnswer.toString().toUpperCase();
                    }
                }

                // If we can't determine, return null
                return null;
            }
        }

        // Check questions_33_35
        if (questionNum >= 33 && questionNum <= 35 && studentAnswers.questions_33_35) {
            // Try both string and number keys
            const answer = studentAnswers.questions_33_35[questionNumStr]
                || studentAnswers.questions_33_35[questionNumNum]
                || studentAnswers.questions_33_35[questionNum];

            if (answer) {
                // If is_correct is explicitly set (true or false), use it
                if (answer.is_correct === true || answer.is_correct === false) {
                    return answer.is_correct;
                }

                // If is_correct is null or undefined, try to check manually using test data
                if (testData && testData.details && testData.details.questions_33_35) {
                    // Get correct answer from test data
                    const qData = testData.details.questions_33_35[questionNumStr]
                        || testData.details.questions_33_35[questionNumNum]
                        || testData.details.questions_33_35[questionNum];
                    const correctAnswer = qData?.correct_answer;

                    // Get student answer
                    const studentAnswer = answer.answer || answer.correct_answer;

                    if (correctAnswer && studentAnswer) {
                        // Compare answers (case-insensitive)
                        return correctAnswer.toString().toUpperCase() === studentAnswer.toString().toUpperCase();
                    }
                }

                // If we can't determine, return null
                return null;
            }
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

                {/* Auto-checked Questions Summary (1-35) */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Avtomatik tekshirilgan savollar (1-35)
                    </h3>
                    <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: 35 }, (_, i) => i + 1).map((qNum) => {
                            const isCorrect = getAutoCheckResult(qNum);
                            return (
                                <div
                                    key={qNum}
                                    className={`flex items-center justify-center p-2 rounded-lg border ${isCorrect === true
                                        ? "bg-green-500 border-green-600"
                                        : isCorrect === false
                                            ? "bg-red-500 border-red-600"
                                            : "bg-gray-100 border-gray-300"
                                        }`}
                                >
                                    {isCorrect === true ? (
                                        <CheckCircle2
                                            className="text-white"
                                            size={20}
                                        />
                                    ) : isCorrect === false ? (
                                        <XCircle className="text-white" size={20} />
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
