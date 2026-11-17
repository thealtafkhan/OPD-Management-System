import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, AlertCircle, CheckCircle2, RefreshCw, LogIn, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'B+',
    address: '',
    affiliationType: 'NORMAL_CITIZEN',
    studentId: '',
    employeeId: '',
    affiliationExpiryDate: '',
    aadhaarRef: '',
    abhaRef: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredPid, setRegisteredPid] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        username: formData.email || formData.mobile || formData.fullName.toLowerCase().replace(/\s+/g, '')
      };
      const res = await api.post('/auth/register', payload);
      if (res.data && res.data.success) {
        setRegisteredPid(res.data.data.patientId);
        // Automatically login
        await login(formData.email || payload.username, formData.password);
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (registeredPid) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center space-y-4 auth-card-transition">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">Registration Successful!</h2>
        <p className="text-xs text-slate-600">
          Your free lifetime OPD Patient Identity has been created.
        </p>

        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 my-4 shadow-inner">
          <span className="text-xs text-emerald-800 font-semibold block">YOUR PERSISTENT PATIENT ID</span>
          <span className="text-2xl font-black text-emerald-950 font-mono tracking-wider">{registeredPid}</span>
        </div>

        <p className="text-xs text-slate-500">
          Remember this PID for all future visits, pediatric child linkings, and medical record history.
        </p>

        <button
          onClick={() => navigate('/patient')}
          className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
        >
          <span>Go to Patient Portal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 auth-card-transition">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
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
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">AMU OPD Registration</h2>
        <p className="text-xs text-slate-500 mt-1">Free Lifetime Digital Patient Identity (PID)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6 transition-all duration-300 hover:shadow-2xl">
        
        {/* Smooth Toggle Tabs between Login and Register */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <Link
            to="/login"
            className="flex-1 py-2 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-white/60 flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </Link>
          <button
            type="button"
            className="flex-1 py-2 rounded-lg bg-emerald-800 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all duration-200 cursor-default"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register (Free PID)
          </button>
        </div>

        <div className="border-b border-slate-200 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Free Registration
          </div>
          <h2 className="text-xl font-black text-slate-800">New Patient Registration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Assigns your permanent <strong>Patient ID (PID-xxxx)</strong>. Fees are charged only upon OPD booking.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Institutional Affiliation Selector */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="font-bold text-slate-800 block">Select Affiliation Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: 'NORMAL_CITIZEN', title: 'Normal Citizen', desc: 'General Public (Token N)' },
                { type: 'AMU_STUDENT', title: 'AMU Student', desc: 'Active Enrolled (Token S)' },
                { type: 'AMU_EMPLOYEE', title: 'AMU Employee', desc: 'Faculty / Staff (Token E)' },
              ].map((item) => (
                <label 
                  key={item.type}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-left block shadow-sm ${
                    formData.affiliationType === item.type 
                      ? 'border-emerald-600 bg-emerald-50/90 text-emerald-900 ring-2 ring-emerald-500 shadow-emerald-100 shadow-md' 
                      : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="affiliationType"
                    value={item.type}
                    checked={formData.affiliationType === item.type}
                    onChange={(e) => setFormData({ ...formData, affiliationType: e.target.value })}
                    className="sr-only"
                  />
                  <div className="font-bold">{item.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                </label>
              ))}
            </div>

            {/* Conditional Affiliation Fields */}
            {formData.affiliationType === 'AMU_STUDENT' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-slate-700">Student Enrollment / Roll No *</label>
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="e.g. 21BCA102"
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Course Expiry / Validity Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.affiliationExpiryDate}
                    onChange={(e) => setFormData({ ...formData, affiliationExpiryDate: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {formData.affiliationType === 'AMU_EMPLOYEE' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-slate-700">Employee ID / Staff No *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g. EMP-9041"
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Tenure / Card Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.affiliationExpiryDate}
                    onChange={(e) => setFormData({ ...formData, affiliationExpiryDate: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Zaid Khan"
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="e.g. +91 9876543210"
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="zaid@example.com"
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Account Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700">Aadhaar (Last 4 digits / Ref)</label>
              <input
                type="text"
                maxLength="4"
                value={formData.aadhaarRef}
                onChange={(e) => setFormData({ ...formData, aadhaarRef: e.target.value })}
                placeholder="e.g. 5421"
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">ABHA Health ID (Optional)</label>
              <input
                type="text"
                value={formData.abhaRef}
                onChange={(e) => setFormData({ ...formData, abhaRef: e.target.value })}
                placeholder="e.g. 91-0000-0000-0000"
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Address</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Hall of Residence / City / District"
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Assigning Patient ID & Logging In...</span>
              </>
            ) : (
              <span>Complete Free Registration & Get PID</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800">
            Sign In with PID or Email
          </Link>
        </div>

      </div>
    </div>
  );
}
