import { useState, useEffect, useRef } from "react";
import { Bounce, toast, ToastContainer, Zoom } from "react-toastify";
import { Camera, X } from "lucide-react";
import { TopHeader } from "../../components/ui";
import axiosClient from "../../api/axios-client";
import { useLocation, useNavigate } from "react-router-dom";
import { BackButton, BottomBar, MainButton } from "@twa-dev/sdk/react";
import { CountdownTimer } from "../../components/CountDownTimer";
import { useStateContext } from "../../contexts/ContextProvider";
import { TestTypeEnum } from "../../constants/testTypes";

export const TestTakingPage = () => {
    const [loading, setLoading] = useState(true);
    const [loadingAnswers, setLoadingAnswers] = useState(false);
    const [testData, setTestData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [uploadedImages, setUploadedImages] = useState({});
    const [textAnswers, setTextAnswers] = useState({});
    const [scores, setScores] = useState({}); // Scores for questions 36-45
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [currentImageQuestion, setCurrentImageQuestion] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [testStatus, setTestStatus] = useState("loading"); // "waiting" | "active" | "expired"
    const [startTime, setStartTime] = useState(null); // Add state for start time
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const { user, refreshTestResults, fetchUserTestAnswers } = useStateContext();

    const navigate = useNavigate();
    const { state } = useLocation();
    const testId = state?.testId;
    const testStartTime = state?.startTime; // Get start time from navigation state
    const isReadOnly = state?.readOnly || false; // Get read-only flag from navigation state

    // Testni yuklash
    useEffect(() => {
        const fetchTest = async () => {
            try {
                const { data } = await axiosClient.get(`/tests/${testId}`);
                setTestData(data.test);

                // Set the start time if provided
                if (testStartTime) {
                    setStartTime(testStartTime);
                }

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
        fetchTest();
    }, [testId, testStartTime]);

    // Avvalgi javoblarni yuklash
    useEffect(() => {
        const loadPreviousAnswers = async () => {
            if (!testData || !user?.[0]?.bot_user?.user_id) {
                console.log("Missing testData or user:", { testData, user });
                setLoadingAnswers(false);
                return;
            }

            setLoadingAnswers(true);
            try {
                const testCode = testData.code;
                const userId = user[0].bot_user.user_id;

                console.log("Fetching previous answers for:", { testCode, userId });
                const previousResult = await fetchUserTestAnswers(testCode, userId);
                console.log("Previous result from API:", previousResult);

                if (previousResult && previousResult.results) {
                    const results = previousResult.results;
                    console.log("Loading previous answers for test:", testCode, results);

                    // Load answers for questions 1-32
                    if (results.questions_1_32) {
                        const loadedAnswers = {};
                        Object.entries(results.questions_1_32).forEach(
                            ([qNum, qData]) => {
                                // Handle multiple formats:
                                // 1. { correct_answer: "A" }
                                // 2. { answer: "A" }
                                // 3. Direct value "A"
                                let answer = null;
                                if (typeof qData === "object" && qData !== null) {
                                    answer = qData.correct_answer || qData.answer;
                                } else {
                                    answer = qData;
                                }

                                if (answer) {
                                    // Store with both string and number keys to ensure compatibility
                                    const qNumStr = String(qNum);
                                    const qNumNum = Number(qNum);
                                    const answerStr = String(answer).trim();
                                    loadedAnswers[qNumStr] = answerStr;
                                    loadedAnswers[qNumNum] = answerStr;
                                }
                            },
                        );
                        console.log("Loaded answers 1-32:", loadedAnswers);
                        setAnswers((prev) => ({ ...prev, ...loadedAnswers }));
                    }

                    // Load answers for questions 33-35
                    if (results.questions_33_35) {
                        const loadedAnswers = {};
                        Object.entries(results.questions_33_35).forEach(
                            ([qNum, qData]) => {
                                // Handle multiple formats:
                                // 1. { correct_answer: "A" }
                                // 2. { answer: "A" }
                                // 3. Direct value "A"
                                let answer = null;
                                if (typeof qData === "object" && qData !== null) {
                                    answer = qData.correct_answer || qData.answer;
                                } else {
                                    answer = qData;
                                }

                                if (answer) {
                                    // Store with both string and number keys to ensure compatibility
                                    const qNumStr = String(qNum);
                                    const qNumNum = Number(qNum);
                                    const answerStr = String(answer).trim();
                                    loadedAnswers[qNumStr] = answerStr;
                                    loadedAnswers[qNumNum] = answerStr;
                                }
                            },
                        );
                        console.log("Loaded answers 33-35:", loadedAnswers);
                        setAnswers((prev) => ({ ...prev, ...loadedAnswers }));
                    }

                    // Load answers for questions 1-50 (Atestatsiya test)
                    if (results.questions_1_50) {
                        const loadedAnswers = {};
                        Object.entries(results.questions_1_50).forEach(
                            ([qNum, qData]) => {
                                // Handle multiple formats:
                                // 1. { correct_answer: "A" }
                                // 2. { answer: "A" }
                                // 3. Direct value "A"
                                let answer = null;
                                if (typeof qData === "object" && qData !== null) {
                                    answer = qData.correct_answer || qData.answer;
                                } else {
                                    answer = qData;
                                }

                                if (answer) {
                                    // Store with both string and number keys to ensure compatibility
                                    const qNumStr = String(qNum);
                                    const qNumNum = Number(qNum);
                                    const answerStr = String(answer).trim();
                                    loadedAnswers[qNumStr] = answerStr;
                                    loadedAnswers[qNumNum] = answerStr;
                                }
                            },
                        );
                        console.log("Loaded answers 1-50:", loadedAnswers);
                        setAnswers((prev) => ({ ...prev, ...loadedAnswers }));
                    }

                    // Load answers for questions 36-45
                    if (results.questions_36_45) {
                        console.log("Loading questions 36-45:", results.questions_36_45);

                        // Load scores for questions 36-45 if they exist
                        if (results.questions_36_45.questions) {
                            const loadedScores = {};
                            Object.entries(results.questions_36_45.questions).forEach(
                                ([qNum, qData]) => {
                                    if (qData && typeof qData === "object") {
                                        // For image mode: single score per question
                                        if (qData.score !== undefined) {
                                            loadedScores[String(qNum)] = parseFloat(qData.score) || 0;
                                        }
                                        // For write mode: points array - sum them up
                                        if (qData.points && Array.isArray(qData.points)) {
                                            const totalScore = qData.points.reduce((sum, point) => sum + (parseFloat(point) || 0), 0);
                                            loadedScores[String(qNum)] = totalScore;
                                        }
                                    } else if (typeof qData === "number") {
                                        // Direct score value
                                        loadedScores[String(qNum)] = parseFloat(qData) || 0;
                                    }
                                },
                            );
                            if (Object.keys(loadedScores).length > 0) {
                                console.log("Loaded scores 36-45:", loadedScores);
                                setScores(loadedScores);
                            }
                        }

                        if (results.questions_36_45.mode === "image") {
                            // Load images if mode is image
                            if (results.questions_36_45.images) {
                                const loadedImages = {};

                                // Function to get image URL from upload_id
                                const getImageUrl = async (uploadId) => {
                                    try {
                                        // Try to fetch image URL from API
                                        const { data } = await axiosClient.get(`/uploads/${uploadId}/url`);
                                        return data.url || data.image_url || null;
                                    } catch (error) {
                                        console.error(`Error fetching image URL for upload_id ${uploadId}:`, error);
                                        // Fallback: construct URL if API endpoint doesn't exist
                                        // Adjust this based on your backend structure
                                        return `${axiosClient.defaults.baseURL}/storage/uploads/${uploadId}`;
                                    }
                                };

                                // Process images - handle upload_id
                                const processImages = async () => {
                                    const imagePromises = Object.entries(results.questions_36_45.images).map(
                                        async ([qNum, imageData]) => {
                                            let imageUrl = null;

                                            if (typeof imageData === "string") {
                                                // Direct base64 string or URL
                                                imageUrl = imageData;
                                            } else if (imageData?.url) {
                                                // Object with url property (already processed by backend)
                                                imageUrl = imageData.url;
                                            } else if (imageData?.image_url) {
                                                // Object with image_url property
                                                imageUrl = imageData.image_url;
                                            } else if (imageData?.image) {
                                                // Object with image property
                                                imageUrl = imageData.image;
                                            } else if (imageData?.upload_id) {
                                                // Object with upload_id - need to fetch URL
                                                imageUrl = await getImageUrl(imageData.upload_id);
                                            }

                                            return { qNum, imageUrl };
                                        }
                                    );

                                    const processedImages = await Promise.all(imagePromises);
                                    processedImages.forEach(({ qNum, imageUrl }) => {
                                        if (imageUrl) {
                                            loadedImages[String(qNum)] = imageUrl;
                                        }
                                    });

                                    console.log("Loaded images:", loadedImages);
                                    setUploadedImages(loadedImages);
                                };

                                await processImages();
                            }
                        } else if (results.questions_36_45.mode === "write") {
                            // Load text answers if mode is write
                            if (results.questions_36_45.answers) {
                                const loadedTextAnswers = {};
                                Object.entries(results.questions_36_45.answers).forEach(
                                    ([qNum, answerData]) => {
                                        // Handle both direct object format and nested format
                                        if (typeof answerData === "object" && answerData !== null && !Array.isArray(answerData)) {
                                            // It's already an object with variant indices
                                            loadedTextAnswers[String(qNum)] = answerData;
                                        } else if (Array.isArray(answerData)) {
                                            // Array format, convert to object
                                            const answerObj = {};
                                            answerData.forEach((val, idx) => {
                                                answerObj[idx] = val;
                                            });
                                            loadedTextAnswers[String(qNum)] = answerObj;
                                        } else {
                                            // Single answer value, convert to object format
                                            loadedTextAnswers[String(qNum)] = { 0: answerData };
                                        }
                                    },
                                );
                                console.log("Loaded text answers:", loadedTextAnswers);
                                setTextAnswers(loadedTextAnswers);
                            }
                        }
                    }

                    // If we loaded previous answers, mark that user has submitted
                    // But allow editing if test is still active and not in read-only mode
                    if (isReadOnly) {
                        setIsSubmitted(true);
                    }

                    console.log("Successfully loaded all previous answers");
                } else {
                    console.log("No previous answers found for test:", testCode);
                }
            } catch (error) {
                console.error("Avvalgi javoblarni yuklashda xatolik:", error);
                console.error("Error details:", error.response?.data);
                // Silent fail - don't show error if no previous answers exist
            } finally {
                setLoadingAnswers(false);
            }
        };

        loadPreviousAnswers();
    }, [testData, user, fetchUserTestAnswers, isReadOnly]);

    // Spinner
    if (loading || loadingAnswers) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!testData) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-700">
                Test topilmadi.
            </div>
        );
    }

    const { name, code, details, start_time, end_time, type } = testData;

    // Test turini aniqlash
    const isAtestatsiyaTest = type === TestTypeEnum.ATTESTATSIYA;

    // Savollar ro'yxatini test turiga qarab olish
    const allQuestions = isAtestatsiyaTest
        ? (details.questions_1_50 || {})
        : {
            ...details.questions_1_32,
            ...details.questions_33_35,
        };

    // Test type ni backend formatiga o'tkazish funksiyasi
    // Backend TestTypeEnum integer qiymatlarini kutadi: 100, 200, 300, 400, 500
    const getTestTypeForBackend = (type) => {
        // Agar integer bo'lsa, to'g'ridan-to'g'ri qaytarish
        if (typeof type === "number") {
            // TestTypeEnum qiymatlarini tekshirish
            if ([
                TestTypeEnum.RASH_TEST,
                TestTypeEnum.OCHIQ_TEST,
                TestTypeEnum.YOPIQ_TEST,
                TestTypeEnum.BLOK_TEST,
                TestTypeEnum.ATTESTATSIYA
            ].includes(type)) {
                return type;
            }
            return TestTypeEnum.RASH_TEST; // Default
        }
        // Agar string bo'lsa, TestTypeEnum ga o'tkazish
        if (typeof type === "string") {
            const normalizedType = type.toLowerCase().trim();
            const typeMap = {
                "rash": TestTypeEnum.RASH_TEST,
                "blok": TestTypeEnum.BLOK_TEST,
                "ochiq-test": TestTypeEnum.OCHIQ_TEST,
                "ochiq": TestTypeEnum.OCHIQ_TEST,
                "yopiq-test": TestTypeEnum.YOPIQ_TEST,
                "yopiq": TestTypeEnum.YOPIQ_TEST,
                "atestatsiya": TestTypeEnum.ATTESTATSIYA,
                "atestat": TestTypeEnum.ATTESTATSIYA, // Alias for compatibility
            };
            return typeMap[normalizedType] || TestTypeEnum.RASH_TEST;
        }
        return TestTypeEnum.RASH_TEST; // Default
    };

    // Test holatlari uchun qisqa o'zgaruvchilar
    const isTestNotStarted = testStatus === "waiting";
    const isTestExpired = testStatus === "expired";
    const isTestActive = testStatus === "active";

    const handleAnswerSelect = (questionId, answer) => {
        if (isReadOnly) {
            return; // Don't allow changes in read-only mode
        }

        if (!isTestActive) {
            toast.warning(
                isTestExpired
                    ? "Test vaqti tugagan! Javob yuborib bo'lmaydi."
                    : "Test hali boshlanmagan!",
                {
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
                },
            );
            return;
        }

        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    // Yozma javoblarni saqlash
    const handleTextAnswerChange = (questionNum, variantIndex, value) => {
        if (isReadOnly) {
            return; // Don't allow changes in read-only mode
        }

        if (!isTestActive) {
            toast.warning(
                isTestExpired
                    ? "Test vaqti tugagan! Javob yuborib bo'lmaydi."
                    : "Test hali boshlanmagan!",
                {
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
                },
            );
            return;
        }

        setTextAnswers((prev) => ({
            ...prev,
            [questionNum]: {
                ...prev[questionNum],
                [variantIndex]: value,
            },
        }));
    };

    // Variantlar sonini aniqlash funksiyasi
    const getOptionsForQuestion = (questionNum) => {
        const num = Number(questionNum);
        // Atestatsiya testida barcha savollar 4 ta variantli
        if (isAtestatsiyaTest) {
            return ["A", "B", "C", "D"];
        }
        // DTM testida 33-35 savollar 6 ta variantli
        if (num >= 33 && num <= 35) {
            return ["A", "B", "C", "D", "E", "F"];
        }
        return ["A", "B", "C", "D"];
    };

    const answeredCount =
        Object.keys(answers).length +
        Object.keys(uploadedImages).length +
        Object.keys(textAnswers).length;

    // Total questions - test turiga qarab
    const totalQuestions = isAtestatsiyaTest
        ? 50 // Atestatsiya testida 50 ta savol
        : Object.keys(allQuestions).length + 10; // DTM testida 1-32, 33-35, 36-45

    const progressPercentage = Math.round(
        (answeredCount / totalQuestions) * 100,
    );

    // handleSubmit funksiyasi
    const handleSubmit = async () => {
        if (isTestExpired) {
            toast.error("Test vaqti tugagan!", {
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

        if (isTestNotStarted) {
            toast.warning("Test hali boshlanmagan!", {
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

        const totalAnswered =
            Object.keys(answers).length +
            Object.keys(uploadedImages).length +
            Object.keys(textAnswers).length;

        if (totalAnswered === 0) {
            toast.error("Hech qanday javob belgilanmagan!", {
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

        // if (totalAnswered < totalQuestions) {
        //     const confirmSubmit = window.confirm(
        //         `Siz ${totalQuestions} ta savoldan faqat ${totalAnswered} tasiga javob berdingiz. Baribir yuborasizmi?`,
        //     );
        //     if (!confirmSubmit) return;
        // }

        // Calculate duration in minutes
        let duration = 0; // Default value
        if (startTime) {
            const start = new Date(startTime);
            const end = new Date();
            const diffMs = end - start;
            duration = Math.round(diffMs / 60000); // Convert to minutes
        }

        // Test turiga qarab submission data tayyorlash
        let submissionData;

        if (isAtestatsiyaTest) {
            // Atestatsiya test uchun
            const questions_1_50 = {};
            Object.entries(answers).forEach(([id, answer]) => {
                const qid = Number(id);
                if (qid >= 1 && qid <= 50) {
                    questions_1_50[qid] = { correct_answer: answer };
                }
            });

            submissionData = {
                test_code: code,
                user_id: user[0]?.bot_user?.user_id,
                duration: duration,
                results: {
                    type: getTestTypeForBackend(type),
                    questions_1_50,
                },
            };
        } else {
            // DTM test uchun
            const questions_1_32 = {};
            const questions_33_35 = {};

            Object.entries(answers).forEach(([id, answer]) => {
                const qid = Number(id);
                if (qid >= 1 && qid <= 32)
                    questions_1_32[qid] = { correct_answer: answer };
                else if (qid >= 33 && qid <= 35)
                    questions_33_35[qid] = { correct_answer: answer };
            });

            const questions36_45 =
                details.questions_36_45?.mode === "image"
                    ? {
                        mode: "image",
                        images: uploadedImages,
                    }
                    : {
                        mode: "write",
                        answers: textAnswers,
                    };

            submissionData = {
                test_code: code,
                user_id: user[0]?.bot_user?.user_id,
                duration: duration,
                results: {
                    type: getTestTypeForBackend(type),
                    questions_1_32,
                    questions_33_35,
                    questions_36_45: questions36_45,
                },
            };
        }
        console.log("Submission data:", submissionData);

        try {
            await axiosClient.post("/tests/save", submissionData);
            setIsSubmitted(true);
            refreshTestResults();
            toast.success(
                "Javoblar muvaffaqiyatli yuborildi, Tez orada natijalaringizni ko'rishingiz mumkin!",
                {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    className: "toast-width my-2",
                },
            );

            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (error) {
            console.error("Yuborishda xatolik:", error);
            toast.error("Yuborishda xatolik yuz berdi!", {
                position: "top-center",
                autoClose: 2000,
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

    const render36_45Questions = () => {
        // Atestatsiya testida 36-45 savollar yo'q
        if (isAtestatsiyaTest) {
            return null;
        }

        const q36_45 = details.questions_36_45;

        // Agar questions_36_45 mavjud bo'lmasa, null qaytar
        if (!q36_45) {
            return null;
        }

        if (q36_45.mode === "image") {
            return (
                <div className="space-y-4 mb-24">
                    {Array.from({ length: 10 }, (_, i) => 36 + i).map((num) => {
                        const numStr = String(num);
                        const imageSrc = uploadedImages[numStr] || uploadedImages[num];
                        return (
                            <div
                                key={num}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center"
                            >
                                <div className="flex justify-between items-center w-full mb-3">
                                    <h3 className="font-semibold text-gray-800">
                                        {num}-savol
                                    </h3>
                                    {isReadOnly && scores[num] !== undefined && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                            Ball: {scores[num]}
                                        </span>
                                    )}
                                </div>
                                {imageSrc ? (
                                    <img
                                        src={imageSrc}
                                        alt={`Savol ${num}`}
                                        className="w-48 h-48 object-cover rounded-lg border mb-3"
                                        onError={(e) => {
                                            console.error(`Image load error for question ${num}:`, imageSrc);
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                {!imageSrc && (
                                    <div className="w-48 h-48 bg-gray-100 border rounded-lg mb-3 flex items-center justify-center text-gray-400">
                                        Rasm yo'q
                                    </div>
                                )}
                                <button
                                    onClick={() => handleOpenCamera(num)}
                                    className="px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    <Camera size={18} /> Rasmga olish
                                </button>
                            </div>
                        );
                    })}
                </div>
            );
        } else if (q36_45.mode === "write") {
            return (
                <div className="space-y-4 mb-24">
                    {Object.entries(q36_45.questions).map(([qNum, qData]) => {
                        const variantCount = qData.variant_count || 1;
                        return (
                            <div
                                key={qNum}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-gray-800">
                                        {qNum}-savol (Yozma)
                                        <span className="ml-2 text-xs text-purple-600 font-normal">
                                            ({variantCount} ta variant)
                                        </span>
                                    </h3>
                                    {isReadOnly && scores[qNum] !== undefined && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                            Ball: {scores[qNum]}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {Array.from(
                                        { length: variantCount },
                                        (_, i) => (
                                            <div key={i}>
                                                <label className="block text-sm text-gray-600 mb-1">
                                                    Variant {i + 1}:
                                                </label>
                                                <textarea
                                                    value={
                                                        textAnswers[qNum]?.[
                                                        i
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleTextAnswerChange(
                                                            qNum,
                                                            i,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={`${qNum}-savol, ${i + 1}-variant javobini kiriting...`}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                                                    rows={3}
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return null;
    };

    // Kamera funksiyalari
    const handleOpenCamera = async (qNumber) => {
        if (!isTestActive) {
            toast.warning(
                isTestExpired
                    ? "Test vaqti tugagan!"
                    : "Test hali boshlanmagan!",
                {
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
                }
            );
            return;
        }

        setCurrentImageQuestion(qNumber);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            setCameraStream(stream);
            setShowCamera(true);
            setTimeout(() => {
                if (videoRef.current) videoRef.current.srcObject = stream;
            }, 100);
        } catch (err) {
            alert("Kamera ruxsatini bering: " + err.message);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL("image/jpeg");
            setCapturedImage(imageData);
        }
    };

    const handleSaveImage = () => {
        if (capturedImage && currentImageQuestion) {
            setUploadedImages((prev) => ({
                ...prev,
                [String(currentImageQuestion)]: capturedImage,
            }));
            handleCloseCamera();
        }
    };

    const handleCloseCamera = () => {
        if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
        setShowCamera(false);
        setCapturedImage(null);
        setCurrentImageQuestion(null);
    };

    // Test boshlanganda chaqiriladigan callback
    const handleTestStart = () => {
        setTestStatus("active");
        toast.success("🎉 Test boshlandi! Javoblarni jo'natishingiz mumkin.", {
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
    };

    // Test vaqti tugaganda chaqiriladigan callback
    const handleTestExpire = () => {
        setTestStatus("expired");
        toast.error("⏰ Test vaqti tugadi! Endi javob yuborib bo'lmaydi.", {
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
    };

    // Kamera modal
    const CameraModal = () => (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="bg-gray-900 px-4 py-4 flex items-center justify-between">
                <h2 className="text-white text-lg font-semibold">
                    Rasmga olish
                </h2>
                <button onClick={handleCloseCamera} className="text-white">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 relative bg-black">
                {!capturedImage ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                            <button
                                onClick={handleCapture}
                                className="w-16 h-16 rounded-full bg-blue-500 border-4 border-white shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                            >
                                <Camera size={28} className="text-white" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
                            <button
                                onClick={() => setCapturedImage(null)}
                                className="flex-1 max-w-xs py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                            >
                                Qayta olish
                            </button>
                            <button
                                onClick={handleSaveImage}
                                className="flex-1 max-w-xs py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                            >
                                Saqlash
                            </button>
                        </div>
                    </>
                )}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );

    // Countdown uchun rang
    const getCountdownBgClass = () => {
        if (isTestExpired) return "bg-red-100 border-red-300";
        if (isTestActive) return "bg-green-100 border-green-300";
        return "bg-yellow-100 border-yellow-300";
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <TopHeader testName={name} />
            {showCamera && <CameraModal />}

            <div className="px-4 py-4">
                {/* Read-only mode warning */}
                {isReadOnly && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
                        <p className="text-yellow-800 text-sm font-medium text-center">
                            📋 Bu testni allaqachon topshirgansiz. Javoblarni ko'rish rejimidasiz.
                        </p>
                    </div>
                )}
                {/* Test info - faqat yangi test uchun */}
                {!isReadOnly && (
                    <>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <span className="text-gray-600 text-sm">
                                        Test kodi:{" "}
                                    </span>
                                    <span className="text-orange-500 font-bold">
                                        {code}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-blue-600 font-bold text-lg">
                                        {answeredCount} / {totalQuestions}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 text-right">
                                {progressPercentage}% tayyor
                            </p>
                        </div>

                        {/* Countdown Timer - faqat yangi test uchun */}
                        <div
                            className={`p-3 rounded-lg mb-4 border ${getCountdownBgClass()}`}
                        >
                            <CountdownTimer
                                startTime={start_time}
                                endTime={end_time}
                                onStart={handleTestStart}
                                onExpire={handleTestExpire}
                            />
                        </div>
                    </>
                )}

                {/* Variantli savollar */}
                <div className="space-y-4 mb-8">
                    {Object.entries(allQuestions).map(([num, q]) => {
                        const options = getOptionsForQuestion(num);
                        const gridCols =
                            options.length === 6
                                ? "grid-cols-3"
                                : "grid-cols-4";

                        // Get answer for this question - try all possible key formats
                        const numStr = String(num);
                        const numNum = Number(num);
                        const selectedAnswer = answers[numStr] || answers[numNum] || answers[String(numNum)] || answers[Number(numStr)];

                        return (
                            <div
                                key={num}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                            >
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    {num}-savol
                                    {!isAtestatsiyaTest && Number(num) >= 33 && Number(num) <= 35 && (
                                        <span className="ml-2 text-xs text-blue-600 font-normal">
                                            (6 ta variant)
                                        </span>
                                    )}
                                </h3>
                                <div className={`grid ${gridCols} gap-2`}>
                                    {options.map((opt) => {
                                        // Compare selectedAnswer with opt (case-insensitive and type-safe)
                                        const isSelected = selectedAnswer &&
                                            String(selectedAnswer).toUpperCase().trim() === String(opt).toUpperCase().trim();

                                        return (
                                            <button
                                                key={opt}
                                                onClick={() =>
                                                    handleAnswerSelect(num, opt)
                                                }
                                                className={`py-2.5 rounded-lg font-medium text-sm transition-all ${isSelected
                                                    ? "bg-blue-500 text-white shadow-md"
                                                    : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Rasmli yoki textli savollar - faqat DTM test uchun */}
                {!isAtestatsiyaTest && render36_45Questions()}

                {/* TEST UCHUN*/}
                {
                    !isReadOnly && !isSubmitted && !isTestNotStarted && !isTestExpired ? (
                        <button
                            onClick={handleSubmit}
                            className="w-full cursor-pointer mb-24 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                        >
                            📤 Javoblarni yuborish
                        </button>
                    ) :
                        (
                            <button
                                onClick={() => navigate("/")}
                                className="w-full cursor-pointer mb-24 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                            >
                                🏠 Asosiy sahifaga qaytish
                            </button>
                        )
                }
                {/* END TEST UCHUN*/}

                <BottomBar bgColor="#ffffff">
                    {
                        !isReadOnly && !isSubmitted && isTestActive ? (
                            <MainButton
                                color="#2b7fff"
                                textColor="#ffffff"
                                text="📤 Javoblarni yuborish"
                                progress={false}
                                onClick={handleSubmit}
                            />
                        ) : (
                            <MainButton
                                color="#2b7fff"
                                textColor="#ffffff"
                                text="🏠 Asosiy sahifaga qaytish"
                                progress={false}
                                onClick={() => navigate("/")}
                            />
                        )
                    }
                    <BackButton onClick={() => window.history.back()} />
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
                    className="w-1/2"
                />
            </div>
        </div>
    );
};
