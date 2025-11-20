import { useState, useEffect, useRef } from "react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import { Camera, X } from "lucide-react";
import { TopHeader } from "../../components/ui";
import axiosClient from "../../api/axios-client";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomBar, MainButton } from "@twa-dev/sdk/react";
import { CountdownTimer } from "../../components/CountDownTimer";

export const TestTakingPage = () => {
    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState(null);
    // const [timeRemaining, setTimeRemaining] = useState(null);
    const [answers, setAnswers] = useState({});
    const [uploadedImages, setUploadedImages] = useState({});
    const [textAnswers, setTextAnswers] = useState({});
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [currentImageQuestion, setCurrentImageQuestion] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isTestExpired, setIsTestExpired] = useState(false); // ✅ Test vaqti tugashi
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const navigate = useNavigate();
    const { state } = useLocation();
    const testId = state?.testId;

    // Testni yuklash
    useEffect(() => {
        const fetchTest = async () => {
            try {
                const { data } = await axiosClient.get(`/tests/${testId}`);
                setTestData(data.test);

                // Test vaqti tugagan yoki yo'qligini tekshirish
                const endTime = new Date(data.test.end_time).getTime();
                const now = new Date().getTime();
                if (now > endTime) {
                    setIsTestExpired(true);
                }
            } catch (error) {
                console.error("Test yuklashda xatolik:", error);
                toast.error("Test ma'lumotlarini yuklashda xatolik!");
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId]);

    // Spinner
    if (loading) {
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

    const { name, code, details, start_time, end_time } = testData;

    const allQuestions = {
        ...details.questions_1_32,
        ...details.questions_33_35,
    };

    const isTestNotStarted =
        new Date().getTime() < new Date(start_time).getTime();

    const handleAnswerSelect = (questionId, answer) => {
        // Agar test vaqti tugagan bo'lsa, javob tanlashga ruxsat berma
        if (isTestExpired) {
            toast.warning("Test vaqti tugagan! Javob yuborib bo'lmaydi.");
            return;
        }

        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    // Yozma javoblarni saqlash
    const handleTextAnswerChange = (questionNum, variantIndex, value) => {
        if (isTestExpired) {
            toast.warning("Test vaqti tugagan! Javob yuborib bo'lmaydi.");
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
        if (num >= 33 && num <= 35) {
            return ["A", "B", "C", "D", "E", "F"];
        }
        return ["A", "B", "C", "D"];
    };

    const answeredCount =
        Object.keys(answers).length +
        Object.keys(uploadedImages).length +
        Object.keys(textAnswers).length;

    const totalQuestions = Object.keys(allQuestions).length + 10;
    const progressPercentage = Math.round(
        (answeredCount / totalQuestions) * 100,
    );

    // handleSubmit funksiyasini yangilash
    const handleSubmit = async () => {
        // Agar test vaqti tugagan bo'lsa
        if (isTestExpired) {
            toast.error("Test vaqti tugagan! Javob yuborib bo'lmaydi.");
            return;
        }

        // Agar test hali boshlanmagan bo'lsa
        if (isTestNotStarted) {
            toast.warning("Test hali boshlanmagan!");
            return;
        }

        const totalAnswered =
            Object.keys(answers).length +
            Object.keys(uploadedImages).length +
            Object.keys(textAnswers).length;

        if (totalAnswered === 0) {
            toast.error("Hech qanday javob belgilanmagan!");
            return;
        }

        if (totalAnswered < totalQuestions) {
            const confirmSubmit = window.confirm(
                `Siz ${totalQuestions} ta savoldan faqat ${totalAnswered} tasiga javob berdingiz. Baribir yuborasizmi?`,
            );
            if (!confirmSubmit) return;
        }

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
            details.questions_36_45.mode === "image"
                ? {
                      mode: "image",
                      images: uploadedImages,
                  }
                : {
                      mode: "write",
                      answers: textAnswers,
                  };

        const submissionData = {
            type: details.type,
            questions_1_32,
            questions_33_35,
            questions_36_45: questions36_45,
        };

        try {
            await axiosClient.post("/tests/save", submissionData);
            console.log(submissionData);
            setIsSubmitted(true);
            toast.success("Javoblar muvaffaqiyatli yuborildi!", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Zoom,
            });
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
                transition: Zoom,
            });
        }
    };

    const render36_45Questions = () => {
        const q36_45 = details.questions_36_45;

        if (q36_45.mode === "image") {
            return (
                <div className="space-y-4 mb-24">
                    {Array.from({ length: 10 }, (_, i) => 36 + i).map((num) => (
                        <div
                            key={num}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center"
                        >
                            <h3 className="font-semibold text-gray-800 mb-3">
                                {num}-savol
                            </h3>
                            {uploadedImages[num] ? (
                                <img
                                    src={uploadedImages[num]}
                                    alt={`Savol ${num}`}
                                    className="w-48 h-48 object-cover rounded-lg border mb-3"
                                />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 border rounded-lg mb-3 flex items-center justify-center text-gray-400">
                                    Rasm yo'q
                                </div>
                            )}
                            <button
                                onClick={() =>
                                    !isTestExpired && handleOpenCamera(num)
                                }
                                disabled={isTestExpired}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                    isTestExpired
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-500 text-white hover:bg-blue-700"
                                }`}
                            >
                                <Camera size={18} /> Rasmga olish
                            </button>
                        </div>
                    ))}
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
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    {qNum}-savol (Yozma)
                                    <span className="ml-2 text-xs text-purple-600 font-normal">
                                        ({variantCount} ta variant)
                                    </span>
                                </h3>
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
                                                    disabled={isTestExpired}
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
        if (isTestExpired) {
            toast.warning("Test vaqti tugagan!");
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
                [currentImageQuestion]: capturedImage,
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

    // Test vaqti tugaganda chaqiriladigan callback
    const handleTestExpire = () => {
        setIsTestExpired(true);
        toast.error("⏰ Test vaqti tugadi! Endi javob yuborib bo'lmaydi.", {
            position: "top-center",
            autoClose: false,
            theme: "light",
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
                                className="w-16 h-16 rounded-full bg-blue-500 border-4 border-white shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
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
                                className="flex-1 max-w-xs py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
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

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <TopHeader testName={name} />
            {showCamera && <CameraModal />}

            <div className="px-4 py-4">
                {/* Test info */}
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

                {/* Test hali boshlanmagan yoki tugagan */}
                {(isTestNotStarted || isTestExpired) && (
                    <div
                        className={`${isTestExpired ? "bg-red-100 border-red-300" : "bg-yellow-100 border-yellow-300"} p-3 rounded-lg mb-4 border`}
                    >
                        <CountdownTimer
                            deadline={isTestExpired ? end_time : start_time}
                            onExpire={isTestExpired ? null : handleTestExpire}
                        />
                    </div>
                )}

                {/* Variantli savollar */}
                <div className="space-y-4 mb-8">
                    {Object.entries(allQuestions).map(([num, q]) => {
                        const options = getOptionsForQuestion(num);
                        const gridCols =
                            options.length === 6
                                ? "grid-cols-3"
                                : "grid-cols-4";

                        return (
                            <div
                                key={num}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                            >
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    {num}-savol
                                    {Number(num) >= 33 && Number(num) <= 35 && (
                                        <span className="ml-2 text-xs text-blue-600 font-normal">
                                            (6 ta variant)
                                        </span>
                                    )}
                                </h3>
                                <div className={`grid ${gridCols} gap-2`}>
                                    {options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() =>
                                                handleAnswerSelect(num, opt)
                                            }
                                            disabled={isTestExpired}
                                            className={`py-2.5 rounded-lg font-medium text-sm transition-all ${
                                                isTestExpired
                                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                    : answers[num] === opt
                                                      ? "bg-blue-500 text-white shadow-md"
                                                      : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Rasmli yoki textli savollar */}
                {render36_45Questions()}

                {/* TEST UCHUN*/}
                {!isSubmitted && !isTestNotStarted && !isTestExpired ? (
                    <button
                        onClick={handleSubmit}
                        className="w-full cursor-pointer mb-24 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        📤 Javoblarni yuborish
                    </button>
                ) : (
                    <button
                        onClick={() => navigate("/")}
                        className="w-full cursor-pointer mb-24 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                    >
                        🏠 Asosiy sahifaga qaytish
                    </button>
                )}
                {/* END TEST UCHUN*/}

                <BottomBar bgColor="#000000">
                    {!isSubmitted && !isTestNotStarted && !isTestExpired ? (
                        <MainButton
                            color="#2563eb"
                            textColor="#ffffff"
                            text="📤 Javoblarni yuborish"
                            progress={false}
                            onClick={handleSubmit}
                        />
                    ) : (
                        <MainButton
                            color="#438ea4"
                            textColor="#ffffff"
                            text="🏠 Asosiy sahifaga qaytish"
                            progress={false}
                            onClick={() => navigate("/")}
                        />
                    )}
                </BottomBar>

                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    transition={Zoom}
                />
            </div>
        </div>
    );
};
