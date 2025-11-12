import { useState, useEffect, useRef } from "react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import { Camera, X } from "lucide-react";
import { TopHeader } from "../../components/ui";
import axiosClient from "../../api/axios-client";
import { useLocation, useNavigate } from "react-router-dom";
import { ButtomBar, MainButton } from "@twa-dev/sdk/react"

export const TestTakingPage = () => {
    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [uploadedImages, setUploadedImages] = useState({});
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [currentImageQuestion, setCurrentImageQuestion] = useState(null);
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
                // console.log("Test ma'lumotlari:", data);
                setTestData(data.test);
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

    const { name, code, details } = testData;
    const allQuestions = {
        ...details.questions_1_32,
        ...details.questions_33_35,
    };

    const handleAnswerSelect = (questionId, answer) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = Object.keys(allQuestions).length + 10; // 36–45 rasmli qism ham qo‘shiladi
    const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

    // Javoblarni yuborish
    const handleSubmit = async () => {
        if (answeredCount === 0) {
            toast.error("Hech qanday javob belgilanmagan!");
            return;
        }

        const questions_1_32 = {};
        const questions_33_35 = {};

        Object.entries(answers).forEach(([id, answer]) => {
            const qid = Number(id);
            if (qid >= 1 && qid <= 32) questions_1_32[qid] = { correct_answer: answer };
            else if (qid >= 33 && qid <= 35) questions_33_35[qid] = { correct_answer: answer };
        });

        const submissionData = {
            type: details.type,
            questions_1_32,
            questions_33_35,
            questions_36_45: {
                mode: "image",
                images: uploadedImages,
            },
        };

        try {
            await axiosClient.post("/tests/save", submissionData);
            toast.success("Javoblar muvaffaqiyatli yuborildi!", { transition: Zoom });
            navigate("/");
        } catch (error) {
            console.error("Yuborishda xatolik:", error);
            toast.error("Yuborishda xatolik yuz berdi!", { transition: Zoom });
        }
    };

    // Kamera funksiyalari
    const handleOpenCamera = async (qNumber) => {
        setCurrentImageQuestion(qNumber);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

    // Kamera modal
    const CameraModal = () => (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="bg-gray-900 px-4 py-4 flex items-center justify-between">
                <h2 className="text-white text-lg font-semibold">Rasmga olish</h2>
                <button onClick={handleCloseCamera} className="text-white">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 relative bg-black">
                {!capturedImage ? (
                    <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                            <button
                                onClick={handleCapture}
                                className="w-16 h-16 rounded-full bg-blue-600 border-4 border-white shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                                <Camera size={28} className="text-white" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
                            <button
                                onClick={() => setCapturedImage(null)}
                                className="flex-1 max-w-xs py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                            >
                                Qayta olish
                            </button>
                            <button
                                onClick={handleSaveImage}
                                className="flex-1 max-w-xs py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
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
                            <span className="text-gray-600 text-sm">Test kodi: </span>
                            <span className="text-orange-500 font-bold">{code}</span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-bold text-lg">
                                {answeredCount} / {totalQuestions}
                            </span>
                        </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">{progressPercentage}% tayyor</p>
                </div>

                {/* Variantli savollar */}
                <div className="space-y-4 mb-8">
                    {Object.entries(allQuestions).map(([num, q]) => (
                        <div
                            key={num}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                        >
                            <h3 className="font-semibold text-gray-800 mb-3">
                                {num}-savol
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {["A", "B", "C", "D"].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleAnswerSelect(num, opt)}
                                        className={`py-2.5 rounded-lg font-medium text-sm transition-all ${answers[num] === opt
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Rasmli savollar */}
                <div className="space-y-4 mb-24">
                    {Array.from({ length: 10 }, (_, i) => 36 + i).map((num) => (
                        <div
                            key={num}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center"
                        >
                            <h3 className="font-semibold text-gray-800 mb-3">
                                {num}-savol (Rasm)
                            </h3>
                            {uploadedImages[num] ? (
                                <img
                                    src={uploadedImages[num]}
                                    alt={`Savol ${num}`}
                                    className="w-48 h-48 object-cover rounded-lg border mb-3"
                                />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 border rounded-lg mb-3 flex items-center justify-center text-gray-400">
                                    Rasm yo‘q
                                </div>
                            )}
                            <button
                                onClick={() => handleOpenCamera(num)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Camera size={18} /> Rasm olish
                            </button>
                        </div>
                    ))}
                </div>

                {/* Javob yuborish tugmasi */}
                {/* <div className="bottom-12 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-colors"
                    >
                        Javoblarni jo'natish
                    </button>
                </div> */}
                <ButtomBar bgColor="#2563EB">
                    <MainButton text="Javoblarni jo'natish" onClick={handleSubmit} />
                </ButtomBar>
            </div>
            <ToastContainer position="bottom-center" autoClose={5000} theme="light" transition={Zoom} />
        </div>
    );
};
