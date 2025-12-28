import { CardNav } from "./CardNav";
import logo from '/logo.png';

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

    return (
        <>
            <CardNav
                logo={logo}
                logoAlt="Company Logo"
                items={items}
                baseColor="#fff"
                menuColor="#000"
                buttonBgColor="#2b7fff"
                buttonTextColor="#fff"
                ease="power3.out"
            />
        </>
    );
};
