import { createBrowserRouter, Navigate } from "react-router-dom";
import { DefaultLayout, GuestLayout } from "../components/layouts";
import { Dashboard, NotFound, Profile, Signup, Students } from "../pages";
import { TestTakingPage } from "../pages/Tests/TestTakingPage";
import { TestChecking } from "../pages/Tests/TestChacking";
import { StudentTestChecking } from "../pages/Tests/StudentTestChecking";
import { PaidTests } from "../pages/Tests/PaidTests";
import { FreeTests } from "../pages/Tests/FreeTests";
import { Login } from "../pages/Auth/Login";

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
                element: <TestTakingPage />,
            },
            {
                path: "/test_checking",
                element: <TestChecking />,
            },
            {
                path: "/test/:testId/student/:studentId",
                element: <StudentTestChecking />,
            },
            {
                path: "/add_paid_test",
                element: <PaidTests />,
            },
            {
                path: "/add_free_test",
                element: <FreeTests />
            }
        ],
    },
    {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                path: "/login",
                element: <Login />,
            },
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
