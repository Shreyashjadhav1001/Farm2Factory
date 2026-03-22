import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import apiClient from '../api/apiClient';

const ParticipantsModal = ({ demand, onClose, onStatusUpdate }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demand) {
      fetchParticipants();
    }
  }, [demand]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/orders/participants/${demand._id}`);
      setParticipants(response.data);
    } catch (err) {
      console.error('Error fetching participants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await apiClient.patch(`/orders/update-participant-status/${orderId}`, { status });
      // Refresh local list
      await fetchParticipants();
      // Notify parent to refresh demand progress
      onStatusUpdate();
    } catch (err) {
      alert('Failed to update participant status');
    }
  };

  if (!demand) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Participants</h2>
            <p className="text-sm text-slate-500 mt-1">Demand: {demand.title}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition"
            title="Close"
          >
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" />
              <p>Loading participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
              <Users className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No farmers have joined this demand yet.</p>
              <p className="max-w-xs mt-2 text-sm">When farmers join, they will appear here for your review.</p>
            </div>
          ) : (
            <div className="space-y-4">
               {/* Active Participants */}
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Active Participants</h3>
               {participants.filter(p => p.status !== 'REJECTED').length === 0 ? (
                 <p className="text-sm text-slate-400 italic">No active participants</p>
               ) : (
                 participants.filter(p => p.status !== 'REJECTED').map((participant) => (
                   <div key={participant._id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="flex items-center space-x-4">
                       <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                         {participant.farmerId?.name?.charAt(0)}
                       </div>
                       <div>
                         <h4 className="font-bold text-slate-900">{participant.farmerId?.name}</h4>
                         <div className="flex items-center text-sm text-slate-500 mt-1">
                           <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] font-black uppercase mr-2 tracking-tighter">
                             {participant.farmerId?.location || 'Unknown Location'}
                           </span>
                           <span>Rating: {participant.farmerId?.rating || '0'} ⭐</span>
                         </div>
                       </div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-1 gap-4 text-center md:text-left">
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</p>
                         <p className="text-xl font-black text-slate-900">{participant.quantity} Tons</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                         <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase mt-1 ${
                           participant.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                           'bg-blue-100 text-blue-700'
                         }`}>
                           {participant.status}
                         </span>
                       </div>
                     </div>

                     <div className="flex items-center space-x-2">
                       {participant.status === 'PENDING' && (
                         <>
                           <button 
                             onClick={() => handleUpdateStatus(participant._id, 'ACCEPTED')}
                             className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm"
                           >
                             <CheckCircle className="h-4 w-4" />
                             <span>Accept</span>
                           </button>
                           <button 
                             onClick={() => handleUpdateStatus(participant._id, 'REJECTED')}
                             className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition border border-red-100"
                           >
                             <XCircle className="h-4 w-4" />
                             <span>Reject</span>
                           </button>
                         </>
                       )}
                       {participant.status === 'ACCEPTED' && (
                         <button 
                           onClick={() => handleUpdateStatus(participant._id, 'REJECTED')}
                           className="flex-1 md:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition text-xs border border-red-100"
                         >
                           Reject & Free Capacity
                         </button>
                       )}
                     </div>
                   </div>
                 ))
               )}

               {/* Rejected Participants */}
               {participants.filter(p => p.status === 'REJECTED').length > 0 && (
                 <div className="mt-12 pt-12 border-t border-slate-100">
                    <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-4">Rejected Contributions</h3>
                    <div className="space-y-4 opacity-70">
                        {participants.filter(p => p.status === 'REJECTED').map((participant) => (
                          <div key={participant._id} className="bg-rose-50/30 rounded-2xl p-6 border border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                                    {participant.farmerId?.name?.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700">{participant.farmerId?.name}</h4>
                                    <p className="text-[10px] text-rose-500 font-black uppercase">Rejected Contribution</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900">{participant.quantity} Tons</p>
                                <button 
                                  onClick={() => handleUpdateStatus(participant._id, 'PENDING')}
                                  className="text-[10px] font-black text-blue-600 uppercase mt-1 hover:underline"
                                >
                                  Re-activate
                                </button>
                            </div>
                          </div>
                        ))}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="text-sm font-medium text-slate-600">
            Total Participants: <span className="text-slate-900 font-bold">{participants.length}</span>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsModal;
