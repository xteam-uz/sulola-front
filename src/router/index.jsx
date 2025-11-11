import { createBrowserRouter, Navigate } from "react-router-dom";
import { DefaultLayout, GuestLayout } from "../components/layouts";
import { Dashboard, NotFound, Profile, Signup, Students } from "../pages";
import { TestTakingPage } from "../pages/Tests/TestTakingPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                path: "/",
                element: <Navigate to="/dashboard" />,
            },
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/profile",
                element: <Profile />,
            },
            {
                path: "/students",
                element: <Students />,
            },
            {
                path: "/test_taking",
                element: <TestTakingPage />
            }
        ],
    },
    {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                path: "/register",
                element: <Signup />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);

export default router;
