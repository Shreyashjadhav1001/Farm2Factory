import React, { useState, useEffect } from 'react';
import { MapPin, Users, AlertCircle, X, Map as MapIcon, List } from 'lucide-react';
import apiClient, { getAllDemands } from '../../api/apiClient';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslation } from 'react-i18next';

// Fix Leaflet default icon
if (L && L.Icon && L.Icon.Default) {
  try {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl:        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  } catch (e) {
    console.warn("Leaflet icon setup failed:", e);
  }
}

const FactoryDemands = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('list');
  const [demands, setDemands] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [userPools, setUserPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: 16.8524, lng: 74.5815 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [showBeyond100km, setShowBeyond100km] = useState(false);
  const [contributionData, setContributionData] = useState({ quantity: '', type: 'Individual', poolId: '' });

  useEffect(() => {
    fetchDemands();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => console.error("Error getting location:", err)
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
      setDemands(demandsRes.data || []);
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
        demandId: selectedDemand._id, quantity: finalQuantity,
        type: contributionData.type, poolId: contributionData.poolId
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
    setSelectedDemand(null);
    setContributionData({ quantity: '', type: 'Individual', poolId: '' });
  };

  const getExistingContribution = (demandId) => {
    const ordersArray = Array.isArray(userOrders) ? userOrders : [];
    const poolsArray  = Array.isArray(userPools)  ? userPools  : [];
    const order = ordersArray.find(o => (o.demandId?._id === demandId || o.demandId === demandId) && o.quantity > 0 && o.status !== 'REJECTED' && o.status !== 'CANCELLED');
    if (order) return { type: 'Individual', data: order };
    const pool = poolsArray.find(p => (p.demandId?._id === demandId || p.demandId === demandId) && p.totalQuantityCommitted > 0);
    if (pool) return { type: 'Pool', data: pool };
    return null;
  };

  const safeDemands = Array.isArray(demands) ? demands : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{t('demands.title')}</h2>
          <p className="text-slate-500 font-medium mt-1">{t('demands.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center bg-white p-1.5 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 gap-2">
          <button onClick={() => setShowBeyond100km(!showBeyond100km)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${showBeyond100km ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
            {showBeyond100km ? t('demands.hideFar') : t('demands.showBeyond')}
          </button>
          <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>
          <div className="flex bg-slate-50 rounded-xl p-1">
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all text-xs ${viewMode === 'list' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <List size={16} /> {t('demands.list')}
            </button>
            <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all text-xs ${viewMode === 'map' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <MapIcon size={16} /> {t('demands.map')}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">{t('demands.scanning')}</div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(() => {
            let filtered = showBeyond100km ? safeDemands : safeDemands.filter(d => d.distance <= 100);
            if (filtered.length === 0 && safeDemands.length > 0 && !showBeyond100km) {
              filtered = [{ ...safeDemands[0], isDemoNearby: true }];
            }
            return filtered.length > 0 ? filtered.map(demand => (
              <div key={demand._id} className={`bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/40 hover:shadow-slate-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col relative ${demand.distance > 100 && !demand.isDemoNearby ? 'opacity-80' : ''}`}>
                {demand.isDemoNearby ? (
                  <div className="absolute top-6 right-8 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-10">{t('demands.topRecommended')}</div>
                ) : demand.distance <= 100 ? (
                  <div className="absolute top-6 right-8 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20 z-10">{t('demands.within100km')}</div>
                ) : (
                  <div className="absolute top-6 right-8 px-3 py-1 bg-slate-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-10">{t('demands.farAway')}</div>
                )}
                <div className="p-8 flex-1 space-y-6">
                  <div className="flex justify-between items-start pt-2">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900">{demand.createdBy?.name || 'Factory'}</h3>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                          <MapPin size={12} className="text-emerald-500" /> {demand.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-500 font-black text-[10px] uppercase tracking-widest">
                          <MapIcon size={12} /> {Math.round(demand.distance || 0)} {t('demands.kmAway')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-600">₹{demand.ratePerTon}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('demands.perTon')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('demands.quantity')}</p>
                      <p className="font-bold text-slate-900">{demand.totalQuantityRequired}T</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('demands.remaining')}</p>
                      <p className="font-bold text-emerald-600">{demand.totalQuantityRequired - (demand.fulfilledQuantity || 0)}T</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <span>{t('demands.fulfillment')}</span>
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
                      return <div className="flex-1 bg-emerald-50 text-emerald-700 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest border border-emerald-100 text-center">{t('demands.contributed')}</div>;
                    }
                    return (
                      <>
                        <button onClick={() => { setSelectedDemand(demand); setContributionData({ ...contributionData, type: 'Individual' }); setIsModalOpen(true); }}
                          disabled={demand.fulfilledQuantity >= demand.totalQuantityRequired}
                          className="flex-1 bg-neutral-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50">
                          {t('demands.participate')}
                        </button>
                        <button onClick={() => { setSelectedDemand(demand); setContributionData({ ...contributionData, type: 'Pool' }); setIsModalOpen(true); }}
                          disabled={demand.fulfilledQuantity >= demand.totalQuantityRequired}
                          className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest hover:border-slate-300 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                          <Users size={16} className="text-emerald-500" /> {t('demands.joinPool')}
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
                <p className="font-black text-slate-400 uppercase tracking-widest">{t('demands.noNearby')}</p>
                {!showBeyond100km && safeDemands.length > 0 && (
                  <button onClick={() => setShowBeyond100km(true)} className="px-6 py-3 bg-neutral-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition shadow-lg">
                    {t('demands.showBeyond')}
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        <div style={{ height: "500px", width: "100%" }} className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white">
          <MapContainer center={[location.lat, location.lng]} zoom={10} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {safeDemands.map(demand => {
              const position = [Number(demand.latitude) || 16.8524, Number(demand.longitude) || 74.5815];
              return (
                <Marker key={demand._id} position={position}>
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-bold">{demand.createdBy?.name}</h4>
                      <p className="text-xs">{demand.location}</p>
                      <button onClick={() => { setSelectedDemand(demand); setIsModalOpen(true); }} className="mt-2 w-full py-1 bg-black text-white text-[10px] uppercase font-bold rounded">
                        {t('demands.participate')}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* Contribution Modal */}
      {isModalOpen && selectedDemand && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-white/20">
            <div className="bg-neutral-900 p-8 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter">{t('demands.submitContribution')}</h3>
                  <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-1">{selectedDemand.createdBy?.name}</p>
                </div>
                <button onClick={handleCloseModal} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition text-neutral-400">
                  <X size={20} />
                </button>
              </div>
            </div>
            <form onSubmit={handleContribute} className="p-8 space-y-8">
              <div className="pt-2">
                <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition active:scale-95 text-sm uppercase tracking-widest">
                  {contributionData.type === 'Individual' ? t('demands.confirmIndividual') : t('demands.confirmPool')}
                </button>
                <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest flex items-center justify-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" /> {t('demands.agreementHint')}
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
