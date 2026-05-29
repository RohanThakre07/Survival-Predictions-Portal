import React from "react";
import Markdown from "react-markdown";
import { Task, JupyterNotebook } from "./types";
import { NotebookViewer } from "./components/NotebookViewer";
import { DatasetExplorer } from "./components/DatasetExplorer";
import { PredictionForm } from "./components/PredictionForm";
import { SourceViewer } from "./components/SourceViewer";
import { Daa1Explorer } from "./components/Daa1Explorer";
import { Dp3Explorer } from "./components/Dp3Explorer";
import { IosDrawer } from "./components/IosDrawer";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Brain,
  BrainCircuit,
  Calculator,
  Binary,
  Code,
  Table,
  Play,
  FileText,
  Loader2,
  AlertCircle,
  Github,
  ChevronRight,
  Database,
  Terminal,
  Cpu,
  LifeBuoy,
  Film,
  Leaf,
  TrendingUp,
  Sparkles,
  Settings
} from "lucide-react";

const DEFAULT_TASKS: Task[] = [
  {
    id: "task1",
    title: "Titanic Survival Prediction",
    notebook: "Task 1 Titanic_Survival.ipynb",
    dataset: "tested.csv",
    description: "Predict the survival of passengers on the Titanic using classification algorithms like Logistic Regression, Random Forests, etc. based on age, gender, passenger class, and cabin features.",
    features: ["Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Embarked"]
  },
  {
    id: "task2",
    title: "Movie Rating Prediction",
    notebook: "Task 2 Movies_Rating_Prediction.ipynb",
    dataset: "IMDb Movies India.csv",
    description: "Analyze movie parameters and build regression models to predict movie ratings on IMDb based on parameters like Genre, Director, Actor casting, Year, and Duration.",
    features: ["Year", "Duration", "Genre", "Director", "Actor 1", "Actor 2", "Actor 3"]
  },
  {
    id: "task3",
    title: "Iris Flower Classification",
    notebook: "Task_3_Iris_Flower.ipynb",
    dataset: "IRIS.csv",
    description: "Classify Iris flowers into setosa, versicolor, and virginica species using physical petal and sepal measurement features like width and length.",
    features: ["sepal_length", "sepal_width", "petal_length", "petal_width"]
  },
  {
    id: "task4",
    title: "Sales Predictions",
    notebook: "Task_4_Sales_Predictions.ipynb",
    dataset: "advertising.csv",
    description: "Model sales volumes based on distinct advertisement spendings in television, radio, and newspaper mediums using Linear Regression.",
    features: ["TV", "Radio", "Newspaper"]
  }
];

export default function App() {
  const [activeItem, setActiveItem] = React.useState<string>("overview");
  const [activeSubtab, setActiveSubtab] = React.useState<"demo" | "notebook" | "dataset">("demo");
  const [taskList, setTaskList] = React.useState<Task[]>(DEFAULT_TASKS);
  const [loadingTasks, setLoadingTasks] = React.useState(false);
  
  // File Content Loading & Cache mapping: filename -> content data
  const [fileContentCache, setFileContentCache] = React.useState<Record<string, any>>({});
  const [loadingFile, setLoadingFile] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Prefill row state to link DatasetExplorer -> PredictionForm
  const [rowPrefill, setRowPrefill] = React.useState<Record<string, string> | null>(null);

  // iOS System Diagnostic Spec Drawer Open state
  const [isSpecsOpen, setIsSpecsOpen] = React.useState(false);

  // Fetch task lists on startup
  React.useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        if (res.ok) {
          setTaskList(data.tasks);
        } else {
          console.warn("Using built-in config fallback:", data.error);
        }
      } catch (err) {
        console.error("Error loading task config:", err);
      } finally {
        setLoadingTasks(false);
      }
    }
    loadTasks();
  }, []);

  const activeTask = taskList.find(t => t.id === activeItem);

  const fetchFileIfNeeded = React.useCallback(async (filename: string) => {
    if (!filename) return;
    if (fileContentCache[filename]) {
      setErrorMsg(null);
      return; // Already loaded in cache
    }

    setLoadingFile(filename);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/file-content/${encodeURIComponent(filename)}`);
      const data = await res.json();
      if (res.ok) {
        setFileContentCache(prev => ({ ...prev, [filename]: data.content }));
      } else {
        setErrorMsg(data.error || `Could not retrieve file content: ${filename}`);
      }
    } catch (err) {
      console.error(`Fetch error for ${filename}:`, err);
      setErrorMsg(`Internal server timeout. Could not secure dataset/notebook source for: ${filename}`);
    } finally {
      setLoadingFile(null);
    }
  }, [fileContentCache]);

  const handleRetryLoad = React.useCallback(() => {
    if (activeItem === "overview") {
      setFileContentCache(prev => {
        const copy = { ...prev };
        delete copy["README.md"];
        return copy;
      });
      setTimeout(() => fetchFileIfNeeded("README.md"), 50);
    } else if (activeItem === "daa1") {
      setFileContentCache(prev => {
        const copy = { ...prev };
        delete copy["Daa1"];
        return copy;
      });
      setTimeout(() => fetchFileIfNeeded("Daa1"), 50);
    } else if (activeItem === "dp3") {
      setFileContentCache(prev => {
        const copy = { ...prev };
        delete copy["dp3"];
        return copy;
      });
      setTimeout(() => fetchFileIfNeeded("dp3"), 50);
    } else if (activeTask) {
      if (activeTask.notebook) {
        setFileContentCache(prev => {
          const copy = { ...prev };
          delete copy[activeTask.notebook];
          return copy;
        });
        setTimeout(() => fetchFileIfNeeded(activeTask.notebook), 50);
      }
      if (activeTask.dataset) {
        setFileContentCache(prev => {
          const copy = { ...prev };
          delete copy[activeTask.dataset];
          return copy;
        });
        setTimeout(() => fetchFileIfNeeded(activeTask.dataset), 50);
      }
    }
  }, [activeItem, activeTask, fetchFileIfNeeded]);

  // Handle Fetch triggering for Active Items (eagerly loading both files immediately for offline readiness)
  React.useEffect(() => {
    if (activeItem === "overview") {
      fetchFileIfNeeded("README.md");
    } else if (activeItem === "daa1") {
      fetchFileIfNeeded("Daa1");
    } else if (activeItem === "dp3") {
      fetchFileIfNeeded("dp3");
    } else if (activeTask) {
      if (activeTask.notebook) {
        fetchFileIfNeeded(activeTask.notebook);
      }
      if (activeTask.dataset) {
        fetchFileIfNeeded(activeTask.dataset);
      }
    }
  }, [activeItem, activeTask, fetchFileIfNeeded]);

  // Flush prefill state once consumed or menu is toggled
  React.useEffect(() => {
    setRowPrefill(null);
  }, [activeItem]);

  // Callback to link table row clicks into the predict inputs form directly
  const handlePrefillSelect = (row: Record<string, string>) => {
    setRowPrefill(row);
    // Switch to active demo trigger with smooth sliding response
    setActiveSubtab("demo");
  };

  // Colored circle icons dictionary matching iOS style presets
  const getMenuIcon = (id: string) => {
    switch (id) {
      case "overview":
        return {
          icon: <BookOpen className="h-4 w-4 text-white" />,
          bg: "bg-[#8e8e93]", // System gray
        };
      case "task1":
        return {
          icon: <LifeBuoy className="h-4 w-4 text-white" />,
          bg: "bg-[#007aff]", // System Blue
        };
      case "task2":
        return {
          icon: <Film className="h-4 w-4 text-white" />,
          bg: "bg-[#ff9500]", // System Orange
        };
      case "task3":
        return {
          icon: <Leaf className="h-4 w-4 text-white" />,
          bg: "bg-[#af52de]", // System Purple
        };
      case "task4":
        return {
          icon: <TrendingUp className="h-4 w-4 text-white" />,
          bg: "bg-[#34c759]", // System Green
        };
      case "daa1":
        return {
          icon: <Calculator className="h-4 w-4 text-white" />,
          bg: "bg-[#ff3b30]", // System Red
        };
      case "dp3":
        return {
          icon: <Binary className="h-4 w-4 text-white" />,
          bg: "bg-[#5856d6]", // Indigo
        };
      default:
        return {
          icon: <BrainCircuit className="h-4 w-4 text-white" />,
          bg: "bg-[#5ac8fa]", // Teal
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-slate-900 flex flex-col font-sans select-none antialiased">
      
      {/* Premium iOS style navigation bar */}
      <header className="bg-white/85 backdrop-blur-md border-b border-[#e5e5ea] sticky top-0 z-40 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#007aff] rounded-xl text-white shadow-sm shadow-[#007aff]/30">
            <Brain className="h-5.5 w-5.5 stroke-2" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 id="app-title" className="text-sm font-black tracking-tight text-slate-900">
                Survival Predictions Portal
              </h1>
              <span className="text-[9px] bg-[#e5e5ea] text-[#48484a] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Performance Portfolio
              </span>
            </div>
            <p className="text-[11px] text-[#8e8e93] mt-0.5 font-medium">
              High-fidelity interactive model predictions, notebooks & dataset diagnostics
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsSpecsOpen(true)}
            className="cursor-pointer text-[11px] font-bold flex items-center gap-1.5 bg-[#007aff]/10 text-[#007aff] hover:bg-[#007aff]/15 rounded-lg px-3 py-1.5 transition-all shadow-xs border border-[#007aff]/15"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#007aff] animate-pulse" /> Diagnostics Desk
          </motion.button>

          <a
            href="https://github.com/RohanThakre07/Survival-Predictions-Portal.git"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="text-[11px] font-bold flex items-center gap-1.5 text-[#555] hover:text-[#007aff] border border-[#e5e5ea] bg-white rounded-lg px-3 py-1.5 transition-all shadow-xs"
          >
            <Github className="h-3.5 w-3.5" /> Project GitHub
          </a>
        </div>
      </header>

      {/* Main Container Panels */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN: Organized Settings-style Sidebar */}
        <aside className="w-full lg:w-80 p-5 shrink-0 flex flex-col justify-between border-r border-[#e5e5ea] bg-[#f2f2f7] space-y-6">
          <div className="space-y-5">
            
            {/* GROUP 1: Portal Overview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider pl-2 block">
                Portfolio Manuals
              </span>
              <div className="bg-white rounded-xl border border-[#e5e5ea] overflow-hidden shadow-xs divide-y divide-[#f2f2f7]">
                {(() => {
                  const item = getMenuIcon("overview");
                  return (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveItem("overview")}
                      className={`w-full text-left text-xs font-semibold flex items-center gap-3 px-3 py-3 transition-colors ${
                        activeItem === "overview"
                          ? "bg-[#e5e5ea]/50 text-[#007aff]"
                          : "text-slate-800 hover:bg-[#fafafa]"
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${item.bg}`}>
                        {item.icon}
                      </div>
                      <span className="flex-1 truncate">README Introduction</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#c7c7cc] shrink-0" />
                    </motion.button>
                  );
                })()}
              </div>
            </div>

            {/* GROUP 2: ML Tasks */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider pl-2 block">
                Machine Learning Tasks
              </span>
              
              {loadingTasks ? (
                <div className="flex items-center gap-2 text-xs text-[#8e8e93] py-2 pl-3">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8e8e93]" />
                  <span>Loading task modules...</span>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#e5e5ea] overflow-hidden shadow-xs divide-y divide-[#f2f2f7]">
                  {taskList.filter(t => t.notebook).map(task => {
                    const style = getMenuIcon(task.id);
                    const isActive = activeItem === task.id;
                    return (
                      <motion.button
                        key={task.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveItem(task.id);
                          setActiveSubtab("demo");
                        }}
                        className={`w-full text-left text-xs font-semibold flex items-center gap-3 px-3 py-3 transition-colors ${
                          isActive
                            ? "bg-[#e5e5ea]/50 text-[#007aff]"
                            : "text-slate-800 hover:bg-[#fafafa]"
                        }`}
                      >
                        <div className={`p-1.5 rounded-md ${style.bg}`}>
                          {style.icon}
                        </div>
                        <span className="flex-1 truncate">{task.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-[#c7c7cc] shrink-0" />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* GROUP 3: Core Programming Tasks */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider pl-2 block">
                Practical Algorithm Labs
              </span>
              <div className="bg-white rounded-xl border border-[#e5e5ea] overflow-hidden shadow-xs divide-y divide-[#f2f2f7]">
                {(() => {
                  const style = getMenuIcon("daa1");
                  const isActive = activeItem === "daa1";
                  return (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveItem("daa1")}
                      className={`w-full text-left text-xs font-semibold flex items-center gap-3 px-3 py-3 transition-colors ${
                        isActive
                          ? "bg-[#e5e5ea]/50 text-[#007aff]"
                          : "text-slate-800 hover:bg-[#fafafa]"
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${style.bg}`}>
                        {style.icon}
                      </div>
                      <span className="flex-1 truncate">Fibonacci Analyzer (DAA-1)</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#c7c7cc] shrink-0" />
                    </motion.button>
                  );
                })()}

                {(() => {
                  const style = getMenuIcon("dp3");
                  const isActive = activeItem === "dp3";
                  return (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveItem("dp3")}
                      className={`w-full text-left text-xs font-semibold flex items-center gap-3 px-3 py-3 transition-colors ${
                        isActive
                          ? "bg-[#e5e5ea]/50 text-[#007aff]"
                          : "text-slate-800 hover:bg-[#fafafa]"
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${style.bg}`}>
                        {style.icon}
                      </div>
                      <span className="flex-1 truncate">Huffman Compression (DP-3)</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#c7c7cc] shrink-0" />
                    </motion.button>
                  );
                })()}
              </div>
            </div>

          </div>

          {/* Quick Environment Metadata Footer (Compact and light) */}
          <div className="hidden lg:block pt-4 border-t border-[#e5e5ea] text-[10px] font-mono text-[#8e8e93] leading-relaxed">
            <div className="flex items-center gap-1 text-slate-700 font-bold mb-1.5">
              <Terminal className="h-3 w-3" /> Runtime Specs
            </div>
            <div>STATION: SURVIVAL PREDICTIONS PORTAL</div>
            <div>STATUS: COMPILED SUCCESSFULLY</div>
            <div>VER: 1.0.0 (PRODUCTION)</div>
            <div className="mt-2 text-[9px] text-[#8e8e93] italic select-none">
              Premium light design pattern
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Interactive Working Board */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full space-y-6">
          
          {/* Global error notifications */}
          {errorMsg && (
            <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/25 p-4 rounded-xl text-[#ff3b30] text-xs flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#ff3b30] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block mb-0.5">Application Error</strong>
                  <span>{errorMsg}</span>
                </div>
              </div>
              <button
                onClick={handleRetryLoad}
                className="cursor-pointer shrink-0 bg-[#ff3b30] hover:bg-[#e02e24] text-white font-semibold px-3 py-1.5 rounded-lg text-xs tracking-wide shadow-sm transition-colors duration-150"
              >
                Retry Load
              </button>
            </div>
          )}

          {/* Load indicator state */}
          {loadingFile && (
            <div className="relative z-10 bg-white border border-[#e5e5ea] p-4 rounded-xl flex items-center justify-center gap-3 shadow-xs">
              <Loader2 className="h-4.5 w-4.5 animate-spin text-[#007aff]" />
              <div className="text-xs font-medium text-slate-600">
                Opening whitelisted repo component: <code className="font-bold font-mono bg-slate-100 text-[#007aff] px-1 py-0.5 rounded text-[11px]">{loadingFile}</code>
              </div>
            </div>
          )}

          {/* Interactive Animations wrapper */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem}
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="space-y-6"
            >
              
              {/* PAGE VIEW 1: Document View */}
              {activeItem === "overview" && (
                <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#e5e5ea] pb-4 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900">Project README Manual</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Application documentation and portfolio configuration</p>
                    </div>
                  </div>

                  <div className="mt-4 prose prose-slate max-w-none text-xs leading-relaxed text-slate-700 break-words overflow-x-auto select-text font-medium">
                    {fileContentCache["README.md"] ? (
                      <Markdown>{fileContentCache["README.md"]}</Markdown>
                    ) : (
                      !loadingFile && <div className="text-[#8e8e93] text-center py-10 italic">Awaiting document stream...</div>
                    )}
                  </div>
                </div>
              )}

              {/* PAGE VIEW 2: Fibonacci Explorer View */}
              {activeItem === "daa1" && (
                <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#e5e5ea] pb-4 mb-6">
                    <div className="p-2 bg-red-100 rounded-lg text-red-650">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 font-sans tracking-tight">DAA Assignment 1: Fibonacci Performance Analyzer</h2>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">Benchmarking O(2^N) recursive limits versus iterative O(N) execution speeds</p>
                    </div>
                  </div>

                  {fileContentCache["Daa1"] ? (
                    <Daa1Explorer sourceCode={fileContentCache["Daa1"]} />
                  ) : (
                    !loadingFile && <div className="text-[#8e8e93] text-center py-10 italic">Awaiting document stream...</div>
                  )}
                </div>
              )}

              {/* PAGE VIEW 3: Huffman Explorer View */}
              {activeItem === "dp3" && (
                <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#e5e5ea] pb-4 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-650">
                      <Binary className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 font-sans tracking-tight">DP Assignment 3: Huffman Code Tree Synthesizer</h2>
                      <p className="text-xs text-slate-500 mt-0.5 font-semibold">Constructing prefix-code examples based on character occurrence rates</p>
                    </div>
                  </div>

                  {fileContentCache["dp3"] ? (
                    <Dp3Explorer sourceCode={fileContentCache["dp3"]} />
                  ) : (
                    !loadingFile && <div className="text-[#8e8e93] text-center py-10 italic">Awaiting document stream...</div>
                  )}
                </div>
              )}



              {/* PAGE VIEW 4: Assignments Detailed Dashboard views */}
              {activeTask && (
                <div className="space-y-6">
                  
                  {/* Task Header Description Panel */}
                  <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 md:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-[#e5e5ea]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] bg-[#007aff]/10 text-[#007aff] uppercase tracking-wider font-extrabold font-mono px-2.5 py-1 rounded-full">
                          {activeTask.id.toUpperCase()}
                        </span>
                        <h2 className="text-base font-black text-slate-900 leading-tight">{activeTask.title}</h2>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8e8e93] font-mono leading-none">
                        <Cpu className="h-3.5 w-3.5 text-[#007aff]" /> Grounded Evaluator
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-600 leading-relaxed mt-4 font-semibold">
                      {activeTask.description}
                    </p>
                    
                    <div className="mt-4 pt-3.5 border-t border-[#e5e5ea] flex flex-col sm:flex-row sm:items-center gap-4 text-[11px] text-[#8e8e93] select-none font-mono">
                      <div className="flex items-center gap-1.5">
                        <Code className="h-3.5 w-3.5 text-[#8e8e93]" />
                        <span className="truncate max-w-[200px]" title={activeTask.notebook}>{activeTask.notebook}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-[#8e8e93]" />
                        <span className="truncate max-w-[200px]" title={activeTask.dataset}>{activeTask.dataset}</span>
                      </div>
                    </div>
                  </div>

                  {/* iOS Style Segmented Tab Controls (Beautiful Sliding Underlay pill) */}
                  <div className="bg-[#e3e3e8] p-0.5 rounded-lg flex items-center select-none w-fit max-w-full">
                    {(["demo", "notebook", "dataset"] as const).map(tabKey => {
                      const isActive = activeSubtab === tabKey;
                      const getLabel = (k: typeof tabKey) => {
                        if (k === "demo") return "Interactive Predictor";
                        if (k === "notebook") return "Jupyter Notebook cells";
                        return "Dataset explorer";
                      };
                      return (
                        <button
                          key={tabKey}
                          onClick={() => setActiveSubtab(tabKey)}
                          className="cursor-pointer relative px-4 py-1.5 text-[11px] font-bold text-slate-800 transition-colors focus:outline-none select-none px-4"
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeSubtab"
                              className="absolute inset-0 bg-white rounded-md shadow-xs"
                              transition={{ type: "spring", stiffness: 450, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10 block whitespace-nowrap px-1">
                            {getLabel(tabKey)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SUBTAB DETAILS */}
                  <div className="mt-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSubtab}
                        initial={{ opacity: 0, scale: 0.995, y: 3 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.995, y: -3 }}
                        transition={{ duration: 0.15 }}
                      >
                        {activeSubtab === "demo" && (
                          <PredictionForm
                            task={activeTask}
                            prefillValues={rowPrefill}
                            onClearPrefill={() => setRowPrefill(null)}
                            datasetText={fileContentCache[activeTask.dataset] || ""}
                          />
                        )}

                        {activeSubtab === "notebook" && (
                          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
                            {fileContentCache[activeTask.notebook] ? (
                              <NotebookViewer notebook={fileContentCache[activeTask.notebook] as JupyterNotebook} />
                            ) : (
                              !loadingFile && <div className="text-slate-400 text-center py-10 italic text-xs">Opening cells...</div>
                            )}
                          </div>
                        )}

                        {activeSubtab === "dataset" && (
                          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
                            {fileContentCache[activeTask.dataset] ? (
                              <DatasetExplorer
                                csvText={fileContentCache[activeTask.dataset]}
                                filename={activeTask.dataset}
                                onRowSelect={handlePrefillSelect}
                              />
                            ) : (
                              !loadingFile && <div className="text-slate-400 text-center py-10 italic text-xs">Opening raw CSV data file...</div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </main>
      </div>

      {/* iOS styled specifications and settings sheet drawer */}
      <IosDrawer
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
        title="Diagnostic Spec Desk"
        subtitle="Survival Predictions Portal System Properties"
      >
        {/* SECTION 1: SYSTEM DETAILS */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider pl-3 block">
            System Subsystem Properties
          </span>
          <div className="bg-white rounded-[14px] border border-[#e5e5ea] overflow-hidden divide-y divide-[#e5e5ea] text-xs">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[#007aff] flex items-center justify-center text-white font-bold text-[10px]">
                  OS
                </div>
                <span className="font-semibold text-slate-800">Operational Subsystem</span>
              </div>
              <span className="font-mono text-[#8e8e93] font-semibold">NodeJS / React-Vite</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[#ff3b30] flex items-center justify-center text-white text-[10px]">
                  ⚙️
                </div>
                <span className="font-semibold text-slate-800">Engine Build Version</span>
              </div>
              <span className="font-mono text-[#8e8e93] font-semibold">v1.2.0 (Stable Release)</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[#34c759] flex items-center justify-center text-white text-[10px]">
                  📡
                </div>
                <span className="font-semibold text-slate-800">Database Streams state</span>
              </div>
              <span className="font-mono text-emerald-600 font-bold">4 CSV catalogs connected</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[#ff9500] flex items-center justify-center text-white text-[10px]">
                  🧠
                </div>
                <span className="font-semibold text-slate-800">Empirical Coefficients</span>
              </div>
              <span className="font-mono text-[#8e8e93] font-semibold">Notebook-backed demo</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: MATHEMATICAL MODEL ARCHITECTURES */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider pl-3 block">
            Integrated Model Architectures
          </span>
          <div className="bg-white rounded-[14px] border border-[#e5e5ea] overflow-hidden divide-y divide-[#e5e5ea] text-xs">
            
            {/* Model 1 */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900">Task 1: Titanic Survival</span>
                <span className="text-[10px] bg-[#007aff]/10 text-[#007aff] px-2 py-0.5 rounded-full font-bold">
                  Random Forest
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Demonstrates a Titanic survival classification workflow using passenger age, class, fare, family size, and gender features. The live portal uses local prediction logic for interactive review.
              </p>
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 font-mono text-[9.5px] leading-relaxed text-slate-700">
                z = 0.5 + 2.2(Female) - 1.8(Male) + 1.3(1st Class) - 1.2(3rd Class) + 0.8(Child) + 0.4(Mid Family) - 1.3(Big Family)
              </div>
            </div>

            {/* Model 2 */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900">Task 2: Movies Rating Prediction</span>
                <span className="text-[10px] bg-[#ff9500]/10 text-[#ff9500] px-2 py-0.5 rounded-full font-bold">
                  Linear Regression (OLS)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Continuous numerical rating predictor mapping years, storytelling length, vote log ratios, and select cast weights. R-squared metric scores at <strong>~0.28 overall fit</strong> on Indian movie archives.
              </p>
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 font-mono text-[9.5px] leading-relaxed text-slate-700">
                Rating = 5.4 + (2018-Y)*0.006 + (Dur-100)*0.005 + log10(Votes)*0.22 + GenreOffsets(Drama=0.4, Biography=0.6) + StarOffset
              </div>
            </div>

            {/* Model 3 */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900">Task 3: Iris Classification</span>
                <span className="text-[10px] bg-[#af52de]/10 text-[#af52de] px-2 py-0.5 rounded-full font-bold">
                  Decision Tree
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Perfect linear categorization splitting Setosa classes early at Petal Length boundaries (2.45cm) and Versicolor/Virginica splits at Petal Width (1.75cm). Accuracy scores at <strong>97.3% testing split stability</strong>.
              </p>
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 font-mono text-[9.5px] leading-relaxed text-slate-700">
                Split 0: Petal_Length &lt;= 2.45cm ? Iris-setosa : (Petal_Width &lt;= 1.75cm ? Iris-versicolor : Iris-virginica)
              </div>
            </div>

            {/* Model 4 */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900">Task 4: Sales Predictions</span>
                <span className="text-[10px] bg-[#34c759]/10 text-[#34c759] px-2 py-0.5 rounded-full font-bold">
                  Simple Linear fit
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Univariate analytical linear regression fitted on TV advertisement outputs from "advertising.csv". Scoring a highly significant <strong>~0.81 R-squared correlation factor</strong>.
              </p>
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 font-mono text-[9.5px] leading-relaxed text-slate-700">
                Predicted Sales = 6.7308 + (0.0578 * TV_Channel_Budget)
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: CODE STANDARDS */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider pl-3 block">
            Algorithmic Programming Lab Cores
          </span>
          <div className="bg-white rounded-[14px] border border-[#e5e5ea] overflow-hidden divide-y divide-[#e5e5ea] text-xs">
            <div className="p-3.5 flex items-start gap-3">
              <div className="p-2 bg-[#ff3b30]/10 text-[#ff3b30] rounded-lg text-sm font-black shrink-0">
                F
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800">Fibonacci Core (DAA-1)</div>
                <p className="text-[11px] text-[#8e8e93] leading-relaxed font-semibold">
                  Recursion O(2^N) stack limits vs Iterative O(N) constant memory footprint benchmark. Ensures thread-level protection at heavy limits.
                </p>
              </div>
            </div>
            <div className="p-3.5 flex items-start gap-3">
              <div className="p-2 bg-[#5856d6]/10 text-[#5856d6] rounded-lg text-sm font-black shrink-0">
                H
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800">Huffman Dynamic Compression (DP-3)</div>
                <p className="text-[11px] text-[#8e8e93] leading-relaxed font-semibold">
                  Binary Prefix Tree compilation. Builds prefix structures dynamically based on active corpus occurrence rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </IosDrawer>

    </div>
  );
}
