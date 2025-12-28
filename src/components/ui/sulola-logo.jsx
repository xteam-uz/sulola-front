import logo from '/logo.png';

export function SulolaLogo({ className }) {
    return (
        <div className={`relative flex flex-col items-center justify-center ${className}`}>
            <img src={logo} alt="Sulola Edu Logo" width={300} height={150} className="object-contain" />
        </div>
    )
}
