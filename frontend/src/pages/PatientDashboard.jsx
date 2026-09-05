import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import PrescriptionModal from '../components/PrescriptionModal';
import { 
  User, Calendar, Clock, CreditCard, Shield, Baby, 
  FileText, Activity, AlertCircle, CheckCircle2, RefreshCw, Printer, Plus, AlertTriangle 
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [children, setChildren] = useState([]);
  const [ehrData, setEhrData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, book, pediatric, ehr
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    patientId: '',
    departmentId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM - 10:00 AM',
  });
  const [bookingFee, setBookingFee] = useState(50);
  const [pendingAppointment, setPendingAppointment] = useState(null); // For payment modal
  const [bookingMsg, setBookingMsg] = useState('');

  // Pediatric Form State
  const [pediatricForm, setPediatricForm] = useState({
    childFullName: '',
    childDateOfBirth: '',
    childGender: 'Male',
    childBloodGroup: 'B+',
    guardianRelation: 'Father',
    aadhaarRef: '',
    abhaRef: '',
    departmentId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM - 10:00 AM',
  });
  const [pediatricMsg, setPediatricMsg] = useState('');

  // Load patient data
  const loadData = async () => {
    try {
      const [profRes, apptRes, childRes, deptRes, docRes] = await Promise.all([
        api.get('/patient/me'),
        api.get('/appointments/my'),
        api.get('/patient/children'),
        api.get('/public/departments'),
        api.get('/public/doctors')
      ]);

      if (profRes.data?.success) {
        setProfile(profRes.data.data);
        setBookingForm(prev => ({ ...prev, patientId: profRes.data.data.patientId }));
        // Load EHR
        loadEhr(profRes.data.data.patientId);
      }
      if (apptRes.data?.success) setAppointments(apptRes.data.data);
      if (childRes.data?.success) setChildren(childRes.data.data);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
      if (docRes.data?.success) setDoctors(docRes.data.data);
    } catch (err) {
      console.error('Error loading patient dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEhr = async (pid) => {
    try {
      const res = await api.get(`/patient/ehr/${pid}`);
      if (res.data?.success) {
        setEhrData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update dynamic booking fee calculation when doctor or patient changes
  useEffect(() => {
    if (!bookingForm.doctorId || !profile) return;
    const doc = doctors.find(d => d.id === parseInt(bookingForm.doctorId));
    if (!doc) return;

    // AMU Fee Calculation Rule:
    // Active AMU Student or Employee: 100% Free Consultation!
    // Expired AMU: Rs 50 (subsidized)
    // Normal Citizen: Doctor's standard consultation fee
    const today = new Date().toISOString().split('T')[0];
    const isExpired = profile.affiliationExpiryDate && profile.affiliationExpiryDate < today;

    if (profile.affiliationType === 'AMU_STUDENT' || profile.affiliationType === 'AMU_EMPLOYEE') {
      if (isExpired) {
        setBookingFee(50); // Subsidized rate for expired AMU affiliation
      } else {
        setBookingFee(0); // Free for active AMU institutional members!
      }
    } else {
      setBookingFee(doc.consultationFee || 100);
    }
  }, [bookingForm.doctorId, profile, doctors]);

  // Handle appointment booking step 1
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingMsg('');
    try {
      const res = await api.post('/appointments/book', {
        patientId: bookingForm.patientId,
        departmentId: parseInt(bookingForm.departmentId),
        doctorId: parseInt(bookingForm.doctorId),
        appointmentDate: bookingForm.appointmentDate,
        timeSlot: bookingForm.timeSlot,
      });

      if (res.data?.success) {
        setPendingAppointment(res.data.data);
      } else {
        setBookingMsg(res.data.message || 'Booking failed');
      }
    } catch (err) {
      setBookingMsg(err.response?.data?.message || err.message);
    }
  };

  // Handle Payment simulation step 2
  const handleProcessPayment = async (simulateSuccess) => {
    if (!pendingAppointment) return;
    try {
      const res = await api.post('/appointments/pay', {
        appointmentId: pendingAppointment.id,
        paymentMethod: 'UPI / Card Simulation',
        simulateSuccess: simulateSuccess,
      });

      if (simulateSuccess && res.data?.success) {
        alert('Payment Verified! Your OPD Token has been issued.');
        setPendingAppointment(null);
        setActiveTab('appointments');
        loadData();
      } else {
        alert('Payment Simulation: FAILED. You can retry payment as required by OPD specifications.');
        loadData();
      }
    } catch (err) {
      alert('Payment processing error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle Pediatric Booking
  const handlePediatricBooking = async (e) => {
    e.preventDefault();
    setPediatricMsg('');
    try {
      const res = await api.post('/patient/pediatric-booking', {
        guardianPatientId: profile.patientId,
        childFullName: pediatricForm.childFullName,
        childDateOfBirth: pediatricForm.childDateOfBirth,
        childGender: pediatricForm.childGender,
        childBloodGroup: pediatricForm.childBloodGroup,
        guardianRelation: pediatricForm.guardianRelation,
        aadhaarRef: pediatricForm.aadhaarRef,
        abhaRef: pediatricForm.abhaRef,
        departmentId: parseInt(pediatricForm.departmentId),
        doctorId: parseInt(pediatricForm.doctorId),
        appointmentDate: pediatricForm.appointmentDate,
        timeSlot: pediatricForm.timeSlot,
      });

      if (res.data?.success) {
        setPendingAppointment(res.data.data);
        setPediatricMsg('Pediatric booking initiated. Please complete the fee payment to confirm.');
      } else {
        setPediatricMsg(res.data.message || 'Pediatric booking failed');
      }
    } catch (err) {
      setPediatricMsg(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-500 text-sm">Loading patient profile & records...</div>;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const isAffiliationExpired = profile?.affiliationExpiryDate && profile?.affiliationExpiryDate < todayStr;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Patient Digital Identity Card */}
      {profile && (
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <User className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black">{profile.fullName}</h1>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isAffiliationExpired 
                      ? 'bg-amber-400 text-slate-950' 
                      : 'bg-emerald-700 text-emerald-100 border border-emerald-500'
                  }`}>
                    {profile.affiliationType} {isAffiliationExpired && '(EXPIRED)'}
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-0.5">
                  DOB: {profile.dateOfBirth} | Gender: {profile.gender} | Blood Group: <span className="font-bold text-white">{profile.bloodGroup}</span>
                </p>
                {profile.affiliationExpiryDate && (
                  <p className="text-[11px] text-emerald-300">
                    Tenure / Course Expiry: <strong>{profile.affiliationExpiryDate}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Permanent Patient ID Badge */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 text-center sm:text-right">
              <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider block">
                PERSISTENT PATIENT ID (PID)
              </span>
              <span className="text-2xl font-black font-mono tracking-widest text-amber-300">
                {profile.patientId}
              </span>
              <div className="text-[10px] text-emerald-200 mt-0.5">
                Aligarh Muslim University Health Service
              </div>
            </div>

          </div>

          {/* Institutional Status Alert if expired */}
          {isAffiliationExpired && (
            <div className="mt-4 p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  Your AMU Institutional affiliation expired on {profile.affiliationExpiryDate}. 
                  Your permanent PID & medical records are fully preserved, but current bookings are prioritized under Normal Citizen (N series).
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'border-emerald-700 text-emerald-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> My Appointments & OPD Tokens
        </button>

        <button
          onClick={() => setActiveTab('book')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'book'
              ? 'border-emerald-700 text-emerald-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus className="w-4 h-4 text-amber-600" /> Book OPD Consultation
        </button>

        <button
          onClick={() => setActiveTab('pediatric')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'pediatric'
              ? 'border-emerald-700 text-emerald-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Baby className="w-4 h-4 text-sky-600" /> Pediatric Booking (Child ≤ 8 yrs)
        </button>

        <button
          onClick={() => setActiveTab('ehr')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'ehr'
              ? 'border-emerald-700 text-emerald-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" /> Longitudinal EHR & Prescriptions
        </button>
      </div>

      {/* Tab 1: Appointments & Tokens */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Your Consultations & Active Tokens</h2>
            <button onClick={loadData} className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
              No appointments booked yet. Click "Book OPD Consultation" to schedule your visit.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((appt) => {
                const isPaid = appt.paymentState === 'SUCCESSFUL';
                const isPending = appt.paymentState === 'PENDING';
                const isFailed = appt.paymentState === 'FAILED';

                return (
                  <div 
                    key={appt.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {appt.appointmentNumber}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Dr. {appt.doctor?.user?.fullName}
                        </h3>
                        <p className="text-xs text-emerald-700 font-medium">
                          {appt.department?.name} (Room {appt.doctor?.roomNumber})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' :
                          isPending ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appt.paymentState}
                        </span>
                        <div className="text-xs font-bold text-slate-800 mt-1">
                          ₹{appt.feeAmount}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg flex justify-between">
                      <div>Date: <span className="font-semibold text-slate-800">{appt.appointmentDate}</span></div>
                      <div>Slot: <span className="font-semibold text-slate-800">{appt.timeSlot}</span></div>
                    </div>

                    {/* Pending Payment Notice & Retry Button */}
                    {(isPending || isFailed) && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2">
                        <div className="text-amber-800 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          OPD Token withheld until fee payment is verified.
                        </div>
                        <button
                          onClick={() => setPendingAppointment(appt)}
                          className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-md text-xs transition"
                        >
                          Complete / Retry Payment (₹{appt.feeAmount})
                        </button>
                      </div>
                    )}

                    {/* Paid Token Details */}
                    {isPaid && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-emerald-700 font-bold uppercase block">CONFIRMED OPD TOKEN</span>
                          <span className="text-base font-black text-emerald-950 font-mono">
                            {appt.paymentState === 'SUCCESSFUL' ? 'TOKEN ISSUED' : 'WAITING'}
                          </span>
                        </div>
                        <span className="text-[11px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-md">
                          Room {appt.doctor?.roomNumber}
                        </span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Book OPD Appointment */}
      {activeTab === 'book' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Schedule OPD Consultation</h2>
            <p className="text-xs text-slate-500">
              Select department and doctor. Dynamic institutional fee calculated automatically.
            </p>
          </div>

          {bookingMsg && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
              {bookingMsg}
            </div>
          )}

          <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Clinical Department *</label>
              <select
                required
                value={bookingForm.departmentId}
                onChange={(e) => setBookingForm({ ...bookingForm, departmentId: e.target.value, doctorId: '' })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Consulting Doctor *</label>
              <select
                required
                value={bookingForm.doctorId}
                onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Doctor --</option>
                {doctors
                  .filter(d => !bookingForm.departmentId || d.department?.id === parseInt(bookingForm.departmentId))
                  .map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.user?.fullName} (Room {doc.roomNumber}) - Fee: ₹{doc.consultationFee}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Appointment Date *</label>
                <input
                  type="date"
                  required
                  value={bookingForm.appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Time Slot *</label>
                <select
                  value={bookingForm.timeSlot}
                  onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="08:30 AM - 09:30 AM">08:30 AM - 09:30 AM</option>
                  <option value="09:30 AM - 10:30 AM">09:30 AM - 10:30 AM</option>
                  <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                  <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
                  <option value="12:30 PM - 01:30 PM">12:30 PM - 01:30 PM</option>
                </select>
              </div>
            </div>

            {/* Dynamic Fee Summary Banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-950 block">Calculated OPD Consultation Fee</span>
                <span className="text-[11px] text-emerald-700">
                  {bookingFee === 0 
                    ? '100% Waived for active AMU Student/Employee' 
                    : isAffiliationExpired 
                      ? 'Subsidized fee for expired AMU affiliation' 
                      : 'Standard Citizen consultation fee'}
                </span>
              </div>
              <div className="text-xl font-black text-emerald-900">
                {bookingFee === 0 ? 'FREE (₹0)' : `₹${bookingFee}`}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
            >
              Proceed to Booking & Payment
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Pediatric Booking */}
      {activeTab === 'pediatric' && (
        <div className="space-y-6">
          <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold mb-1">
                <Baby className="w-3.5 h-3.5" /> Guardian-Linked Child Registration
              </div>
              <h2 className="text-lg font-bold text-slate-800">Pediatric Booking (Age ≤ 8 Years)</h2>
              <p className="text-xs text-slate-500">
                Registered patients can book on behalf of children. Generates dedicated child PID linked to guardian PID <strong>{profile?.patientId}</strong>.
              </p>
            </div>

            {pediatricMsg && (
              <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs">
                {pediatricMsg}
              </div>
            )}

            <form onSubmit={handlePediatricBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Child Full Name *</label>
                  <input
                    type="text"
                    required
                    value={pediatricForm.childFullName}
                    onChange={(e) => setPediatricForm({ ...pediatricForm, childFullName: e.target.value })}
                    placeholder="e.g. Baby Aarav"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Child Date of Birth * (≤ 8 yrs)</label>
                  <input
                    type="date"
                    required
                    value={pediatricForm.childDateOfBirth}
                    onChange={(e) => setPediatricForm({ ...pediatricForm, childDateOfBirth: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={pediatricForm.childGender}
                    onChange={(e) => setPediatricForm({ ...pediatricForm, childGender: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={pediatricForm.childBloodGroup}
                    onChange={(e) => setPediatricForm({ ...pediatricForm, childBloodGroup: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="B+">B+</option>
                    <option value="A+">A+</option>
                    <option value="O+">O+</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Guardian Relation</label>
                  <select
                    value={pediatricForm.guardianRelation}
                    onChange={(e) => setPediatricForm({ ...pediatricForm, guardianRelation: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pediatric Doctor *</label>
                  <select
                    required
                    value={pediatricForm.doctorId}
                    onChange={(e) => {
                      const doc = doctors.find(d => d.id === parseInt(e.target.value));
                      setPediatricForm({ 
                        ...pediatricForm, 
                        doctorId: e.target.value,
                        departmentId: doc?.department?.id || ''
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose Pediatrician --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.user?.fullName} ({d.department?.name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={pediatricForm.appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPediatricForm({ ...pediatricForm, appointmentDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-700 hover:bg-sky-600 text-white font-bold rounded-xl shadow transition"
              >
                Register Child & Initiate Appointment
              </button>
            </form>
          </div>

          {/* Children List */}
          {children.length > 0 && (
            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                Linked Children under PID: {profile.patientId}
              </h3>
              <div className="space-y-2">
                {children.map(ch => (
                  <div key={ch.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{ch.fullName}</span>
                      <span className="text-slate-500 text-[11px] block">DOB: {ch.dateOfBirth} | Relation: {ch.guardianRelation}</span>
                    </div>
                    <span className="font-mono font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-md">
                      {ch.patientId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Longitudinal EHR History */}
      {activeTab === 'ehr' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-800">Longitudinal Electronic Health Record</h2>
              <p className="text-xs text-slate-500">Persistent medical history linked to {profile.patientId}</p>
            </div>
            <button
              onClick={() => loadEhr(profile.patientId)}
              className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Records
            </button>
          </div>

          {!ehrData || (ehrData.consultations?.length === 0 && ehrData.diagnosticRequests?.length === 0) ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
              No historical clinical records or lab tests recorded yet under PID {profile.patientId}.
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Consultations and Prescriptions Timeline */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" /> Clinical Visits & Prescriptions
                </h3>

                {ehrData.consultations?.map((cons) => (
                  <div key={cons.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-emerald-800">{cons.visitDate}</span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          Dr. {cons.doctor?.user?.fullName} ({cons.doctor?.specialization})
                        </h4>
                      </div>
                      <button
                        onClick={() => setSelectedPrescription(cons)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> View & Print Prescription
                      </button>
                    </div>

                    <div className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg">
                      <div>
                        <span className="font-semibold text-slate-700">Presenting Symptoms: </span>
                        <span className="text-slate-600">{cons.symptoms}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Diagnosis: </span>
                        <span className="text-slate-800 font-bold">{cons.finalDiagnosis || cons.provisionalDiagnosis}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Diagnostic Test Reports */}
              {ehrData.diagnosticRequests?.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" /> Diagnostic Test Reports (Lab / Radiology)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ehrData.diagnosticRequests.map(({ request, report }, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-sky-700 tracking-wider">
                              {request.discipline}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{request.testName}</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            report?.finalized ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {report?.finalized ? 'LOCKED / FINALIZED' : request.status}
                          </span>
                        </div>

                        {report ? (
                          <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                            <div className="font-bold text-slate-800">Findings: {report.findings}</div>
                            <div className="text-slate-600">{report.reportSummary}</div>
                            {report.fileUrl && (
                              <a 
                                href={report.fileUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-block text-emerald-700 font-semibold underline mt-1"
                              >
                                View Attached Lab Scan ({report.fileType?.toUpperCase()})
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">Sample collection / investigation in progress.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Conceptual Payment Simulation Modal */}
      {pendingAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="border-b pb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">AMU Healthcare Checkout</span>
              <h3 className="text-base font-black text-slate-800">OPD Consultation Payment</h3>
              <p className="text-xs text-slate-500">Appointment No: {pendingAppointment.appointmentNumber}</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Consulting Doctor:</span>
                <span className="font-bold text-slate-900">Dr. {pendingAppointment.doctor?.user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Clinic Room:</span>
                <span className="font-bold text-slate-900">Room {pendingAppointment.doctor?.roomNumber}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-200 pt-2 text-sm">
                <span className="font-bold text-emerald-950">Total Payable:</span>
                <span className="font-black text-emerald-950">₹{pendingAppointment.feeAmount}</span>
              </div>
            </div>

            {/* Test Simulation Buttons */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                Conceptual Payment Simulation Controls
              </div>
              <button
                onClick={() => handleProcessPayment(true)}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simulate Payment SUCCESS (Issue Token)
              </button>
              <button
                onClick={() => handleProcessPayment(false)}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" /> Simulate Payment FAILURE (Demonstrate Retry)
              </button>
            </div>

            <button
              onClick={() => setPendingAppointment(null)}
              className="w-full py-1.5 text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {/* Prescription View/Print Modal */}
      {selectedPrescription && (
        <PrescriptionModal
          consultation={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}

    </div>
  );
}
