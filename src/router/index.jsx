import { createBrowserRouter, Navigate } from "react-router-dom";
import { DefaultLayout, GuestLayout } from "../components/layouts";
import { Dashboard, NotFound, Signup, Students } from "../pages";

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
                path: "/students",
                element: <Students />,
            },
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
