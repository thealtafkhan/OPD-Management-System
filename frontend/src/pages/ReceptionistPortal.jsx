import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  Users, UserPlus, Printer, CheckCircle2, Ticket, 
  Calendar, RefreshCw, ArrowRight, Search, ShieldCheck, 
  AlertCircle, AlertTriangle, FileCheck, Check, Clock
} from 'lucide-react';
import { OPD_10_MIN_SLOTS, getDoctor10MinSlots } from '../utils/timeSlots';
import OpdConsultationSlipModal from '../components/OpdConsultationSlipModal';

export default function ReceptionistPortal() {
  const [activeTab, setActiveTab] = useState('verify'); // verify, register, book, tokens
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [todayTokens, setTodayTokens] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for Bookings Verification
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, VERIFIED
  const [verifyingId, setVerifyingId] = useState(null);
  const [selectedSlipModalData, setSelectedSlipModalData] = useState(null);

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
    timeSlot: '09:00 AM - 09:10 AM',
  });
  const [issuedSlip, setIssuedSlip] = useState(null);

  const loadData = async () => {
    try {
      const [deptRes, docRes, tokRes, bookRes] = await Promise.all([
        api.get('/public/departments'),
        api.get('/public/doctors'),
        api.get('/receptionist/today-tokens'),
        api.get('/receptionist/bookings')
      ]);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
      if (docRes.data?.success) setDoctors(docRes.data.data);
      if (tokRes.data?.success) setTodayTokens(tokRes.data.data);
      if (bookRes.data?.success) setBookings(bookRes.data.data);
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
        loadData();
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
        setSelectedSlipModalData(res.data.data);
        loadData();
      } else {
        alert(res.data?.message || 'Token generation failed');
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleVerifyAndPrint = async (appointmentId) => {
    try {
      setVerifyingId(appointmentId);
      const res = await api.post(`/receptionist/verify-and-issue-slip/${appointmentId}`);
      if (res.data?.success) {
        setSelectedSlipModalData(res.data.data);
        loadData();
      } else {
        alert(res.data?.message || 'Verification failed');
      }
    } catch (err) {
      alert('Verification error: ' + (err.response?.data?.message || err.message));
    } finally {
      setVerifyingId(null);
    }
  };

  const selectedDoctor = doctors.find(d => d.id === parseInt(bookTokenForm.doctorId));
  const availableReceptionistSlots = getDoctor10MinSlots(selectedDoctor?.availableTimeSlot);

  // Filter bookings
  const filteredBookings = bookings.filter((item) => {
    const appt = item.appointment || {};
    const patient = appt.patient || {};
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q || (
      (patient.patientId && patient.patientId.toLowerCase().includes(q)) ||
      (patient.fullName && patient.fullName.toLowerCase().includes(q)) ||
      (patient.mobile && patient.mobile.includes(q)) ||
      (appt.appointmentNumber && appt.appointmentNumber.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    if (statusFilter === 'PENDING') return !appt.slipIssued;
    if (statusFilter === 'VERIFIED') return !!appt.slipIssued;
    return true;
  });

  const pendingCount = bookings.filter(b => !b.appointment?.slipIssued).length;
  const verifiedCount = bookings.filter(b => !!b.appointment?.slipIssued).length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
            <Users className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">OPD Reception & Prescription Issuance Desk</h1>
            <p className="text-xs text-purple-200 mt-0.5">
              Verify Patient Bookings by PID • Print Official Hard Copy Prescription Slips • Walk-in Registration
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 bg-purple-800 hover:bg-purple-700 active:scale-95 rounded-xl text-white transition flex items-center gap-1.5 text-xs font-semibold shadow shrink-0"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Counter
        </button>
      </div>

      {/* Mandatory Workflow Advisory Card */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs space-y-2">
        <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
          <span>Mandatory Protocol: Hard Copy Prescription Collection Before Doctor Consultation</span>
        </div>
        <p className="text-slate-700 leading-relaxed text-[11px]">
          In AMU Hospital OPD, every registered & booked patient <strong>must receive their physical printed OPD Prescription & Consultation Slip</strong> from this reception desk prior to seeing the consulting physician. 
          The patient carries this physical sheet into the consulting room for the doctor to document clinical findings and write medication prescriptions for pharmacy dispensing. All records are simultaneously linked permanently to the patient's Digital EHR for lifetime continuity.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-semibold overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('verify')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'verify'
              ? 'border-purple-700 text-purple-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-700" />
          1. Verify Bookings & Issue Prescription Slip ({pendingCount} Pending)
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'register'
              ? 'border-purple-700 text-purple-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4 inline" /> 2. Register Walk-In Patient (Free PID)
        </button>

        <button
          onClick={() => setActiveTab('book')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'book'
              ? 'border-purple-700 text-purple-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4 text-amber-600 inline" /> 3. On-Counter Booking & Immediate Slip
        </button>

        <button
          onClick={() => setActiveTab('tokens')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'tokens'
              ? 'border-purple-700 text-purple-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer className="w-4 h-4 text-slate-600 inline" /> 4. Queue Token Roster ({todayTokens.length})
        </button>
      </div>

      {/* Tab 1: Verify Bookings & Issue Hard-Copy Prescription Slip */}
      {activeTab === 'verify' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Patient Bookings & Hard Copy Prescription Issuance
              </h2>
              <p className="text-xs text-slate-500">
                Search patient by PID or Name, verify their identity details, and click "Verify & Print Slip" to hand the hard copy to patient.
              </p>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg">
              Total Bookings: {bookings.length}
            </span>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Patient ID (PID), Name, Mobile, or Booking No..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto text-xs overflow-x-auto">
              <span className="text-slate-500 font-semibold text-[11px] shrink-0">Filter:</span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                  statusFilter === 'ALL' ? 'bg-purple-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                  statusFilter === 'PENDING' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                ⏳ Pending Slip ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('VERIFIED')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                  statusFilter === 'VERIFIED' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                ✅ Slip Handed Over ({verifiedCount})
              </button>
            </div>
          </div>

          {/* Bookings Verification Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b">
                  <th className="p-3">Patient ID & Category</th>
                  <th className="p-3">Patient Particulars</th>
                  <th className="p-3">Doctor & Clinic</th>
                  <th className="p-3">Date & 10-Min Slot</th>
                  <th className="p-3">Token & Fee</th>
                  <th className="p-3">Prescription Slip Status</th>
                  <th className="p-3 text-right">Counter Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      No matching patient bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((item) => {
                    const appt = item.appointment || {};
                    const patient = appt.patient || {};
                    const doctor = appt.doctor || {};
                    const doctorUser = doctor.user || {};
                    const token = item.token || {};
                    const isIssued = appt.slipIssued;
                    const isVerifying = verifyingId === appt.id;

                    return (
                      <tr key={appt.id} className="border-b hover:bg-slate-50 transition-colors">
                        
                        {/* PID & Category */}
                        <td className="p-3">
                          <span className="font-mono font-bold text-sm bg-purple-50 text-purple-950 px-2 py-0.5 rounded border border-purple-200 block w-max">
                            {patient.patientId || 'N/A'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                            {patient.affiliationType || 'NORMAL_CITIZEN'}
                          </span>
                        </td>

                        {/* Patient Particulars */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-sm">{patient.fullName}</div>
                          <div className="text-[11px] text-slate-500">
                            Gender: {patient.gender || 'N/A'} | Blood: {patient.bloodGroup || 'N/A'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Ph: {patient.mobile || 'N/A'}
                          </div>
                        </td>

                        {/* Doctor & Room */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900">Dr. {doctorUser.fullName}</div>
                          <div className="text-[11px] text-emerald-800 font-semibold">{appt.department?.name}</div>
                          <div className="text-[11px] text-slate-600 font-bold">
                            Room {doctor.roomNumber || '101'}
                          </div>
                        </td>

                        {/* Date & Slot */}
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{appt.appointmentDate}</div>
                          <div className="text-[11px] text-emerald-900 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                            {appt.timeSlot}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {appt.appointmentNumber}
                          </div>
                        </td>

                        {/* Token & Fee */}
                        <td className="p-3">
                          <div className="font-mono font-black text-sm text-purple-900">
                            {token.tokenNumber || 'Queue Ready'}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 inline-block ${
                            appt.paymentState === 'SUCCESSFUL' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            ₹{appt.feeAmount} ({appt.paymentState})
                          </span>
                        </td>

                        {/* Slip Status */}
                        <td className="p-3">
                          {isIssued ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                Slip Handed Over
                              </span>
                              <div className="text-[10px] text-slate-400 mt-1">
                                Verified by {appt.verifiedBy || 'receptionist'}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              Pending Verification
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          {isIssued ? (
                            <button
                              onClick={() => setSelectedSlipModalData({ appointment: appt, token })}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 ml-auto active:scale-95 shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5" /> Reprint Hard Copy
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifyAndPrint(appt.id)}
                              disabled={isVerifying}
                              className="px-3.5 py-2 bg-purple-800 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                            >
                              {isVerifying ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Verifying...</span>
                                </>
                              ) : (
                                <>
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>Verify & Print Slip</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Walkin Registration */}
      {activeTab === 'register' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-slate-800">Walk-In Patient Registration</h2>
            <p className="text-xs text-slate-500">Free lifetime enrollment. Generates permanent PID.</p>
          </div>

          {registeredResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs animate-in fade-in">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Walk-In Patient Enrolled Successfully!
              </div>
              <div className="text-slate-700">Name: <strong>{registeredResult.fullName}</strong></div>
              <div className="text-slate-700">Assigned Patient ID: <strong className="font-mono text-emerald-900 text-sm">{registeredResult.patientId}</strong></div>
              <button
                onClick={() => setActiveTab('book')}
                className="mt-2 py-1.5 px-4 bg-purple-800 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition"
              >
                Proceed to Issue Token & Prescription Slip <ArrowRight className="w-3.5 h-3.5" />
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
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
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
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
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
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                <select
                  value={walkinForm.gender}
                  onChange={(e) => setWalkinForm({ ...walkinForm, gender: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
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
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-purple-600"
                >
                  <option value="NORMAL_CITIZEN">Normal Citizen (N)</option>
                  <option value="AMU_STUDENT">AMU Student (S)</option>
                  <option value="AMU_EMPLOYEE">AMU Employee (E)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                <select
                  value={walkinForm.bloodGroup}
                  onChange={(e) => setWalkinForm({ ...walkinForm, bloodGroup: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Aadhaar / ID Ref (Optional)</label>
                <input
                  type="text"
                  value={walkinForm.aadhaarRef || ''}
                  onChange={(e) => setWalkinForm({ ...walkinForm, aadhaarRef: e.target.value })}
                  placeholder="e.g. XXXX-XXXX-1234"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Address</label>
              <input
                type="text"
                value={walkinForm.address}
                onChange={(e) => setWalkinForm({ ...walkinForm, address: e.target.value })}
                placeholder="Hall of Residence / City / District"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition"
            >
              Enroll Patient & Generate PID
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: On-Counter Instant Booking */}
      {activeTab === 'book' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-slate-800">On-Counter Instant OPD Booking & Prescription Slip</h2>
            <p className="text-xs text-slate-500">Instant Cash/Card counter payment and automatic prescription slip generation.</p>
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
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Consulting Doctor *</label>
              <select
                required
                value={bookTokenForm.doctorId}
                onChange={(e) => {
                  const docId = e.target.value;
                  const doc = doctors.find(d => d.id === parseInt(docId));
                  const slots = getDoctor10MinSlots(doc?.availableTimeSlot);
                  setBookTokenForm({
                    ...bookTokenForm,
                    doctorId: docId,
                    departmentId: doc?.department?.id || '',
                    timeSlot: slots[0] || '09:00 AM - 09:10 AM'
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={bookTokenForm.appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookTokenForm({ ...bookTokenForm, appointmentDate: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Time Slot (10 Mins) *</label>
                <select
                  value={bookTokenForm.timeSlot}
                  onChange={(e) => setBookTokenForm({ ...bookTokenForm, timeSlot: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                >
                  {availableReceptionistSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition"
            >
              Confirm Cash/Card Fee & Print Prescription Slip
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Today's Tokens Roster */}
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

      {/* OPD Consultation Prescription Slip Print Modal */}
      {selectedSlipModalData && (
        <OpdConsultationSlipModal
          appointment={selectedSlipModalData.appointment}
          token={selectedSlipModalData.token}
          onClose={() => setSelectedSlipModalData(null)}
        />
      )}

    </div>
  );
}
