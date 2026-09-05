import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  Shield, Building2, Stethoscope, Users, Activity, 
  FileText, Plus, RefreshCw, CheckCircle2 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, departments, doctors, users
  const [loading, setLoading] = useState(true);

  // New Department Form
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '', active: true });
  // New Doctor Form
  const [newDoc, setNewDoc] = useState({
    userId: '',
    departmentId: '',
    roomNumber: '',
    specialization: '',
    qualification: 'MBBS, MD',
    consultationFee: 100,
    opdSchedule: '09:00 AM - 01:00 PM',
  });

  const loadData = async () => {
    try {
      const [statsRes, deptRes, docRes, usrRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/departments'),
        api.get('/admin/doctors'),
        api.get('/admin/users')
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
      if (docRes.data?.success) setDoctors(docRes.data.data);
      if (usrRes.data?.success) setUsers(usrRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/departments', newDept);
      if (res.data?.success) {
        alert('Department created successfully!');
        setNewDept({ name: '', code: '', description: '', active: true });
        loadData();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black">AMU Healthcare Administration</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Department Rosters, Clinical Faculty Controls & System Auditing
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 uppercase font-semibold text-[10px]">Total Patients (PIDs)</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalPatients || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 uppercase font-semibold text-[10px]">Appointments</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{stats.totalAppointments || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 uppercase font-semibold text-[10px]">Today's OPD Tokens</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.todayTokens || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 uppercase font-semibold text-[10px]">Clinical Consultations</span>
          <div className="text-2xl font-black text-purple-900 mt-1">{stats.totalConsultations || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-slate-800 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Departments & Doctors Directory
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'departments'
              ? 'border-slate-800 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Add New Department
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'users'
              ? 'border-slate-800 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          System User Accounts ({users.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" /> Active Departments ({departments.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
              {departments.map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">{d.name}</span>
                    <span className="text-[11px] text-slate-500 block">{d.description}</span>
                  </div>
                  <span className="font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {d.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-amber-700" /> Consulting Physicians ({doctors.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
              {doctors.map((doc) => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">Dr. {doc.user?.fullName}</span>
                    <span className="text-[11px] text-slate-500 block">{doc.department?.name} • Room {doc.roomNumber}</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    Fee: ₹{doc.consultationFee}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Add Department */}
      {activeTab === 'departments' && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">Add Clinical Department</h2>
          <form onSubmit={handleAddDepartment} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department Name *</label>
              <input
                type="text"
                required
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                placeholder="e.g. Ophthalmology"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department Code *</label>
              <input
                type="text"
                required
                value={newDept.code}
                onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                placeholder="e.g. OPHTH"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Description</label>
              <input
                type="text"
                value={newDept.description}
                onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                placeholder="Clinical description"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition"
            >
              Save Department
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800">System User Credentials & Roles</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b">
                  <th className="p-2">User ID</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">System Role</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-slate-50">
                    <td className="p-2 font-mono">{u.id}</td>
                    <td className="p-2 font-bold text-slate-900">{u.fullName}</td>
                    <td className="p-2 text-slate-600">{u.email}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-purple-100 text-purple-900">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-2 text-emerald-700 font-bold">Active</td>
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
