import React, { useState, useEffect } from "react";
import opryxLogo from "./assets/images/transparent logo.png";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Mail, 
  Phone, 
  Clock, 
  Check, 
  Menu, 
  X, 
  LogOut, 
  User 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getSupabase } from "./lib/supabase";
import ServiceCard from "./components/ServiceCard";
import AuthModal from "./components/AuthModal";
import ContactForm from "./components/ContactForm";
import CreatorDashboard from "./components/CreatorDashboard";

// Premium quality inline base64 assets from original site
const navLogoIcon = opryxLogo;

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Workspace Status panel data
  const [workspaceData, setWorkspaceData] = useState([
    { title: "Brand deal — Northwind Co.", status: "IN REVIEW", color: "text-amber-400 border-amber-500/30" },
    { title: "Manager note — contract terms revised", status: "UPDATED", color: "text-blue-400 border-blue-500/30" },
    { title: "Payout reconciliation running", status: "ACTIVE", pulse: true, color: "text-violet-400 border-violet-500/30" },
    { title: "Monthly statement — 4 sources merged", status: "READY", color: "text-emerald-400 border-emerald-500/30" }
  ]);

  const supabase = getSupabase();

  useEffect(() => {
    // Check localStorage first for demo session
    const savedUser = localStorage.getItem("opryx_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    if (!supabase) return;
    
    // Fetch current session natively
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        setCurrentUser(session.user);
      }
    });

    // Sub to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setCurrentUser(session.user);
      } else if (!localStorage.getItem("opryx_user")) {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Periodic simulation for Workspace Status UI engagement
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkspaceData(prev => {
        const next = [...prev];
        // Rotate status messages slightly to indicate operational activity
        const item = next.pop();
        if (item) next.unshift(item);
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("opryx_user");
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  const handleOpenAuth = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  if (currentUser) {
    return <CreatorDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-violet overflow-x-hidden antialiased">
      {/* Background Aurora design blobs */}
      <div className="aurora">
        <div className="blob v"></div>
        <div className="blob b"></div>
        <div className="blob v2"></div>
      </div>
      <div className="noise"></div>

      {/* Navigation bar component */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4.5 md:p-6 transition-all duration-300">
        <div className="nav-inner max-w-[1180px] mx-auto flex items-center justify-between bg-[rgba(8,8,10,0.55)] border border-[rgba(255,255,255,0.09)] rounded-2xl backdrop-blur-xl px-5 py-3 shadow-2xl">
          <div className="brand flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src={navLogoIcon} alt="OPRYX icon" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
            <span className="text-white font-extrabold text-xl tracking-wider select-none">OPRYX</span>
          </div>

          <div className="nav-links hidden md:flex gap-8 text-sm text-slate">
            <a href="#platform" className="transition-colors duration-200 hover:text-white">Services</a>
            <a href="#workspace" className="transition-colors duration-200 hover:text-white">Workspace</a>
            <a href="#identity" className="transition-colors duration-200 hover:text-white">About</a>
            <a href="#start" className="transition-colors duration-200 hover:text-white">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-4 text-sm text-slate">
                <span className="flex items-center gap-1.5 bg-white/5 border border-line py-1.5 px-3 rounded-full text-xs text-white">
                  <User className="w-3.5 h-3.5 text-violet" />
                  {currentUser.email}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-ghost glass px-4 py-2 text-xs flex items-center gap-1.5 text-white hover:border-white/30 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log out
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => handleOpenAuth("login")} 
                  className="btn btn-ghost glass px-4 py-2 text-xs text-white hover:border-white/30 cursor-pointer hidden sm:block"
                >
                  Log in
                </button>
                <a href="#start" className="btn btn-primary bg-gradient-to-r from-violet to-blue hover:shadow-violet/50 hover:shadow-lg py-2.5 px-5 rounded-lg text-xs font-semibold tracking-wide text-white transition-all duration-300">
                  Get management
                </a>
              </>
            )}

            {/* Mobile menu trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden text-slate hover:text-white p-1 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="md:hidden absolute top-[calc(100%)] left-4.5 right-4.5 mt-2 bg-[rgba(8,8,10,0.95)] border border-[rgba(255,255,255,0.09)] rounded-2xl p-6 flex flex-col gap-4 text-center shadow-3xl backdrop-blur-2xl"
            >
              <a href="#platform" onClick={() => setIsMobileMenuOpen(false)} className="text-slate hover:text-white transition-colors duration-200 py-1">Services</a>
              <a href="#workspace" onClick={() => setIsMobileMenuOpen(false)} className="text-slate hover:text-white transition-colors duration-200 py-1">Workspace</a>
              <a href="#identity" onClick={() => setIsMobileMenuOpen(false)} className="text-slate hover:text-white transition-colors duration-200 py-1">About</a>
              <a href="#start" onClick={() => setIsMobileMenuOpen(false)} className="text-slate hover:text-white transition-colors duration-200 py-1">Pricing</a>
              {currentUser && (
                <div className="flex flex-col gap-3 pt-3 border-t border-line items-center">
                  <span className="text-xs text-slate">{currentUser.email}</span>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-ghost glass w-full justify-center text-xs py-2 text-white cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              )}
              {!currentUser && (
                <button 
                  onClick={() => handleOpenAuth("login")} 
                  className="btn btn-ghost glass w-full justify-center text-xs py-2.5 text-white cursor-pointer"
                >
                  Log in
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Header Section */}
      <header className="hero min-h-screen flex flex-col items-center justify-center text-center pt-28 pb-15 px-6">
        <motion.img 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          src={navLogoIcon} 
          alt="OPRYX icon" 
          className="icon-mark w-24 h-24 object-contain mb-9 filter drop-shadow-[0_0_40px_rgba(124,58,237,0.45)]"
          referrerPolicy="no-referrer"
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="eyebrow mono mb-6"
        >
          The creator operating system
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="font-sans font-extrabold text-[clamp(44px,7vw,88px)] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet to-blue mb-6 select-none"
        >
          OPRYX
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.25 }}
          className="tagline text-[clamp(16px,2.2vw,20px)] text-slate max-w-[560px] leading-relaxed"
        >
          <strong className="text-white font-semibold">The operating system</strong> behind modern creators — full-service management for talent, brand deals, and payouts, run with the discipline of software.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hero-cta flex flex-col sm:flex-row gap-4 mt-11"
        >
          <a href="#start" className="btn btn-primary bg-gradient-to-r from-violet to-blue text-white shadow-xl hover:shadow-violet/40 py-3 px-7 rounded-[10px] font-display font-semibold text-sm transition-all duration-300">
            Get management
          </a>
          <a href="#platform" className="btn btn-ghost glass py-3 px-7 rounded-[10px] font-display font-semibold text-sm text-white hover:border-white/30 transition-all duration-300">
            See our services
          </a>
        </motion.div>
      </header>

      {/* Services Section */}
      <section id="platform" className="py-28 px-6">
        <div className="wrap max-w-[1180px] mx-auto">
          <div className="sec-head max-w-[640px] mb-14">
            <div className="eyebrow mono">Management Services</div>
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-white mt-2 mb-4 leading-tight">
              Agency-level management, run on a single operating system.
            </h2>
            <p className="text-slate leading-relaxed">
              Every creator we manage gets a dedicated team for deals, finances, and growth — coordinated through the same system, so nothing falls between departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ServiceCard 
              num="01 — Talent & Brand" 
              title="A negotiating team in your corner" 
              desc="Your manager sources brand partnerships, negotiates rates, and reviews every contract before you sign — so no deal underpays you."
            >
              <Users className="w-5.5 h-5.5 text-white" />
            </ServiceCard>

            <ServiceCard 
              num="02 — Financial Operations" 
              title="Payouts, reconciled and tax-ready" 
              desc="Sponsorships, subscriptions, and platform revenue are reconciled into one ledger, with statements your accountant can use as-is."
            >
              <CreditCard className="w-5.5 h-5.5 text-white" />
            </ServiceCard>

            <ServiceCard 
              num="03 — Growth Strategy" 
              title="A content plan, not just a calendar" 
              desc="Your strategist sets the release plan, platform mix, and format tests — and the system carries out the schedule without you managing it."
            >
              <TrendingUp className="w-5.5 h-5.5 text-white" />
            </ServiceCard>
          </div>
        </div>
      </section>

      {/* Workspace Preview Section */}
      <section id="workspace" className="py-28 px-6">
        <div className="wrap max-w-[1180px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Device preview UI mockup */}
            <div className="device p-2.5 relative">
              <div className="device-inner glass p-5.5 bg-gradient-to-br from-[#0d0d12] to-[#08080b] border border-[rgba(255,255,255,0.09)] rounded-xl shadow-2xl">
                <div className="device-bar flex gap-1.5 mb-4.5">
                  <span className="w-2 h-2 rounded-full bg-white/15"></span>
                  <span className="w-2 h-2 rounded-full bg-white/15"></span>
                  <span className="w-2 h-2 rounded-full bg-white/15"></span>
                </div>
                
                <div className="flex flex-col gap-1">
                  {workspaceData.map((item, idx) => (
                    <div key={idx} className="row-line flex items-center justify-between py-3.5 border-b border-[rgba(255,255,255,0.09)] last:border-0 text-[13px]">
                      <span className="flex items-center gap-2 text-white/90">
                        {item.pulse && <span className="pulse-dot"></span>}
                        {item.title}
                      </span>
                      <span className={`tag mono text-[10.5px] px-2 py-1 border rounded-md ${item.color} bg-black/30`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="showcase-copy flex flex-col gap-6">
              <div className="eyebrow mono">Client Workspace</div>
              <h2 className="font-display font-semibold text-3xl md:text-4xl text-white leading-tight">
                Full visibility into your own business.
              </h2>
              <p className="text-slate text-[15.5px] leading-relaxed">
                Every creator we manage gets a live portal into their account — deals in motion, payouts scheduled, and manager notes — so nothing about your own business is a mystery.
              </p>
              <div className="checklist flex flex-col gap-3.5">
                <div className="flex items-center gap-3 text-[14.5px]">
                  <span className="dot w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  A direct line to your dedicated manager
                </div>
                <div className="flex items-center gap-3 text-[14.5px]">
                  <span className="dot w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Transparent, itemized revenue reporting
                </div>
                <div className="flex items-center gap-3 text-[14.5px]">
                  <span className="dot w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Real-time status on every deal in motion
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="identity" className="py-28 px-6">
        <div className="wrap max-w-[1180px] mx-auto">
          <div className="sec-head max-w-[640px] mb-14">
            <div className="eyebrow mono">Who We Are</div>
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-white mt-2 mb-4 leading-tight">
              A management company built like an operating system.
            </h2>
            <p className="text-slate leading-relaxed">
              OPRYX pairs a dedicated manager with the consistency of software — every contract, payout, and deal handled to the same standard, for every creator on the roster.
            </p>
          </div>

          <div className="identity-grid grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-11">
            <div className="stat glass p-7 flex flex-col justify-between min-h-[120px] transition-transform duration-300 hover:-translate-y-1.5 hover:border-[rgba(255,255,255,0.22)]">
              <span className="stat-num font-display font-bold text-3xl bg-gradient-to-r from-white to-[#cfcfe0] bg-clip-text text-transparent">
                150+
              </span>
              <span className="stat-label mono text-[10.5px] text-slate mt-3.5">Creators managed</span>
            </div>
            <div className="stat glass p-7 flex flex-col justify-between min-h-[120px] transition-transform duration-300 hover:-translate-y-1.5 hover:border-[rgba(255,255,255,0.22)]">
              <span className="stat-num font-display font-bold text-3xl bg-gradient-to-r from-white to-[#cfcfe0] bg-clip-text text-transparent">
                $60M+
              </span>
              <span className="stat-label mono text-[10.5px] text-slate mt-3.5">Payouts processed</span>
            </div>
            <div className="stat glass p-7 flex flex-col justify-between min-h-[120px] transition-transform duration-300 hover:-translate-y-1.5 hover:border-[rgba(255,255,255,0.22)]">
              <span className="stat-num font-display font-bold text-3xl bg-gradient-to-r from-white to-[#cfcfe0] bg-clip-text text-transparent">
                40+
              </span>
              <span className="stat-label mono text-[10.5px] text-slate mt-3.5">Active brand partners</span>
            </div>
            <div className="stat glass p-7 flex flex-col justify-between min-h-[120px] transition-transform duration-300 hover:-translate-y-1.5 hover:border-[rgba(255,255,255,0.22)]">
              <span className="stat-num font-display font-bold text-3xl bg-gradient-to-r from-white to-[#cfcfe0] bg-clip-text text-transparent">
                24/7
              </span>
              <span className="stat-label mono text-[10.5px] text-slate mt-3.5">Manager coverage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing and Scale Packages Section */}
      <section id="start" className="py-28 px-6">
        <div className="wrap max-w-[1180px] mx-auto">
          <div className="sec-head max-w-[640px] mb-14">
            <div className="eyebrow mono">Investment In Your Growth</div>
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-white mt-2 mb-4 leading-tight">
              Choose the partnership that fits your creator journey.
            </h2>
            <p className="text-slate leading-relaxed">
              Every engagement begins with a discovery call to understand your goals and recommend the right operational support.
            </p>
          </div>

          <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* Founding Partner Card */}
            <div className="price-card glass p-9 flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20">
              <div className="plan-name font-display font-semibold text-lg text-white mb-3">Founding Partner</div>
              <div className="plan-price font-display font-bold text-3xl text-white mb-3">
                &#8377;15,000<span className="block font-sans font-normal text-xs text-slate mt-1.5">/ Month</span>
              </div>
              <div className="plan-tag inline-block text-[10px] text-slate border border-line rounded-lg px-2.5 py-1 mb-4 w-fit">
                Limited to first 5 creators
              </div>
              <p className="plan-desc text-sm text-slate leading-relaxed mb-6">
                Designed for creators building the foundation of their business.
              </p>
              
              <div className="checklist flex flex-col gap-3.5 mb-8 flex-grow text-[13.5px]">
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Dedicated Operations Manager
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Weekly Planning &amp; content calendar
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Email &amp; Brand communications
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Monthly performance reports
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  2 Strategy consulting calls / mo
                </div>
              </div>

              <div className="plan-fit border-t border-line pt-4 mb-5.5">
                <div className="plan-fit-label text-[10px] text-slate text-center mb-3">Best Fit For</div>
                <div className="plan-fit-row flex justify-between gap-1.5 text-center text-[11.5px] text-slate leading-tight">
                  <span className="flex-1">Solo Creators</span>
                  <span className="flex-1">10K-100K Fans</span>
                  <span className="flex-1">Early Brand Deals</span>
                </div>
              </div>

              <button 
                onClick={() => handleOpenAuth("signup")} 
                className="btn btn-ghost glass justify-center w-full rounded-[10px] py-3 text-sm font-semibold tracking-wide text-white hover:border-white/30 cursor-pointer"
              >
                Get started
              </button>
            </div>

            {/* Growth Partner Card (Featured Glow) */}
            <div className="price-card glass p-9 flex flex-col transition-all duration-300 hover:-translate-y-1.5 featured border border-violet/50 bg-gradient-to-b from-violet/12 to-blue/6 shadow-[0_30px_70px_-30px_rgba(124,58,237,0.4)] relative">
              <span className="plan-badge absolute -top-3.5 left-8 text-[10px] px-3 py-1 rounded-full bg-gradient-to-r from-violet to-blue text-white font-semibold">
                Most popular
              </span>
              <div className="plan-name font-display font-semibold text-lg text-white mb-3 mt-1">Growth Partner</div>
              <div className="plan-price font-display font-bold text-3xl text-white mb-3">
                &#8377;50,000<span className="block font-sans font-normal text-xs text-slate mt-1.5">/ Month</span>
              </div>
              <p className="plan-includes text-[10.5px] text-blue font-bold opacity-90 mb-4">
                Includes all Founding Partner benefits, plus:
              </p>
              <p className="plan-desc text-sm text-slate leading-relaxed mb-6">
                For creators scaling with a growing audience and team.
              </p>

              <div className="checklist flex flex-col gap-3.5 mb-8 flex-grow text-[13.5px]">
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Full Sponsorship pipeline management
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Team &amp; editor coordination
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  SOP development &amp; optimization
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Custom analytics dashboard integrations
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Weekly Strategy syncs &amp; Priority support
                </div>
              </div>

              <div className="plan-fit border-t border-line pt-4 mb-5.5">
                <div className="plan-fit-label text-[10px] text-slate text-center mb-3">Best Fit For</div>
                <div className="plan-fit-row flex justify-between gap-1.5 text-center text-[11.5px] text-slate leading-tight">
                  <span className="flex-1">Teams &amp; editors</span>
                  <span className="flex-1">Steady sponsor flow</span>
                  <span className="flex-1">Full-time business</span>
                </div>
              </div>

              <button 
                onClick={() => handleOpenAuth("signup")} 
                className="btn btn-primary justify-center w-full rounded-[10px] py-3 text-sm font-semibold tracking-wide bg-gradient-to-r from-violet to-blue hover:scale-[1.02] active:scale-[0.98] transition-transform text-white cursor-pointer"
              >
                Get management
              </button>
            </div>

            {/* Scale Partner Card */}
            <div className="price-card glass p-9 flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20">
              <div className="plan-name font-display font-semibold text-lg text-white mb-3">Scale Partner</div>
              <div className="plan-price font-display font-bold text-3xl text-white mb-3">
                Custom Pricing<span className="block font-sans font-normal text-[11px] text-slate mt-1.5">Starting at &#8377;90,000/month</span>
              </div>
              <p className="plan-desc text-sm text-slate leading-relaxed mb-6">
                Complete, automated back-office business operations for elite personal brands.
              </p>

              <div className="checklist flex flex-col gap-3.5 mb-8 flex-grow text-[13.5px]">
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Full business operations outsourcing
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Dedicated 24/7 Operations Squad
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Hiring, onboarding &amp; scaling systems
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Digital product launch planning &amp; ops
                </div>
                <div className="flex gap-3 items-start">
                  <span className="dot mt-0.5 w-[18px] h-[18px] rounded-md bg-gradient-to-br from-violet to-blue flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  Executive-level strategy and automated reporting
                </div>
              </div>

              <div className="plan-fit border-t border-line pt-4 mb-5.5">
                <div className="plan-fit-label text-[10px] text-slate text-center mb-3">Best Fit For</div>
                <div className="plan-fit-row flex justify-between gap-1.5 text-center text-[11.5px] text-slate leading-tight">
                  <span className="flex-1">Multichannel creators</span>
                  <span className="flex-1">IP &amp; Brand Launches</span>
                  <span className="flex-1">Enterprise scale</span>
                </div>
              </div>

              <a 
                href="#contact" 
                className="btn btn-ghost glass justify-center w-full rounded-[10px] py-3 text-sm font-semibold tracking-wide text-white hover:border-white/30 text-center"
              >
                Talk to sales
              </a>
            </div>
          </div>

          <div className="cta-panel glass p-15 text-center relative overflow-hidden mt-20 rounded-[20px] bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.09)]">
            <div className="absolute inset-[-40%] bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.2),transparent_60%)] animate-pulse duration-[8000ms] pointer-events-none"></div>
            <h2 className="relative font-display font-semibold text-3xl md:text-5xl text-white mb-5">
              Run your business like a system, not a scramble.
            </h2>
            <p className="relative text-slate max-w-[500px] mx-auto mb-9 text-base">
              Book a call with a manager to explore how our specialized operating system can accelerate your channel. No commitment required.
            </p>
            <div className="relative flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => handleOpenAuth("signup")} 
                className="btn btn-primary bg-gradient-to-r from-violet to-blue text-white shadow-xl hover:shadow-violet/40 py-3 px-7 rounded-[10px] font-display font-semibold text-sm transition-all duration-300"
              >
                Get management
              </button>
              <a href="#contact" className="btn btn-ghost glass py-3 px-7 rounded-[10px] font-display font-semibold text-sm text-white hover:border-white/30 transition-all duration-300">
                Talk to the team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-28 px-6">
        <div className="wrap max-w-[1180px] mx-auto">
          <div className="sec-head max-w-[640px] mb-14">
            <div className="eyebrow mono">Contact</div>
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-white mt-2 mb-4 leading-tight">
              Talk to the team.
            </h2>
            <p className="text-slate leading-relaxed">
              Reach us directly, or send a message and a dedicated operations manager will get back to you within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="contact-info glass p-9 flex flex-col gap-7 justify-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.09)] rounded-[20px] backdrop-blur-md">
              <div className="contact-row flex items-start gap-4">
                <div className="contact-icon w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-gradient-to-br from-[rgba(124,58,237,0.25)] to-[rgba(37,99,235,0.25)] border border-[rgba(255,255,255,0.09)] flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="contact-label text-[10px] text-slate uppercase tracking-wider mb-1">Call us</div>
                  <a href="tel:+917030101631" className="contact-value text-base font-semibold text-white hover:text-blue transition-colors">
                    +91 70301 01631
                  </a>
                </div>
              </div>

              <div className="contact-row flex items-start gap-4">
                <div className="contact-icon w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-gradient-to-br from-[rgba(124,58,237,0.25)] to-[rgba(37,99,235,0.25)] border border-[rgba(255,255,255,0.09)] flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="contact-label text-[10px] text-slate uppercase tracking-wider mb-1">Email us</div>
                  <a href="mailto:opryx.in@gmail.com" className="contact-value text-base font-semibold text-white hover:text-blue transition-colors">
                    opryx.in@gmail.com
                  </a>
                </div>
              </div>

              <div className="contact-row flex items-start gap-4">
                <div className="contact-icon w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-gradient-to-br from-[rgba(124,58,237,0.25)] to-[rgba(37,99,235,0.25)] border border-[rgba(255,255,255,0.09)] flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="contact-label text-[10px] text-slate uppercase tracking-wider mb-1">Response time</div>
                  <span className="contact-value text-base font-semibold text-white">
                    Within 1 business day
                  </span>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer component */}
      <footer className="py-15 border-t border-[rgba(255,255,255,0.09)] bg-black/40">
        <div className="wrap max-w-[1180px] mx-auto px-6">
          <div className="footer-inner flex flex-col sm:flex-row justify-between items-center gap-5">
            <div className="brand flex items-center gap-2">
              <img src={navLogoIcon} alt="OPRYX logo icon" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
              <span className="text-white font-extrabold text-lg tracking-wider select-none">OPRYX</span>
            </div>
            <div className="footer-links flex gap-6 text-sm text-slate">
              <a href="#platform" className="hover:text-white transition-colors duration-200">Services</a>
              <a href="#workspace" className="hover:text-white transition-colors duration-200">Workspace</a>
              <a href="#identity" className="hover:text-white transition-colors duration-200">About</a>
              <a href="#start" className="hover:text-white transition-colors duration-200">Pricing</a>
            </div>
          </div>
          <div className="footer-copy text-center sm:text-left text-xs text-[#5c5c66] mt-6">
            © 2026 OPRYX. The management operating system for modern creators.
          </div>
        </div>
      </footer>

      {/* Pop up Authentication Modal component */}
      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        initialTab={authTab}
      />
    </div>
  );
}
