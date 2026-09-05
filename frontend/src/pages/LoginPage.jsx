import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Shield, AlertCircle } from 'lucide-react';

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
    else if (role === 'DIAGNOSTIC_REPORTER') navigate('/diagnostic');
    else if (role === 'RECEPTIONIST') navigate('/receptionist');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src="/amu_logo.png" alt="AMU" className="mx-auto h-16 w-16 mb-2" />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">AMU OPD Portal Sign In</h2>
        <p className="text-xs text-slate-500 mt-1">Access Outpatient Care, Clinical Suite & Records</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-8 space-y-6">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@amu.ac.in"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
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
                onClick={() => handleDemo('lab@amu.ac.in', '/diagnostic')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-sky-50 hover:border-sky-300 transition"
              >
                <div className="font-bold text-sky-800">🧪 Diagnostics</div>
                <div className="text-[10px] text-slate-500">Lab / Radiology</div>
              </button>

              <button 
                onClick={() => handleDemo('reception@amu.ac.in', '/receptionist')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-purple-50 hover:border-purple-300 transition"
              >
                <div className="font-bold text-purple-800">🏢 Receptionist</div>
                <div className="text-[10px] text-slate-500">Walk-in Counter</div>
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
