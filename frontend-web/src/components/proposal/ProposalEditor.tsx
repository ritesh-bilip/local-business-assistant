import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  isStreaming: boolean;
};

export default function ProposalEditor({ value, onChange, isStreaming }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(400, el.scrollHeight) + "px";
  }, [value]);

  useEffect(() => {
    if (isStreaming && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [value, isStreaming]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Draft</span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 text-xs text-brand-600">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Writing…
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {isStreaming ? "Editable when finished" : "Click to edit"}
        </div>
      </div>

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={isStreaming}
        placeholder="The proposal will appear here…"
        className={`w-full p-5 text-sm leading-relaxed text-gray-800 resize-none outline-none font-sans ${
          isStreaming ? "bg-white cursor-wait" : "bg-white"
        }`}
        style={{ minHeight: 400 }}
      />
    </div>
  );
}