import { CardNav } from './CardNav';
import logo from '../../assets/react.svg';

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
                    href: "/profile"
                },
            ]
        }

    ];

    return (
        <>
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
