import React from "react";
import { Search, ChevronLeft, ChevronRight, FileText, BarChart3, Database } from "lucide-react";

interface DatasetExplorerProps {
  csvText: string;
  filename: string;
  onRowSelect?: (row: Record<string, string>) => void;
}

export function DatasetExplorer({ csvText, filename, onRowSelect }: DatasetExplorerProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  // Custom robust quoted CSV string parser
  const parsedData = React.useMemo(() => {
    if (!csvText) return { headers: [], rows: [] };
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(s => s.replace(/^["']|["']$/g, ""));
    };

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      return row;
    });

    return { headers, rows };
  }, [csvText]);

  // Handle column stats (mean, min, max) for numeric columns
  const columnStats = React.useMemo(() => {
    const stats: Record<string, { min: number; max: number; mean: number; isNumeric: boolean }> = {};
    if (parsedData.headers.length === 0 || parsedData.rows.length === 0) return stats;

    parsedData.headers.forEach(hdr => {
      let isNumeric = true;
      let min = Infinity;
      let max = -Infinity;
      let sum = 0;
      let count = 0;

      for (const row of parsedData.rows) {
        const val = row[hdr];
        if (!val) continue;
        const num = parseFloat(val);
        if (isNaN(num)) {
          isNumeric = false;
          break;
        }
        if (num < min) min = num;
        if (num > max) max = num;
        sum += num;
        count++;
      }

      if (isNumeric && count > 0) {
        stats[hdr] = {
          min,
          max,
          mean: parseFloat((sum / count).toFixed(2)),
          isNumeric: true
        };
      } else {
        stats[hdr] = { min: 0, max: 0, mean: 0, isNumeric: false };
      }
    });

    return stats;
  }, [parsedData]);

  // Filtering
  const filteredRows = React.useMemo(() => {
    if (!searchTerm) return parsedData.rows;
    const term = searchTerm.toLowerCase();
    return parsedData.rows.filter(row => {
      return Object.values(row).some(cellVal => 
        cellVal.toLowerCase().includes(term)
      );
    });
  }, [parsedData.rows, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const numericHeaders = parsedData.headers.filter(hdr => columnStats[hdr]?.isNumeric);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-white border border-gray-100 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-500">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Original Dataset</div>
            <div className="text-sm font-semibold text-gray-800 font-mono break-all">{filename}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white border border-gray-100 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-sky-50 rounded-lg text-sky-500">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Browsable Rows</div>
            <div className="text-xl font-bold text-gray-800 font-mono">
              {parsedData.rows.length} rows <span className="text-xs text-slate-400 font-sans">({parsedData.headers.length} columns)</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white border border-gray-100 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Numerical Quantiles</div>
            <div className="text-xs text-slate-600 font-medium leading-relaxed">
              {numericHeaders.length > 0 ? (
                <span>Detected {numericHeaders.length} continuous continuous variables</span>
              ) : (
                <span>Primarily qualitative attributes</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Feature Stats */}
      {numericHeaders.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            Empirical Key Descriptives (Mean, Min, Max)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {numericHeaders.slice(0, 4).map(hdr => (
              <div key={hdr} className="p-3 border border-slate-50 bg-slate-50/50 rounded-lg text-center font-mono">
                <span className="text-xs text-slate-600 font-medium truncate block max-w-full" title={hdr}>{hdr}</span>
                <div className="text-sm font-bold text-slate-800 mt-1">μ = {columnStats[hdr].mean}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  [{columnStats[hdr].min} - {columnStats[hdr].max}]
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
        
        {onRowSelect && (
          <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md font-semibold font-mono shadow-sm">
            💡 Tap any row below to autofill form prediction inputs
          </span>
        )}
      </div>

      {/* Data Grid table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-gray-100 text-slate-600 font-semibold align-middle">
                {parsedData.headers.map(hdr => (
                  <th key={hdr} className="px-4 py-3 whitespace-nowrap tracking-wide select-none">
                    {hdr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  onClick={() => onRowSelect?.(row)}
                  className={`hover:bg-indigo-50/30 transition-colors duration-150 align-middle ${
                    onRowSelect ? "cursor-pointer" : ""
                  }`}
                >
                  {parsedData.headers.map((hdr, hIdx) => (
                    <td key={hIdx} className="px-4 py-2.5 whitespace-nowrap text-slate-700 font-mono font-medium">
                      {row[hdr] !== undefined ? row[hdr] : <span className="text-slate-300">N/A</span>}
                    </td>
                  ))}
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={parsedData.headers.length || 1} className="text-center py-8 text-slate-400 select-none">
                    No matching dataset rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginator Footer */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50/50 border-t border-gray-100 select-none">
          <span className="text-xs text-slate-500 font-medium font-mono">
            Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length} entries
          </span>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono font-semibold text-slate-700 mx-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
