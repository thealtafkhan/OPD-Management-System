import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  FileText, Upload, Lock, ShieldCheck, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Filter, Search 
} from 'lucide-react';

export default function DiagnosticPortal() {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, BLOOD_LAB, XRAY, ULTRASOUND
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null); // For upload modal

  // Form State
  const [uploadForm, setUploadForm] = useState({
    findings: '',
    reportSummary: '',
    fileName: 'lab_scan_report.pdf',
    fileType: 'pdf',
    fileUrl: 'https://example.com/reports/scan.pdf',
    finalizeNow: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const url = activeTab === 'ALL' ? '/diagnostic/requests' : `/diagnostic/requests?discipline=${activeTab}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSubmitting(true);
    try {
      const payload = {
        requestId: selectedReq.id,
        findings: uploadForm.findings,
        reportSummary: uploadForm.reportSummary,
        fileName: uploadForm.fileName,
        fileType: uploadForm.fileType,
        fileUrl: uploadForm.fileUrl,
        finalizeNow: uploadForm.finalizeNow
      };

      const res = await api.post('/diagnostic/upload', payload);
      if (res.data?.success) {
        alert(res.data.message || 'Diagnostic report finalized and locked against modifications.');
        setSelectedReq(null);
        fetchRequests();
      } else {
        alert(res.data.message || 'Failed to submit report');
      }
    } catch (err) {
      alert('Error submitting report: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black">Central Diagnostic Laboratories & Imaging</h1>
            <span className="bg-sky-700 text-sky-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              AMU JNMC
            </span>
          </div>
          <p className="text-xs text-sky-200 mt-1">
            Requisition Pipeline for Blood / Pathology, Radiology (X-Ray), and Ultrasonography (USG)
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="p-2.5 bg-sky-800 hover:bg-sky-700 rounded-xl text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Discipline Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-semibold">
        {[
          { key: 'ALL', label: 'All Disciplines' },
          { key: 'BLOOD_LABORATORY', label: '🩸 Blood & Pathology' },
          { key: 'X_RAY', label: '🦴 X-Ray / Radiology' },
          { key: 'ULTRASOUND', label: '🩺 Ultrasound (USG)' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === tab.key
                ? 'border-sky-700 text-sky-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="text-center py-24 text-slate-500 text-sm">Loading diagnostic requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          No pending diagnostic requisitions under this discipline.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => {
            const isFinalized = req.status === 'FINALIZED';
            return (
              <div 
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {req.discipline}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{req.testName}</h3>
                    <p className="text-xs text-slate-500">Ordered by Dr. {req.doctor?.user?.fullName}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isFinalized ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1">
                  <div>Patient: <strong className="text-slate-800">{req.patient?.fullName}</strong> ({req.patient?.patientId})</div>
                  {req.clinicalNotes && (
                    <div className="text-slate-600 italic">Notes: {req.clinicalNotes}</div>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Order ID: #{req.id}</span>
                  {!isFinalized ? (
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setUploadForm({
                          findings: '',
                          reportSummary: '',
                          fileName: `${req.testName.toLowerCase().replace(/\s+/g, '_')}_scan.pdf`,
                          fileType: 'pdf',
                          fileUrl: 'https://amu.ac.in/jnmc/reports/sample_scan.pdf',
                          finalizeNow: true,
                        });
                      }}
                      className="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5" /> Submit & Lock Findings
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Report Finalized
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Upload & Lock Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            
            <div className="border-b pb-3">
              <span className="text-[10px] font-bold uppercase text-sky-700">Diagnostic Entry</span>
              <h3 className="text-base font-black text-slate-800">{selectedReq.testName}</h3>
              <p className="text-xs text-slate-500">Patient: {selectedReq.patient?.fullName} ({selectedReq.patient?.patientId})</p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Diagnostic Findings / Metrics *</label>
                <textarea
                  rows="3"
                  required
                  value={uploadForm.findings}
                  onChange={(e) => setUploadForm({ ...uploadForm, findings: e.target.value })}
                  placeholder="e.g. Hb: 13.8 g/dL, TLC: 7,400 /uL, Platelets: 2.2 Lakhs. Peripheral smear normal."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Radiologist / Pathologist Impression Summary</label>
                <input
                  type="text"
                  required
                  value={uploadForm.reportSummary}
                  onChange={(e) => setUploadForm({ ...uploadForm, reportSummary: e.target.value })}
                  placeholder="e.g. Complete Blood Count within standard physiological reference ranges"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Attached Scan / PDF File Name</label>
                  <input
                    type="text"
                    value={uploadForm.fileName}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">File Format</label>
                  <select
                    value={uploadForm.fileType}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileType: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="png">PNG Image</option>
                    <option value="jpg">JPG Scan</option>
                  </select>
                </div>
              </div>

              {/* Finalization / Tamper Protection Lock */}
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                  <input
                    type="checkbox"
                    checked={uploadForm.finalizeNow}
                    onChange={(e) => setUploadForm({ ...uploadForm, finalizeNow: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Finalize & Lock Report (Tamper Protection)</span>
                </label>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Once finalized, this medical report is cryptographically locked and cannot be edited or modified, as required by institutional audit rules.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-800 hover:bg-sky-700 text-white font-bold rounded-lg shadow transition"
                >
                  {submitting ? 'Submitting...' : 'Confirm & Save Report'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
