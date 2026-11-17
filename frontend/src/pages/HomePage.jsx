import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { 
  Building2, Users, Stethoscope, Calendar, Activity, 
  Clock, ShieldCheck, ArrowRight, HeartPulse, Sparkles, CheckCircle2, UserPlus 
} from 'lucide-react';

export default function HomePage() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, docRes] = await Promise.all([
          api.get('/public/departments'),
          api.get('/public/doctors')
        ]);
        if (deptRes.data?.success) setDepartments(deptRes.data.data);
        if (docRes.data?.success) setDoctors(docRes.data.data);
      } catch (err) {
        console.error('Error fetching public directory', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-2">
                <div className="relative inline-flex items-center justify-center group cursor-pointer">
                  {/* Dynamic pulsing aura glow */}
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-400 to-amber-300 opacity-60 blur-md logo-glow-aura group-hover:opacity-100 group-hover:scale-120 transition-all duration-700"></div>
                  
                  {/* Rotating decorative accent ring */}
                  <div className="absolute -inset-1 rounded-full border border-dashed border-amber-300/80 logo-ring-rotate pointer-events-none"></div>

                  {/* Logo badge with tactile hover */}
                  <div className="relative w-16 h-16 rounded-full bg-white p-1 shadow-2xl ring-2 ring-amber-400 group-hover:ring-amber-300 group-hover:rotate-12 transition-all duration-500 transform group-hover:scale-110 flex items-center justify-center overflow-hidden">
                    <img 
                      src="/amu_logo.png" 
                      alt="AMU Logo" 
                      className="w-full h-full object-contain rounded-full transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-700/90 text-emerald-200 text-xs font-semibold tracking-wide border border-emerald-500/40 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Next-Gen AMU Healthcare System • JNMCH
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Aligarh Muslim University <br />
                <span className="text-amber-400">OPD Management System</span>
              </h1>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                Jawaharlal Nehru Medical College & Hospital — Streamlined Outpatient Consultations, 
                Priority Queue Management with Anti-Starvation Fairness, and Unified Longitudinal Electronic Health Records.
              </p>

              <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-3">
                <Link 
                  to="/patient" 
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 hover:scale-[1.03] flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Book OPD Appointment
                </Link>
                <Link 
                  to="/register" 
                  className="px-4.5 py-3 rounded-xl bg-emerald-700/90 hover:bg-emerald-600 text-emerald-50 text-sm font-semibold transition-all duration-200 active:scale-95 hover:scale-[1.03] shadow-md flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-emerald-200" /> Free Registration (PID)
                </Link>
              </div>
            </div>

            {/* Quick Stats Pill Card */}
            <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl text-white space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2 border-b border-white/20 pb-3">
                <HeartPulse className="w-5 h-5 text-amber-400" /> OPD Operations
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span className="text-emerald-200">OPD Timings</span>
                  <span className="font-bold text-amber-300">08:00 AM - 02:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span className="text-emerald-200">Free Registration</span>
                  <span className="font-bold text-emerald-300">Persistent PID</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span className="text-emerald-200">AMU Token Series</span>
                  <span className="font-bold text-white">S (Student) | E (Employee)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-emerald-200">Citizen Token Series</span>
                  <span className="font-bold text-sky-300">N (Normal Citizen)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Core System Architecture</h2>
          <p className="text-xs text-slate-500 mt-1">Compliant with AMU JNMC Outpatient Care & ABHA Standards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Persistent Patient Identity</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Separation of registration from fee payment. Every patient receives a permanent <strong>PID-xxxx</strong> 
              that retains longitudinal medical records even after AMU affiliation expiration.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Anti-Starvation Fairness Queue</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Token series for Students (<strong>S</strong>), Employees (<strong>E</strong>), and General Public (<strong>N</strong>). 
              Strict fairness algorithm guarantees normal citizens are served after every two priority tokens.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center mb-4">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Longitudinal EHR</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Unified electronic medical records and digital prescriptions with printable AMU format.
            </p>
          </div>
        </div>
      </section>

      {/* OPD Departments & Rosters */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Active OPD Departments & Clinical Faculty</h2>
            <p className="text-xs text-slate-500">Live roster of consulting specialists at J.N. Medical College</p>
          </div>
          <Link to="/patient" className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1">
            Book Appointment <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading OPD roster...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-emerald-500 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Dr. {doc.user?.fullName}</h4>
                    <p className="text-xs font-semibold text-emerald-700">{doc.department?.name}</p>
                    <p className="text-[11px] text-slate-500">{doc.specialization} ({doc.qualification})</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                    Room {doc.roomNumber}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.opdSchedule || '09:00 AM - 01:00 PM'}</span>
                  </div>
                  <div className="font-bold text-slate-800">
                    Fee: ₹{doc.consultationFee || 50}
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to="/patient"
                    className="w-full block text-center py-2 bg-slate-50 hover:bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-slate-200 hover:border-emerald-300 transition"
                  >
                    Consult Doctor
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
