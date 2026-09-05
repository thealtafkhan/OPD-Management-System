import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  Users, UserPlus, Printer, CheckCircle2, Ticket, 
  Calendar, RefreshCw, ArrowRight 
} from 'lucide-react';

export default function ReceptionistPortal() {
  const [activeTab, setActiveTab] = useState('register'); // register, book, tokens
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [todayTokens, setTodayTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Walk-in Registration Form
  const [walkinForm, setWalkinForm] = useState({
    fullName: '',
    email: '',
    password: 'password123',
    mobile: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'B+',
    address: 'Aligarh',
    affiliationType: 'NORMAL_CITIZEN',
    studentId: '',
    employeeId: '',
    affiliationExpiryDate: '',
  });
  const [registeredResult, setRegisteredResult] = useState(null);

  // Instant Book & Issue Token Form
  const [bookTokenForm, setBookTokenForm] = useState({
    patientId: '',
    departmentId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM - 10:00 AM',
  });
  const [issuedSlip, setIssuedSlip] = useState(null);

  const loadData = async () => {
    try {
      const [deptRes, docRes, tokRes] = await Promise.all([
        api.get('/public/departments'),
        api.get('/public/doctors'),
        api.get('/receptionist/today-tokens')
      ]);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
      if (docRes.data?.success) setDoctors(docRes.data.data);
      if (tokRes.data?.success) setTodayTokens(tokRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWalkinRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...walkinForm,
        email: walkinForm.email || `walkin_${Date.now()}@opd.local`
      };
      const res = await api.post('/receptionist/register-walkin', payload);
      if (res.data?.success) {
        setRegisteredResult(res.data.data);
        setBookTokenForm(prev => ({ ...prev, patientId: res.data.data.patientId }));
      }
    } catch (err) {
      alert('Walk-in registration error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBookAndIssueToken = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/receptionist/book-and-token', {
        patientId: bookTokenForm.patientId,
        departmentId: parseInt(bookTokenForm.departmentId),
        doctorId: parseInt(bookTokenForm.doctorId),
        appointmentDate: bookTokenForm.appointmentDate,
        timeSlot: bookTokenForm.timeSlot,
      });

      if (res.data?.success) {
        setIssuedSlip(res.data.data);
        loadData();
      } else {
        alert(res.data?.message || 'Token generation failed');
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
            <Users className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black">OPD Reception & Token Dispatch Counter</h1>
            <p className="text-xs text-purple-200">
              Walk-in Patient Enrollment, Immediate Fee Settlement & Category Token Generation (S, E, N)
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 bg-purple-800 hover:bg-purple-700 rounded-xl text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('register')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'register'
              ? 'border-purple-700 text-purple-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-1" /> 1. Register Walk-In Patient (Free PID)
        </button>

        <button
          onClick={() => setActiveTab('book')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'book'
              ? 'border-purple-700 text-purple-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4 inline mr-1 text-amber-600" /> 2. On-Counter Booking & Issue Token Slip
        </button>

        <button
          onClick={() => setActiveTab('tokens')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'tokens'
              ? 'border-purple-700 text-purple-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer className="w-4 h-4 inline mr-1 text-slate-600" /> 3. Today's Tokens Roster ({todayTokens.length})
        </button>
      </div>

      {/* Tab 1: Walkin Registration */}
      {activeTab === 'register' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-slate-800">Walk-In Patient Registration</h2>
            <p className="text-xs text-slate-500">Free lifetime enrollment. Generates permanent PID.</p>
          </div>

          {registeredResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Walk-In Patient Enrolled Successfully!
              </div>
              <div className="text-slate-700">Name: <strong>{registeredResult.fullName}</strong></div>
              <div className="text-slate-700">Assigned Patient ID: <strong className="font-mono text-emerald-900 text-sm">{registeredResult.patientId}</strong></div>
              <button
                onClick={() => setActiveTab('book')}
                className="mt-2 py-1.5 px-4 bg-purple-800 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                Proceed to Issue Token Slip <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleWalkinRegister} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={walkinForm.fullName}
                  onChange={(e) => setWalkinForm({ ...walkinForm, fullName: e.target.value })}
                  placeholder="e.g. Mohd Rashid"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={walkinForm.mobile}
                  onChange={(e) => setWalkinForm({ ...walkinForm, mobile: e.target.value })}
                  placeholder="9876543210"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={walkinForm.dateOfBirth}
                  onChange={(e) => setWalkinForm({ ...walkinForm, dateOfBirth: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                <select
                  value={walkinForm.gender}
                  onChange={(e) => setWalkinForm({ ...walkinForm, gender: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Affiliation</label>
                <select
                  value={walkinForm.affiliationType}
                  onChange={(e) => setWalkinForm({ ...walkinForm, affiliationType: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="NORMAL_CITIZEN">Normal Citizen (N)</option>
                  <option value="AMU_STUDENT">AMU Student (S)</option>
                  <option value="AMU_EMPLOYEE">AMU Employee (E)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition mt-2"
            >
              Enroll Patient & Generate PID
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Book and Issue Token */}
      {activeTab === 'book' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-slate-800">Issue Immediate OPD Token Slip</h2>
            <p className="text-xs text-slate-500">Collects on-counter consultation fee and assigns queue token.</p>
          </div>

          <form onSubmit={handleBookAndIssueToken} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Patient ID (PID) *</label>
              <input
                type="text"
                required
                value={bookTokenForm.patientId}
                onChange={(e) => setBookTokenForm({ ...bookTokenForm, patientId: e.target.value })}
                placeholder="e.g. PID-1001"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Consulting Doctor *</label>
              <select
                required
                value={bookTokenForm.doctorId}
                onChange={(e) => {
                  const doc = doctors.find(d => d.id === parseInt(e.target.value));
                  setBookTokenForm({
                    ...bookTokenForm,
                    doctorId: e.target.value,
                    departmentId: doc?.department?.id || ''
                  });
                }}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="">-- Select Consulting Doctor --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.user?.fullName} ({d.department?.name}) - Room {d.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition"
            >
              Confirm Cash/Card Fee & Print Token Slip
            </button>
          </form>

          {/* Printable Token Slip Preview */}
          {issuedSlip && (
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-400 rounded-xl text-center space-y-2 mt-4">
              <div className="text-[10px] uppercase font-bold text-slate-500">ALIGARH MUSLIM UNIVERSITY • OPD SLIP</div>
              <div className="text-xs font-semibold text-slate-700">J.N. Medical College & Hospital</div>
              <div className="text-4xl font-black font-mono text-purple-950 py-2">
                {issuedSlip.token?.tokenNumber}
              </div>
              <div className="text-xs font-bold text-slate-800">
                Dr. {issuedSlip.token?.doctor?.user?.fullName} (Room {issuedSlip.token?.doctor?.roomNumber})
              </div>
              <div className="text-[11px] text-slate-500">
                Patient: {issuedSlip.appointment?.patient?.fullName} ({issuedSlip.appointment?.patient?.patientId})
              </div>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                Issued At: {new Date().toLocaleTimeString()} • Paid: ₹{issuedSlip.appointment?.feeAmount}
              </div>
              <button
                onClick={() => window.print()}
                className="no-print mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Print Slip
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Today's Tokens */}
      {activeTab === 'tokens' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Today's Token Registry</h2>
            <span className="text-xs text-slate-500">Total Tokens: {todayTokens.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b">
                  <th className="p-2">Token No</th>
                  <th className="p-2">Prefix</th>
                  <th className="p-2">Patient PID</th>
                  <th className="p-2">Doctor</th>
                  <th className="p-2">Room</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Issued At</th>
                </tr>
              </thead>
              <tbody>
                {todayTokens.map((tok) => (
                  <tr key={tok.id} className="border-b hover:bg-slate-50">
                    <td className="p-2 font-mono font-black text-slate-900">{tok.tokenNumber}</td>
                    <td className="p-2">
                      <span className="bg-slate-100 font-bold px-1.5 py-0.5 rounded text-[10px]">
                        {tok.tokenPrefix}
                      </span>
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-700">{tok.patient?.patientId}</td>
                    <td className="p-2">Dr. {tok.doctor?.user?.fullName}</td>
                    <td className="p-2 font-bold text-slate-800">Room {tok.doctor?.roomNumber}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tok.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        tok.status === 'IN_CONSULTATION' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {tok.status}
                      </span>
                    </td>
                    <td className="p-2 text-slate-500">{tok.tokenIssuedAt?.substring(11, 16) || '09:00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
