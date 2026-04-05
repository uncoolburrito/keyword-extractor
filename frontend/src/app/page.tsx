"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, FileText, Settings, Copy, Download, RefreshCw, CheckCircle2, ChevronDown } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader } from "@/components/ui/Loader";

type Keyword = { word: string; score: number };

export default function Home() {
  const [inputType, setInputType] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [method, setMethod] = useState<"semantic" | "baseline" | "advanced">("semantic");
  const [topN, setTopN] = useState(15);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  const keywordVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.name.endsWith(".pdf") || droppedFile.name.endsWith(".docx") || droppedFile.name.endsWith(".txt"))) {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Please upload a PDF, DOCX, or TXT file.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleExtract = async () => {
    if (inputType === "file" && !file) {
      setError("Please select a file first.");
      return;
    }
    if (inputType === "text" && !text.trim()) {
      setError("Please enter some text.");
      return;
    }

    setIsLoading(true);
    setError("");
    setKeywords([]);
    setIsCopied(false);

    try {
      let response;
      if (inputType === "file") {
        const formData = new FormData();
        formData.append("file", file!);
        formData.append("method", method);
        formData.append("top_n", topN.toString());

        response = await fetch("http://localhost:8000/api/extract/file", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("http://localhost:8000/api/extract/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, method, top_n: topN }),
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to extract keywords");
      }

      const data = await response.json();
      setKeywords(data.keywords);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = keywords.map(k => k.word).join(", ");
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadResults = (format: "json" | "csv") => {
    let content = "";
    let mime = "";
    
    if (format === "json") {
      content = JSON.stringify(keywords, null, 2);
      mime = "application/json";
    } else {
      content = "Keyword,Score\n" + keywords.map(k => `"${k.word}",${k.score}`).join("\n");
      mime = "text/csv";
    }
    
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keywords.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col justify-center min-h-[80vh] gap-12 sm:gap-16 px-5 sm:px-6 py-16 sm:py-24">
      {/* Header Section */}
      <motion.header
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between border-b border-foreground/10 pb-8"
      >
        <motion.div variants={itemVariants} className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Keyword Extractor
            </h1>
            <p className="text-sm sm:text-base text-foreground/60 font-medium">
              AI-powered semantic extraction for research papers.
            </p>
          </div>
          <p className="text-sm text-foreground/50 leading-relaxed">
            Upload your academic papers, research articles, or paste text directly. This tool utilizes advanced NLP models to understand the context of your text and instantly extract the highest relevance concepts and keywords. Perfect for researchers and students looking to rapidly summarize documents.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="relative">
          <ThemeToggle />
        </motion.div>
      </motion.header>

      {/* Main Core Interaction */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-8"
      >
        <motion.div variants={itemVariants} className="flex gap-4 border-b border-foreground/10 pb-2">
          <button
            onClick={() => setInputType("file")}
            className={`pb-2 px-2 text-sm font-medium transition-all duration-300 relative ${
              inputType === "file" ? "text-foreground" : "text-foreground/40 hover:text-foreground/80"
            }`}
          >
            File Upload
            {inputType === "file" && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
          <button
            onClick={() => setInputType("text")}
            className={`pb-2 px-2 text-sm font-medium transition-all duration-300 relative ${
              inputType === "text" ? "text-foreground" : "text-foreground/40 hover:text-foreground/80"
            }`}
          >
            Paste Text
            {inputType === "text" && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        </motion.div>

        <motion.div variants={itemVariants}>
          {inputType === "file" ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 group
                ${file ? 'border-foreground/40 bg-foreground/5' : 'border-foreground/10 hover:border-foreground/40 hover:bg-foreground/5'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className={`w-5 h-5 ${file ? 'text-foreground' : 'text-foreground/60'}`} />
              </div>
              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-foreground/40">{(file.size / 1024 / 1024).toFixed(2)} MB • Click or drag to replace</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Drag & drop your paper here</p>
                  <p className="text-xs text-foreground/40">Supports PDF, DOCX, TXT</p>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the abstract or full text of the research paper here..."
              className="w-full h-48 bg-foreground/5 border border-foreground/10 rounded-xl p-6 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20 resize-none transition-all duration-300"
            />
          )}

          {/* Settings Area */}
          <div className="mt-8 grid sm:grid-cols-2 gap-6 bg-foreground/[0.02] border border-foreground/5 p-6 rounded-xl">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                <Settings className="w-3 h-3" /> Extraction Engine
              </label>
              <div className="relative">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full appearance-none bg-background border border-foreground/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/40 transition-colors"
                >
                  <option value="semantic">Semantic (KeyBERT)</option>
                  <option value="advanced">Advanced (RAKE)</option>
                  <option value="baseline">Baseline (TF-IDF)</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
               <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-foreground/50">
                <span>Quantity</span>
                <span className="bg-foreground/10 px-1.5 py-0.5 rounded text-foreground">{topN}</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={topN}
                onChange={(e) => setTopN(parseInt(e.target.value))}
                className="w-full accent-foreground h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer mt-3"
              />
            </div>
          </div>

          {error && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm font-medium">
              {error}
            </motion.div>
          )}

          <button
            onClick={handleExtract}
            disabled={isLoading || (inputType === "file" && !file) || (inputType === "text" && !text)}
            className="mt-8 w-full py-3.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>Processing Document...</>
            ) : (
              <>Extract Keywords <RefreshCw className="w-4 h-4" /></>
            )}
          </button>
        </motion.div>
      </motion.main>

      {/* Loading State or Results */}
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 border border-foreground/5 rounded-2xl bg-foreground/[0.02]"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
            <p className="text-foreground/50 text-xs font-medium tracking-wide animate-pulse">Running analysis...</p>
          </div>
        </motion.div>
      )}

      {!isLoading && keywords.length > 0 && (
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="border-t border-foreground/10 pt-12 space-y-8"
        >
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h2 className="text-xl font-bold text-foreground">
                 Results
               </h2>
               <p className="text-foreground/50 text-xs mt-1">Found {keywords.length} relevant concepts, ordered by relevance.</p>
             </div>
             <div className="flex items-center gap-2">
               <button onClick={copyToClipboard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-foreground/10 text-xs font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors">
                 {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                 {isCopied ? "Copied" : "Copy All"}
               </button>
               <div className="relative group">
                 <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-foreground/10 text-xs font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors">
                   <Download className="w-3.5 h-3.5" /> Export
                 </button>
                 <div className="absolute right-0 mt-1 w-28 bg-background border border-foreground/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                   <button onClick={() => downloadResults("json")} className="w-full text-left px-3 py-2 text-xs font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground rounded-t-lg">JSON</button>
                   <button onClick={() => downloadResults("csv")} className="w-full text-left px-3 py-2 text-xs font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground rounded-b-lg">CSV</button>
                 </div>
               </div>
             </div>
          </motion.div>

          <motion.div variants={containerVariants} className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <motion.div
                variants={keywordVariants}
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-foreground/10 bg-foreground/5 hover:border-foreground/30 hover:bg-foreground/10 transition-colors cursor-default"
              >
                <span className="text-foreground/90 font-medium text-sm">{kw.word}</span>
                <span className="text-[10px] bg-foreground/10 px-1 py-0.5 rounded text-foreground/50 tabular-nums">
                  {(kw.score * 100).toFixed(0)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Footer */}
      <motion.footer 
        variants={itemVariants}
        className="mt-8 pt-8 border-t border-foreground/10 text-center text-sm text-foreground/40 font-medium"
      >
        Built by Ramiz Rahman
      </motion.footer>
    </div>
  );
}
