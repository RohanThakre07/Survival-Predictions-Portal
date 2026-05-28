import React from "react";
import { FileCode, Clipboard, Check } from "lucide-react";

interface SourceViewerProps {
  content: string;
  filename: string;
  language: "java" | "python" | "markdown" | "text";
}

export function SourceViewer({ content, filename, language }: SourceViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const lines = React.useMemo(() => {
    return content.split(/\r?\n/);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* File Header Tab */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-850">
        <div className="flex items-center gap-2.5">
          <FileCode className="h-4.5 w-4.5 text-emerald-400" />
          <span className="font-mono text-sm text-slate-200 font-bold">{filename}</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded uppercase tracking-wider font-sans">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="cursor-pointer text-slate-400 hover:text-white flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition hover:bg-slate-850 select-none border border-slate-800 hover:border-slate-755 font-mono"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied Code!
            </>
          ) : (
            <>
              <Clipboard className="h-3.5 w-3.5" /> Copy Code
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="overflow-x-auto p-4 flex font-mono text-[13px] leading-relaxed select-text">
        {/* Line Numbers column */}
        <div className="text-right text-slate-600 pr-4 select-none border-r border-slate-800/65 font-medium leading-relaxed font-mono min-w-[2.5rem]">
          {lines.map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <div className="pl-4 text-slate-100 flex-1 whitespace-pre break-all leading-relaxed font-mono">
          {lines.map((line, idx) => (
            <div key={idx} className="hover:bg-slate-800/40 px-1 rounded transition-colors duration-100">
              {line || "\n"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
