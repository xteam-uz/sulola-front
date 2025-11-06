import { Home, User2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export const FooterNavbar = () => {
    const location = useLocation();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 shadow-lg">
            <div className="flex items-center justify-around max-w-md mx-auto">
                <Link
                    to="/dashboard"
                    className={`flex flex-col items-center space-y-1 ${location.pathname === "/dashboard"
                        ? "text-blue-600"
                        : "text-gray-400 hover:text-blue-600"
                        }`}
                >
                    <Home size={20} />
                    <span className="text-xs font-medium">Bosh sahifa</span>
                </Link>
                <Link
                    to='/students'
                    className={`flex flex-col items-center space-y-1 ${location.pathname === "/students"
                        ? "text-blue-600"
                        : "text-gray-400 hover:text-blue-600"
                        }`}
                >
                    <User2 size={24} />
                    <span className="text-xs">O'quvchilar</span>
                </Link>
            </div>
        </div>
    )
}
