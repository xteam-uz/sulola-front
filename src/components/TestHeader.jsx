import { ChevronLeft } from "lucide-react"
import { Link } from "react-router-dom"

export const TestHeader = ({ testName }) => {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Link to="/" className="text-white">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-white text-xl font-semibold">{testName}</h1>
                </div>
            </div>
        </div>
    )
}