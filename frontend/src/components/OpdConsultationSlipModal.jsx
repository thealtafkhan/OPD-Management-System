import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OpdConsultationSlipModal({ appointment, token, onClose }) {
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const patient = appointment.patient || {};
  const doctor = appointment.doctor || {};
  const doctorUser = doctor.user || {};
  const department = appointment.department || doctor.department || {};
  const tokenNumber = token?.tokenNumber || appointment.tokenNumber || 'N-001';

  // Calculate age if DOB available
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    try {
      const birthDate = new Date(dob);
      const diff = Date.now() - birthDate.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970) + ' Yrs';
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-4 sm:p-6 relative animate-in zoom-in-95 my-8">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex justify-between items-center mb-4 no-print border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Official AMU OPD Consultation & Prescription Slip
              </h3>
              <p className="text-[11px] text-slate-500">
                Verified at Reception Counter • Ready to Hand Over to Patient
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Hard Copy
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Template */}
        <div 
          id="printable-prescription" 
          className="border-2 border-emerald-900 p-6 sm:p-8 rounded-xl bg-white text-slate-900 text-xs font-sans shadow-sm"
        >
          
          {/* Official AMU Header */}
          <div className="flex items-center justify-between border-b-2 border-emerald-900 pb-4 mb-4">
            <div className="flex items-center gap-4">
              <img 
                src="/amu_logo.png" 
                alt="AMU Crest" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full border border-emerald-800/30 p-0.5" 
              />
              <div>
                <h1 className="font-serif font-black text-lg sm:text-xl text-emerald-950 tracking-wider uppercase">
                  Aligarh Muslim University
                </h1>
                <h2 className="font-bold text-sm text-emerald-900 tracking-wide">
                  Jawaharlal Nehru Medical College & Hospital (JNMCH)
                </h2>
                <p className="text-[11px] text-slate-600 font-medium">
                  Outpatient Department (OPD) • Clinical Consultation & Prescription Sheet
                </p>
                <p className="text-[10px] text-emerald-800 font-mono mt-0.5">
                  Aligarh - 202002, Uttar Pradesh, India
                </p>
              </div>
            </div>

            {/* Token Badge */}
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">QUEUE TOKEN NO.</div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-950 border-2 border-emerald-800 px-3 py-1 rounded-xl bg-emerald-50/80 inline-block mt-1">
                {tokenNumber}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                Booking: {appointment.appointmentNumber}
              </div>
            </div>
          </div>

          {/* Verification Watermark / Verification Banner */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5 mb-4 flex justify-between items-center text-[11px]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold text-emerald-950">
                OPD RECEPTION DESK: PATIENT VERIFIED & CONSULTATION SLIP ISSUED
              </span>
            </div>
            <div className="text-slate-600 font-mono text-[10px]">
              Verified By: <strong className="text-emerald-900">{appointment.verifiedBy || 'Receptionist'}</strong> • {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Patient Demographics & Doctor Block */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">PATIENT PARTICULARS</div>
              <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                {patient.fullName}
                <span className="text-[11px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  {patient.patientId}
                </span>
              </div>
              <div className="text-slate-700">
                Age: <span className="font-semibold">{calculateAge(patient.dateOfBirth)}</span> | Gender: <span className="font-semibold">{patient.gender || 'N/A'}</span> | Blood: <span className="font-semibold">{patient.bloodGroup || 'N/A'}</span>
              </div>
              <div className="text-slate-600">
                Mobile: <span className="font-mono font-medium">{patient.mobile || 'N/A'}</span>
              </div>
              <div className="text-slate-600">
                Category: <span className="font-bold text-emerald-800">{patient.affiliationType || 'NORMAL_CITIZEN'}</span>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">CONSULTING PHYSICIAN & CLINIC</div>
              <div className="font-bold text-slate-900 text-sm sm:text-base">
                Dr. {doctorUser.fullName || doctor.name}
              </div>
              <div className="text-emerald-800 font-semibold">
                {department.name} ({doctor.specialization || 'Clinical Specialist'})
              </div>
              <div className="text-slate-700">
                OPD Room: <strong className="text-slate-900 font-mono text-sm">{doctor.roomNumber || 'Room 101'}</strong>
              </div>
              <div className="text-slate-700">
                Shift Slot: <strong className="text-emerald-900 font-mono">{appointment.timeSlot}</strong>
              </div>
              <div className="text-slate-500 text-[10px]">
                Consultation Date: {appointment.appointmentDate} • Fee Paid: ₹{appointment.feeAmount}
              </div>
            </div>
          </div>

          {/* Clinical Blank Recording Area for Physician Handwriting */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-4 mb-4">
            
            {/* Vitals Recording Strip */}
            <div>
              <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <span>1. Patient Vitals (Triage / Examination Desk)</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
                  <span className="block text-slate-500 font-semibold">Blood Pressure</span>
                  <span className="font-mono text-xs text-slate-400">____ / ____ mmHg</span>
                </div>
                <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
                  <span className="block text-slate-500 font-semibold">Pulse Rate</span>
                  <span className="font-mono text-xs text-slate-400">______ bpm</span>
                </div>
                <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
                  <span className="block text-slate-500 font-semibold">Temperature</span>
                  <span className="font-mono text-xs text-slate-400">______ °F</span>
                </div>
                <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
                  <span className="block text-slate-500 font-semibold">SpO2 Oxygen</span>
                  <span className="font-mono text-xs text-slate-400">______ %</span>
                </div>
                <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
                  <span className="block text-slate-500 font-semibold">Body Weight</span>
                  <span className="font-mono text-xs text-slate-400">______ kg</span>
                </div>
              </div>
            </div>

            {/* Chief Complaints & Clinical Findings */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-1">
                  2. Chief Complaints & History of Illness
                </span>
                <div className="h-16 border-b border-dashed border-slate-300 flex flex-col justify-end text-[10px] text-slate-300 pb-1">
                  (Doctor writes primary symptoms, duration, and clinical notes)
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-1">
                  3. Clinical Diagnosis / Observations
                </span>
                <div className="h-16 border-b border-dashed border-slate-300 flex flex-col justify-end text-[10px] text-slate-300 pb-1">
                  (Provisional / Confirmed Diagnosis)
                </div>
              </div>
            </div>

            {/* Rx - Prescription Medicines Table */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900 text-sm font-serif italic flex items-center gap-1">
                  <span className="text-lg font-black not-italic text-emerald-900">℞</span> Prescribed Medicines & Pharmacotherapy
                </span>
                <span className="text-[10px] text-slate-500">AMU Hospital Pharmacy Dispensing</span>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-1.5 border border-slate-300 w-8 text-center">#</th>
                    <th className="p-1.5 border border-slate-300">Drug / Medicine Name (Generic / Brand)</th>
                    <th className="p-1.5 border border-slate-300 w-24">Dosage / Strength</th>
                    <th className="p-1.5 border border-slate-300 w-28">Frequency</th>
                    <th className="p-1.5 border border-slate-300 w-20">Duration</th>
                    <th className="p-1.5 border border-slate-300">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((row) => (
                    <tr key={row} className="h-8">
                      <td className="p-1.5 border border-slate-300 text-center font-mono text-slate-400">{row}</td>
                      <td className="p-1.5 border border-slate-300"></td>
                      <td className="p-1.5 border border-slate-300"></td>
                      <td className="p-1.5 border border-slate-300"></td>
                      <td className="p-1.5 border border-slate-300"></td>
                      <td className="p-1.5 border border-slate-300"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature & Seal Block */}
            <div className="pt-4 flex justify-between items-end">
              <div className="text-[10px] text-slate-500 space-y-1">
                <div>Follow-up Advice: _________________________________</div>
                <div>Lab / Radiology Referral: ___________________________</div>
              </div>
              <div className="text-center w-56">
                <div className="h-10"></div>
                <div className="border-t border-slate-800 pt-1 font-bold text-slate-900 text-xs">
                  Dr. {doctorUser.fullName || doctor.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  Treating Physician Signature & Hospital Stamp
                </div>
              </div>
            </div>

          </div>

          {/* Mandatory Patient & Medical History Policy Notice */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              IMPORTANT INSTRUCTION FOR PATIENTS & PHARMACY:
            </div>
            <p>
              1. <strong>Mandatory Hard Copy</strong>: You must carry this verified hard copy into the consultation room for the doctor to write their examination notes and prescriptions.
            </p>
            <p>
              2. <strong>Pharmacy Purchase</strong>: Present this original sheet at the AMU JNMCH Hospital Pharmacy or any registered chemist to procure your prescribed medications.
            </p>
            <p>
              3. <strong>Permanent Digital History Protection</strong>: If this physical sheet is ever lost or misplaced, do not worry — all your visit consultations, doctor notes, and digital prescriptions are permanently stored in your Electronic Health Record (EHR) on the AMU OPD Portal and remain accessible to you and your treating doctors at any time.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
