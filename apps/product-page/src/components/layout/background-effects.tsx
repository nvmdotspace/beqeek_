export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Blue glow top-right */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent-blue/10 rounded-full blur-[120px] mix-blend-screen" />
      {/* Purple glow bottom-left */}
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-[120px] mix-blend-screen" />
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid" />
    </div>
  );
}
