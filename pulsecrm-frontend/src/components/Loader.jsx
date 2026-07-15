import { Loader2 } from "lucide-react";

export default function Loader({ label = "Loading...", fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <Loader2 size={28} className="text-primary animate-spin" />
      {label && (
        <p className="text-text-secondary text-[13.5px] font-medium">{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface font-sans">
        {content}
      </div>
    );
  }

  return content;
}
