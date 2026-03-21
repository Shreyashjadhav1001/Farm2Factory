import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Truck, AlertCircle, X, Users, Map as MapIcon, List } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const FactoryDemands = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: 16.8524, lng: 74.5815 }); // Default Sangli coordinates
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [contributionData, setContributionData] = useState({
    quantity: '',
    type: 'Individual', // or 'Pool'
    poolId: ''
  });

  useEffect(() => {
    // Get user geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        fetchDemands(coords.lat, coords.lng);
      }, () => {
        fetchDemands(location.lat, location.lng);
      });
    } else {
      fetchDemands(location.lat, location.lng);
    }
  }, []);

  const fetchDemands = async (lat, lng) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/farmer/nearby-demands?lat=${lat}&lng=${lng}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDemands(res.data);
    } catch (err) {
      console.error('Error fetching demands', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/farmer/join-demand', {
        demandId: selectedDemand._id,
        quantity: parseFloat(contributionData.quantity),
        type: contributionData.type,
        poolId: contributionData.poolId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Contribution successful!');
      handleCloseModal();
      fetchDemands(location.lat, location.lng);
    } catch (err) {
      alert(err.response?.data?.message || 'Error contributing');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDemand(null);
    setContributionData({ quantity: '', type: 'Individual', poolId: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Factory Demands</h2>
          <p className="text-slate-500 font-medium mt-1">Discover sugar factory requirements in your 100km radius.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40">
           <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'list' ? 'bg-neutral-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <List size={20} />
             List
           </button>
           <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'map' ? 'bg-neutral-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <MapIcon size={20} />
             Map
           </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Scanning nearby factories...</div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demands.length > 0 ? demands.map(demand => (
            <div key={demand._id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/40 hover:shadow-slate-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="p-8 flex-1 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900">{demand.createdBy?.name || 'Factory'}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <MapPin size={12} className="text-emerald-500" />
                        {demand.location}
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-2xl font-black text-emerald-600">₹{demand.ratePerTon}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Per Ton</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                      <p className="font-bold text-slate-900">{demand.totalQuantityRequired}T</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                      <p className="font-bold text-emerald-600">{demand.totalQuantityRequired - (demand.fulfilledQuantity || 0)}T</p>
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <span>Demand Fulfillment</span>
                      <span>{Math.round((demand.fulfilledQuantity / demand.totalQuantityRequired) * 100) || 0}%</span>
                   </div>
                   <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(demand.fulfilledQuantity / demand.totalQuantityRequired) * 100}%` }}></div>
                   </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                 <button 
                  onClick={() => { setSelectedDemand(demand); setContributionData({...contributionData, type: 'Individual'}); setIsModalOpen(true); }}
                  className="flex-1 bg-neutral-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg hover:bg-neutral-800 transition active:scale-95"
                 >
                   Solo
                 </button>
                 <button 
                   onClick={() => { setSelectedDemand(demand); setContributionData({...contributionData, type: 'Pool'}); setIsModalOpen(true); }}
                   className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest hover:border-slate-300 transition active:scale-95 flex items-center justify-center gap-2"
                 >
                   <Users size={16} className="text-emerald-500" />
                   Join Pool
                 </button>
              </div>
            </div>
          )) : (
            <div className="md:col-span-3 p-20 text-center font-bold text-slate-300 uppercase tracking-widest">No demands found in this area.</div>
          )}
        </div>
      ) : (
        <div className="h-[400px] w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white">
          <MapContainer center={[location.lat, location.lng]} zoom={10} style={{ height: "400px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>You are here</Popup>
            </Marker>
            {demands.map(demand => (
              <Marker key={demand._id} position={[demand.locationCoordinates.coordinates[1], demand.locationCoordinates.coordinates[0]]}>
                <Popup>
                  <div className="p-2 space-y-2">
                    <h4 className="font-black text-slate-900">{demand.createdBy?.name}</h4>
                    <p className="text-sm font-bold text-emerald-600">₹{demand.ratePerTon}/Ton</p>
                    <button 
                      onClick={() => { setSelectedDemand(demand); setIsModalOpen(true); }}
                      className="w-full py-1.5 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                    >
                      Contribute
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Contribution Modal */}
      {isModalOpen && selectedDemand && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20">
            <div className="bg-neutral-900 p-8 text-white">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter">Submit Contribution</h3>
                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-1">{selectedDemand.createdBy?.name}</p>
                  </div>
                  <button onClick={handleCloseModal} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition text-neutral-400">
                    <X size={20} />
                  </button>
               </div>
               <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
                  <div>
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Rate</p>
                    <p className="font-extrabold text-emerald-400">₹{selectedDemand.ratePerTon}/T</p>
                  </div>
                  <div className="w-px h-8 bg-neutral-800"></div>
                  <div>
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Remaining</p>
                    <p className="font-extrabold text-white">{selectedDemand.totalQuantityRequired - (selectedDemand.fulfilledQuantity || 0)} Tons</p>
                  </div>
               </div>
            </div>
            
            <form onSubmit={handleContribute} className="p-8 space-y-8">
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Quantity (Tons)</label>
                 <div className="relative">
                   <input 
                    type="number" required
                    className="w-full bg-slate-50 border-none px-6 py-4 rounded-2xl text-xl font-black outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all"
                    placeholder="00"
                    value={contributionData.quantity}
                    onChange={(e) => setContributionData({...contributionData, quantity: e.target.value})}
                   />
                   <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase tracking-widest">Tons</span>
                 </div>
               </div>

               <div className="pt-2">
                 <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition active:scale-95 text-sm uppercase tracking-widest">
                   Confirm {contributionData.type} Deal
                 </button>
                 <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest flex items-center justify-center gap-2">
                   <AlertCircle size={14} className="text-amber-500" />
                   Agreement will be generated upon factory lock
                 </p>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactoryDemands;
