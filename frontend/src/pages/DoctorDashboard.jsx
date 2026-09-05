import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Stethoscope, Users, User, Activity, FileText, CheckCircle2, 
  Plus, Trash2, ArrowRight, RefreshCw, Clock, AlertTriangle, ShieldCheck 
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [queue, setQueue] = useState([]);
  const [activeToken, setActiveToken] = useState(null);
  const [patientEhr, setPatientEhr] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clinical Consultation Form
  const [consultationForm, setConsultationForm] = useState({
    symptoms: '',
    clinicalObservations: '',
    provisionalDiagnosis: '',
    finalDiagnosis: '',
    generalAdvice: '',
    followUpDate: '',
    medicines: [
      { name: 'Tab Paracetamol 650mg', dose: '1 Tab', frequency: '1-0-1', duration: '3 Days', instructions: 'After food' }
    ],
    diagnosticOrders: []
  });

  const [savingConsultation, setSavingConsultation] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    try {
      const profRes = await api.get('/doctor/my-profile');
      if (profRes.data?.success) {
        const doc = profRes.data.data;
        setDoctorProfile(doc);

        const [qRes, activeRes] = await Promise.all([
          api.get(`/queue/doctor/${doc.id}`),
          api.get('/doctor/active-token')
        ]);

        if (qRes.data?.success) setQueue(qRes.data.data);
        if (activeRes.data?.success && activeRes.data.data) {
          setActiveToken(activeRes.data.data);
          loadPatientHistory(activeRes.data.data.patient?.patientId);
        }
      }
    } catch (err) {
      console.error('Error loading doctor portal', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientHistory = async (pid) => {
    if (!pid) return;
    try {
      const res = await api.get(`/doctor/history/${pid}`);
      if (res.data?.success) {
        setPatientEhr(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Call next patient using anti-starvation fairness algorithm
  const handleCallNext = async () => {
    if (!doctorProfile) return;
    try {
      const res = await api.post(`/queue/doctor/${doctorProfile.id}/call-next`);
      if (res.data?.success && res.data.data) {
        setActiveToken(res.data.data);
        loadPatientHistory(res.data.data.patient?.patientId);
        loadData();
        setStatusMsg(`Token ${res.data.data.tokenNumber} is now inside consultation room.`);
      } else {
        alert(res.data?.message || 'No patients currently waiting in queue.');
      }
    } catch (err) {
      alert('Error calling next patient: ' + err.message);
    }
  };

  // Medicine helpers
  const addMedicineRow = () => {
    setConsultationForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dose: '', frequency: '1-0-1', duration: '5 Days', instructions: 'After meals' }]
    }));
  };

  const removeMedicineRow = (idx) => {
    setConsultationForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx)
    }));
  };

  // Diagnostic helpers
  const addDiagnosticOrder = (discipline, testName) => {
    setConsultationForm(prev => ({
      ...prev,
      diagnosticOrders: [...prev.diagnosticOrders, { discipline, testName, clinicalNotes: 'Urgent OPD evaluation' }]
    }));
  };

  const removeDiagnosticOrder = (idx) => {
    setConsultationForm(prev => ({
      ...prev,
      diagnosticOrders: prev.diagnosticOrders.filter((_, i) => i !== idx)
    }));
  };

  // Submit Consultation
  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    if (!activeToken) {
      alert('Please call a patient into the consultation room first.');
      return;
    }

    setSavingConsultation(true);
    setStatusMsg('');
    try {
      const payload = {
        appointmentId: activeToken.appointment.id,
        symptoms: consultationForm.symptoms,
        clinicalObservations: consultationForm.clinicalObservations,
        provisionalDiagnosis: consultationForm.provisionalDiagnosis,
        finalDiagnosis: consultationForm.finalDiagnosis,
        followUpDate: consultationForm.followUpDate || null,
        medicinesJson: JSON.stringify(consultationForm.medicines),
        generalAdvice: consultationForm.generalAdvice,
        diagnosticOrders: consultationForm.diagnosticOrders
      };

      const res = await api.post('/doctor/consultation', payload);
      if (res.data?.success) {
        alert(`Consultation completed for Token ${activeToken.tokenNumber}! Digital prescription issued.`);
        setActiveToken(null);
        setPatientEhr(null);
        // Reset form
        setConsultationForm({
          symptoms: '',
          clinicalObservations: '',
          provisionalDiagnosis: '',
          finalDiagnosis: '',
          generalAdvice: '',
          followUpDate: '',
          medicines: [{ name: 'Tab Paracetamol 650mg', dose: '1 Tab', frequency: '1-0-1', duration: '3 Days', instructions: 'After food' }],
          diagnosticOrders: []
        });
        loadData();
      } else {
        alert(res.data?.message || 'Failed to complete consultation');
      }
    } catch (err) {
      alert('Error saving consultation: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingConsultation(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-500 text-sm">Opening Doctor Clinical Suite...</div>;
  }

  const waitingTokens = queue.filter(t => t.status === 'WAITING');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
            <Stethoscope className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Dr. {doctorProfile?.user?.fullName}</h1>
            <p className="text-xs text-emerald-200">
              {doctorProfile?.department?.name} | {doctorProfile?.specialization} ({doctorProfile?.qualification})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/20">
            <span className="text-[10px] text-emerald-300 uppercase block font-semibold">CLINIC ROOM</span>
            <span className="text-xl font-black text-amber-300">Room {doctorProfile?.roomNumber}</span>
          </div>
          <button
            onClick={handleCallNext}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center gap-2"
          >
            <Activity className="w-4 h-4" /> CALL NEXT PATIENT (FAIR QUEUE)
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          {statusMsg}
        </div>
      )}

      {/* Main Grid: Left Queue & EHR, Right Active Consultation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Waiting Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Patient Card */}
          <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 shadow-md">
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 flex justify-between items-center mb-2">
              <span>CURRENTLY IN ROOM</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold animate-pulse">ACTIVE</span>
            </div>

            {activeToken ? (
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-4xl font-black font-mono text-emerald-900">{activeToken.tokenNumber}</span>
                  <span className="font-mono text-xs font-bold text-slate-500">{activeToken.patient?.patientId}</span>
                </div>
                <div className="font-bold text-slate-800 text-sm">{activeToken.patient?.fullName}</div>
                <div className="text-xs text-slate-600">
                  DOB: {activeToken.patient?.dateOfBirth} | Gender: {activeToken.patient?.gender} | Blood: {activeToken.patient?.bloodGroup}
                </div>
                <div className="text-[11px] bg-slate-100 p-2 rounded-lg text-slate-700 font-medium">
                  Affiliation: <strong>{activeToken.patient?.affiliationType}</strong>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No patient in consultation. Click "CALL NEXT PATIENT" to dispatch queue.
              </div>
            )}
          </div>

          {/* Waiting Queue List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-500" /> Waiting Queue ({waitingTokens.length})
              </h3>
              <button onClick={loadData} className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {waitingTokens.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic">
                No patients waiting in queue today.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {waitingTokens.map((tok) => {
                  const prefix = tok.tokenPrefix;
                  const isStudent = prefix === 'S';
                  const isEmployee = prefix === 'E';
                  const isCitizen = prefix === 'N';

                  return (
                    <div 
                      key={tok.id} 
                      className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black px-2 py-0.5 rounded text-xs ${
                            isEmployee ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                            isStudent ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                            'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}>
                            {tok.tokenNumber}
                          </span>
                          <span className="font-semibold text-slate-800">{tok.patient?.fullName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          PID: {tok.patient?.patientId} • Weight: {tok.priorityWeight}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isEmployee ? 'EMPLOYEE' : isStudent ? 'STUDENT' : 'CITIZEN'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t text-[10px] text-slate-500 leading-tight">
              Anti-starvation fairness is enforced: After every 2 priority tokens (S/E), waiting Normal citizen (N) tokens are dispatched automatically.
            </div>
          </div>

          {/* Longitudinal History Mini Panel */}
          {patientEhr && patientEhr.consultations?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" /> Previous Visit History
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                {patientEhr.consultations.map((c, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{c.visitDate}</span>
                      <span className="text-emerald-800">Dr. {c.doctor?.user?.fullName}</span>
                    </div>
                    <div className="text-slate-600 mt-1">Diagnosis: {c.finalDiagnosis || c.provisionalDiagnosis}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Consultation Workspace (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
            
            <div className="border-b pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Clinical Consultation & Digital Rx</h2>
                <p className="text-xs text-slate-500">Record symptoms, diagnosis, electronic prescription and order diagnostics</p>
              </div>
              {activeToken && (
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full font-mono">
                  Token: {activeToken.tokenNumber}
                </span>
              )}
            </div>

            {!activeToken ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                <Stethoscope className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm">Consultation Room Idle</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the <strong>"CALL NEXT PATIENT"</strong> button to invite the next token into your room and unlock this clinical workspace.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitConsultation} className="space-y-5 text-xs">
                
                {/* Symptoms & Observations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Chief Complaints / Presenting Symptoms *</label>
                    <textarea
                      rows="3"
                      required
                      value={consultationForm.symptoms}
                      onChange={(e) => setConsultationForm({ ...consultationForm, symptoms: e.target.value })}
                      placeholder="e.g. Fever for 3 days, dry cough, body ache, mild headache"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Clinical Observations & Vitals</label>
                    <textarea
                      rows="3"
                      value={consultationForm.clinicalObservations}
                      onChange={(e) => setConsultationForm({ ...consultationForm, clinicalObservations: e.target.value })}
                      placeholder="e.g. BP: 120/80 mmHg, Pulse: 82 bpm, SpO2: 98%, Temp: 100.4 F, Chest clear"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Provisional & Final Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Provisional Diagnosis</label>
                    <input
                      type="text"
                      value={consultationForm.provisionalDiagnosis}
                      onChange={(e) => setConsultationForm({ ...consultationForm, provisionalDiagnosis: e.target.value })}
                      placeholder="e.g. Acute Viral Bronchitis"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Final Diagnosis *</label>
                    <input
                      type="text"
                      required
                      value={consultationForm.finalDiagnosis}
                      onChange={(e) => setConsultationForm({ ...consultationForm, finalDiagnosis: e.target.value })}
                      placeholder="e.g. Viral URI with pyrexia"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                </div>

                {/* Digital Prescription Builder */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <span className="font-serif font-black text-base text-emerald-800">℞</span> Prescribe Medicines
                    </span>
                    <button
                      type="button"
                      onClick={addMedicineRow}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" /> Add Drug Row
                    </button>
                  </div>

                  <div className="space-y-2">
                    {consultationForm.medicines.map((med, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 bg-white p-2 rounded-lg border border-slate-200 items-center">
                        <div className="col-span-4">
                          <input
                            type="text"
                            placeholder="Medicine Name & Strength"
                            value={med.name}
                            onChange={(e) => {
                              const list = [...consultationForm.medicines];
                              list[idx].name = e.target.value;
                              setConsultationForm({ ...consultationForm, medicines: list });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Dose (e.g. 1 Tab)"
                            value={med.dose}
                            onChange={(e) => {
                              const list = [...consultationForm.medicines];
                              list[idx].dose = e.target.value;
                              setConsultationForm({ ...consultationForm, medicines: list });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Freq (1-0-1)"
                            value={med.frequency}
                            onChange={(e) => {
                              const list = [...consultationForm.medicines];
                              list[idx].frequency = e.target.value;
                              setConsultationForm({ ...consultationForm, medicines: list });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Duration (5 Days)"
                            value={med.duration}
                            onChange={(e) => {
                              const list = [...consultationForm.medicines];
                              list[idx].duration = e.target.value;
                              setConsultationForm({ ...consultationForm, medicines: list });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Advice (After meal)"
                            value={med.instructions}
                            onChange={(e) => {
                              const list = [...consultationForm.medicines];
                              list[idx].instructions = e.target.value;
                              setConsultationForm({ ...consultationForm, medicines: list });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                          />
                          {consultationForm.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicineRow(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnostic Test Requisitions across Disciplines */}
                <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sky-950 text-sm">Order Diagnostic Tests</span>
                      <p className="text-[11px] text-sky-800">Directly dispatches orders to Blood Lab, X-Ray & Ultrasound</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => addDiagnosticOrder('BLOOD_LABORATORY', 'Complete Blood Count (CBC)')}
                        className="px-2 py-1 bg-white hover:bg-sky-100 text-sky-900 border border-sky-300 rounded text-[11px] font-semibold transition"
                      >
                        + Lab (CBC)
                      </button>
                      <button
                        type="button"
                        onClick={() => addDiagnosticOrder('X_RAY', 'Chest X-Ray PA View')}
                        className="px-2 py-1 bg-white hover:bg-sky-100 text-sky-900 border border-sky-300 rounded text-[11px] font-semibold transition"
                      >
                        + X-Ray
                      </button>
                      <button
                        type="button"
                        onClick={() => addDiagnosticOrder('ULTRASOUND', 'USG Whole Abdomen')}
                        className="px-2 py-1 bg-white hover:bg-sky-100 text-sky-900 border border-sky-300 rounded text-[11px] font-semibold transition"
                      >
                        + Ultrasound
                      </button>
                    </div>
                  </div>

                  {consultationForm.diagnosticOrders.length > 0 && (
                    <div className="space-y-2">
                      {consultationForm.diagnosticOrders.map((order, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-sky-200">
                          <div>
                            <span className="font-bold text-sky-950">{order.testName}</span>
                            <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full ml-2">
                              {order.discipline}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDiagnosticOrder(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Advice & Follow-up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">General Dietary / Lifestyle Advice</label>
                    <input
                      type="text"
                      value={consultationForm.generalAdvice}
                      onChange={(e) => setConsultationForm({ ...consultationForm, generalAdvice: e.target.value })}
                      placeholder="e.g. Drink plenty of warm fluids, rest for 48 hours"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Follow-Up Date</label>
                    <input
                      type="date"
                      value={consultationForm.followUpDate}
                      onChange={(e) => setConsultationForm({ ...consultationForm, followUpDate: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={savingConsultation}
                    className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {savingConsultation ? 'Saving Consultation...' : 'Complete Consultation & Issue Digital Prescription'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
