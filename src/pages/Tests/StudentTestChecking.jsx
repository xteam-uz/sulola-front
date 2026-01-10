import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { TopHeader } from "../../components/ui";
import { Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { BackButton, BottomBar } from "@twa-dev/sdk/react";
import { useStateContext } from "../../contexts/ContextProvider";
import { TestTypeEnum } from "../../constants/testTypes";
import { LoadingAnimation } from "../../components/ui/Loader";

export const StudentTestChecking = () => {
    const { testId, studentId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    // Context
    const {
        fetchTest,
        fetchStudentTestData,
        fetchTeacherScores,
        checkStudentAnswers,
        fetchTestStudents,
    } = useStateContext();

    // States
    const [loading, setLoading] = useState(true);
    const [loadingScores, setLoadingScores] = useState(false);
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
                // Fetch student test data (answers and student info)
                const studentTestData = await fetchStudentTestData(testId, studentId);

                if (studentTestData) {
                    setStudentData(studentTestData.student);
                    setStudentAnswers(studentTestData.answers);
                    setIsChecked(studentTestData.checked || false);

                    // Debug: log answers structure
                    console.log("Student answers structure:", studentTestData.answers);
                    console.log("Questions 36-45:", studentTestData.answers?.questions_36_45);
                }

                // Load teacher scores from all_result (parsed in fetchStudentTestData)
                if (studentTestData?.scores && Object.keys(studentTestData.scores).length > 0) {
                    setScores(studentTestData.scores);
                    setIsChecked(studentTestData.checked || false);
                }

                // Fetch test data if not in state
                let currentTestData = testData;
                if (!currentTestData) {
                    const test = await fetchTest(testId);
                    if (test) {
                        setTestData(test);
                        currentTestData = test;
                    }
                }

                // Agar Atestatsiya testi bo'lsa, avtomatik "Tekshirilgan" qilish
                if (currentTestData && currentTestData.type === TestTypeEnum.ATTESTATSIYA) {
                    setIsChecked(true);
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
    }, [testId, studentId, fetchStudentTestData, fetchTeacherScores, fetchTest]);

    // Atestatsiya testlarida avtomatik "Tekshirilgan" qilish
    useEffect(() => {
        if (testData && testData.type === TestTypeEnum.ATTESTATSIYA) {
            setIsChecked(true);
        }
    }, [testData]);

    // Check if test has image mode for questions 36-45
    const isImageMode = testData?.details?.questions_36_45?.mode === "image";

    // Check if a question 36-45 is essay type
    const isQuestionEssay = (questionNum) => {
        const q36_45 = testData?.details?.questions_36_45;
        if (!q36_45 || !q36_45.questions) return false;
        const questionData = q36_45.questions[String(questionNum)] || q36_45.questions[questionNum];
        return questionData?.is_essay === true || questionData?.is_essay === "true" || questionData?.is_essay === 1;
    };

    // Check if a question 36-45 exists in test (not excluded)
    const questionExistsInTest = (questionNum) => {
        const q36_45 = testData?.details?.questions_36_45;
        if (!q36_45 || !q36_45.questions) return false;
        const questionData = q36_45.questions[String(questionNum)] || q36_45.questions[questionNum];
        // Question exists if it's in the questions object (variant_count > 0 or is_essay = true)
        return !!questionData;
    };

    // Handle score change for questions 36-45 (supports per-variant keys)
    // For image mode and write mode (non-essay), accepts boolean (true/false/undefined) for checkbox
    // For write mode (essay), accepts numeric score
    const handleScoreChange = (questionNum, value, variantKey = null) => {
        const key = variantKey || questionNum;

        // Check if question is essay
        const isEssay = isQuestionEssay(questionNum);

        // For essay questions in write mode, handle numeric score (0-75)
        if (!isImageMode && isEssay && questionNum >= 36 && questionNum <= 45) {
            const maxScore = 75;
            const numValue = value === ""
                ? ""
                : Math.max(0, Math.min(parseInt(value) || 0, maxScore));
            setScores((prev) => ({
                ...prev,
                [key]: numValue,
            }));
            return;
        }

        // For image mode and write mode (non-essay), handle boolean values (checkbox)
        if ((isImageMode || (!isImageMode && !isEssay)) && questionNum >= 36 && questionNum <= 45) {
            // value is boolean (true/false/undefined) for checkbox
            setScores((prev) => {
                const newScores = { ...prev };
                if (value === true) {
                    newScores[key] = 1; // To'g'ri - set to 1, which will uncheck "Xato" automatically
                } else if (value === false) {
                    newScores[key] = 0; // Xato - set to 0, which will uncheck "To'g'ri" automatically
                } else {
                    // undefined - checkbox unchecked, remove from scores
                    delete newScores[key];
                }
                return newScores;
            });
        }
    };

    // Get max score for a question (36-45)
    const getMaxScore = (questionNum) => {
        // If question is essay, max score is 75
        if (isQuestionEssay(questionNum)) {
            return 75;
        }

        // Default max scores for non-essay questions - adjust based on your API response
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
        // Only validate questions that exist in the test (variant_count > 0 or is_essay = true)
        const requiredQuestions = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
        const missingScores = [];

        requiredQuestions.forEach((qNum) => {
            // Skip if question doesn't exist in test (was excluded when created)
            if (!questionExistsInTest(qNum)) {
                return;
            }

            // Check if question is essay
            if (isQuestionEssay(qNum)) {
                // Essay questions need a single score (0-75)
                if (scores[qNum] === undefined || scores[qNum] === "") {
                    missingScores.push(`${qNum} (Essey)`);
                }
                return;
            }

            const variants = getAnswerVariants(qNum);
            const answerType = getAnswerType(qNum);

            // For image mode and write mode (non-essay), check if checkbox is set (0 or 1 is valid)
            if ((isImageMode && (answerType === "image" || answerType === null)) || (!isImageMode && (answerType === "text" || answerType === null))) {
                if (scores[qNum] === undefined || scores[qNum] === "") {
                    missingScores.push(`${qNum}`);
                }
            } else if (variants.length > 0) {
                // For write mode with variants (non-essay)
                variants.forEach((_, idx) => {
                    const key = `${qNum}_${idx}`;
                    if (scores[key] === undefined || scores[key] === "") {
                        missingScores.push(`${qNum}-variant ${idx + 1}`);
                    }
                });
            }
        });

        if (missingScores.length > 0) {
            // Check if any missing score is for essay question
            const hasEssay = missingScores.some(score => score.includes("Essey"));

            let message;
            if (hasEssay) {
                // If there are essay questions, mention ball kiriting
                const essayScores = missingScores.filter(s => s.includes("Essey"));
                const nonEssayScores = missingScores.filter(s => !s.includes("Essey"));

                const parts = [];
                if (nonEssayScores.length > 0) {
                    parts.push(`Quyidagi savollar uchun to'g'ri/noto'g'ri belgilang: ${nonEssayScores.join(", ")}`);
                }
                if (essayScores.length > 0) {
                    parts.push(`Quyidagi essey savollari uchun ball kiriting: ${essayScores.join(", ")}`);
                }
                message = parts.join("\n");
            } else {
                // All non-essay questions use checkboxes
                message = `Quyidagi savollar uchun to'g'ri/noto'g'ri belgilang: ${missingScores.join(", ")}`;
            }

            toast.warning(message, {
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
        setLoadingScores(true);

        try {
            // Save teacher scores to backend
            const response = await checkStudentAnswers(testId, studentId, scores);

            if (response) {
                // After saving, fetch updated student test data from database to get all_result
                // Keep loading until scores are fetched from all_result
                setLoadingScores(true);

                // Fetch updated data from database (with all_result containing teacher_scores)
                const updatedStudentTestData = await fetchStudentTestData(testId, studentId);

                if (updatedStudentTestData) {
                    // Load teacher scores from all_result
                    if (updatedStudentTestData.scores && Object.keys(updatedStudentTestData.scores).length > 0) {
                        setScores(updatedStudentTestData.scores);
                    }
                    setIsChecked(updatedStudentTestData.checked || true);
                } else {
                    setIsChecked(true);
                }

                // Refresh test students list to update checked status in TestChacking page
                if (fetchTestStudents && testId) {
                    try {
                        await fetchTestStudents(testId);
                    } catch (error) {
                        console.error("Error refreshing test students:", error);
                        // Don't block navigation if refresh fails
                    }
                }

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
            setLoadingScores(false);
        }
    };

    // Get answer type for questions 36-45 (image or text)
    const getAnswerType = (questionNum) => {
        if (!studentAnswers || !studentAnswers.questions_36_45) {
            console.log(`[getAnswerType] No answers for question ${questionNum}:`, studentAnswers);
            return null;
        }

        const q36_45 = studentAnswers.questions_36_45;
        const questionNumStr = String(questionNum);

        // Check if format is { mode: "write", answers: {...} } or { mode: "image", images: {...} }
        if (q36_45.mode === "write" && q36_45.answers) {
            const answer = q36_45.answers[questionNumStr] || q36_45.answers[questionNum];
            if (answer) {
                // If answer is an array (most common format from backend)
                if (Array.isArray(answer) && answer.length > 0) {
                    return "text";
                }
                // If answer is an object with keys (variant indices)
                if (typeof answer === "object" && !Array.isArray(answer) && Object.keys(answer).length > 0) {
                    return "text";
                }
                // If answer is a string
                if (typeof answer === "string" && answer.trim().length > 0) {
                    return "text";
                }
            }
        } else if (q36_45.mode === "image" && q36_45.images) {
            const image = q36_45.images[questionNumStr] || q36_45.images[questionNum];
            if (image) {
                return "image";
            }
        }

        // Check direct format: { 36: { type: "text", text_answer: ... }, ... }
        // Try both string and number keys
        const answer = q36_45[questionNumStr] || q36_45[questionNum] || q36_45[Number(questionNum)];
        if (!answer) {
            return null;
        }

        // Check if answer has type field
        if (answer.type === "text" || answer.type === "image") {
            return answer.type;
        }

        // Check if answer has image
        if (answer.image_url || answer.image || answer.url) {
            return "image";
        }

        // Check if answer has text
        if (answer.text_answer || answer.answer) {
            return "text";
        }

        // Check if answer is an object with variant indices (text format)
        if (typeof answer === "object" && !Array.isArray(answer) && Object.keys(answer).length > 0) {
            // Skip if it's the backend format object with type field but no content
            if (answer.type && !answer.text_answer && !answer.answer) {
                return null;
            }
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

    // Get answer variants as array (each item is string); falls back to single entry
    const getAnswerVariants = (questionNum) => {
        if (!studentAnswers?.questions_36_45) return [];

        const q36_45 = studentAnswers.questions_36_45;
        const questionNumStr = String(questionNum);

        // Format: { mode: "write", answers: {...} }
        if (q36_45.mode === "write" && q36_45.answers) {
            const answer = q36_45.answers[questionNumStr] || q36_45.answers[questionNum];
            if (answer) {
                if (Array.isArray(answer)) {
                    return answer.filter((text) => text && text.trim());
                }
                if (typeof answer === "object" && !Array.isArray(answer)) {
                    return Object.keys(answer)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((idx) => answer[idx])
                        .filter((text) => text && text.trim());
                }
                if (typeof answer === "string" && answer.trim()) {
                    return [answer];
                }
            }
        }

        // Direct format: { 36: { type: "text", text_answer: ... }, ... }
        const answer = q36_45[questionNumStr] || q36_45[questionNum] || q36_45[Number(questionNum)];
        if (!answer) return [];

        if (answer.text_answer !== null && answer.text_answer !== undefined) {
            if (typeof answer.text_answer === "string" && answer.text_answer.trim()) {
                return [answer.text_answer];
            }
            if (Array.isArray(answer.text_answer)) {
                return answer.text_answer.filter((text) => text && text.trim());
            }
            if (typeof answer.text_answer === "object" && !Array.isArray(answer.text_answer)) {
                return Object.keys(answer.text_answer)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((idx) => answer.text_answer[idx])
                    .filter((text) => text && text.trim());
            }
        }

        if (answer.answer) {
            if (typeof answer.answer === "string" && answer.answer.trim()) {
                return [answer.answer];
            }
            if (typeof answer.answer === "object" && !Array.isArray(answer.answer)) {
                return Object.keys(answer.answer)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((idx) => answer.answer[idx])
                    .filter((text) => text && text.trim());
            }
        }

        if (typeof answer === "object" && !Array.isArray(answer) && Object.keys(answer).length > 0) {
            if (answer.type) {
                return [];
            }
            return Object.keys(answer)
                .sort((a, b) => Number(a) - Number(b))
                .map((idx) => answer[idx])
                .filter((text) => text && text.trim());
        }

        if (typeof answer === "string" && answer.trim()) {
            return [answer];
        }

        return [];
    };

    // Get answer text (joined variants for legacy display)
    const getAnswerText = (questionNum) => {
        if (!studentAnswers?.questions_36_45) return null;

        const q36_45 = studentAnswers.questions_36_45;
        const questionNumStr = String(questionNum);

        // Check if format is { mode: "write", answers: {...} }
        if (q36_45.mode === "write" && q36_45.answers) {
            const answer = q36_45.answers[questionNumStr] || q36_45.answers[questionNum];
            if (answer) {
                // If answer is an array ["answer1", "answer2", ...]
                if (Array.isArray(answer) && answer.length > 0) {
                    // Filter out empty strings and format as variants
                    const variants = answer
                        .filter(text => text && text.trim()) // Filter out empty strings
                        .map((text, idx) => `Variant ${idx + 1}: ${text}`)
                        .join("\n\n");
                    return variants || null;
                }
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
                if (typeof answer === "string" && answer.trim()) {
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

    // Get automatic check result for questions 1-35 (or 1-50 for Atestatsiya)
    const getAutoCheckResult = (questionNum) => {
        if (!studentAnswers) {
            return null;
        }

        const questionNumStr = String(questionNum);
        const questionNumNum = Number(questionNum);

        // Check questions_1_50 for Atestatsiya tests
        if (isAtestatsiyaTest && questionNum >= 1 && questionNum <= 50 && studentAnswers.questions_1_50) {
            // Try both string and number keys
            const answer = studentAnswers.questions_1_50[questionNumStr]
                || studentAnswers.questions_1_50[questionNumNum]
                || studentAnswers.questions_1_50[questionNum];

            if (answer) {
                // If is_correct is explicitly set (true or false), use it
                if (answer.is_correct === true || answer.is_correct === false) {
                    return answer.is_correct;
                }

                // If is_correct is null or undefined, try to check manually using test data
                if (testData && testData.details && testData.details.questions_1_50) {
                    // Get correct answer from test data
                    const qData = testData.details.questions_1_50[questionNumStr]
                        || testData.details.questions_1_50[questionNumNum]
                        || testData.details.questions_1_50[questionNum];
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
            <>
                <LoadingAnimation />
            </>
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

    // Test turini aniqlash
    const isAtestatsiyaTest = testData.type === TestTypeEnum.ATTESTATSIYA;

    return (
        <div className="min-h-screen bg-gray-50 pb-32 relative">
            {/* Loading overlay during submission - show until scores are loaded */}
            {(submitting || loadingScores) && (
                <div className="absolute inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-700 font-medium">
                            {submitting && !loadingScores
                                ? "Ballar saqlanmoqda..."
                                : "Ballar yuklanmoqda..."}
                        </p>
                    </div>
                </div>
            )}
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
                {!isAtestatsiyaTest && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                        <p className="text-blue-900 text-sm font-semibold mb-2">
                            Ko'rsatma:
                        </p>
                        <p className="text-blue-800 text-sm">
                            {isImageMode
                                ? "O'quvchi yuklagan rasmga qarab, to'g'ri javoblarni checkbox bilan belgilang. Noto'g'ri javoblar uchun checkboxni belgilamang."
                                : "O'quvchi yuklagan javoblarga qarab, to'g'ri javoblarni 'To'g'ri' checkbox bilan belgilang, noto'g'ri javoblarni 'Xato' checkbox bilan belgilang. Essey savollari uchun 0 dan 75 gacha ball kiriting."}
                        </p>
                    </div>
                )}
                {isAtestatsiyaTest && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                        <p className="text-blue-900 text-sm font-semibold mb-2">
                            Ko'rsatma:
                        </p>
                        <p className="text-blue-800 text-sm">
                            Barcha savollar variantli va avtomatik tekshiriladi.
                            Yashil belgi - to'g'ri javob, qizil belgi - noto'g'ri javob.
                        </p>
                    </div>
                )}

                {/* Questions 36-45 Section - Faqat DTM testlar uchun (Atestatsiya testlar uchun emas) */}
                {!isAtestatsiyaTest && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Yozma javoblar (36-45 savollar)
                        </h3>
                        <div className="space-y-4">
                            {Array.from({ length: 10 }, (_, i) => i + 36).map((questionNum) => {
                                // Skip if question doesn't exist in test (was excluded when created)
                                if (!questionExistsInTest(questionNum)) {
                                    return null;
                                }

                                const isEssay = isQuestionEssay(questionNum);
                                const answerType = getAnswerType(questionNum);
                                const imageUrl = getAnswerImage(questionNum);
                                const answerText = getAnswerText(questionNum);
                                const variants = getAnswerVariants(questionNum);
                                const hasVariants = answerType === "text" && variants.length > 0 && !isEssay;

                                return (
                                    <div
                                        key={questionNum}
                                        className="border border-gray-200 rounded-xl p-4"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-medium text-gray-700">
                                                {questionNum}-savol {isEssay && <span className="text-xs text-purple-600 font-normal">(Essey)</span>}
                                            </h4>
                                            {isEssay && (
                                                <p className="text-xs text-gray-500">
                                                    Maksimal: 75 ball
                                                </p>
                                            )}
                                        </div>

                                        {/* Essay question - show 0-75 score input */}
                                        {isEssay && (
                                            <div className="mb-3">
                                                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 mb-3">
                                                    <p className="text-sm text-purple-700 font-medium mb-1">
                                                        Essey savoli
                                                    </p>
                                                    {/* {answerText ? (
                                                        <p className="text-sm text-gray-700 mt-2">
                                                            {answerText}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 italic mt-2">
                                                            Javob berilmagan
                                                        </p>
                                                    )} */}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Essey balli (0-75)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="75"
                                                        value={scores[questionNum] ?? ""}
                                                        onChange={(e) =>
                                                            handleScoreChange(
                                                                questionNum,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                        placeholder="0"
                                                        disabled={isChecked || submitting || loadingScores}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Essey savoli uchun 0 dan 75 gacha ball kiriting
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Non-essay questions rendering */}
                                        {!isEssay && (
                                            <>
                                                {/* Rasmli javob - rasm bo'lsa yoki rasmli rejimda rasm bo'lmasa ham ko'rsatilsin */}
                                                {(answerType === "image" || (isImageMode && answerType === null)) && (
                                                    <div className="mb-3">
                                                        {imageUrl ? (
                                                            <div className="mb-3">
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={`${questionNum}-savol javobi`}
                                                                    className="w-full rounded-lg border border-gray-200"
                                                                    onError={(e) => {
                                                                        console.error(`Image load error for question ${questionNum}:`, imageUrl);
                                                                        e.target.style.display = 'none';
                                                                        const placeholder = e.target.nextElementSibling;
                                                                        if (placeholder) {
                                                                            placeholder.style.display = 'flex';
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="hidden flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                                                    <ImageIcon
                                                                        className="text-gray-400 mb-2"
                                                                        size={48}
                                                                    />
                                                                    <p className="text-gray-500 text-sm">
                                                                        Rasm yuklanmadi
                                                                    </p>
                                                                </div>
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
                                                    <div className="mb-3 space-y-3">
                                                        {hasVariants
                                                            ? variants.map((variantText, idx) => {
                                                                const variantKey = `${questionNum}_${idx}`;
                                                                return (
                                                                    <div
                                                                        key={variantKey}
                                                                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                                                    >
                                                                        <p className="text-sm text-gray-700 font-medium mb-2">
                                                                            Variant {idx + 1}:{" "}
                                                                            <span className="font-normal text-gray-700">
                                                                                {variantText}
                                                                            </span>
                                                                        </p>
                                                                        {/* Checkbox for write mode (non-essay) */}
                                                                        <div className="flex items-center justify-between">
                                                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={scores[variantKey] === 1 || scores[variantKey] === true}
                                                                                    onChange={(e) => {
                                                                                        handleScoreChange(
                                                                                            questionNum,
                                                                                            e.target.checked ? true : undefined,
                                                                                            variantKey
                                                                                        );
                                                                                    }}
                                                                                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                                    disabled={isChecked || submitting || loadingScores}
                                                                                />
                                                                                <span className="text-sm font-medium text-green-600">
                                                                                    To'g'ri
                                                                                </span>
                                                                            </label>
                                                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={scores[variantKey] === 0 && scores[variantKey] !== "" && scores[variantKey] !== undefined}
                                                                                    onChange={(e) => {
                                                                                        handleScoreChange(
                                                                                            questionNum,
                                                                                            e.target.checked ? false : undefined,
                                                                                            variantKey
                                                                                        );
                                                                                    }}
                                                                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                                    disabled={isChecked || submitting || loadingScores}
                                                                                />
                                                                                <span className="text-sm font-medium text-red-600">
                                                                                    Xato
                                                                                </span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                            : (
                                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                                    {answerText ? (
                                                                        <p className="text-sm text-gray-700">
                                                                            {answerText}
                                                                        </p>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500 italic">
                                                                            Javob berilmagan
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                )}

                                                {/* Agar javob bo'lmasa - faqat yozma rejimda ko'rsatilsin */}
                                                {answerType === null && !isImageMode && (
                                                    <div className="mb-3">
                                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <p className="text-sm text-gray-500 italic">
                                                                Javob berilmagan
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Ball input yoki checkbox - har bir savol uchun (variantsiz yoki rasmli javoblarda) */}
                                                {!hasVariants && (
                                                    <div>
                                                        {(isImageMode && (answerType === "image" || answerType === null)) || (!isImageMode && (answerType === "text" || answerType === null)) ? (
                                                            // Checkbox for image mode and write mode (non-essay) (to'g'ri/xato)
                                                            <div className="flex items-center justify-between">
                                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={scores[questionNum] === 1 || scores[questionNum] === true}
                                                                        onChange={(e) => {
                                                                            // Agar "To'g'ri" tanlansa, 1 qo'y, aks holda undefined
                                                                            // "Xato" ni avtomatik unchecked qilish
                                                                            handleScoreChange(
                                                                                questionNum,
                                                                                e.target.checked ? true : undefined
                                                                            );
                                                                        }}
                                                                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                        disabled={isChecked || submitting || loadingScores}
                                                                    />
                                                                    <span className="text-sm font-medium text-green-600">
                                                                        To'g'ri
                                                                    </span>
                                                                </label>
                                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={scores[questionNum] === 0 && scores[questionNum] !== "" && scores[questionNum] !== undefined}
                                                                        onChange={(e) => {
                                                                            // Agar "Xato" tanlansa, 0 qo'y, aks holda undefined
                                                                            // "To'g'ri" ni avtomatik unchecked qilish
                                                                            handleScoreChange(
                                                                                questionNum,
                                                                                e.target.checked ? false : undefined
                                                                            );
                                                                        }}
                                                                        className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                        disabled={isChecked || submitting || loadingScores}
                                                                    />
                                                                    <span className="text-sm font-medium text-red-600">
                                                                        Xato
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Auto-checked Questions Summary */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {isAtestatsiyaTest
                            ? "Avtomatik tekshirilgan savollar (1-50)"
                            : "Avtomatik tekshirilgan savollar (1-35)"}
                    </h3>
                    <div className={`grid ${isAtestatsiyaTest ? "grid-cols-10" : "grid-cols-6"} gap-2`}>
                        {Array.from(
                            { length: isAtestatsiyaTest ? 50 : 35 },
                            (_, i) => i + 1
                        ).map((qNum) => {
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

                {/* Finish Checking Button - Faqat DTM testlar uchun (Atestatsiya testlar uchun emas) */}
                {!isAtestatsiyaTest && !isChecked && (
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
