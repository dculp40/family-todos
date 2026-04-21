export function LoadingScreen({ label = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(68,92,128,0.08),_transparent_55%),_#f8f5f0]">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/80 px-10 py-12 shadow-glow backdrop-blur">
        <span className="h-14 w-14 animate-spin rounded-full border-[6px] border-midnight-200 border-t-midnight-600" />
        <p className="font-display text-xl tracking-tight text-midnight-900">{label}</p>
      </div>
    </div>
  );
}
