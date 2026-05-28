import React from "react";
import { SourceViewer } from "./SourceViewer";
import { Binary, Text, ChevronRight, BarChart3, Database, Save } from "lucide-react";

interface Dp3ExplorerProps {
  sourceCode: string;
}

interface HuffmanNode {
  char: string | null;
  count: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
}

export function Dp3Explorer({ sourceCode }: Dp3ExplorerProps) {
  const [inputText, setInputText] = React.useState<string>("huffman coding is premium compression");

  const huffmanResults = React.useMemo(() => {
    if (!inputText) return null;

    // 1. Calculate frequency of each character
    const freqs: Record<string, number> = {};
    for (let char of inputText) {
      freqs[char] = (freqs[char] || 0) + 1;
    }

    // 2. Build initial nodes list (min-heap replica)
    let nodes: HuffmanNode[] = Object.entries(freqs).map(([char, count]) => ({
      char,
      count
    }));

    if (nodes.length === 0) return null;

    // Special case for single character
    if (nodes.length === 1) {
      const single = nodes[0];
      const codeMap = { [single.char!]: "0" };
      const binaryString = "0".repeat(single.count);
      const originalBits = inputText.length * 8;
      const compressedBits = single.count * 1;
      const savings = originalBits > 0 ? ((originalBits - compressedBits) / originalBits) * 100 : 0;

      return {
        freqs,
        codes: codeMap,
        binaryString,
        originalBits,
        compressedBits,
        savings: Math.round(savings * 10) / 10,
        sortedList: [{ char: single.char!, count: single.count, code: "0" }]
      };
    }

    // 3. Keep combining lowest frequency nodes
    while (nodes.length > 1) {
      nodes.sort((a, b) => a.count - b.count);
      const left = nodes.shift()!;
      const right = nodes.shift()!;
      
      nodes.push({
        char: null,
        count: left.count + right.count,
        left,
        right
      });
    }

    const root = nodes[0];
    const codeMap: Record<string, string> = {};

    // 4. Traverse the node tree to find the codes
    function traverse(node: HuffmanNode | undefined, codePath: string) {
      if (!node) return;
      if (node.char !== null) {
        codeMap[node.char] = codePath || "0";
        return;
      }
      traverse(node.left, codePath + "0");
      traverse(node.right, codePath + "1");
    }

    traverse(root, "");

    // 5. Calculate bit statistics
    let binaryString = "";
    for (let char of inputText) {
      binaryString += codeMap[char] || "";
    }

    const originalBits = inputText.length * 8;
    const compressedBits = binaryString.length;
    const savings = originalBits > 0 ? ((originalBits - compressedBits) / originalBits) * 100 : 0;

    const sortedList = Object.entries(freqs).map(([char, count]) => ({
      char,
      count,
      code: codeMap[char] || "0"
    })).sort((a, b) => b.count - a.count);

    return {
      freqs,
      codes: codeMap,
      binaryString,
      originalBits,
      compressedBits,
      savings: Math.round(savings * 10) / 10,
      sortedList
    };

  }, [inputText]);

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PLAYGROUND INPUT CONTAINER */}
        <div className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Text className="h-4.5 w-4.5 text-[#5856d6]" />
              <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">Compression Testing Input</h3>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-normal font-semibold">
              Enter any sentence or word parameters. The local compiler will analyze the frequency probabilities of each single character and re-encode with high-fidelity prefix tree steps.
            </p>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Input Text String:</label>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="w-full h-24 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-semibold text-slate-850 placeholder:text-gray-400"
                placeholder="Type anything to test compression rates..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>CHAR COUNT: <code className="font-mono font-bold text-indigo-600 bg-indigo-50 p-1 px-1.5 rounded">{inputText.length}</code></span>
            <span>UNIQUE CHARS: <code className="font-mono font-bold text-emerald-600 bg-emerald-50 p-1 px-1.5 rounded">{huffmanResults ? huffmanResults.sortedList.length : 0}</code></span>
          </div>
        </div>

        {/* METRICS & FREQUENCY CODES */}
        <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
            <BarChart3 className="h-4.5 w-4.5 text-[#ff9500]" />
            <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">Optimized Prefix Dictionary</h3>
          </div>

          {huffmanResults ? (
            <div className="space-y-4">
              
              {/* Savings metrics blocks */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl hover:shadow-xs transition duration-150">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans">UNCUT ASCII BITS</div>
                  <div className="text-sm font-black font-mono mt-1 text-slate-800">{huffmanResults.originalBits} <span className="text-[10px] font-normal text-slate-400">bits</span></div>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl hover:shadow-xs transition duration-150">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans font-sans">HUFFMAN COMPRESSED</div>
                  <div className="text-sm font-black font-mono mt-1 text-indigo-600">{huffmanResults.compressedBits} <span className="text-[10px] font-normal text-slate-400">bits</span></div>
                </div>
                <div className="bg-[#e2f9eb] border border-[#aaeac3] p-3 rounded-xl shadow-xs">
                  <div className="text-[9px] font-bold text-[#14703b] uppercase tracking-widest font-sans">SAVINGS RATIO %</div>
                  <div className="text-sm font-black font-mono mt-1 text-[#10b981] flex items-center gap-0.5">
                    <Save className="h-3.5 w-3.5 font-bold" />
                    +{huffmanResults.savings}%
                  </div>
                </div>
              </div>

              {/* Compressed Binary Bitstream Panel */}
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5 shadow-sm text-slate-200">
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                  <span>BINARY BITSTREAM DATA</span>
                  <span className="bg-emerald-500/25 text-emerald-300 font-extrabold font-sans font-semibold px-1.5 py-0.2 rounded-full uppercase text-[8px] tracking-wide">
                    Live Packets
                  </span>
                </div>
                <div className="font-mono text-[10.5px] leading-relaxed break-all max-h-[50px] overflow-y-auto select-all pr-2 scrollbar-thin text-emerald-400 font-extrabold tracking-widest">
                  {huffmanResults.binaryString || "Awaiting bit generation..."}
                </div>
              </div>

              {/* Dynamic scroll table codes */}
              <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-50 p-2.5 font-mono text-[9px] font-bold text-slate-500 tracking-wider uppercase border-b border-slate-150 grid grid-cols-12 text-[#8e8e93]">
                  <span className="col-span-3">SYMBOL NODE</span>
                  <span className="col-span-3 text-center">CHARACTER FEQ</span>
                  <span className="col-span-6 text-right">OPTIMIZED PREFIX BINARY</span>
                </div>
                <div className="max-h-[140px] overflow-y-auto divide-y divide-slate-100 font-mono text-[11px] text-slate-800">
                  {huffmanResults.sortedList.map(({ char, count, code }) => (
                    <div key={char} className="p-2.5 grid grid-cols-12 items-center hover:bg-slate-50/50 transition">
                      <span className="col-span-3 font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-center w-fit min-w-[24px]">
                        {char === " " ? "space" : char}
                      </span>
                      <span className="col-span-3 text-center text-slate-550 font-bold">
                        {count} <span className="text-[9px] text-[#8e8e93] font-normal">({((count / inputText.length) * 100).toFixed(0)}%)</span>
                      </span>
                      <span className="col-span-6 text-right text-emerald-600 font-extrabold flex items-center justify-end gap-1 font-mono tracking-widest">
                        {code} <ChevronRight className="h-3 w-3 text-slate-300" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-[#8e8e93] text-center py-10 italic text-xs">Waiting for string input streams...</div>
          )}
        </div>

      </div>

      {/* REPO SOURCE CODE VIEWER CONTAINER */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider pl-2 block">
          Committed Repository Code Source
        </span>
        <SourceViewer content={sourceCode} filename="dp3" language="python" />
      </div>

    </div>
  );
}
