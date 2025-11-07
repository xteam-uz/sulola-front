import { Menu, User2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axios-client';
import { useStateContext } from '../../contexts/ContextProvider';
import { CardNav } from './CardNav';
import logo from '../../assets/react.svg';

export const TopHeader = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen(!isOpen);

    const [tests, setTests] = useState([]);
    const [activeTab, setActiveTab] = useState("created");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const { token, user, setUser, setToken } = useStateContext();

    // if (!token) {
    //     return <Navigate to="/register" />;
    // }

    // const onLogout = (e) => {
    //     e.preventDefault();
    //     localStorage.removeItem("ACCESS_TOKEN");

    //     axiosClient
    //         .post("/logout")
    //         .then(() => {
    //             setUser({});
    //             setToken(null);
    //         })
    //         .catch((error) => {
    //             console.error(error);
    //         });
    // };

    useEffect(() => {
        // axiosClient
        //     .get("/user")
        //     .then(({ data }) => {
        //         setUser(data);
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });
        setTimeout(() => {
            setUser({
                id: 1,
                telegram_id: 1367538109,
                username: "o'qituvchi",
                first_name: "Mirsoli",
                last_name: "Mirsultonov",
                role: "tester",
                phone_number: null,
                balance: 0,
                status: 1,
                credits: 50,
            });

            setLoading(false);
        }, 500);
    }, []);

    // if (loading) {
    //     return (
    //         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    //         </div>
    //     );
    // }

    const items = [

        {
            label: "Profil",
            bgColor: "#0D0716",
            textColor: "#fff",
            links: [
                {
                    label: "Profil",
                    ariaLabel: "Profile information",
                    href: "/profile"
                },
            ]
        },
        {
            label: "Projects",
            bgColor: "#170D27",
            textColor: "#fff",
            links: [
                { label: "Featured", ariaLabel: "Featured Projects" },
                { label: "Case Studies", ariaLabel: "Project Case Studies" }
            ]
        },
        {
            label: "Contact",
            bgColor: "#271E37",
            textColor: "#fff",
            links: [
                { label: "Email", ariaLabel: "Email us" },
                { label: "Twitter", ariaLabel: "Twitter" },
                { label: "LinkedIn", ariaLabel: "LinkedIn" }
            ]
        }
    ];

    return (
        <>
            {/* <div className="flex items-center justify-between mb-4">
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

            <div className="bg-white text-gray-800 rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <span className="text-lg font-semibold">
                            {user?.first_name} {user?.last_name}
                        </span>
                        <span className="text-blue-600 text-sm ml-3">
                            {user?.role}
                        </span>
                    </div>
                </div>
                <div className="text-sm text-gray-600">
                    <span>Telegram ID: </span>
                    <span className="font-semibold text-gray-800">
                        {user?.telegram_id}
                    </span>
                </div>
            </div> */}
            <CardNav
                logo={logo}
                logoAlt="Company Logo"
                items={items}
                baseColor="#fff"
                menuColor="#000"
                buttonBgColor="#111"
                buttonTextColor="#fff"
                ease="power3.out"

            />
        </>
    )
}
