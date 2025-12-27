import { SulolaLogo } from "./sulola-logo"

export function LoadingAnimation() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="relative flex items-center justify-center h-80 w-80">
        {/* Ripple Wave 1 */}
        <div
          className="absolute rounded-full border-2 border-red-600/40 animate-[ripple_1.2s_cubic-bezier(0,0.2,0.8,1)_infinite]"
          style={{ width: "60%", height: "60%" }}
        />
        {/* Ripple Wave 2 */}
        <div
          className="absolute rounded-full border-2 border-red-500/30 animate-[ripple_1.2s_cubic-bezier(0,0.2,0.8,1)_0.4s_infinite]"
          style={{ width: "60%", height: "60%" }}
        />
        {/* Ripple Wave 3 */}
        <div
          className="absolute rounded-full border-2 border-red-400/20 animate-[ripple_1.2s_cubic-bezier(0,0.2,0.8,1)_0.8s_infinite]"
          style={{ width: "60%", height: "60%" }}
        />

        {/* Logo Container */}
        <div className="relative z-10">
          <SulolaLogo className="w-64 h-auto" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
