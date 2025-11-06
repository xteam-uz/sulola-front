import { Menu, User2, Wallet } from 'lucide-react';
import { useState } from 'react'
import { Link } from 'react-router-dom';

export const TopHeader = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Rash yordamchi</h1>
                <button
                    id="dropdownDividerButton"
                    onClick={toggleDropdown}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    type="button"
                >
                    <Menu size={20} />
                </button>
            </div>

            {isOpen && (
                <div
                    id="dropdownDivider"
                    className="z-10 absolute right-0 mt-2 w-44 rounded-xl shadow-lg border border-blue-100 bg-gradient-to-b from-blue-50 to-white dark:from-blue-800 dark:to-gray-800"
                >
                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                        <li>
                            <Link
                                to="/profile"
                                className="flex items-center px-4 py-2 rounded-lg transition-all hover:bg-blue-100 dark:hover:bg-blue-700 hover:text-blue-700 dark:hover:text-white"
                            >
                                <User2 size={16} className="mr-2" />
                                <span>Profil</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/balance"
                                className="flex items-center px-4 py-2 rounded-lg transition-all hover:bg-blue-100 dark:hover:bg-blue-700 hover:text-blue-700 dark:hover:text-white"
                            >
                                <Wallet size={16} className="mr-2" />
                                <span>Balans</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </>
    )
}
