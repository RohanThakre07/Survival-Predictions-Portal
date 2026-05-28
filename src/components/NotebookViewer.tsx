import React from "react";
import Markdown from "react-markdown";
import { JupyterNotebook, JupyterCell } from "../types";
import { Play, Code, Eye, BarChart, ChevronDown, ChevronRight } from "lucide-react";

interface NotebookViewerProps {
  notebook: JupyterNotebook;
}

export function NotebookViewer({ notebook }: NotebookViewerProps) {
  const [collapsedCells, setCollapsedCells] = React.useState<Record<number, boolean>>({});

  const toggleCollapse = (idx: number) => {
    setCollapsedCells(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const renderOutputs = (outputs: any[]) => {
    if (!outputs || outputs.length === 0) return null;

    return (
      <div className="mt-2 bg-gray-50/70 border-t border-gray-100 p-3 rounded-b-lg font-mono text-[13px] text-gray-700 overflow-x-auto">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Cell Execution Outputs</div>
        {outputs.map((out, idx) => {
          // 1. Matplotlib Inline Plot (base64 image/png)
          const imageBase64 = out.data?.["image/png"];
          if (imageBase64) {
            return (
              <div key={idx} className="my-3 flex flex-col items-center justify-center bg-white p-3 border border-gray-100 rounded-md shadow-sm">
                <img
                  src={`data:image/png;base64,${imageBase64.replace(/\n/g, "")}`}
                  alt="Matplotlib Plot"
                  referrerPolicy="no-referrer"
                  className="max-w-full h-auto rounded"
                />
                <span className="text-[10px] text-gray-400 mt-2">Visualized Figure {idx + 1}</span>
              </div>
            );
          }

          // 2. HTML output (often Dataframes)
          const htmlData = out.data?.["text/html"];
          if (htmlData) {
            const htmlString = Array.isArray(htmlData) ? htmlData.join("") : htmlData;
            // Standard dataframe display cleaning
            return (
              <div
                key={idx}
                className="my-2 bg-white p-2 rounded border border-gray-100 overflow-x-auto max-w-full"
                dangerouslySetInnerHTML={{ __html: htmlString }}
              />
            );
          }

          // 3. Simple text print stream or errors
          if (out.text) {
            const textLines = Array.isArray(out.text) ? out.text.join("") : out.text;
            return (
              <pre key={idx} className="whitespace-pre-wrap text-emerald-800 break-all leading-relaxed bg-emerald-50/30 p-2 rounded">
                {textLines}
              </pre>
            );
          }

          if (out.traceback) {
            const errorText = Array.isArray(out.traceback) ? out.traceback.join("\n") : out.traceback;
            // Clean ANSI escape colors for raw web preview readability
            const cleanErr = errorText.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
            return (
              <pre key={idx} className="whitespace-pre-wrap text-rose-600 bg-rose-50 p-2 rounded border border-rose-100 break-all">
                {cleanErr}
              </pre>
            );
          }

          // 4. Fallback trace or text/plain
          const plainText = out.data?.["text/plain"];
          if (plainText) {
            const textLines = Array.isArray(plainText) ? plainText.join("") : plainText;
            return (
              <pre key={idx} className="whitespace-pre-wrap text-gray-600 font-medium">
                {textLines}
              </pre>
            );
          }

          return null;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Code className="h-5 w-5 text-indigo-500" />
            Jupyter Notebook Source Reader
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Parsed original cell structures, annotations, execution sequence and graphs
          </p>
        </div>
        <div className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
          {notebook.cells?.length || 0} Cells
        </div>
      </div>

      <div className="space-y-4">
        {notebook.cells?.map((cell, idx) => {
          const isCollapsed = collapsedCells[idx] || false;
          
          if (cell.cell_type === "markdown") {
            const mdSource = cell.source.join("");
            return (
              <div key={idx} className="bg-white hover:shadow-sm border border-gray-100/80 rounded-lg p-5 transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="bg-sky-50 text-sky-600 p-1.5 rounded-md text-xs font-bold leading-none mt-1">MD</div>
                  <div className="flex-1 text-gray-700 prose prose-sm max-w-none leading-relaxed overflow-x-auto">
                    <Markdown>{mdSource}</Markdown>
                  </div>
                </div>
              </div>
            );
          }

          if (cell.cell_type === "code") {
            const codeSource = cell.source.join("");
            const hasOutputs = cell.outputs && cell.outputs.length > 0;

            return (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
                {/* Header controls */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-850">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-indigo-400 font-semibold flex items-center gap-1">
                      <Play className="h-3 w-3 fill-indigo-400 text-indigo-400" />
                      In [{cell.execution_count ?? " "}]
                    </span>
                    <span className="text-[10px] text-slate-500">Python Cell</span>
                  </div>
                  {hasOutputs && (
                    <button
                      onClick={() => toggleCollapse(idx)}
                      className="cursor-pointer text-slate-400 hover:text-white flex items-center gap-1 text-xs px-2 py-0.5 rounded transition hover:bg-slate-800"
                    >
                      {isCollapsed ? (
                        <>
                          <ChevronRight className="h-3 w-3" /> Show output ({cell.outputs!.length})
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" /> Hide output
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Source Code block */}
                <div className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-slate-100">
                  <pre><code>{codeSource}</code></pre>
                </div>

                {/* Rendered output stream (Collapsible) */}
                {hasOutputs && !isCollapsed && renderOutputs(cell.outputs!)}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
