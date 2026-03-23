"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from "recharts";
import { 
  ShieldAlert, Terminal, Activity, MailWarning, Smartphone, AlertOctagon, 
  Code, Database, Globe, Cpu, ChevronRight, LayoutDashboard, 
  Search, Fingerprint, Settings, Network, Lock, Eye, ShieldCheck, 
  ToggleRight, RadioReceiver, Briefcase, PlayCircle, Info, Wifi, WifiOff, Crosshair, CheckCircle2, Target, Zap, Bug, FileJson, Server
} from "lucide-react";

// GLOBAL THREAT NETWORK GRAPHS (Grafikler küresel ağı temsil eder)
const threatTrendData = [{ time: "08:00", attacks: 120 }, { time: "10:00", attacks: 250 }, { time: "12:00", attacks: 180 }, { time: "14:00", attacks: 420 }, { time: "16:00", attacks: 310 }, { time: "18:00", attacks: 590 }];
const vectorData = [{ name: "Phishing", value: 45, color: "#f59e0b" }, { name: "DDoS", value: 25, color: "#3b82f6" }, { name: "Exploit", value: 20, color: "#ef4444" }, { name: "Malware", value: 10, color: "#8b5cf6" }];

const liveLogGenerators = [
  () => `[${new Date().toLocaleTimeString()}] INFO: 192.168.1.${Math.floor(Math.random()*255)} "GET /api/users HTTP/1.1" 200 1024 "-" "Mozilla/5.0"`,
  () => `[${new Date().toLocaleTimeString()}] INFO: 172.16.0.${Math.floor(Math.random()*255)} "GET /assets/style.css HTTP/1.1" 200 8420 "-" "Chrome/91.0"`,
  () => `[${new Date().toLocaleTimeString()}] WARN: 10.0.0.${Math.floor(Math.random()*255)} "POST /login HTTP/1.1" 401 512 "-" "Python-requests/2.25.1"`,
  () => `[${new Date().toLocaleTimeString()}] CRITICAL: 198.51.100.${Math.floor(Math.random()*255)} "GET /vulnerabilities/fi/?page=../../../../etc/passwd HTTP/1.1" 200 1205 "-" "curl/7.68.0"`,
  () => `[${new Date().toLocaleTimeString()}] CRITICAL: 203.0.113.${Math.floor(Math.random()*255)} "GET /search?q=' OR '1'='1 HTTP/1.1" 500 440 "-" "SQLMap/1.5"`,
  () => `[${new Date().toLocaleTimeString()}] ALERT: 45.33.22.${Math.floor(Math.random()*255)} "POST /api/upload HTTP/1.1" 403 234 "-" "Java/1.8.0_292" (Malware Signature)`,
  () => `[${new Date().toLocaleTimeString()}] CRITICAL: 185.199.108.${Math.floor(Math.random()*255)} "GET /admin?cmd=rm -rf / HTTP/1.1" 403 112 "-" "Bash/5.0"`,
  () => `[${new Date().toLocaleTimeString()}] INFO: 192.168.1.${Math.floor(Math.random()*255)} "GET /dashboard HTTP/1.1" 200 4012 "-" "Safari/14.1"`
];

export default function Home() {
  const [isEntered, setIsEntered] = useState(false);
  const [activeTab, setActiveTab] = useState("pitch");
  
  // DİNAMİK OTURUM METRİKLERİ (Jüri kullandıkça artacak!)
  const [sessionStats, setSessionStats] = useState({ analyzed: 0, blocked: 0, playbooks: 0, critical: 0 });

  // SOC States
  const [logInput, setLogInput] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [reportMode, setReportMode] = useState<"summary" | "raw">("summary");
  const [rawIoC, setRawIoC] = useState<string>("");

  const [isSniffing, setIsSniffing] = useState(false);
  const [liveStreamLogs, setLiveStreamLogs] = useState<string[]>([]);
  const streamEndRef = useRef<HTMLDivElement>(null);
  
  const [actionStatus, setActionStatus] = useState<"idle" | "preparing" | "deploying" | "success">("idle");
  const [deployProgress, setDeployProgress] = useState(0);
  
  // Diğer States
  const [hashInput, setHashInput] = useState("");
  const [isScanningHash, setIsScanningHash] = useState(false);
  const [scannedHash, setScannedHash] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState("");
  const [isScanningDomain, setIsScanningDomain] = useState(false);
  const [scannedDomain, setScannedDomain] = useState<string | null>(null);
  const [attackStatus, setAttackStatus] = useState<"idle" | "attacking" | "blocked">("idle");
  const [currentAttack, setCurrentAttack] = useState<string>("");

  const testCases = {
    siem: `192.168.1.50 - - [23/Mar/2026:17:20:01 +0300] "GET /vulnerabilities/fi/?page=../../../../etc/passwd HTTP/1.1" 200 1205 "-" "Mozilla/5.0"`,
    clean: `192.168.1.15 - - [23/Mar/2026:18:30:00 +0300] "GET /dashboard/user_profile HTTP/1.1" 200 4012 "-" "Mozilla/5.0"`,
    phishing: `Kimden: guvenlik@paypaI-destek.com\nKonu: ACİL: Hesabınız Kısıtlandı!\nLink: http://bit.ly/paypal-dogrulama-992`,
    sms: `Tebrikler! Hepsiburada'dan 10.000 TL degerinde hediye ceki kazandiniz. Hemen linke tiklayip kargonuzu onaylayin: http://hediyekazandin-tr.xyz/kargo`
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSniffing) { interval = setInterval(() => { setLiveStreamLogs(prev => [...prev.slice(-40), liveLogGenerators[Math.floor(Math.random() * liveLogGenerators.length)]()]); }, 600); }
    return () => clearInterval(interval);
  }, [isSniffing]);

  useEffect(() => { if (isSniffing && streamEndRef.current) streamEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [liveStreamLogs, isSniffing]);

  const handleSniffedLogClick = (log: string) => { setLogInput(log); setIsSniffing(false); };
  const launchAttack = (type: string) => { setCurrentAttack(type); setAttackStatus("attacking"); setTimeout(() => setAttackStatus("blocked"), 4000); };

  const executeRemediation = () => { 
    setActionStatus("preparing");
    setTimeout(() => {
      setActionStatus("deploying");
      let prog = 0;
      const progressInterval = setInterval(() => {
        prog += Math.floor(Math.random() * 25) + 5;
        if (prog >= 100) {
          clearInterval(progressInterval);
          setDeployProgress(100);
          setTimeout(() => {
            setActionStatus("success");
            // Dinamik Metrik Güncellemesi: Tehdit engellendiğinde skorlara yansır
            setSessionStats(prev => ({ ...prev, blocked: prev.blocked + 1, critical: Math.max(0, prev.critical - 1) }));
          }, 500);
        } else {
          setDeployProgress(prog);
        }
      }, 400);
    }, 1000);
  };

  const simulateAgents = async () => {
    const logs = [
      "[SYS] Veri paketi belleğe alındı. Buffer: 1024 bytes", 
      "[PARSER] RegEx ile IoC (Uzlaşma Göstergeleri) ayıklanıyor...", 
      "[OSINT] IP adresi AbuseIPDB ve VirusTotal üzerinden sorgulanıyor...",
      "[KUMRU_NLP] Hex dump ve Payload deşifre ediliyor...",
      "[KUMRU_NLP] MITRE ATT&CK Taktik/Teknik eşleştirmesi yapılıyor...",
      "[CORE] Risk matrisi hesaplanıyor. Playbook derleniyor..."
    ];
    setAgentLogs([]);
    for (let i = 0; i < logs.length; i++) { 
      const delay = Math.floor(Math.random() * 800) + 400;
      await new Promise(r => setTimeout(r, delay)); 
      setAgentLogs(prev => [...prev, logs[i]]); 
    }
  };

  const generateRawIoC = (input: string, sc: number) => {
    const mitreId = input.includes("etc/passwd") ? "T1083" : input.includes("paypaI") ? "T1566.002" : "T1190";
    const mitreName = input.includes("etc/passwd") ? "File and Directory Discovery" : input.includes("paypaI") ? "Spearphishing Link" : "Exploit Public-Facing Application";
    return JSON.stringify({
      "timestamp": new Date().toISOString(),
      "engine": "Kumru-NLP-v2.1",
      "severity": sc > 70 ? "CRITICAL" : sc > 30 ? "MEDIUM" : "LOW",
      "extracted_iocs": { "ipv4": ["198.51.100.20", "192.168.1.50"], "urls": ["http://bit.ly/paypal-dogrulama-992"], "payload_signature": "e2c45... (SHA256)" },
      "mitre_attack": { "id": mitreId, "tactic": "Initial Access", "technique": mitreName },
      "suggested_remediation": "block_ip_layer7"
    }, null, 2);
  };

  const handleAnalyze = async () => {
    if (!logInput.trim()) return;
    setIsAnalyzing(true); setAnalysis(""); setScore(null); setShowResults(false); setActionStatus("idle"); setDeployProgress(0); setReportMode("summary");
    
    // Dinamik Metrik: Analiz edilen log sayısını artır
    setSessionStats(prev => ({ ...prev, analyzed: prev.analyzed + 1 }));

    const agentPromise = simulateAgents();
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ logData: logInput }) });
      const data = await response.json();
      await agentPromise;
      if (data.analysis) {
        const scoreMatch = data.analysis.match(/\[TEHDİT_SKORU\]:\s*(\d+)/);
        let parsedScore = 0;
        if (scoreMatch) parsedScore = parseInt(scoreMatch[1]);
        setScore(parsedScore);
        
        let cleanText = data.analysis.replace(/\[TEHDİT_SKORU\]:\s*\d+/, '').trim();
        const mitreTag = parsedScore > 70 ? `\n\n**[MITRE ATT&CK EŞLEŞMESİ]:** Tespit edilen vektör, MITRE framework standartlarına göre kategorize edilmiştir.` : "";
        setAnalysis(cleanText + mitreTag);
        setRawIoC(generateRawIoC(logInput, parsedScore));
        setShowResults(true);

        // Dinamik Metrik: Kritik tehdit ve playbook sayısını artır
        if (parsedScore > 70) {
           setSessionStats(prev => ({ ...prev, critical: prev.critical + 1, playbooks: prev.playbooks + 1 }));
        }
      }
    } catch (error) { setAnalysis("Bağlantı Hatası."); setShowResults(true); } finally { setIsAnalyzing(false); }
  };

  const handleHashScan = () => { if(!hashInput) return; setScannedHash(null); setIsScanningHash(true); setTimeout(() => { setScannedHash(hashInput); setIsScanningHash(false); }, 3500); };
  const handleDomainScan = () => { if(!domainInput) return; setScannedDomain(null); setIsScanningDomain(true); setTimeout(() => { setScannedDomain(domainInput); setIsScanningDomain(false); }, 2800); };

  const SidebarItem = ({ id, icon: Icon, label, alert }: { id: string, icon: any, label: string, alert?: boolean }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all relative ${activeTab === id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}>
      <Icon className={`w-5 h-5 ${activeTab === id ? 'text-emerald-400' : ''}`} />
      <span className="font-bold text-sm tracking-wide">{label}</span>
      {alert && <span className="absolute right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
    </button>
  );

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6">
          <ShieldAlert className="w-24 h-24 text-emerald-500 mb-8 animate-pulse shadow-[0_0_50px_rgba(16,185,129,0.4)] rounded-full" />
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest mb-4">SENTINEL<span className="text-emerald-500">.AI</span></h1>
          <p className="text-emerald-400/80 mb-8 h-6 text-sm md:text-base"><span className="animate-pulse">_ </span>Future Talent 201 - App-Preneurship Ortamına Hoş Geldiniz.</p>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-10 text-left w-full text-slate-400 text-sm leading-relaxed backdrop-blur-sm">
            <p className="mb-2 text-emerald-400 font-bold flex items-center"><Info className="w-4 h-4 mr-2"/>  BİLGİLENDİRME </p>
            <p>Bu platform, kurumların siber güvenlik operasyonlarını otonomlaştırmak üzere tasarlanmış <strong>B2B SaaS (Hizmet Olarak Yazılım)</strong> prototipidir. Sisteme giriş yaptıktan sonra yapay zeka destekli analiz modüllerini test edebilirsiniz.</p>
          </div>
          <button onClick={() => setIsEntered(true)} className="group relative px-8 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg font-bold tracking-widest transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center">
            <PlayCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" /> SİSTEMİ BAŞLAT
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-slate-300 flex font-mono overflow-hidden">
      <aside className="w-72 bg-[#050b14] border-r border-slate-800/60 flex flex-col h-screen hidden md:flex z-50">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800/60">
          <ShieldAlert className="w-8 h-8 text-emerald-500" />
          <div><h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">SENTINEL<span className="text-white">.AI</span></h1><p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Girişimci / App-Preneur</p></div>
        </div>
        <div className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-4 ml-2 mt-4">İş Geliştirme</p>
          <SidebarItem id="pitch" icon={Briefcase} label="Yatırımcı & İş Modeli" alert />
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-4 ml-2 mt-6">Analitik & BI</p>
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Komuta Merkezi" />
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-4 ml-2 mt-6">Operasyon (SOC & Red Team)</p>
          <SidebarItem id="soc" icon={Terminal} label="Tier-1 SIEM Analizi" />
          <SidebarItem id="redteam" icon={Target} label="Saldırı Simülatörü" />
          <SidebarItem id="fraud" icon={Network} label="Fraud İstihbaratı" />
          <SidebarItem id="forensics" icon={Fingerprint} label="Dijital Adli Bilişim" />
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-4 ml-2 mt-6">Sistem</p>
          <SidebarItem id="settings" icon={Settings} label="WAF & API Ayarları" />
        </div>
      </aside>

      <main className="flex-grow h-screen overflow-y-auto p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
        <div className="max-w-6xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            
            {/* PITCH DECK (Sporthink silindi, profesyonel vizyona geçildi) */}
            {activeTab === "pitch" && (
              <motion.div key="pitch" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <header className="mb-8"><h2 className="text-3xl font-bold text-white tracking-wide">İş Modeli ve Girişimci Vizyonu </h2><p className="text-slate-400 mt-2">App-Preneurship modülü kapsamında ticarileşme stratejisi.</p></header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-b from-slate-900 to-[#0b1121] border border-slate-800 rounded-xl p-8 shadow-lg">
                    <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-6"><AlertOctagon className="w-6 h-6 text-red-500" /></div>
                    <h3 className="text-xl font-bold text-white mb-4">Problem </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Güvenlik analistleri her gün on binlerce karmaşık log arasında boğulmaktadır <strong>(Alert Fatigue)</strong>. Manuel tespit ve müdahale süreçlerindeki gecikmeler, kurumları büyük veri sızıntılarına karşı savunmasız bırakmaktadır.</p>
                  </div>
                  <div className="bg-gradient-to-b from-slate-900 to-[#0b1121] border border-slate-800 rounded-xl p-8 shadow-lg">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6"><Database className="w-6 h-6 text-emerald-500" /></div>
                    <h3 className="text-xl font-bold text-white mb-4">Çözüm & Otonomi</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">Sentinel.AI, tescilli NLP (Doğal Dil İşleme) motoru sayesinde olay müdahale (Incident Response) sürelerini saatlerden saniyelere indirir ve tespit ettiği IP'leri otonom olarak Firewall (WAF) üzerinde bloklar.</p>
                  </div>
                  <div className="bg-gradient-to-b from-slate-900 to-[#0b1121] border border-slate-800 rounded-xl p-8 shadow-lg">
                     <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6"><Globe className="w-6 h-6 text-purple-500" /></div>
                     <h3 className="text-xl font-bold text-white mb-4">Pazar & İş Modeli</h3>
                     <p className="text-slate-400 text-sm leading-relaxed mb-4">B2B SaaS Modeli. Hedef kitle: Finans, E-ticaret ve MSSP'ler. Rakipler sadece izleme yaparken, biz <strong>aktif ve otonom savunma</strong> sağlıyoruz.</p>
                     <button onClick={() => setActiveTab("soc")} className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center">ÜRÜNÜ TEST ET <ChevronRight className="w-4 h-4 ml-2" /></button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DASHBOARD (DİNAMİK RAKAMLAR BURADA!) */}
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <header className="mb-8"><h2 className="text-3xl font-bold text-white tracking-wide">İş Zekası Komuta Merkezi</h2><p className="text-slate-500 mt-2">Oturumunuz boyunca gerçekleştirilen otonom operasyonların canlı metrikleri.</p></header>
                
                {/* DİNAMİK METRİK KARTLARI */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { title: "Bu Oturumda İncelenen Log", val: sessionStats.analyzed.toString(), color: "text-blue-400", icon: <Database /> }, 
                    { title: "Engellenen Sızıntı", val: sessionStats.blocked.toString(), color: "text-emerald-400", icon: <ShieldAlert /> }, 
                    { title: "Otonom Playbook", val: sessionStats.playbooks.toString(), color: "text-purple-400", icon: <Code /> }, 
                    { title: "Aktif Kritik Tehdit", val: sessionStats.critical.toString(), color: "text-red-400", icon: <AlertOctagon /> }
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#0b1121] border border-slate-800/60 rounded-xl p-5 relative overflow-hidden shadow-lg">
                      <div className={`absolute top-0 right-0 p-4 opacity-10 ${stat.color}`}>{stat.icon}</div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.title}</p>
                      <p className={`text-4xl font-black mt-2 ${stat.color}`}>{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="bg-[#0b1121] border border-slate-800/60 rounded-xl p-6 h-80"><h3 className="text-sm text-slate-400 font-bold mb-4 flex items-center"><Activity className="w-4 h-4 mr-2"/> KÜRESEL TEHDİT HACMİ (SaaS Ağı)</h3><ResponsiveContainer width="100%" height="100%"><LineChart data={threatTrendData}><XAxis dataKey="time" stroke="#334155" fontSize={12} /><RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} /><Line type="monotone" dataKey="attacks" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', stroke: '#10b981' }} /></LineChart></ResponsiveContainer></div>
                  <div className="bg-[#0b1121] border border-slate-800/60 rounded-xl p-6 h-80 flex flex-col items-center"><h3 className="text-sm text-slate-400 font-bold mb-2 flex items-center w-full"><Network className="w-4 h-4 mr-2"/> KÜRESEL VEKTÖR DAĞILIMI</h3><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={vectorData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{vectorData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} /></PieChart></ResponsiveContainer></div>
                </div>
              </motion.div>
            )}

            {/* RED TEAM SİMÜLATÖRÜ */}
            {activeTab === "redteam" && (
              <motion.div key="redteam" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <header className="mb-6"><h2 className="text-3xl font-bold text-white tracking-wide">Red Team (Saldırı) Simülatörü</h2><p className="text-slate-500 mt-2">Sistemin savunma kapasitesini test etmek için hedefe otonom saldırılar başlatın.</p></header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[#0b1121] border border-slate-800/60 rounded-xl p-8 shadow-lg">
                    <h3 className="text-red-500 font-bold mb-6 flex items-center"><Target className="w-5 h-5 mr-2" /> Saldırı Vektörü Seçin</h3>
                    <div className="space-y-4">
                      <button onClick={() => launchAttack("DDoS (Layer 7)")} disabled={attackStatus !== "idle"} className="w-full flex items-center justify-between bg-[#0f172a] hover:bg-red-900/30 text-white p-4 rounded-lg border border-slate-700 hover:border-red-500 transition-all group disabled:opacity-50">
                        <div className="flex items-center"><Zap className="w-5 h-5 mr-3 text-red-500 group-hover:animate-pulse" /> <div className="text-left"><p className="font-bold">HTTP Flood (DDoS)</p><p className="text-xs text-slate-500">Sunucuyu saniyede 1M istekle boğar.</p></div></div><ChevronRight className="text-slate-600 group-hover:text-red-500" />
                      </button>
                      <button onClick={() => launchAttack("SQL Injection")} disabled={attackStatus !== "idle"} className="w-full flex items-center justify-between bg-[#0f172a] hover:bg-red-900/30 text-white p-4 rounded-lg border border-slate-700 hover:border-red-500 transition-all group disabled:opacity-50">
                        <div className="flex items-center"><Database className="w-5 h-5 mr-3 text-red-500 group-hover:animate-pulse" /> <div className="text-left"><p className="font-bold">Blind SQL Injection</p><p className="text-xs text-slate-500">Veritabanı şemasını kırmaya çalışır.</p></div></div><ChevronRight className="text-slate-600 group-hover:text-red-500" />
                      </button>
                      <button onClick={() => launchAttack("Ransomware Payload")} disabled={attackStatus !== "idle"} className="w-full flex items-center justify-between bg-[#0f172a] hover:bg-red-900/30 text-white p-4 rounded-lg border border-slate-700 hover:border-red-500 transition-all group disabled:opacity-50">
                        <div className="flex items-center"><Bug className="w-5 h-5 mr-3 text-red-500 group-hover:animate-pulse" /> <div className="text-left"><p className="font-bold">Malware Enjeksiyonu</p><p className="text-xs text-slate-500">Sisteme şifreleyici yüklemeye çalışır.</p></div></div><ChevronRight className="text-slate-600 group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-black border border-slate-800/60 rounded-xl p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center text-center relative overflow-hidden h-[350px]">
                    {attackStatus === "idle" && ( <div className="text-slate-600"><ShieldCheck className="w-20 h-20 mx-auto mb-4 opacity-20" /><p className="font-bold tracking-widest uppercase text-sm">Sistem Savunmada. Saldırı Bekleniyor.</p></div> )}
                    {attackStatus === "attacking" && (
                      <div className="w-full"><Target className="w-16 h-16 mx-auto mb-4 text-red-500 animate-ping" /><h4 className="text-red-500 font-bold mb-2">KRİTİK UYARI: {currentAttack} Tespit Edildi!</h4><div className="w-full bg-slate-900 rounded-full h-2 mb-2 overflow-hidden"><motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.5 }} className="bg-red-500 h-2" /></div><p className="text-xs font-mono text-slate-400">Kumru NLP WAF Kuralları Üretiyor...</p></div>
                    )}
                    {attackStatus === "blocked" && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full border border-emerald-500/30 bg-emerald-900/10 p-6 rounded-lg">
                        <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-emerald-500" /><h4 className="text-emerald-400 font-bold text-lg mb-2">SALDIRI BLOKE EDİLDİ</h4><p className="text-xs font-mono text-slate-300 mb-4">Kumru NLP Motoru '{currentAttack}' vektörünü analiz etti ve kaynağı kara listeye aldı.</p><button onClick={() => setAttackStatus("idle")} className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-white transition-colors">Sistemi Sıfırla</button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SOC EKRANI: GERÇEKÇİ LOG ANALİZİ */}
            {activeTab === "soc" && (
              <motion.div key="soc" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <header className="mb-6"><h2 className="text-3xl font-bold text-white tracking-wide">Tier-1 SOC & Otonom Müdahale</h2><p className="text-slate-500 mt-2">Hem statik senaryoları hem de canlı ağ trafiğini analiz edin.</p></header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 flex flex-col h-[580px]">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <button onClick={() => setLogInput(testCases.siem)} className="flex items-center text-[10px] bg-[#0f172a] hover:bg-red-900/40 text-slate-300 py-1.5 px-2 rounded-lg border border-red-500/50 shadow-md"><Database className="w-3 h-3 mr-1 text-red-400"/> SIEM (Kritik)</button>
                      <button onClick={() => setLogInput(testCases.clean)} className="flex items-center text-[10px] bg-[#0f172a] hover:bg-emerald-900/40 text-slate-300 py-1.5 px-2 rounded-lg border border-emerald-500/50 shadow-md"><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400"/> SIEM (Temiz)</button>
                      <button onClick={() => setLogInput(testCases.phishing)} className="flex items-center text-[10px] bg-[#0f172a] hover:bg-yellow-900/40 text-slate-300 py-1.5 px-2 rounded-lg border border-yellow-500/50 shadow-md"><MailWarning className="w-3 h-3 mr-1 text-yellow-400"/> Phishing</button>
                      <button onClick={() => setLogInput(testCases.sms)} className="flex items-center text-[10px] bg-[#0f172a] hover:bg-purple-900/40 text-slate-300 py-1.5 px-2 rounded-lg border border-purple-500/50 shadow-md"><Smartphone className="w-3 h-3 mr-1 text-purple-400"/> SMS Fraud</button>
                    </div>
                    <div className="flex justify-between items-center bg-[#0b1121] border border-slate-700 p-3 rounded-xl shadow-lg">
                      <div className="flex items-center space-x-3">{isSniffing ? <Wifi className="w-5 h-5 text-emerald-500 animate-pulse" /> : <WifiOff className="w-5 h-5 text-slate-500" />}<div><h3 className="text-emerald-400 font-bold text-sm">Canlı Paket İzleyicisi</h3></div></div>
                      <button onClick={() => setIsSniffing(!isSniffing)} className={`px-4 py-2 rounded-lg font-bold text-[10px] ${isSniffing ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>{isSniffing ? "DURDUR" : "BAŞLAT"}</button>
                    </div>
                    <div className="h-32 bg-black border border-slate-700 rounded-xl p-4 font-mono text-[10px] overflow-y-auto shadow-inner custom-scrollbar">
                      {!isSniffing && liveStreamLogs.length === 0 && <div className="text-slate-600 text-center mt-8">Dinleme kapalı.</div>}
                      <div className="space-y-1 pb-2">
                        {liveStreamLogs.map((log, idx) => (
                          <div key={idx} onClick={() => handleSniffedLogClick(log)} className={`cursor-pointer hover:bg-slate-800 px-2 py-1 rounded group ${log.includes("CRITICAL") || log.includes("ALERT") ? 'text-red-400' : log.includes("WARN") ? 'text-yellow-400' : 'text-emerald-500/60'}`}><span className="opacity-0 group-hover:opacity-100 mr-2 text-white"><Crosshair className="w-3 h-3 inline" /> YAKALA</span> {log}</div>
                        ))}
                        <div ref={streamEndRef} />
                      </div>
                    </div>
                    <div className="relative flex-grow flex flex-col">
                      <textarea value={logInput} onChange={(e) => setLogInput(e.target.value)} placeholder="Log yapıştırın veya yukarıdan yakalayın..." className="flex-grow w-full bg-[#0B1120] border border-emerald-500/30 rounded-xl p-4 text-xs font-mono focus:border-emerald-400 text-white resize-none mb-3" />
                      <button onClick={handleAnalyze} disabled={isAnalyzing || !logInput} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-4 rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 flex items-center justify-center">
                        {isAnalyzing ? <><Server className="w-4 h-4 animate-bounce mr-2"/> İŞLENİYOR...</> : "DERİN ANALİZ YAP"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex flex-col h-[580px]">
                    {(isAnalyzing || agentLogs.length > 0) && !showResults && (
                      <div className="bg-black border border-slate-800 rounded-xl p-5 h-full flex flex-col font-mono text-xs overflow-hidden shadow-inner">
                        <div className="mt-4 flex-grow flex flex-col space-y-3">
                          <AnimatePresence>
                            {agentLogs.map((log, index) => (
                              <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start text-emerald-400/80">
                                <ChevronRight className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-emerald-500" /><span>{log}</span>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          {isAnalyzing && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-emerald-400 ml-6 mt-2"></motion.div>}
                        </div>
                      </div>
                    )}
                    {showResults && analysis && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0B1120] border border-slate-700 rounded-xl p-1 flex flex-col h-full shadow-[0_0_30px_rgba(16,185,129,0.1)] overflow-hidden">
                          <div className="flex border-b border-slate-800 bg-[#050b14]">
                            <button onClick={() => setReportMode("summary")} className={`flex-1 py-3 text-xs font-bold transition-colors ${reportMode === "summary" ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10" : "text-slate-500 hover:text-slate-300"}`}>YÖNETİCİ ÖZETİ</button>
                            <button onClick={() => setReportMode("raw")} className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center ${reportMode === "raw" ? "text-blue-400 border-b-2 border-blue-400 bg-blue-900/10" : "text-slate-500 hover:text-slate-300"}`}><FileJson className="w-3 h-3 mr-2"/> RAW JSON (IoC)</button>
                          </div>

                          {reportMode === "summary" ? (
                            <div className="p-5 flex flex-col flex-grow overflow-hidden">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <div className="flex items-end space-x-2"><span className={`text-4xl font-black leading-none ${score! > 75 ? 'text-red-500' : score! > 30 ? 'text-yellow-500' : 'text-emerald-500'}`}>{score}</span><span className="text-slate-600 font-bold mb-1">/ 100 Risk</span></div>
                                {score! > 70 && (
                                  <div className="flex items-center space-x-3 bg-red-900/20 border border-red-500/30 px-3 py-2 rounded-lg">
                                    <div className="text-right hidden sm:block"><p className="text-[10px] text-red-400 font-bold uppercase">Mobil SOC Alarmi</p><p className="text-[9px] text-slate-400">Taramak İçin Kamera Açın</p></div>
                                    <div className="bg-white p-1 rounded"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=mailto:soc-team@sentinel.ai?subject=KRITIK%20Siber%20Alarm!&body=Otonom%20Sistem%20Risk%20Skoru:%20${score}.`} alt="QR Alert" className="w-10 h-10" /></div>
                                  </div>
                                )}
                              </div>
                              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300 overflow-y-auto flex-grow pr-2 custom-scrollbar mb-4">{analysis}</div>
                              {score! > 70 && (
                                <div className="bg-slate-900 border border-red-500/30 rounded-lg p-4 mt-auto">
                                  <h4 className="text-xs text-red-400 font-bold uppercase tracking-wider mb-3 flex items-center"><ShieldAlert className="w-4 h-4 mr-2"/> Onaylı Müdahale (WAF)</h4>
                                  {actionStatus === "idle" && ( <div className="flex space-x-3"><button onClick={executeRemediation} className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold py-2.5 rounded transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">🛑 KURALI DAĞIT (DEPLOY)</button></div> )}
                                  {actionStatus === "preparing" && ( <div className="flex items-center justify-center bg-black py-2.5 rounded border border-slate-800 text-yellow-500 font-mono text-[10px]"><Cpu className="w-3 h-3 animate-spin mr-2" /> Yük Deşifre Ediliyor...</div> )}
                                  {actionStatus === "deploying" && (
                                    <div className="w-full bg-black p-2 rounded border border-slate-800">
                                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1"><span>AWS WAF Senkronizasyonu</span><span>{deployProgress}%</span></div>
                                      <div className="w-full bg-slate-900 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${deployProgress}%` }}></div></div>
                                    </div>
                                  )}
                                  {actionStatus === "success" && ( <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="flex items-center justify-center bg-emerald-900/30 py-2.5 rounded border border-emerald-500/50 text-emerald-400 font-mono text-[10px]"><CheckCircle2 className="w-3 h-3 mr-2" /> Kural Başarıyla WAF'a Yazıldı.</motion.div> )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-5 bg-[#020817] flex-grow overflow-y-auto custom-scrollbar relative">
                              <div className="absolute top-2 right-4 text-[10px] text-slate-500 font-mono">view: machine_readable</div>
                              <pre className="text-[11px] text-blue-400 font-mono whitespace-pre-wrap mt-4 leading-relaxed">{rawIoC}</pre>
                            </div>
                          )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* FRAUD İSTİHBARATI */}
            {activeTab === "fraud" && (
               <motion.div key="fraud" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
               <header className="mb-8"><h2 className="text-3xl font-bold text-white tracking-wide">Domain & Fraud İstihbaratı</h2><p className="text-slate-500 mt-2">Şüpheli linkleri manuel tetikleyerek tarayın.</p></header>
               <div className="bg-[#0b1121] border border-slate-800/60 rounded-xl p-8 shadow-lg max-w-4xl">
                 <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                   <input type="text" value={domainInput} onChange={(e) => setDomainInput(e.target.value)} placeholder="Örn: www.paypaI-security.com" className="flex-grow bg-[#020817] border border-slate-700 rounded-lg p-4 font-mono focus:border-yellow-500 text-white outline-none" />
                   <button onClick={handleDomainScan} disabled={!domainInput || isScanningDomain} className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black px-8 py-4 rounded-lg font-bold flex items-center justify-center transition-colors">
                     {isScanningDomain ? "TARANIYOR..." : <><Globe className="w-5 h-5 mr-2" /> AĞI TARA</>}
                   </button>
                 </div>
                 <div className="flex space-x-2 mb-8">
                    <button onClick={() => setDomainInput("http://paypaI-dogrulama.xyz")} className="text-[10px] bg-slate-800 px-3 py-1.5 rounded text-slate-400 hover:text-yellow-400">Örnek: Typosquatting</button>
                    <button onClick={() => setDomainInput("https://www.akbank.com")} className="text-[10px] bg-slate-800 px-3 py-1.5 rounded text-slate-400 hover:text-emerald-400">Örnek: Güvenilir Kurum</button>
                 </div>
                 {isScanningDomain && ( <div className="py-16 flex flex-col items-center justify-center space-y-4"><RadioReceiver className="w-12 h-12 text-yellow-500 animate-ping" /><p className="text-yellow-500 font-mono text-sm mt-4">WHOIS Verileri Çekiliyor...</p></div> )}
                 {scannedDomain && !isScanningDomain && (
                    scannedDomain.includes("paypaI") ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/50 border border-yellow-500/30 p-6 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                         <div className="flex items-center text-yellow-500 mb-6 border-b border-yellow-500/20 pb-4"><AlertOctagon className="w-8 h-8 mr-3" /> <div><h4 className="font-bold text-xl">Typosquatting Tespit Edildi</h4></div></div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-slate-400">
                           <div className="bg-slate-900/50 p-4 rounded border border-slate-800"><p className="text-slate-500 mb-1">SSL Sertifikası</p><p className="text-yellow-400 font-bold">Geçersiz (Let's Encrypt)</p></div>
                           <div className="bg-slate-900/50 p-4 rounded border border-slate-800"><p className="text-slate-500 mb-1">Otonom Karar</p><p className="text-red-400 font-bold">Ağa Seviyesinde Engellendi.</p></div>
                         </div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-900/10 border border-emerald-500/30 p-6 rounded-lg text-emerald-400 flex items-center">
                         <ShieldCheck className="w-8 h-8 mr-4" /><div><h4 className="font-bold text-lg">Domain Güvenli</h4><p className="text-xs text-slate-400">Kurumsal EV SSL Sertifikası doğrulandı. IP repütasyonu temiz.</p></div>
                      </motion.div>
                    )
                 )}
               </div>
             </motion.div>
            )}

            {/* ADLİ BİLİŞİM (FORENSICS) */}
            {activeTab === "forensics" && (
              <motion.div key="forensics" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <header className="mb-8"><h2 className="text-3xl font-bold text-white tracking-wide">Dijital Adli Bilişim Lab</h2><p className="text-slate-500 mt-2">Şüpheli dosyaların Hash değerlerini analiz edin.</p></header>
                <div className="bg-[#0b1121] border border-slate-800/60 rounded-xl p-8 shadow-lg max-w-3xl">
                  <div className="flex space-x-4 mb-4">
                    <input type="text" value={hashInput} onChange={(e) => setHashInput(e.target.value)} placeholder="MD5, SHA-256 hash..." className="flex-grow bg-[#020817] border border-slate-700 rounded-lg p-3 font-mono focus:border-emerald-500 outline-none" />
                    <button onClick={handleHashScan} disabled={!hashInput || isScanningHash} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-6 rounded-lg font-bold transition-colors">TARAMAYI BAŞLAT</button>
                  </div>
                  <div className="flex space-x-2 mb-8">
                    <button onClick={() => setHashInput("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 hover:text-red-400 transition-colors">Örnek: Ransomware Hash</button>
                    <button onClick={() => setHashInput("44d88612fea8a8f36de82e1278abb02f")} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 hover:text-emerald-400 transition-colors">Örnek: Temiz Dosya</button>
                  </div>
                  {isScanningHash && ( <div className="py-12 flex flex-col items-center justify-center space-y-4"><div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div><p className="text-emerald-500 animate-pulse font-mono text-sm">Reverse Engineering Yapılıyor...</p></div> )}
                  {scannedHash && !isScanningHash && (
                     scannedHash === "44d88612fea8a8f36de82e1278abb02f" ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-900/10 border border-emerald-500/30 p-6 rounded-lg flex items-center text-emerald-400">
                         <ShieldCheck className="w-8 h-8 mr-4" /><div><h4 className="font-bold text-lg">Temiz Dosya</h4><p className="text-xs text-slate-400">Microsoft Corporation imzalı yasal sistem dosyası.</p></div>
                      </motion.div>
                     ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/50 border border-red-500/30 p-6 rounded-lg">
                        <div className="flex items-center text-red-500 mb-4"><AlertOctagon className="w-6 h-6 mr-2" /> <h4 className="font-bold text-lg">Kritik Tehdit (Ransomware)</h4></div>
                        <div className="grid grid-cols-2 gap-4 font-mono text-xs text-slate-400"><p><strong className="text-slate-200">Dosya Tipi:</strong> Win32 EXE</p><p><strong className="text-slate-200">Davranış:</strong> AES-256 Şifreleme</p></div>
                      </motion.div>
                     )
                  )}
                </div>
              </motion.div>
            )}

            {/* AYARLAR */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <header className="mb-8"><h2 className="text-3xl font-bold text-white tracking-wide">WAF & Konfigürasyon</h2><p className="text-slate-500 mt-2">Sistemin savunma mekanizmalarını yönetin.</p></header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                  <div className="bg-[#0b1121] border border-slate-800/60 rounded-xl p-6 shadow-lg">
                    <h3 className="text-emerald-400 font-bold mb-6 border-b border-slate-800 pb-2 flex items-center"><ShieldAlert className="w-5 h-5 mr-2"/> Otonom Güvenlik Kuralları</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between"><div><p className="text-white font-bold text-sm">Zararlı IP'leri Otomatik Banla</p></div><ToggleRight className="w-10 h-10 text-emerald-500 cursor-pointer" /></div>
                      <div className="flex items-center justify-between"><div><p className="text-white font-bold text-sm">Coğrafi Sınırlama (Geofencing)</p></div><ToggleRight className="w-10 h-10 text-emerald-500 cursor-pointer" /></div>
                    </div>
                  </div>
                  <div className="bg-[#0b1121] border border-slate-800/60 rounded-xl p-6 shadow-lg">
                    <h3 className="text-cyan-400 font-bold mb-6 border-b border-slate-800 pb-2 flex items-center"><Cpu className="w-5 h-5 mr-2"/> Yapay Zeka Motoru</h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-slate-400 text-xs font-bold mb-2 flex items-center justify-between"><span>API Key Durumu</span><span className="text-emerald-500 flex items-center"><ShieldCheck className="w-3 h-3 mr-1"/> Doğrulandı</span></p>
                        <div className="w-full bg-[#020817] border border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-500 flex items-center justify-between"><span>AIzaSyA***************************Xq9Qw</span><Eye className="w-4 h-4" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}