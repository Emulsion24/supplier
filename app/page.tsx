'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sun, Mail, Lock, Building2, ArrowRight, 
  CheckCircle, Loader2, Globe, ShieldCheck, ShoppingBag 
} from 'lucide-react';

export default function MainPage() {
  const router = useRouter();
  
  // State
  const [isLogin, setIsLogin] = useState(true);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    companyName: '', 
    otp: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) router.push('/dashboard');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email, 
            password: formData.password 
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        router.push('/dashboard');

      } else if (!showOtpInput) {
        // Step 1: Send OTP
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send verification code');
        
        setShowOtpInput(true);

      } else {
        // Step 2: Finalize Signup
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid code or registration failed');
        
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-800">
      
      {/* LEFT SIDE: Rezillion Branding & Marketplace Link */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-90 z-0"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl z-0"></div>
        
        <div className="relative z-20 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
            <Sun size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Rezillion Supply Chain</span>
        </div>

        <div className="relative z-20 mb-12">
           <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">
             Resilient. Reliable. <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Rezillion Operations</span>
           </h2>
           <p className="text-slate-400 text-lg max-w-md leading-relaxed">
             The global standard for secure solar component distribution and inventory management.
           </p>
           
           <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={20} className="text-blue-500" /> 
                <span>End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={20} className="text-blue-500" /> 
                <span>Verified Supplier Network</span>
              </div>
           </div>
        </div>

        {/* --- NEW MARKETPLACE LINK (DESKTOP) --- */}
        <div className="relative z-20">
           <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between gap-6">
              <div>
                <p className="text-white font-bold mb-1">Sourcing Components?</p>
                <p className="text-slate-400 text-xs">Browse the global marketplace catalog without an account.</p>
              </div>
              <button 
                onClick={() => router.push('/suppliers')}
                className="px-5 py-3 bg-white hover:bg-blue-50 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0 group"
              >
                <Globe size={16} className="text-blue-600" /> 
                <span>Open Marketplace</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform opacity-50"/>
              </button>
           </div>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {showOtpInput ? 'Confirm Identity' : isLogin ? 'Sign In' : 'Partner Registration'}
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                {showOtpInput 
                  ? `For security, enter the code sent to ${formData.email}` 
                  : isLogin 
                    ? 'Welcome back to the Rezillion dashboard.' 
                    : 'Create your supplier account to join our global network.'}
            </p>
          </div>

          {!showOtpInput && (
            <div className="flex p-1 bg-slate-200/50 rounded-xl mb-6">
              <button 
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Existing User
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                New Supplier
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!showOtpInput ? (
              <>
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Company Name</label>
                    <div className="relative">
                      <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required 
                        type="text" 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                        placeholder="e.g. Rezillion Global PV" 
                        value={formData.companyName} 
                        onChange={e => setFormData({...formData, companyName: e.target.value})} 
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Corporate Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      required 
                      type="email" 
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                      placeholder="admin@rezillion.com" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Password</label>
                    {isLogin && <button type="button" className="text-[10px] text-blue-600 font-bold hover:underline">Reset?</button>}
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      required 
                      type="password" 
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                      placeholder="••••••••" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">OTP Verification Code</label>
                  <div className="relative">
                    <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      required 
                      type="text" 
                      maxLength={6} 
                      className="w-full pl-10 pr-4 py-4 bg-white border-2 border-blue-100 rounded-xl outline-none focus:border-blue-500 text-center tracking-[0.8em] font-bold text-2xl text-blue-600" 
                      placeholder="000000" 
                      value={formData.otp} 
                      onChange={e => setFormData({...formData, otp: e.target.value})} 
                    />
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowOtpInput(false)}
                  className="text-xs text-slate-500 font-bold hover:text-blue-600 flex items-center gap-1"
                >
                  Edit details
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {error}
              </div>
            )}

            <button 
              disabled={loading} 
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-70 shadow-xl shadow-slate-900/10 mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="tracking-wide">{showOtpInput ? 'Verify & Create Account' : isLogin ? 'Sign In' : 'Receive OTP Code'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          
          {/* --- NEW MARKETPLACE LINK (MOBILE/TABLET) --- */}
          <div className="lg:hidden mt-8 pt-6 border-t border-slate-200 text-center">
             <button 
               onClick={() => router.push('/suppliers')}
               className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
             >
               <ShoppingBag size={14} /> Browse Marketplace as Guest
             </button>
          </div>

          <p className="text-center text-[10px] text-slate-400 mt-12 uppercase tracking-[0.2em] font-medium">
            &copy; 2026 Rezillion Supply Chain &bull; Enterprise Protocol
          </p>
        </div>
      </div>
    </div>
  );
}