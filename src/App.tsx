import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Settings2,
  Trash2,
  Share2,
  History,
  Languages
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { cn } from "./lib/utils";
import { summarizeText, type SummaryType, type SummaryLength, type GlossaryItem } from "./services/geminiService";

interface HistoryItem {
  id: string;
  originalText: string;
  summary: string;
  glossary: GlossaryItem[];
  timestamp: number;
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [glossary, setGlossary] = useState<GlossaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryType, setSummaryType] = useState<SummaryType>("bullets");
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("medium");
  const [tone, setTone] = useState("professional");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handleSummarize = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    setSummary("");

    try {
      const result = await summarizeText(inputText, {
        type: summaryType,
        length: summaryLength,
        tone: tone
      });
      setSummary(result.summary);
      setGlossary(result.glossary);
      
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        originalText: inputText.substring(0, 100) + "...",
        summary: result.summary,
        glossary: result.glossary,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev.slice(0, 9)]);
    } catch (error) {
      setSummary("Error: Failed to generate summary. Please check your API key.");
      setGlossary([]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden border-8 border-slate-200">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <span className="font-bold tracking-tighter text-xl text-slate-900 uppercase">Core.Summarizer</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <button className="text-slate-900 border-b-2 border-slate-900 pb-1">Dashboard</button>
            <button onClick={() => setShowHistory(true)} className="hover:text-slate-900 transition-colors">History</button>
            <span className="opacity-30">v1.2</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Parameters Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-8">
          <div className="mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 font-mono">Parameters</h3>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block mb-3">Length</label>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { id: 'short', label: 'Short' },
                    { id: 'medium', label: 'Mid' },
                    { id: 'long', label: 'Long' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSummaryLength(l.id as SummaryLength)}
                      className={cn(
                        "h-9 text-[10px] font-bold uppercase tracking-widest transition-all text-left px-3 border",
                        summaryLength === l.id 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block mb-3">Format</label>
                <div className="space-y-1">
                  {[
                    { id: 'bullets', label: 'Bullet Points' },
                    { id: 'concise', label: 'Concise' },
                    { id: 'detailed', label: 'Comprehensive' },
                    { id: 'key-takeaways', label: 'Takeaways' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSummaryType(t.id as SummaryType)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 text-[10px] font-bold uppercase tracking-widest border transition-all",
                        summaryType === t.id 
                          ? "border-slate-900 text-slate-900" 
                          : "border-slate-50 text-slate-300 hover:border-slate-100"
                      )}
                    >
                      <span>{t.label}</span>
                      <div className={cn(
                        "w-2 h-2 transition-all",
                        summaryType === t.id ? "bg-slate-900" : "border border-slate-200"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block mb-3">Tone</label>
                <div className="grid grid-cols-1 gap-1">
                  {["professional", "casual", "academic"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={cn(
                        "h-8 text-[10px] font-bold uppercase tracking-widest text-left px-3 border",
                        tone === t 
                          ? "bg-slate-100 text-slate-900 border-slate-200" 
                          : "border-transparent text-slate-400 hover:bg-slate-50"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto border-t border-slate-100 pt-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 font-mono">Process Load</h3>
            <div className="h-1 w-full bg-slate-100 mb-2">
              <div 
                className="h-full bg-slate-900 transition-all duration-1000" 
                style={{ width: isLoading ? '100%' : '0%' }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest">
              <span>{isLoading ? 'Processing' : 'Idle'}</span>
              <span className="text-slate-400">{isLoading ? '100%' : '0%'}</span>
            </div>
          </div>
        </aside>

        {/* Main Interface */}
        <section className="flex-1 flex flex-col p-8 gap-8 overflow-hidden">
          <div className="flex-1 grid grid-cols-2 gap-8 overflow-hidden">
            {/* Input Side */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Source Material</span>
                <div className="flex gap-4">
                  <button 
                    onClick={async () => setInputText(await navigator.clipboard.readText())}
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
                  >
                    Paste
                  </button>
                  <button 
                    onClick={() => { setInputText(""); setSummary(""); }}
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="INPUT.RAW_TEXT_DATA..."
                className="flex-1 bg-white border border-slate-200 p-6 text-sm text-slate-600 leading-relaxed focus:outline-none focus:border-slate-900 transition-colors resize-none font-mono placeholder:text-slate-200"
              />
              <div className="mt-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest flex justify-between">
                <span>{wordCount} Words</span>
                <span>Ready</span>
              </div>
            </div>

            {/* Output Side */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">AI Generated Results</span>
                <div className="flex gap-2 items-center">
                  <div className={cn("w-1.5 h-1.5 rounded-full", isLoading ? "bg-amber-500 animate-pulse" : summary ? "bg-green-500" : "bg-slate-200")} />
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                    {isLoading ? 'Computing' : summary ? 'Complete' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className={cn(
                "flex-1 p-8 relative overflow-y-auto transition-all duration-300",
                summary ? "bg-slate-900 text-white" : "bg-white border border-slate-200 border-dashed"
              )}>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center space-y-4 pt-20"
                    >
                      <div className="w-12 h-12 border-2 border-slate-200 border-t-slate-900 animate-spin" />
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Neutralizing Noise...</p>
                    </motion.div>
                  ) : summary ? (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative z-10"
                    >
                      <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                        <div className="w-48 h-48 border-8 border-white"></div>
                      </div>
                      <h2 className="text-xl font-bold mb-8 border-l-4 border-white pl-4 uppercase tracking-tighter">Executive Summary</h2>
                      <div className="markdown-body text-slate-300 opacity-90 font-light tracking-wide leading-[1.8]">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                      </div>

                      {glossary.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-white/10">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-6 font-mono">Glossary.Term_Definitions</h3>
                          <div className="space-y-4">
                            {glossary.map((item, idx) => (
                              <div key={idx} className="group/item">
                                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1 group-hover/item:text-amber-400 transition-colors">
                                  {item.word}
                                </span>
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                  {item.definition}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-12 flex gap-2">
                        <button 
                          onClick={copyToClipboard}
                          className="px-5 py-2.5 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors"
                        >
                          {copied ? 'Copied' : 'Copy Output'}
                        </button>
                        <button className="px-5 py-2.5 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-colors">
                          Export Data
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-200 pt-20">
                      <div className="w-20 h-20 border border-slate-100 rotate-45 flex items-center justify-center mb-6">
                        <Zap size={24} className="text-slate-100 -rotate-45" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">Awaiting Signal</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="h-20 bg-white border-2 border-slate-900 flex items-center justify-between px-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.1)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)]">
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tighter">Core Model</span>
                <span className="text-xs font-bold uppercase tracking-tight">Gemini-Pro.Flash</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tighter">Latency</span>
                <span className="text-xs font-bold font-mono tracking-tight">{isLoading ? '---' : '42ms'}</span>
              </div>
            </div>
            <button 
              onClick={handleSummarize}
              disabled={!inputText.trim() || isLoading}
              className="bg-slate-900 text-white px-12 h-12 text-xs font-bold uppercase tracking-[0.4em] hover:bg-slate-800 disabled:opacity-20 transition-all active:scale-95"
            >
              {isLoading ? 'Computing...' : 'Compress Data'}
            </button>
          </div>
        </section>
      </main>
      
      {/* History Slide-out */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[400px] bg-white border-l-8 border-slate-900 z-[110] p-10 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-lg font-bold uppercase tracking-tighter">Log.Archive</h3>
                <button onClick={() => setShowHistory(false)} className="hover:rotate-90 transition-transform">
                  <ArrowRight />
                </button>
              </div>
              
              <div className="flex-1 space-y-4 overflow-y-auto">
                {history.length === 0 ? (
                  <div className="text-center py-20 text-slate-300">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Zero records found</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { 
                        setSummary(item.summary); 
                        setGlossary(item.glossary || []);
                        setShowHistory(false); 
                      }}
                      className="w-full text-left p-5 border border-slate-100 hover:border-slate-900 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={14} />
                      </div>
                      <p className="text-[9px] font-mono text-slate-400 mb-2 uppercase tracking-widest">
                        [{new Date(item.timestamp).toLocaleTimeString()}]
                      </p>
                      <p className="text-[11px] font-bold text-slate-600 line-clamp-2 uppercase tracking-tight group-hover:text-slate-900 transition-colors leading-relaxed">
                        {item.originalText}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="h-8 bg-slate-100 border-t border-slate-200 flex items-center justify-between px-8 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
        <span>Status: System.Operational</span>
        <div className="flex gap-4">
          <span>{wordCount} Blocks</span>
          <span>© 2026 Core Data Systems</span>
        </div>
      </footer>
    </div>
  );
}
