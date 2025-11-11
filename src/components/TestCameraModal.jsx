import { Camera } from "lucide-react"

export const TestCameraModal = () => {

    return (
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
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
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
                                className="flex-1 max-w-xs py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                            >
                                Saqlash
                            </button>
                        </div>
                    </>
                )}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    )
}