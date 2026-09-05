import React from 'react';
import { X, Printer } from 'lucide-react';

export default function PrescriptionModal({ consultation, onClose }) {
  if (!consultation) return null;

  const handlePrint = () => {
    window.print();
  };

  let medicines = [];
  try {
    if (consultation.prescription && consultation.prescription.medicinesJson) {
      medicines = JSON.parse(consultation.prescription.medicinesJson);
    }
  } catch (e) {
    medicines = [];
  }

  const patient = consultation.patient || {};
  const doctor = consultation.doctor || {};
  const doctorUser = doctor.user || {};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative animate-in zoom-in-95">
        
        {/* Modal Controls */}
        <div className="flex justify-between items-center mb-4 no-print border-b pb-3">
          <h3 className="font-bold text-slate-800 text-base">Digital Medical Prescription</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Template */}
        <div id="printable-prescription" className="border-2 border-emerald-800 p-6 rounded-lg bg-white">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <img src="/amu_logo.png" alt="AMU" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="font-serif font-black text-xl text-emerald-950 tracking-wide uppercase">
                  Aligarh Muslim University
                </h1>
                <h2 className="font-semibold text-sm text-emerald-900">
                  Jawaharlal Nehru Medical College & Hospital
                </h2>
                <p className="text-xs text-slate-600">Outpatient Department (OPD) Clinical Record</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-slate-800">Visit Date: {consultation.visitDate}</div>
              <div className="text-emerald-700 font-mono font-semibold">PID: {patient.patientId}</div>
            </div>
          </div>

          {/* Patient & Doctor Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
            <div>
              <div className="text-slate-500 font-medium">PATIENT INFORMATION</div>
              <div className="font-bold text-slate-900 text-sm">{patient.fullName}</div>
              <div className="text-slate-700">DOB: {patient.dateOfBirth} | Gender: {patient.gender} | Blood: {patient.bloodGroup}</div>
              <div className="text-slate-600 mt-1">Affiliation: <span className="font-semibold text-emerald-800">{patient.affiliationType}</span></div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 font-medium">TREATING PHYSICIAN</div>
              <div className="font-bold text-slate-900 text-sm">Dr. {doctorUser.fullName}</div>
              <div className="text-slate-700">{doctor.specialization} ({doctor.qualification})</div>
              <div className="text-slate-600 mt-1">Room No: <span className="font-semibold">{doctor.roomNumber}</span></div>
            </div>
          </div>

          {/* Clinical Findings */}
          <div className="space-y-3 mb-4 text-xs">
            {consultation.symptoms && (
              <div>
                <span className="font-bold text-slate-800">Presenting Complaints / Symptoms: </span>
                <span className="text-slate-700">{consultation.symptoms}</span>
              </div>
            )}
            {consultation.provisionalDiagnosis && (
              <div>
                <span className="font-bold text-slate-800">Provisional Diagnosis: </span>
                <span className="text-emerald-900 font-medium">{consultation.provisionalDiagnosis}</span>
              </div>
            )}
            {consultation.finalDiagnosis && (
              <div>
                <span className="font-bold text-slate-800">Final Diagnosis: </span>
                <span className="text-emerald-950 font-bold">{consultation.finalDiagnosis}</span>
              </div>
            )}
          </div>

          {/* Rx Section */}
          <div className="mb-4">
            <div className="font-serif font-black text-lg text-emerald-900 border-b border-emerald-300 pb-1 mb-2">
              ℞ Prescribed Medication
            </div>
            {medicines && medicines.length > 0 ? (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b">
                    <th className="py-1.5 px-2">#</th>
                    <th className="py-1.5 px-2">Medicine & Strength</th>
                    <th className="py-1.5 px-2">Dosage</th>
                    <th className="py-1.5 px-2">Frequency</th>
                    <th className="py-1.5 px-2">Duration</th>
                    <th className="py-1.5 px-2">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-1.5 px-2 text-slate-500">{idx + 1}</td>
                      <td className="py-1.5 px-2 font-bold text-slate-900">{m.name}</td>
                      <td className="py-1.5 px-2 text-slate-700">{m.dose}</td>
                      <td className="py-1.5 px-2 text-slate-700">{m.frequency}</td>
                      <td className="py-1.5 px-2 text-slate-700">{m.duration}</td>
                      <td className="py-1.5 px-2 text-slate-600 italic">{m.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500 italic">No oral medications prescribed.</p>
            )}
          </div>

          {/* Advice & Follow-up */}
          <div className="border-t border-slate-200 pt-3 text-xs flex justify-between items-end">
            <div>
              {consultation.prescription && consultation.prescription.generalAdvice && (
                <div className="mb-2">
                  <span className="font-bold text-slate-800">General Advice: </span>
                  <span className="text-slate-700">{consultation.prescription.generalAdvice}</span>
                </div>
              )}
              {consultation.followUpDate && (
                <div className="text-emerald-800 font-semibold">
                  Follow-up Visit Date: {consultation.followUpDate}
                </div>
              )}
            </div>

            {/* Signature */}
            <div className="text-center">
              <div className="font-serif italic text-sm text-emerald-950 font-bold border-b border-slate-400 pb-1 px-4">
                Dr. {doctorUser.fullName}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Digitally Signed & Verified</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
