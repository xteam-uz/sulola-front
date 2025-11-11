import { useState, useEffect, useRef } from "react";
import { Camera, } from "lucide-react";
import { CountdownTimer, TestHeader, TestCameraModal } from "../../components";
import axiosClient from "../../api/axios-client";
import { toast, ToastContainer, Zoom } from "react-toastify";


export const TestTakingPage = () => {
    const [testCode] = useState("37687C");
    const [testName] = useState("Yangi");
    const [totalQuestions] = useState(35);
    const [timeRemaining, setTimeRemaining] = useState(85541);
    const [answers, setAnswers] = useState({});
    const [testStarted, setTestStarted] = useState(false);
    const [testStatus, setTestStatus] = useState("not_started");
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [currentImageQuestion, setCurrentImageQuestion] = useState(null);
    const [uploadedImages, setUploadedImages] = useState({});
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const testInfo = {
        instructions: "Quyidagi 4 ta rasm yuklang: 36-40 savollar uchun bitta, 41-42-43 masalalar uchun har biriga bittadan savollar javoblarini yozib, rasmga olib yuklang:",
        imageQuestions: [
            { id: 1, label: "36-40 savollar uchun rasm" },
            { id: 2, label: "41-masala uchun rasm" },
            { id: 3, label: "42-masala uchun rasm" },
            { id: 4, label: "43-masala uchun rasm" }
        ]
    };

    const questions = Array.from({ length: 35 }, (_, i) => ({
        id: i + 1,
        number: i + 1,
        type: "multiple_choice",
        options: ["A", "B", "C", "D"]
    }));

    useEffect(() => {
        if (!testStarted || testStatus !== "active") return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    setTestStatus("expired");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [testStarted, testStatus]);

    const formatTime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (days > 0) {
            return `${days} kun, ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const answeredCount = Object.keys(answers).length;
    const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

    const handleStartTest = () => {
        setTestStarted(true);
        setTestStatus("active");
    };

    const handleSubmit = async () => {
        if (answeredCount === 0) {
            alert("Test boshlanmagan, javob jo'natish mumkin emas");
            return;
        }

        try {
            // Javoblar va rasm fayllarini birlashtirish
            const submissionData = {
                answers,
                images: uploadedImages
            };

            console.log("Submitting data:", submissionData);

            const response = await axiosClient.post('/tests/submit', submissionData);

            toast.success("Javoblar yuborildi!", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Zoom,
            });

            console.log("Server response:", response.data);
            // alert(`${answeredCount} ta javob va ${Object.keys(uploadedImages).length} ta rasm yuborildi!`);
        } catch (error) {
            console.error("Submission error:", error);
        }
    };



    // Kamera funksiyalari
    const handleOpenCamera = async (questionItem) => {
        setCurrentImageQuestion(questionItem);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setCameraStream(stream);
            setShowCamera(true);

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            alert("Kamera ruxsatini bering: " + err.message);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);

            const imageData = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageData);
        }
    };

    const handleSaveImage = () => {
        if (capturedImage && currentImageQuestion) {
            setUploadedImages(prev => ({
                ...prev,
                [currentImageQuestion.id]: capturedImage
            }));
            handleCloseCamera();
        }
    };

    const handleCloseCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
        setCapturedImage(null);
        setCurrentImageQuestion(null);
    };



    if (!testStarted) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <TestHeader testName={testName} />

                {showCamera && <TestCameraModal />}

                <div className="px-4 py-4">
                    <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                        <div className="flex items-center">
                            <span className="text-gray-600 text-sm">Test kodi:</span>
                            <span className="text-orange-500 text-lg ml-2">{testCode}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-600 text-lg">
                                0 / {totalQuestions}
                            </span>
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-2xl p-4 border border-red-200 mb-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                !
                            </div>
                            <div className="flex-1">
                                <CountdownTimer />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 mb-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Ko'rsatma:</h3>
                        <p className="text-sm text-blue-800">
                            1-35 javoblarni belgilang.<br />
                            1-35 savollarni tugallaganidan so'ng, savollarning javobini rasmga olib yuklang.
                        </p>
                    </div>

                    <div className="space-y-4 mb-4">
                        {questions.slice(0, 4).map((question) => (
                            <div key={question.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-3">{question.number}-savol</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {question.options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleAnswerSelect(question.id, option)}
                                            className={`py-2.5 rounded-lg font-medium text-sm transition-all ${answers[question.id] === option
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-green-50 rounded-2xl p-4 border border-green-200 mb-4">
                        <h3 className="font-semibold text-green-900 mb-2">
                            Yozma javoblarni rasmga olish
                        </h3>
                        <p className="text-sm text-green-800 mb-4">
                            {testInfo.instructions}
                        </p>

                        <div className="space-y-3">
                            {testInfo.imageQuestions.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl p-4 border border-green-200">
                                    <p className="text-sm text-gray-700 mb-3">{item.label}</p>
                                    {uploadedImages[item.id] ? (
                                        <div className="space-y-2">
                                            <img
                                                src={uploadedImages[item.id]}
                                                alt="Uploaded"
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => handleOpenCamera(item)}
                                                className="flex items-center justify-center space-x-2 w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <Camera size={18} />
                                                <span className="text-sm font-medium">O'zgartirish</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleOpenCamera(item)}
                                            className="flex items-center justify-center space-x-2 w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Camera size={18} />
                                            <span className="text-sm font-medium">Rasmga olish</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-16">
                        <button
                            onClick={handleSubmit}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-colors"
                        >
                            Javoblarni jo'natish
                        </button>
                        <p className="text-center text-red-500 text-sm mt-2">
                            Test boshlanmagan, javob jo'natish mumkin emas
                        </p>
                        {/* <ToastContainer
                            position="bottom-center"
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
                        /> */}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <TopHeader testName={testName} />

            {showCamera && <TestCameraModal />}

            <div className="px-4 py-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <span className="text-gray-600 text-sm">Test kodi: </span>
                            <span className="text-orange-500 font-bold">{testCode}</span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-bold text-lg">
                                {answeredCount} / {totalQuestions}
                            </span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2">Jarayon:</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 text-right">{progressPercentage}% tayyor</p>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Ko'rsatma:</h3>
                    <p className="text-sm text-blue-800 mb-2">
                        1-35 javoblarni belgilang.<br />
                        1-35 savollarni tugallaganidan so'ng, savollarning javobini rasmga olib yuklang.
                    </p>
                </div>

                <div className="space-y-4 mb-24">
                    {questions.map((question) => (
                        <div key={question.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-3">{question.number}-savol</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {question.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswerSelect(question.id, option)}
                                        className={`py-2.5 rounded-lg font-medium text-sm transition-all ${answers[question.id] === option
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-green-50 rounded-2xl p-4 border border-green-200 mb-4">
                    <h3 className="font-semibold text-green-900 mb-2">
                        Yozma javoblarni rasmga olish
                    </h3>
                    <p className="text-sm text-green-800 mb-4">
                        {testInfo.instructions}
                    </p>

                    <div className="space-y-3">
                        {testInfo.imageQuestions.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl p-4 border border-green-200">
                                <p className="text-sm text-gray-700 mb-3">{item.label}</p>
                                {uploadedImages[item.id] ? (
                                    <div className="space-y-2">
                                        <img
                                            src={uploadedImages[item.id]}
                                            alt="Uploaded"
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleOpenCamera(item)}
                                            className="flex items-center justify-center space-x-2 w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <Camera size={18} />
                                            <span className="text-sm font-medium">O'zgartirish</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleOpenCamera(item)}
                                        className="flex items-center justify-center space-x-2 w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Camera size={18} />
                                        <span className="text-sm font-medium">Rasmga olish</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-12 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-colors"
                >
                    Javoblarni jo'natish
                </button>
                <ToastContainer
                    position="bottom-center"
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
                {answeredCount === 0 && (
                    <p className="text-center text-red-500 text-sm mt-2">
                        Test boshlanmagan, javob jo'natish mumkin emas
                    </p>
                )}
            </div>
        </div>
    );
}