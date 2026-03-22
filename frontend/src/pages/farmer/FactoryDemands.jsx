import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Truck, AlertCircle, X, Users, Map as MapIcon, List } from 'lucide-react';
import apiClient, { getAllDemands } from '../../api/apiClient';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet default icon issue in React
if (L && L.Icon && L.Icon.Default) {
  try {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  } catch (e) {
    console.warn("Leaflet icon setup failed:", e);
  }
}

const FactoryDemands = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [demands, setDemands] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [userPools, setUserPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: 16.8524, lng: 74.5815 }); // Default Sangli coordinates
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [showBeyond100km, setShowBeyond100km] = useState(false);
  const [contributionData, setContributionData] = useState({
    quantity: '',
    type: 'Individual', // or 'Pool'
    poolId: ''
  });

  useEffect(() => {
    fetchDemands();
    // Get user location for map centering
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const [demandsRes, dashboardRes] = await Promise.all([
        getAllDemands(),
        apiClient.get('/farmer/dashboard')
      ]);
      setDemands(demandsRes.data);
      setUserOrders(dashboardRes.data.orders || []);
      setUserPools(dashboardRes.data.pools || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    
    const remaining = selectedDemand.totalQuantityRequired - (selectedDemand.fulfilledQuantity || 0);
    let finalQuantity = contributionData.type === 'Individual' ? remaining : parseFloat(contributionData.quantity);

    if (contributionData.type === 'Individual') {
      const confirmFull = window.confirm(`You are about to take full demand (${remaining} Tons). Continue?`);
      if (!confirmFull) return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/farmer/join-demand', {
        demandId: selectedDemand._id,
        quantity: finalQuantity,
        type: contributionData.type,
        poolId: contributionData.poolId
      });
      alert(res.data.message || 'Contribution successful!');
      handleCloseModal();
      fetchDemands();
    } catch (err) {
      alert(err.response?.data?.message || 'Error contributing');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedDemand(null);
    setContributionData({ quantity: '', type: 'Individual', poolId: '' });
  };

  const getExistingContribution = (demandId) => {
    const order = userOrders.find(o => (o.demandId?._id === demandId || o.demandId === demandId) && o.quantity > 0 && o.status !== 'REJECTED' && o.status !== 'CANCELLED');
    if (order) return { type: 'Individual', data: order };
    
    const pool = userPools.find(p => (p.demandId?._id === demandId || p.demandId === demandId) && p.totalQuantityCommitted > 0);
    if (pool) return { type: 'Pool', data: pool };
    
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Factory Demands</h2>
          <p className="text-slate-500 font-medium mt-1">Discover sugar factory requirements in your 100km radius.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center bg-white p-1.5 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 gap-2">
           <button 
            onClick={() => setShowBeyond100km(!showBeyond100km)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${showBeyond100km ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
           >
             {showBeyond100km ? 'Hide Far Away' : 'Show Beyond 100km'}
           </button>
           <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>
           <div className="flex bg-slate-50 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all text-xs ${viewMode === 'list' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={16} />
                List
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all text-xs ${viewMode === 'map' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <MapIcon size={16} />
                Map
              </button>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Scanning nearby factories...</div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(() => {
            let filtered = showBeyond100km ? demands : demands.filter(d => d.distance <= 100);
            
            // If no nearby demands, pick the closest one from the full list for a better demo feel
            if (filtered.length === 0 && demands.length > 0 && !showBeyond100km) {
              const closest = demands[0]; // sorted by distance from API
              filtered = [{ ...closest, isDemoNearby: true }];
            }

            return filtered.length > 0 ? filtered.map(demand => (
            <div key={demand._id} className={`bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/40 hover:shadow-slate-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col relative ${demand.distance > 100 && !demand.isDemoNearby ? 'opacity-80' : ''}`}>
              {demand.isDemoNearby ? (
                <div className="absolute top-6 right-8 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-10">
                  Top Recommended
                </div>
              ) : demand.distance <= 100 ? (
                <div className="absolute top-6 right-8 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20 z-10">
                  Within 100km
                </div>
              ) : (
                <div className="absolute top-6 right-8 px-3 py-1 bg-slate-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-slate-500/20 z-10">
                  Far Away
                </div>
              )}
              
              <div className="p-8 flex-1 space-y-6">
                <div className="flex justify-between items-start pt-2">
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900">{demand.createdBy?.name || 'Factory'}</h3>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                          <MapPin size={12} className="text-emerald-500" />
                          {demand.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-500 font-black text-[10px] uppercase tracking-widest">
                          <MapIcon size={12} />
                          {Math.round(demand.distance || 0)} KM AWAY
                        </div>
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
                  {(() => {
                    const contribution = getExistingContribution(demand._id);
                    if (contribution && (contribution.data.quantity > 0 || contribution.data.totalQuantityCommitted > 0)) {
                      return (
                        <div className="flex-1 bg-emerald-50 text-emerald-700 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest border border-emerald-100 text-center">
                          You have contributed
                        </div>
                      );
                    }
                    return (
                      <>
                        <button 
                         onClick={() => { setSelectedDemand(demand); setContributionData({...contributionData, type: 'Individual'}); setIsModalOpen(true); }}
                         disabled={demand.fulfilledQuantity >= demand.totalQuantityRequired}
                         className="flex-1 bg-neutral-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                         Participate
                        </button>
                        <button 
                          onClick={() => { setSelectedDemand(demand); setContributionData({...contributionData, type: 'Pool'}); setIsModalOpen(true); }}
                          disabled={demand.fulfilledQuantity >= demand.totalQuantityRequired}
                          className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest hover:border-slate-300 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Users size={16} className="text-emerald-500" />
                          Join Pool
                        </button>
                      </>
                    );
                  })()}
               </div>
            </div>
          )) : (
            <div className="md:col-span-3 p-20 text-center space-y-4 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <MapPin size={32} className="text-slate-300" />
              </div>
              <p className="font-black text-slate-400 uppercase tracking-widest">No nearby demands within 100 km</p>
              {!showBeyond100km && demands.length > 0 && (
                <button 
                  onClick={() => setShowBeyond100km(true)}
                  className="px-6 py-3 bg-neutral-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition shadow-lg"
                >
                  Show Beyond 100 km
                </button>
              )}
            </div>
          );
          })()}
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            if (!demands || demands.length === 0) {
              return (
                <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400">
                  <MapPin size={48} className="mb-4 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-sm">No demands available for map</p>
                </div>
              );
            }
            return (
              <div style={{ height: "500px", width: "100%" }} className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white relative bg-slate-100">
                <MapComponent demands={demands} onContribute={(d) => { setSelectedDemand(d); setIsModalOpen(true); }} />
              </div>
            );
          })()}
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
                {contributionData.type === 'Pool' ? (
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
                ) : (
                  <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100/50 text-center space-y-2">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Full Demand Fulfillment</p>
                     <p className="text-3xl font-black text-slate-900">{selectedDemand.totalQuantityRequired - (selectedDemand.fulfilledQuantity || 0)} Tons</p>
                     <p className="text-xs font-medium text-slate-500">Individual farmers take complete responsibility for this batch.</p>
                  </div>
                )}

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

      {/* View Details Modal */}
      {isDetailsModalOpen && selectedDemand && selectedContribution && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Direct Deal Details</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Order Summary</p>
              </div>
              <button 
               onClick={handleCloseModal}
               className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-3xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Commitment</p>
                     <p className="text-2xl font-black text-slate-900">{selectedContribution.quantity || selectedContribution.totalQuantityCommitted} Tons</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rate per Ton</p>
                     <p className="text-2xl font-black text-emerald-600">₹{selectedDemand.ratePerTon}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-500 uppercase tracking-widest text-[10px]">Total Demand</span>
                    <span className="text-slate-900">{selectedDemand.totalQuantityRequired} Tons</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-500 uppercase tracking-widest text-[10px]">Current Fulfillment</span>
                    <span className="text-slate-900">{selectedDemand.fulfilledQuantity} Tons</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(selectedDemand.fulfilledQuantity / selectedDemand.totalQuantityRequired) * 100}%` }}></div>
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="text-amber-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-900 uppercase">Awaiting Factory Lock</p>
                    <p className="text-[10px] font-medium text-slate-500">The agreement will be generated once the factory locks the demand.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MapComponent = ({ demands, onContribute }) => {
  const defaultCenter = [18.5204, 73.8567]; // Hardcoded Pune Center

  try {
    return (
      <MapContainer 
        center={defaultCenter} 
        zoom={10} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {demands && demands
          .filter(d => d.locationCoordinates?.coordinates || (d.latitude && d.longitude))
          .map(demand => {
            const coords = demand.locationCoordinates?.coordinates || [demand.longitude, demand.latitude];
            const isGeoJSON = !!demand.locationCoordinates;
            
            // Leaflet uses [lat, lng]. GeoJSON uses [lng, lat].
            const position = isGeoJSON ? [coords[1], coords[0]] : [Number(demand.latitude), Number(demand.longitude)];
            
            if (isNaN(position[0]) || isNaN(position[1]) || position[0] === 0) return null;

            return (
              <Marker key={demand._id} position={position}>
                <Popup>
                  <div className="p-3 w-48 space-y-3">
                    <div className="border-b border-slate-100 pb-2">
                      <h4 className="font-black text-slate-900 text-sm leading-tight">{demand.createdBy?.name || 'Factory'}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{demand.location}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-50 p-2 rounded-lg text-center">
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Rate</p>
                        <p className="text-xs font-black text-slate-900">₹{demand.ratePerTon}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg text-center">
                        <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Stock</p>
                        <p className="text-xs font-black text-slate-900">{demand.totalQuantityRequired - (demand.fulfilledQuantity || 0)}T</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => onContribute(demand)}
                      className="w-full py-2 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                    >
                      Contribute
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    );
  } catch (mapErr) {
    console.error("Map initialization error:", mapErr);
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400 font-bold p-8 text-center rounded-[2rem]">
        Unable to load map at this time.
      </div>
    );
  }
};

const Plus = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default FactoryDemands;
