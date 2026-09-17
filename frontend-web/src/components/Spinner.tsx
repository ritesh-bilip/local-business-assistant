export default function Spinner({ fullscreen = false }: { fullscreen?: boolean }) {
  const inner = (
    <div className="inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
  );
  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        {inner}
      </div>
    );
  }
  return inner;
}