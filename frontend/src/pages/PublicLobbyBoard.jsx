import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Activity, Clock, Volume2, RefreshCw, AlertCircle } from 'lucide-react';

export default function PublicLobbyBoard() {
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchLobby = async () => {
    try {
      const res = await api.get('/public/lobby-board');
      if (res.data?.success) {
        setDisplayData(res.data.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Error fetching lobby data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobby();
    const interval = setInterval(fetchLobby, 5000); // 5s live polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top TV Screen Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-700 pb-4 gap-4">
        <div className="flex items-center gap-4">
          <img src="/amu_logo.png" alt="AMU" className="w-16 h-16 object-contain bg-white rounded-full p-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-amber-400">
              AMU OPD Waiting Lounge
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Jawaharlal Nehru Medical College & Hospital — Live Consultation Display Board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{lastRefreshed.toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={fetchLobby}
            className="p-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-white transition flex items-center gap-1 font-sans"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Ticker Announcement */}
      <div className="bg-emerald-950/80 border border-emerald-600/50 rounded-lg p-3 text-xs text-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">NOTICE</span>
          <span>Patients are requested to proceed to their respective clinic room immediately when their token is called.</span>
        </div>
        <span className="hidden md:inline font-mono text-[10px] text-emerald-400">Series: S (Student) | E (Employee) | N (Citizen)</span>
      </div>

      {/* Grid of Doctor Consultation Rooms */}
      {loading ? (
        <div className="text-center py-24 text-slate-400 font-mono text-sm">Synchronizing clinic queue displays...</div>
      ) : displayData.length === 0 ? (
        <div className="text-center py-24 text-slate-500 text-sm">No active clinic rooms in session today.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayData.map((room) => {
            const nowServing = room.nowServing;
            const waitingTokens = room.waitingTokens || [];

            return (
              <div 
                key={room.doctorId}
                className="bg-slate-800 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl flex flex-col"
              >
                {/* Room & Doctor Header */}
                <div className="bg-slate-750 px-5 py-3 border-b border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider">
                      {room.departmentName}
                    </span>
                    <h3 className="text-base font-bold text-white">Dr. {room.doctorName}</h3>
                  </div>
                  <div className="bg-amber-400 text-slate-950 font-black text-sm px-3 py-1.5 rounded-lg shadow">
                    Room {room.roomNumber}
                  </div>
                </div>

                {/* Now Serving Big Display */}
                <div className="p-6 text-center bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700 flex-1 flex flex-col justify-center">
                  <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">
                    NOW SERVING
                  </div>
                  {nowServing ? (
                    <div className="space-y-1">
                      <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-emerald-400 animate-pulse">
                        {nowServing}
                      </div>
                      <div className="text-xs text-emerald-300 font-medium">Inside Consultation Room</div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold font-mono text-slate-500 py-4">
                      -- STANDBY --
                    </div>
                  )}
                </div>

                {/* Next In Line Footer */}
                <div className="bg-slate-900 px-5 py-3 text-xs flex justify-between items-center">
                  <div className="text-slate-400">
                    Waiting: <span className="font-bold text-white">{room.waitingCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Next:</span>
                    {waitingTokens.length > 0 ? (
                      <div className="flex gap-1">
                        {waitingTokens.slice(0, 3).map((tok, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 bg-slate-800 border border-slate-600 rounded font-mono font-bold text-amber-300 text-[11px]"
                          >
                            {tok}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Queue Empty</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
