import React from "react";
import { SourceViewer } from "./SourceViewer";
import { Zap, Play, Clock, Activity, Cpu, Layers } from "lucide-react";

interface Daa1ExplorerProps {
  sourceCode: string;
}

export function Daa1Explorer({ sourceCode }: Daa1ExplorerProps) {
  const [nValue, setNValue] = React.useState<number>(15);
  const [calcResult, setCalcResult] = React.useState<{
    val: number;
    recCalls: number;
    recTime: number;
    iterLoops: number;
    iterTime: number;
  } | null>(null);

  const [benchmarking, setBenchmarking] = React.useState(false);

  // Fibonacci helpers
  const getFibValueRecursive = (n: number): number => {
    if (n <= 1) return n;
    return getFibValueRecursive(n - 1) + getFibValueRecursive(n - 2);
  };

  // Measures exact recursion steps: calls count = 2 * F(n+1) - 1
  const getFibCallsCount = (n: number): number => {
    if (n <= 0) return 1;
    let prev = 0, curr = 1;
    for (let i = 2; i <= n + 1; i++) {
      let next = prev + curr;
      prev = curr;
      curr = next;
    }
    return 2 * curr - 1;
  };

  const getFibValueIterative = (n: number): { val: number; loops: number } => {
    if (n <= 1) return { val: n, loops: 0 };
    let prev = 0, curr = 1;
    let loops = 0;
    for (let i = 2; i <= n; i++) {
      loops++;
      const next = prev + curr;
      prev = curr;
      curr = next;
    }
    return { val: curr, loops };
  };

  const runBenchmark = React.useCallback(() => {
    setBenchmarking(true);
    // Timeout to allow spinner state to render
    setTimeout(() => {
      // 1. Measure Recursive (and cap N to 35 to prevent crash)
      const capN = Math.min(nValue, 32);
      
      const tRecStart = performance.now();
      const recVal = getFibValueRecursive(capN);
      const tRecEnd = performance.now();
      const recTimeMs = tRecEnd - tRecStart;
      const recCalls = getFibCallsCount(capN);

      // 2. Measure Iterative
      const tIterStart = performance.now();
      const iterInfo = getFibValueIterative(nValue);
      const tIterEnd = performance.now();
      const iterTimeMs = tIterEnd - tIterStart;

      setCalcResult({
        val: iterInfo.val,
        recCalls: nValue <= 32 ? recCalls : getFibCallsCount(nValue), // mathematical calculation even for high N
        recTime: nValue <= 32 ? recTimeMs : -1, // -1 means skipped to prevent freezing
        iterLoops: iterInfo.loops,
        iterTime: iterTimeMs
      });
      setBenchmarking(false);
    }, 50);
  }, [nValue]);

  React.useEffect(() => {
    runBenchmark();
  }, [nValue, runBenchmark]);

  // Generate coordinates for SVG plotting time-complexity slopes
  const sparklineData = React.useMemo(() => {
    const points: { n: number; recursiveOps: number; iterativeOps: number }[] = [];
    for (let i = 0; i <= 20; i++) {
      points.push({
        n: i,
        recursiveOps: Math.pow(1.618, i), // proportional to golden ratio golden exponent scaling
        iterativeOps: i
      });
    }

    const maxRec = Math.pow(1.618, 20);
    const maxIter = 20;

    const width = 500;
    const height = 180;
    const padding = 20;

    // Map formulas
    const recPoints = points.map(p => {
      const x = padding + (p.n / 20) * (width - 2 * padding);
      const y = height - padding - (p.recursiveOps / maxRec) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(" ");

    const iterPoints = points.map(p => {
      const x = padding + (p.n / 20) * (width - 2 * padding);
      const y = height - padding - (p.iterativeOps / maxRec) * (height - 2 * padding); // plot on same scale to show drastic difference!
      return `${x},${y}`;
    }).join(" ");

    return { recPoints, iterPoints, width, height };
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Benchmark Deck Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CONFIG INDEX CARD */}
        <div className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <Activity className="h-4.5 w-4.5 text-[#ff3b30]" />
              <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">Benchmark Parameter</h3>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-normal mb-4 font-semibold">
              Select any index index <code className="font-mono px-1 bg-slate-100 rounded text-[#ff3b30] font-bold">N</code>. 
              Recursive complexity runs at <code className="font-bold font-mono">O(2^N)</code> which rapidly locks threads beyond 
              index 30. Iterative is <code className="font-mono font-bold text-emerald-600">O(N)</code>.
            </p>

            <div className="space-y-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-150">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 font-mono">
                <span>INDEX (N):</span>
                <span className="text-sm text-indigo-600 font-extrabold">{nValue}</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={nValue}
                onChange={e => setNValue(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-gray-400 font-bold font-mono">
                <span>N=1 (Mild)</span>
                <span>N=30 (Threads Cap)</span>
                <span>N=40 (Heavy)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            {nValue > 32 && (
              <div className="text-[10px] bg-amber-50 text-amber-700 font-semibold p-2.5 rounded-lg border border-amber-200 leading-normal">
                ⚠️ <strong>N &gt; 32 detected.</strong> Recursive live-timer skipped to protect client thread execution from freezing. Mathematical counts remain projected.
              </div>
            )}
          </div>
        </div>

        {/* TIME DYNAMICS METRIC PANEL */}
        <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">Algorithmic Resource Comparison</h3>
            </div>
            {benchmarking && <span className="text-[10px] text-indigo-600 font-bold animate-pulse">Running thread...</span>}
          </div>

          {calcResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              
              {/* RECURSIVE DECK */}
              <div className="border border-red-100 bg-red-50/20 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-red-100/50">
                    <span className="text-[11px] font-black text-red-700 uppercase tracking-wider">Recursive Equation</span>
                    <span className="text-[10px] font-mono bg-red-100/50 text-red-700 font-extrabold px-1.5 py-0.2 rounded uppercase">O(2^N)</span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-semibold">Active Function Calls:</span>
                      <span className="font-mono font-bold text-red-700">
                        {calcResult.recCalls.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-semibold">Allocated Call Stack:</span>
                      <span className="font-mono font-bold text-red-600">{nValue} Frames</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-semibold">Measured Thread Clock:</span>
                      <span className="font-mono font-extrabold text-red-700 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {calcResult.recTime < 0 ? "Skipped (&gt;30s projection)" : `${calcResult.recTime.toFixed(4)} ms`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 text-[9px] text-red-650 italic font-medium leading-normal border-t border-red-100/30">
                  Calls scale exponentially according to $2 \cdot F(N+1) - 1$.
                </div>
              </div>

              {/* ITERATIVE DECK (NON-RECURSIVE) */}
              <div className="border border-emerald-100 bg-emerald-50/20 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-100/50">
                    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Iterative Equation</span>
                    <span className="text-[10px] font-mono bg-emerald-100/50 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded uppercase">O(N)</span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-semibold">Cumulative Loops:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {calcResult.iterLoops} Loops
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-semibold">Allocated Call Stack:</span>
                      <span className="font-mono font-bold text-emerald-600">1 Frame (Constant)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-semibold">Measured Thread Clock:</span>
                      <span className="font-mono font-extrabold text-emerald-700 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {calcResult.iterTime.toFixed(4)} ms
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 text-[9px] text-emerald-650 italic font-medium leading-normal border-t border-emerald-100/30">
                  Maintains memory intercepts at a flat $O(1)$ constant level.
                </div>
              </div>

            </div>
          )}

          {calcResult && (
            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-[#ff9500]" /> COMPUTED VALUE:</span>
              <span className="text-[13px] text-emerald-400 font-black tracking-wide">F({nValue}) = {calcResult.val.toLocaleString()}</span>
            </div>
          )}

        </div>

      </div>

      {/* COMPLEXITY GRAPH CARDS */}
      <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4.5 w-4.5 text-[#ff9500]" />
          <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">Complexity Curve Visualization — Exponential vs Linear Scale</h3>
        </div>

        <div className="bg-slate-950 rounded-xl overflow-hidden p-4 relative border border-slate-900">
          <div className="absolute top-4 right-4 z-10 flex gap-4 text-[9px] font-mono font-bold tracking-tight">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-1 bg-red-400 inline-block rounded-xs" /> O(2^N) RECURSIVE CURVE
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-1 bg-emerald-400 inline-block rounded-xs" /> O(N) ITERATIVE SPEED
            </span>
          </div>

          <div className="pb-1 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest border-l-2 border-slate-700 pl-2">
            Execution Cost Ratio (Traversing logarithmic splits)
          </div>

          {/* SVG Canvas Plot */}
          <div className="w-full h-[180px] mt-2">
            <svg viewBox={`0 0 ${sparklineData.width} ${sparklineData.height}`} className="w-full h-full" preserveAspectRatio="none">
              {/* Grids */}
              <line x1="20" y1="20" x2="480" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="20" y1="65" x2="480" y2="65" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="20" y1="110" x2="480" y2="110" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="20" y1="160" x2="480" y2="160" stroke="#475569" strokeWidth="1" />

              {/* Axes Label */}
              <text x="25" y="15" fill="#64748b" className="font-mono text-[8px] font-semibold">Steps / Thread Cost</text>
              <text x="440" y="173" fill="#64748b" className="font-mono text-[8px] font-semibold">N (0 to 20)</text>

              {/* Plot Lines */}
              <polyline
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklineData.recPoints}
                className="drop-shadow-[0_2px_8px_rgba(239,68,68,0.4)]"
              />
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklineData.iterPoints}
              />

              {/* Points */}
              <circle cx="480" cy="20" r="4.5" fill="#ef4444" />
              <circle cx="480" cy="159" r="4.5" fill="#10b981" />
            </svg>
          </div>
        </div>
      </div>

      {/* REPO SOURCE CODE VIEWER CONTAINER */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider pl-2 block">
          Committed Repository Code Source
        </span>
        <SourceViewer content={sourceCode} filename="Daa1" language="java" />
      </div>

    </div>
  );
}
