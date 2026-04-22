import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock, FileText, Download, Info, X, Edit } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const OrderTracking = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contributionData, setContributionData] = useState({ quantity: '', type: 'Individual' });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/farmer/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedOrders = res.data.orders || [];
      setOrders(fetchedOrders);
      const firstValidOrder = fetchedOrders.find(o => o.status !== 'REJECTED' && o.status !== 'CANCELLED');
      if (firstValidOrder) setSelectedOrder(firstValidOrder);
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateContribution = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/farmer/contribution/update/${selectedOrder._id}`, {
        quantity: parseFloat(contributionData.quantity),
        type: contributionData.type
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Action successful!');
      setIsEditModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating contribution');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContribution = async (id) => {
    if (!window.confirm("Are you sure you want to remove this inactive order?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/farmer/contribution/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Order removed successfully!');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing order');
    } finally {
      setLoading(false);
    }
  };

  const downloadAgreement = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        url: `/api/farmer/agreement/${orderId}`,
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Agreement_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Agreement not yet generated or error downloading.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-emerald-500';
      case 'SHIPPED':   return 'text-blue-500';
      case 'CANCELLED': return 'text-red-500';
      default:          return 'text-amber-500';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'DELIVERED': return 'bg-emerald-50';
      case 'SHIPPED':   return 'bg-blue-50';
      case 'CANCELLED': return 'bg-red-50';
      default:          return 'bg-amber-50';
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  if (loading) return (
    <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">
      {t('orders.tracking')}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{t('orders.title')}</h2>
        <p className="text-slate-500 font-medium mt-1">{t('orders.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Order List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">{t('orders.activeContracts')}</h3>
          <div className="space-y-4 overflow-y-auto max-h-[700px] pr-2">
            {safeOrders.filter(o => o.status !== 'REJECTED' && o.status !== 'CANCELLED').length > 0
              ? safeOrders.filter(o => o.status !== 'REJECTED' && o.status !== 'CANCELLED').map(order => (
                <button
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-300 ${
                    selectedOrder?._id === order._id
                      ? 'bg-neutral-900 border-neutral-900 shadow-2xl shadow-neutral-900/20 text-white translate-x-2'
                      : 'bg-white border-slate-100 text-slate-900 hover:border-emerald-200 shadow-xl shadow-slate-200/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedOrder?._id === order._id ? 'text-neutral-500' : 'text-slate-400'}`}>#{order._id.slice(-6)}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedOrder?._id === order._id ? 'bg-white/10 text-white' : getStatusBg(order.status) + ' ' + getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg leading-tight mb-2">{order.demandId?.title || 'Sugarcane Delivery'}</h4>
                  <div className="flex items-center gap-2 opacity-60 text-sm font-medium">
                    <Package size={14} />
                    <span>{order.quantity} {t('orders.tonsCommitted')}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {order.quantity > 0 ? (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setContributionData({ quantity: order.quantity, type: order.contributionType || 'Individual' }); setIsEditModalOpen(true); }}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedOrder?._id === order._id ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
                          {t('orders.edit')}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); downloadAgreement(order._id); }}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedOrder?._id === order._id ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                          {t('orders.agreement')}
                        </button>
                      </>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveContribution(order._id); }}
                        className="w-full py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100">
                        {t('orders.removeInactive')}
                      </button>
                    )}
                  </div>
                </button>
              ))
              : (
                <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center font-bold text-slate-400 uppercase text-xs tracking-widest">
                  {t('orders.noOrders')}
                </div>
              )
            }
          </div>
        </div>

        {/* Order Detail */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="p-10 bg-slate-50/50 border-b border-slate-50 flex flex-wrap justify-between items-center gap-6">
                <div className="flex gap-5 items-center">
                  <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center border border-slate-100">
                    <Truck size={32} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedOrder.factoryId?.name || 'Sugarcane Factory'}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('orders.orderId')} <span className="text-slate-900">#{selectedOrder._id}</span></p>
                  </div>
                </div>
                <div className="flex gap-3">
                  {selectedOrder.quantity > 0 && (
                    <>
                      <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold shadow-lg hover:border-blue-200 hover:text-blue-600 transition active:scale-95">
                        <Edit size={18} /> {t('orders.editOrder')}
                      </button>
                      <button onClick={() => downloadAgreement(selectedOrder._id)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-95">
                        <Download size={18} /> {t('orders.agreement')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                <div className="space-y-8">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={16} /> {t('orders.shipmentProgress')}
                  </h4>
                  <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {[
                      { statuses: ['PENDING','ACCEPTED','SHIPPED','DELIVERED'], label: t('orders.orderPlaced'), sub: t('orders.awaitingApproval') },
                      { statuses: ['SHIPPED','DELIVERED'],                      label: t('orders.dispatched'),   sub: t('orders.inTransit') },
                      { statuses: ['DELIVERED'],                                label: t('orders.deliveryConfirmed'), sub: t('orders.qualityCheck') },
                    ].map(({ statuses, label, sub }, i) => (
                      <div key={i} className="relative pl-10">
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-md z-10 ${statuses.includes(selectedOrder.status) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{label}</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <Info size={20} className="text-slate-400" />
                      <h4 className="font-bold text-slate-900">{t('orders.logisticsDetails')}</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-slate-400">{t('orders.totalQty')}</span>
                        <span className="font-bold text-slate-900">{selectedOrder.quantity} Tons</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-slate-400">{t('orders.currentRate')}</span>
                        <span className="font-bold text-emerald-600">₹{selectedOrder.demandId?.ratePerTon || 0}/T</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-slate-200/60">
                        <span className="text-sm font-bold text-slate-400">{t('orders.estPay')}</span>
                        <span className="text-lg font-black text-slate-900">₹{(selectedOrder.quantity * (selectedOrder.demandId?.ratePerTon || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm border border-blue-50"><Truck size={20} /></div>
                    <div>
                      <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">{t('orders.dispatchVehicle')}</p>
                      <p className="font-bold text-slate-900">{selectedOrder.dispatchDetails?.vehicleNumber || t('orders.notAssigned')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-bold uppercase tracking-widest">
              {t('orders.selectOrder')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
