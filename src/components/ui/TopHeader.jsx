import { CardNav } from "./CardNav";
import { useLottie } from "lottie-react";
// import logo from "../../assets/react.svg";
import tgLogo from "../../assets/tg_logo.json";

export const TopHeader = () => {
    const items = [
        {
            label: "Profil",
            bgColor: "#fff",
            textColor: "#222",
            links: [
                {
                    label: "Profil",
                    ariaLabel: "Profile information",
                    href: "/profile",
                },
            ],
        },
    ];

    const options = {
        animationData: tgLogo,
        loop: true,
    };

    const { View } = useLottie(options);

    return (
        <>
            <CardNav
                logo={View}
                logoAlt="Company Logo"
                items={items}
                baseColor="#fff"
                menuColor="#000"
                buttonBgColor="#111"
                buttonTextColor="#fff"
                ease="power3.out"
            />
        </>
    );
};
