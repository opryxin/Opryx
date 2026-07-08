import React, { useState } from "react";
import { X } from "lucide-react";
import { getSupabase } from "../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusMsgType] = useState<"success" | "error" | "">();

  if (!isOpen) return null;

  const supabase = getSupabase();

  const handleSignup = async () => {
    setStatusMsg("");
    setStatusMsgType("");

    if (!supabase) {
      setStatusMsg("Can't connect right now — check your internet connection.");
      setStatusMsgType("error");
      return;
    }
    if (!email || !password) {
      setStatusMsg("Please fill in email and password.");
      setStatusMsgType("error");
      return;
    }
    if (password.length < 6) {
      setStatusMsg("Password must be at least 6 characters.");
      setStatusMsgType("error");
      return;
    }

    setLoading(true);
    setStatusMsg("Creating account...");

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setStatusMsg(error.message);
        setStatusMsgType("error");
      } else {
        setStatusMsg("Account created! Check your email to confirm, then log in.");
        setStatusMsgType("success");
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setStatusMsg("An unexpected error occurred. Please try again.");
      setStatusMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setStatusMsg("");
    setStatusMsgType("");

    if (!supabase) {
      setStatusMsg("Can't connect right now — check your internet connection.");
      setStatusMsgType("error");
      return;
    }
    if (!email || !password) {
      setStatusMsg("Please enter both email and password.");
      setStatusMsgType("error");
      return;
    }

    setLoading(true);
    setStatusMsg("Logging in...");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatusMsg(error.message);
        setStatusMsgType("error");
      } else {
        setStatusMsg("Logged in successfully!");
        setStatusMsgType("success");
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      setStatusMsg("An unexpected error occurred. Please try again.");
      setStatusMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const mockUser = {
      id: "demo-user-123",
      email: "partner@opryx.com",
      user_metadata: {
        full_name: "Demo Creator"
      }
    };
    localStorage.setItem("opryx_user", JSON.stringify(mockUser));
    setStatusMsg("Entering OPRYX Workspace...");
    setStatusMsgType("success");
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="auth-modal glass w-full max-w-[400px] p-9 relative bg-[rgba(12,12,16,0.85)] border border-[rgba(255,255,255,0.09)] rounded-[20px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-slate hover:text-white border border-[rgba(255,255,255,0.09)] cursor-pointer transition-colors duration-200"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Tab switch */}
        <div className="auth-tabs flex gap-2 mb-6.5">
          <button
            onClick={() => {
              setTab("login");
              setStatusMsg("");
            }}
            className={`flex-1 text-center py-2.5 rounded-lg font-display font-semibold text-[13.5px] cursor-pointer transition-all duration-300 border border-[rgba(255,255,255,0.09)] ${
              tab === "login"
                ? "bg-gradient-to-r from-violet to-blue text-white border-transparent"
                : "text-slate hover:text-white"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => {
              setTab("signup");
              setStatusMsg("");
            }}
            className={`flex-1 text-center py-2.5 rounded-lg font-display font-semibold text-[13.5px] cursor-pointer transition-all duration-300 border border-[rgba(255,255,255,0.09)] ${
              tab === "signup"
                ? "bg-gradient-to-r from-violet to-blue text-white border-transparent"
                : "text-slate hover:text-white"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Login Panel */}
        {tab === "login" ? (
          <div className="flex flex-col gap-4.5">
            <div>
              <div className="auth-title font-display text-xl font-semibold text-white mb-1">
                Welcome back
              </div>
              <div className="auth-sub text-[13px] text-slate mb-1.5">
                Log in to your OPRYX workspace.
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] text-slate" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-white/5 border border-[rgba(255,255,255,0.09)] rounded-[10px] p-3 text-white text-sm focus:outline-none focus:border-violet/60"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] text-slate" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border border-[rgba(255,255,255,0.09)] rounded-[10px] p-3 text-white text-sm focus:outline-none focus:border-violet/60"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn btn-primary w-full justify-center rounded-[10px] py-3 text-sm font-semibold tracking-wide bg-gradient-to-r from-violet to-blue hover:scale-[1.02] active:scale-[0.98] transition-transform text-white cursor-pointer"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <div className="flex items-center my-1.5">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="px-3 text-[10px] text-slate font-mono uppercase tracking-widest select-none">or</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="btn w-full justify-center rounded-[10px] py-3 text-xs font-semibold tracking-wide bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all text-white cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse"></span>
              Explore Demo Workspace
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4.5">
            <div>
              <div className="auth-title font-display text-xl font-semibold text-white mb-1">
                Create your account
              </div>
              <div className="auth-sub text-[13px] text-slate mb-1.5">
                Get set up with your dedicated manager.
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] text-slate" htmlFor="signup-name">
                Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-white/5 border border-[rgba(255,255,255,0.09)] rounded-[10px] p-3 text-white text-sm focus:outline-none focus:border-violet/60"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] text-slate" htmlFor="signup-email">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-white/5 border border-[rgba(255,255,255,0.09)] rounded-[10px] p-3 text-white text-sm focus:outline-none focus:border-violet/60"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] text-slate" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border border-[rgba(255,255,255,0.09)] rounded-[10px] p-3 text-white text-sm focus:outline-none focus:border-violet/60"
              />
            </div>
            <button
              onClick={handleSignup}
              disabled={loading}
              className="btn btn-primary w-full justify-center rounded-[10px] py-3 text-sm font-semibold tracking-wide bg-gradient-to-r from-violet to-blue hover:scale-[1.02] active:scale-[0.98] transition-transform text-white"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        )}

        {/* Status display */}
        {statusMsg && (
          <div
            className={`mt-4 text-xs font-semibold text-center transition-all duration-300 ${
              statusType === "error" ? "text-red-400" : "text-green-400"
            }`}
          >
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
