import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { ContextProvider } from "./contexts/ContextProvider.jsx";
import "./index.css";
import { ClickSpark } from "./components/ui/ClickSpark.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ContextProvider>
            <ClickSpark
                sparkColor='#FFA500'
                sparkSize={10}
                sparkRadius={15}
                sparkCount={8}
                duration={400}
            >
                <RouterProvider router={router} />
            </ClickSpark>
        </ContextProvider>
    </StrictMode>,
);
