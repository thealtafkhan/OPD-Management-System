import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, User, LogOut, Menu, X, Bell, Stethoscope, 
  Calendar, Activity, Shield, Users, FileText, ChevronDown 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleDemoSwitch = async (email, rolePath) => {
    try {
      await demoLogin(email);
      setDemoDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate(rolePath);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* AMU Brand & Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/amu_logo.png" 
              alt="AMU Crest" 
              className="h-11 w-11 rounded-full bg-white p-0.5 shadow transition-transform group-hover:scale-105" 
            />
            <div>
              <div className="font-bold text-lg sm:text-xl tracking-tight leading-none text-emerald-100 flex items-center gap-1.5">
                AMU <span className="text-amber-400 font-extrabold">OPD</span> Portal
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-200 uppercase tracking-wider font-medium">
                J.N. Medical College & Hospital
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm font-medium">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-emerald-700 transition">Home</Link>
            <Link to="/lobby" className="px-3 py-2 rounded-md hover:bg-emerald-700 transition flex items-center gap-1">
              <Activity className="w-4 h-4 text-amber-400" />
              Live Waiting Board
            </Link>

            {user && (
              <>
                {user.role === 'PATIENT' && (
                  <Link to="/patient" className="px-3 py-2 rounded-md hover:bg-emerald-700 transition flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Patient Portal
                  </Link>
                )}
                {user.role === 'DOCTOR' && (
                  <Link to="/doctor" className="px-3 py-2 rounded-md hover:bg-emerald-700 transition flex items-center gap-1">
                    <Stethoscope className="w-4 h-4 text-emerald-300" /> Clinical Suite
                  </Link>
                )}
                {user.role === 'DIAGNOSTIC_REPORTER' && (
                  <Link to="/diagnostic" className="px-3 py-2 rounded-md hover:bg-emerald-700 transition flex items-center gap-1">
                    <FileText className="w-4 h-4 text-sky-300" /> Diagnostic Lab
                  </Link>
                )}
                {user.role === 'RECEPTIONIST' && (
                  <Link to="/receptionist" className="px-3 py-2 rounded-md hover:bg-emerald-700 transition flex items-center gap-1">
                    <Users className="w-4 h-4 text-amber-300" /> Reception Counter
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="px-3 py-2 rounded-md hover:bg-emerald-700 transition flex items-center gap-1">
                    <Shield className="w-4 h-4 text-purple-300" /> Administration
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right actions / Demo Switcher */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="bg-emerald-900/80 hover:bg-emerald-950 text-emerald-200 text-xs px-3 py-1.5 rounded-full border border-emerald-600 flex items-center gap-1.5 transition"
              >
                <span>⚡ Switch Role Demo</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-lg shadow-xl py-2 z-50 border border-slate-200 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b">
                    Instant Demo Login (Zero Password)
                  </div>
                  <button 
                    onClick={() => handleDemoSwitch('altaf.student@amu.ac.in', '/patient')}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>🎓 AMU Student (Priority S)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Altaf</span>
                  </button>
                  <button 
                    onClick={() => handleDemoSwitch('kamran.emp@amu.ac.in', '/patient')}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>👨‍🏫 AMU Employee (Priority E)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Kamran</span>
                  </button>
                  <button 
                    onClick={() => handleDemoSwitch('ramesh.sharma@gmail.com', '/patient')}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>🧑 Normal Citizen (Series N)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Ramesh</span>
                  </button>
                  <div className="border-t my-1"></div>
                  <button 
                    onClick={() => handleDemoSwitch('zahmed@amu.ac.in', '/doctor')}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>👨‍⚕️ Prof. Zameer Ahmed</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Medicine</span>
                  </button>
                  <button 
                    onClick={() => handleDemoSwitch('fzahra@amu.ac.in', '/doctor')}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>👩‍⚕️ Dr. Fatima Zahra</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Pediatrics</span>
                  </button>
                  <div className="border-t my-1"></div>
                  <button 
                    onClick={() => handleDemoSwitch('lab@amu.ac.in', '/diagnostic')}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>🧪 Diagnostics / Radiology</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">Lab</span>
                  </button>
                  <button 
                    onClick={() => handleDemoSwitch('reception@amu.ac.in', '/receptionist')}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>🏢 OPD Reception Counter</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Walk-in</span>
                  </button>
                  <button 
                    onClick={() => handleDemoSwitch('admin@amu.ac.in', '/admin')}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>👑 Hospital Administrator</span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-xs font-semibold">{user.fullName || user.email}</div>
                  <div className="text-[10px] text-emerald-300 font-mono tracking-wide">{user.role}</div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-1.5 rounded-full hover:bg-emerald-700 transition text-emerald-200 hover:text-white" 
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-700 hover:bg-emerald-600 transition">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-500 hover:bg-amber-400 text-emerald-950 transition">
                  Register (Free)
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center space-x-2">
            <button 
              onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
              className="bg-emerald-900 text-emerald-200 text-xs px-2.5 py-1 rounded border border-emerald-600"
            >
              ⚡ Demo
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-emerald-700 text-emerald-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-emerald-900 border-t border-emerald-700 px-4 pt-2 pb-4 space-y-2 text-sm">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-800">Home</Link>
          <Link to="/lobby" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-800">Live Waiting Board</Link>
          
          {user && (
            <>
              {user.role === 'PATIENT' && <Link to="/patient" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-800">Patient Portal</Link>}
              {user.role === 'DOCTOR' && <Link to="/doctor" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-800">Doctor Clinic Suite</Link>}
              {user.role === 'DIAGNOSTIC_REPORTER' && <Link to="/diagnostic" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-800">Diagnostic Lab</Link>}
              {user.role === 'RECEPTIONIST' && <Link to="/receptionist" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-800">Reception Counter</Link>}
              {user.role === 'ADMIN' && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-800">Hospital Admin</Link>}
            </>
          )}

          <div className="pt-2 border-t border-emerald-800 flex justify-between items-center">
            {user ? (
              <>
                <div>
                  <span className="text-xs block font-semibold">{user.fullName}</span>
                  <span className="text-[10px] text-emerald-300">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="text-xs bg-red-600/80 px-3 py-1 rounded">Logout</button>
              </>
            ) : (
              <div className="flex gap-2 w-full">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 bg-emerald-700 rounded text-xs font-semibold">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 bg-amber-500 text-emerald-950 rounded text-xs font-semibold">Register Free</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
