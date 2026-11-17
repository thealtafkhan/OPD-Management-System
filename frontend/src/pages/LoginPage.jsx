import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Shield, AlertCircle, RefreshCw, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      redirectByRole(data.role);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (demoEmail, path) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(demoEmail);
      navigate(path);
    } catch (err) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'PATIENT') navigate('/patient');
    else if (role === 'DOCTOR') navigate('/doctor');

    else if (role === 'RECEPTIONIST') navigate('/receptionist');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 auth-card-transition">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="relative inline-flex items-center justify-center mb-3 group cursor-pointer">
          {/* Dynamic pulsing aura glow */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-emerald-500 via-amber-400 to-teal-400 opacity-50 blur-md logo-glow-aura group-hover:opacity-100 group-hover:scale-120 transition-all duration-700"></div>
          
          {/* Rotating decorative accent ring */}
          <div className="absolute -inset-1 rounded-full border border-dashed border-emerald-600/50 logo-ring-rotate pointer-events-none"></div>

          {/* Logo badge with shadow, ring, and interactive hover */}
          <div className="relative p-1.5 bg-white rounded-full shadow-xl ring-2 ring-emerald-600/30 group-hover:ring-emerald-500 group-hover:rotate-6 transition-all duration-500 transform group-hover:scale-105 flex items-center justify-center">
            <img 
              src="/amu_logo.png" 
              alt="AMU Crest" 
              className="h-20 w-20 object-contain rounded-full transition-transform duration-500 group-hover:scale-110" 
            />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">AMU OPD Portal Sign In</h2>
        <p className="text-xs text-slate-500 mt-1">Access Outpatient Care, Clinical Suite & Records</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-8 space-y-6 transition-all duration-300 hover:shadow-2xl">
          
          {/* Smooth Toggle Tabs between Login and Register */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              className="flex-1 py-2 rounded-lg bg-emerald-800 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all duration-200 cursor-default"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <Link
              to="/register"
              className="flex-1 py-2 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-white/60 flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register (Free PID)
            </Link>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 transition-colors" />
                <input 
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@amu.ac.in"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 transition-colors" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo One-Click Access Panel */}
          <div className="border-t border-slate-200 pt-5">
            <h4 className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 text-center">
              ⚡ Instant 1-Click Demo Evaluation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => handleDemo('altaf.student@amu.ac.in', '/patient')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-emerald-50 hover:border-emerald-300 transition"
              >
                <div className="font-bold text-emerald-800">🎓 AMU Student</div>
                <div className="text-[10px] text-slate-500">Altaf Khan (Priority S)</div>
              </button>

              <button 
                onClick={() => handleDemo('kamran.emp@amu.ac.in', '/patient')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-emerald-50 hover:border-emerald-300 transition"
              >
                <div className="font-bold text-emerald-800">👨‍🏫 AMU Employee</div>
                <div className="text-[10px] text-slate-500">Kamran Ali (Priority E)</div>
              </button>

              <button 
                onClick={() => handleDemo('ramesh.sharma@gmail.com', '/patient')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-blue-50 hover:border-blue-300 transition"
              >
                <div className="font-bold text-blue-800">🧑 Normal Citizen</div>
                <div className="text-[10px] text-slate-500">Ramesh (Series N)</div>
              </button>

              <button 
                onClick={() => handleDemo('zahmed@amu.ac.in', '/doctor')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-amber-50 hover:border-amber-300 transition"
              >
                <div className="font-bold text-amber-800">👨‍⚕️ Prof. Z. Ahmed</div>
                <div className="text-[10px] text-slate-500">Medicine Clinic</div>
              </button>

              <button 
                onClick={() => handleDemo('reception@amu.ac.in', '/receptionist')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-purple-50 hover:border-purple-300 transition"
              >
                <div className="font-bold text-purple-800">🏢 Receptionist</div>
                <div className="text-[10px] text-slate-500">Walk-in & Slip Counter</div>
              </button>

              <button 
                onClick={() => handleDemo('admin@amu.ac.in', '/admin')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-red-50 hover:border-red-300 transition"
              >
                <div className="font-bold text-red-800">👑 Hospital Admin</div>
                <div className="text-[10px] text-slate-500">System Governance</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-800">
              Register Free (Receive PID)
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
