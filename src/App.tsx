/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  Palette, 
  Layout, 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Layers, 
  Search,
  ExternalLink,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Plus,
  ShoppingBag,
  Zap,
  CheckCircle2,
  FileCode,
  Loader2,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { generateWordPressTheme, WordPressThemeFile } from './services/wpGenerator';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// --- Types ---

type ComponentType = 'Hero' | 'Features' | 'Pricing' | 'Gallery' | 'Footer';
type DesignStyle = 'Stitch' | 'Minimalist' | 'Brutalist' | 'Luxury';

interface GeneratedDesign {
  id: string;
  type: ComponentType;
  style: DesignStyle;
  title: string;
  thumbnail: string;
  prompt: string;
  timestamp: Date;
}

// --- Mock Data --- (Since image quota is out, we use descriptive placeholders)
const INITIAL_DESIGNS: GeneratedDesign[] = [
  {
    id: '1',
    type: 'Hero',
    style: 'Stitch',
    title: 'Cloud SaaS Hero',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    prompt: 'Material Design 3 style hero section for SaaS, geometric shapes, blue accents',
    timestamp: new Date()
  },
  {
    id: '2',
    type: 'Features',
    style: 'Minimalist',
    title: 'Precision Grid',
    thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800',
    prompt: 'Clean feature grid with thin borders and minimal icons',
    timestamp: new Date()
  },
  {
    id: '3',
    type: 'Gallery',
    style: 'Luxury',
    title: 'Portfolio Mosaic',
    thumbnail: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=800',
    prompt: 'Serif-based portfolio gallery with overlapping images',
    timestamp: new Date()
  }
];

export default function App() {
  const [designs, setDesigns] = useState<GeneratedDesign[]>(INITIAL_DESIGNS);
  const [selectedType, setSelectedType] = useState<ComponentType>('Hero');
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>('Stitch');
  const [activeTab, setActiveTab] = useState<'Workspace' | 'Marketplace' | 'Components'>('Workspace');
  const [aiEngine, setAiEngine] = useState<'DeepSeek' | 'Gemini'>('DeepSeek');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDesigns = useMemo(() => {
    return designs.filter(d => 
      (d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.type.toLowerCase().includes(searchQuery.toLowerCase())) &&
      d.type === selectedType
    );
  }, [designs, searchQuery, selectedType]);

  const [isMapping, setIsMapping] = useState(false);
  const [activeDesign, setActiveDesign] = useState<GeneratedDesign | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<WordPressThemeFile[]>([]);
  const [activeFile, setActiveFile] = useState<WordPressThemeFile | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation loop
    setTimeout(() => {
      const newDesign: GeneratedDesign = {
        id: Math.random().toString(36).substr(2, 9),
        type: selectedType,
        style: selectedStyle,
        title: `${selectedStyle} ${selectedType} ${designs.length + 1}`,
        thumbnail: `https://picsum.photos/seed/${Math.random() * 1000}/800/600`, // Randomize seed
        prompt: `Create a professional ${selectedStyle} visual for a wordpress theme ${selectedType} section, incorporating Material Design 3 principles, high contrast, clean lines.`,
        timestamp: new Date()
      };
      setDesigns([newDesign, ...designs]);
      setIsGenerating(false);
    }, 2000);
  };

  const openMapper = async (design: GeneratedDesign) => {
    setActiveDesign(design);
    setIsMapping(true);
    setIsExporting(true);
    setGeneratedFiles([]); // Reset previous files
    setGenerationError(null);
    
    // Generate actual theme files from the design prompt
    try {
      const files = await generateWordPressTheme(design.prompt, design.type, aiEngine);
      if (files && files.length > 0) {
        setGeneratedFiles(files);
        setActiveFile(files[0]);
      } else {
        setGenerationError("The server returned an empty file list. This might be a model issue.");
      }
    } catch (err: any) {
      setGenerationError(err.message || "An unexpected error occurred during theme generation.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTheme = async () => {
    if (generatedFiles.length === 0) return;
    
    const zip = new JSZip();
    const themeFolder = zip.folder("stitch-wordpress-theme");
    
    generatedFiles.forEach(file => {
      themeFolder?.file(file.path, file.content);
    });
    
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "stitch-wordpress-theme.zip");
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">S</div>
          <span className="text-xl font-bold tracking-tight text-slate-800">StitchStudio <span className="text-blue-600 italic font-medium text-sm ml-1">Pro</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('Workspace')}
            className={cn(
              "transition-all pb-1",
              activeTab === 'Workspace' ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Workspace
          </button>
          <button 
            onClick={() => setActiveTab('Marketplace')}
            className={cn(
              "transition-all pb-1",
              activeTab === 'Marketplace' ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Marketplace Demos
          </button>
          <button 
            onClick={() => setActiveTab('Components')}
            className={cn(
              "transition-all pb-1",
              activeTab === 'Components' ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Stitch Components
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search concepts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 w-48 transition-all"
            />
          </div>
          <button className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95">
            Sync Assets
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Modal Overlay */}
        <AnimatePresence>
          {isMapping && activeDesign && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] border border-slate-200"
              >
                <div className="w-full md:w-2/5 bg-slate-50 p-10 flex flex-col border-r border-slate-100">
                  <div className="relative group mb-8">
                    <img 
                      src={activeDesign.thumbnail} 
                      alt={activeDesign.title} 
                      className="w-full aspect-video object-cover rounded-2xl shadow-xl border border-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm">
                        <Monitor className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold mb-3 tracking-tight text-slate-900">{activeDesign.title}</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed italic">"{activeDesign.prompt}"</p>
                  
                  <div className="mt-auto space-y-4">
                     <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-2">Blueprint Protocol</span>
                        <p className="text-xs text-blue-800/80 leading-relaxed">
                          Design adheres to 12-column Material 3 grid. Mapping optimized for <strong>ACF Pro</strong> and <strong>Carbon Fields</strong>.
                        </p>
                     </div>
                  </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto bg-white">
                  <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Standardized Codeblock</h4>
                      <p className="text-slate-900 font-bold">WordPress Theme Files Generator</p>
                    </div>
                    <button onClick={() => setIsMapping(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                      <Plus className="w-6 h-6 rotate-45" />
                    </button>
                  </div>

                  {isExporting ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest text-center">
                        Architecting WordPress Theme with DeepSeek...<br/>
                        <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400 mt-2 block opacity-60 italic">This usually takes 15-30 seconds</span>
                      </p>
                    </div>
                  ) : generationError ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-6 text-center">
                      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                        <Plus className="w-8 h-8 rotate-45" />
                      </div>
                      <div className="px-6">
                        <p className="text-sm font-bold text-red-600">Generation Failed</p>
                        <p className="text-[11px] text-slate-500 mt-2 max-w-xs mx-auto font-medium">
                          {generationError}
                        </p>
                        {generationError.toLowerCase().includes("balance") || generationError.toLowerCase().includes("402") ? (
                          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-700 font-medium text-left">
                            <span className="font-bold underline uppercase mb-1 block">Billing Required:</span>
                            Your DeepSeek account has <span className="font-bold">Insufficient Balance</span>. 
                            <a href="https://platform.deepseek.com/usage" target="_blank" className="block mt-1 text-blue-600 underline">Top up at DeepSeek Dashboard</a>
                          </div>
                        ) : generationError.toLowerCase().includes("key") && (
                          <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[10px] text-blue-700 font-medium text-left">
                            <span className="font-bold underline uppercase mb-1 block">Help Troubleshooting:</span>
                            1. Go to <span className="font-bold">Settings &gt; Secrets</span><br/>
                            2. Add <span className="font-bold text-blue-600">DEEPSEEK_API_KEY</span><br/>
                            3. Restart the server if it persists.
                          </div>
                        )}
                        <button 
                          onClick={() => activeDesign && openMapper(activeDesign)}
                          className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg hover:shadow-slate-900/20 active:scale-95"
                        >
                          Retry Generation
                        </button>
                      </div>
                    </div>
                  ) : generatedFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-6 text-center">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Command...</p>
                    </div>
                  ) : (
                    <section className="space-y-10">
                      <div>
                        {/* File Selector */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 border-b border-slate-100">
                          {generatedFiles.map(file => (
                            <button
                              key={file.path}
                              onClick={() => setActiveFile(file)}
                              className={cn(
                                "px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-2",
                                activeFile?.path === file.path 
                                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                                  : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              )}
                            >
                              <FileCode className="w-3 h-3" />
                              {file.path}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <h5 className="flex items-center gap-2 font-bold text-slate-800 text-sm italic">
                            <Layers className="w-4 h-4 text-blue-600" />
                            {activeFile?.path || "Select a file"}
                          </h5>
                          <button 
                            onClick={handleDownloadTheme}
                            className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Zip
                          </button>
                        </div>
                        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-inner font-mono relative">
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="text-[10px] text-slate-500 ml-2">{activeFile?.path}</span>
                          </div>
                          <pre className="p-6 text-slate-300 text-[11px] leading-relaxed overflow-x-auto h-[400px]">
                            <code>{activeFile?.content || "// Generating code..."}</code>
                          </pre>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pb-10">
                         <div>
                           <h5 className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-4">
                            <Palette className="w-4 h-4 text-blue-600" />
                            Theme Metadata
                          </h5>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">Theme Name</span>
                              <span className="font-mono text-[10px] text-slate-400">StitchPro-v1</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">Framework</span>
                              <span className="font-mono text-[10px] text-slate-400">Stitch_v2.1</span>
                            </div>
                          </div>
                         </div>
                         
                         <div className="flex flex-col justify-end">
                           <button 
                            onClick={handleDownloadTheme}
                            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-extrabold flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all hover:-translate-y-1"
                           >
                            <Save className="w-6 h-6" />
                            Export Functional Theme
                          </button>
                         </div>
                      </div>
                    </section>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>


      {/* Sidebar - Navigation & Settings */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-full shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-20">
        <div className="p-8 pb-4 flex-1 overflow-y-auto">
          <div className="space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Framework Protocol</h3>
              <div className="space-y-2">
                {(['Hero', 'Features', 'Pricing', 'Gallery', 'Footer'] as ComponentType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "w-full px-4 py-3 text-xs font-bold rounded-xl border transition-all flex items-center gap-3 active:scale-[0.98]",
                      selectedType === type 
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-slate-300"
                    )}
                  >
                    <Layout className={cn("w-4 h-4", selectedType === type ? "text-white" : "text-slate-400")} />
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Visual aesthetic</h3>
              <div className="space-y-2">
                {(['Stitch', 'Minimalist', 'Brutalist', 'Luxury'] as DesignStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={cn(
                      "w-full px-5 py-4 text-sm font-bold rounded-2xl border transition-all flex items-center justify-between group",
                      selectedStyle === style 
                        ? "bg-slate-50 border-blue-200" 
                        : "bg-white border-transparent hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black",
                        style === 'Stitch' && "bg-blue-600 text-white",
                        style === 'Minimalist' && "bg-stone-500 text-white",
                        style === 'Brutalist' && "bg-orange-600 text-white",
                        style === 'Luxury' && "bg-amber-600 text-white"
                      )}>{style[0]}</div>
                      <span className={cn(selectedStyle === style ? "text-slate-900" : "text-slate-500")}>{style}</span>
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      selectedStyle === style ? "bg-blue-600 scale-100" : "bg-slate-200 scale-0 group-hover:scale-100"
                    )} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Market Performance</p>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-2xl font-black leading-none">$1.2k <span className="text-[10px] text-blue-400 align-top">+12%</span></p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Avg Theme Revenue</p>
                  </div>
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "72%" }}
                    className="h-full bg-blue-500" 
                   />
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Generation Engine</h3>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-white shadow-inner">
                <button 
                  onClick={() => setAiEngine('DeepSeek')}
                  className={cn(
                    "py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    aiEngine === 'DeepSeek' ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  DeepSeek
                </button>
                <button 
                  onClick={() => setAiEngine('Gemini')}
                  className={cn(
                    "py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    aiEngine === 'Gemini' ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Gemini
                </button>
              </div>
              <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase tracking-widest text-center opacity-60">
                {aiEngine === 'DeepSeek' ? 'Fast & Accurate (Paid)' : 'Official AI Studio (Free)'}
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Custom Concept</h3>
              <textarea 
                placeholder="Describe your design (e.g., 'Modern architecture portfolio with grid layout and floating navbar')..."
                className="w-full bg-slate-50 border border-white rounded-xl p-4 text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all h-32 resize-none shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase tracking-widest">Informs WP Generation</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 relative overflow-hidden"
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : <Sparkles className="w-5 h-5" />}
            {isGenerating ? "Synthesizing..." : "Generate Prototype"}
            {isGenerating && (
              <motion.div 
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content - Gallery */}
      <main className="flex-1 p-12 overflow-y-auto bg-slate-50">
        {activeTab === 'Workspace' ? (
          <>
            <header className="flex items-end justify-between mb-16 border-b border-slate-200 pb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Environment Live</span>
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Marketplace_Elite</h2>
                <p className="text-slate-500 text-lg mt-4 font-medium">Developing high-converting WordPress themes for professional marketplaces.</p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button className="px-4 py-2.5 bg-slate-100 border-r border-slate-300 text-slate-700 hover:bg-slate-200 transition-colors">
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2.5 hover:bg-slate-50 border-r border-slate-300 text-slate-400 transition-colors">
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2.5 hover:bg-slate-50 text-slate-400 transition-colors">
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </header>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <AnimatePresence mode="popLayout">
                {filteredDesigns.map((design, index) => (
                  <motion.div
                    key={design.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                    className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 transition-all hover:-translate-y-2 relative"
                  >
                    <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                      <img 
                        src={design.thumbnail} 
                        alt={design.title}
                        className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-500 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                        <button className="p-4 bg-white rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all text-slate-900">
                          <Download className="w-6 h-6" />
                        </button>
                        <button className="p-4 bg-blue-600 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all text-white">
                          <ExternalLink className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="absolute top-6 left-6">
                        <span className="px-4 py-1.5 bg-white/95 backdrop-blur text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl border border-slate-100">
                          Component: {design.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-extrabold text-2xl tracking-tight text-slate-900">{design.title}</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded">V4.2</span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-8 font-medium">
                        "{design.prompt}"
                      </p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-8">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                             <Zap className="w-4 h-4" />
                           </div>
                           <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Aesthetic</p>
                             <p className="text-xs font-bold text-slate-800 leading-none">{design.style} Mode</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => openMapper(design)}
                          className="group/btn relative px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs overflow-hidden transition-all hover:bg-black active:scale-95"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            Map Blueprint
                            <ChevronRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* New Project Placeholder */}
              <button 
                onClick={handleGenerate}
                className="aspect-[16/10] rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 hover:bg-white hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-600/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-600/30 transition-all duration-500 group-hover:rotate-90">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">New Section Concept</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Add a unique variation to your library</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-8">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">{activeTab} Coming Soon</h2>
            <p className="text-slate-500 max-w-sm font-medium">
              We're currently preparing the {activeTab.toLowerCase()} marketplace assets. Check back soon for synchronized deployments.
            </p>
            <button 
              onClick={() => setActiveTab('Workspace')}
              className="mt-10 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
            >
              Back to Workspace
            </button>
          </div>
        )}
      </main>

      {/* Right Sidebar - Status & Standards */}
      <aside className="w-80 bg-white p-10 border-l border-slate-200 hidden 2xl:flex flex-col z-20">
          <div className="mb-12">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Asset Standards</h3>
            <div className="space-y-6">
              {[
                { label: "ThemeForest Quality Check", status: "Pass" },
                { label: "Gutenberg Full Support", status: "Active" },
                { label: "WooCommerce Ready", status: "Active" },
                { label: "ACF Pro Compatible", status: "Active" }
              ].map(item => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.label}</p>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mt-0.5">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Market Intel</h4>
            <p className="text-xs leading-relaxed text-slate-600 font-medium mb-5">
              "High demand for **Geometric Layouts**. Marketplace customers are currently paying a premium for Stitch-integrated themes."
            </p>
            <div className="flex items-center gap-2">
               <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                 ))}
               </div>
               <span className="text-[10px] font-bold text-slate-400">+14 designers trending</span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <Layout className="w-16 h-16 text-blue-600" />
              </div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Automated Export</p>
              <p className="text-xs text-blue-800 font-bold leading-relaxed mb-4">
                Ready to sync 12 new prototypes to your staging server?
              </p>
              <button className="text-xs font-black text-blue-600 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                OPEN CLOUD CONSOLE
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
      </aside>
      </div>

      {/* Bottom Status Bar */}
      <footer className="bg-slate-900 text-slate-500 px-8 py-2.5 flex items-center justify-between text-[11px] font-bold tracking-wide z-30 shrink-0">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <span className="text-slate-300">SERVER LIVE: BUILD-092-PROD</span>
          </div>
          <div className="hidden sm:block">Active Project: <span className="text-white uppercase tracking-widest text-[10px] px-2 py-0.5 bg-slate-800 rounded ml-2">Marketplace_Elite_2024</span></div>
          <div className="hidden lg:flex items-center gap-2 text-slate-500 border-l border-slate-800 pl-10">
             <Zap className="w-3 h-3" />
             LATENCY: 14ms
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 border-r border-slate-800 pr-8">
            <div className="flex items-center gap-1.5 text-blue-400">
               <Sparkles className="w-3.5 h-3.5" />
               <span className="uppercase tracking-widest text-[10px]">Stitch Engine V2.1</span>
            </div>
          </div>
          <div className="hidden md:block uppercase tracking-widest text-slate-500">WP Version 6.5.2 Detect</div>
          <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-[9px] font-black shadow-lg shadow-blue-600/20">SYNCED</div>
        </div>
      </footer>
    </div>
  );
}
