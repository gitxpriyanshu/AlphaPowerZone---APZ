import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

const OwnerLogin = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const { loginOwner } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginOwner(email, password, secretKey);
      if (res.success) {
        showToast("Owner Login successful!", "success");
        navigate("/owner/dashboard");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col selection:bg-brand-accent selection:text-white">
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-brand-2xl bg-brand-surface-alt border border-brand-border mb-6 shadow-brand-lg group hover:border-brand-accent transition-all duration-500">
              <svg 
                className="w-10 h-10 text-brand-accent group-hover:scale-110 transition-transform duration-500" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-black font-display italic uppercase tracking-tighter text-brand-text-primary mb-2">
              Owner <span className="text-brand-accent underline decoration-brand-accent/30 underline-offset-8">Portal</span>
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-text-muted font-mono">
              Secure Administrative Gateway
            </p>
          </div>

          <div className="bg-brand-surface-alt/50 backdrop-blur-xl p-8 md:p-10 rounded-brand-3xl border border-brand-border shadow-brand-2xl">
            {error && (
              <div className="mb-6 bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-brand-lg text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted ml-1">
                    Identification
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      required
                      placeholder="Enter owner email"
                      className="w-full bg-brand-background border-2 border-brand-border rounded-brand-xl px-5 py-3.5 text-sm font-bold text-brand-text-primary focus:border-brand-accent outline-none transition-all placeholder:text-brand-text-muted/30 group-hover:border-brand-text-muted/30"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted ml-1">
                    Authorization Key
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-brand-background border-2 border-brand-border rounded-brand-xl px-5 py-3.5 text-sm font-bold text-brand-text-primary focus:border-brand-accent outline-none transition-all placeholder:text-brand-text-muted/30 group-hover:border-brand-text-muted/30"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-accent ml-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
                    High-Level Passkey
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      required
                      placeholder="Enter Secure Passkey"
                      className="w-full bg-brand-background border-2 border-brand-border rounded-brand-xl px-5 py-3.5 text-sm font-black italic text-brand-accent focus:border-brand-accent outline-none transition-all placeholder:text-brand-accent/20 group-hover:border-brand-accent/30 shadow-[0_0_15px_rgba(200,169,110,0.05)]"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-brand-text-primary text-brand-background hover:bg-brand-accent hover:text-brand-text-primary py-4 rounded-brand-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-brand-lg hover:shadow-brand-accent/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 0c.886 0 1.75.099 2.585.289m1.595 1.39a10.031 10.031 0 014.242 7.932m-4.274 9.474a10.003 10.003 0 01-4.242-7.932" />
                  </svg>
                  Authorize Entry
                </button>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-text-muted flex items-center justify-center gap-2">
              <span className="w-10 h-[1px] bg-brand-border" />
              AlphaPowerZone Encrypted Session
              <span className="w-10 h-[1px] bg-brand-border" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;
