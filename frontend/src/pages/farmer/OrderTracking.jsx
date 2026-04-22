import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar, FileText, Download, ChevronRight, Info, X, AlertCircle, Edit, RefreshCw } from 'lucide-react';
import axios from 'axios';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [contributionData, setContributionData] = useState({
    quantity: '',
    type: 'Individual'
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/farmer/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = res.data.orders || [];
      setOrders(orders);
      const firstValidOrder = orders.find(o => o.status !== 'REJECTED' && o.status !== 'CANCELLED');
      if (firstValidOrder) setSelectedOrder(firstValidOrder);
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateContribution = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/farmer/contribution/update/${selectedOrder._id}`, {
        quantity: parseFloat(contributionData.quantity),
        type: contributionData.type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Action successful!');
      setIsEditModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating contribution');
    } finally {
      setLoading(false);
    }
  };

  const handleResetContribution = async () => {
    if (!window.confirm("Are you sure you want to reset your contribution? This will set your commitment to 0.")) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/farmer/contribution/update/${selectedOrder._id}`, {
        quantity: 0,
        type: 'Pool' // Defaulting to Pool for custom 0 reset
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Contribution reset successfully!');
      setIsEditModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error resetting contribution');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContribution = async (id) => {
    if (!window.confirm("Are you sure you want to remove this inactive order?")) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/farmer/contribution/${id}`, {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-emerald-500';
      case 'SHIPPED': return 'text-blue-500';
      case 'CANCELLED': return 'text-red-500';
      default: return 'text-amber-500';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'DELIVERED': return 'bg-emerald-50';
      case 'SHIPPED': return 'bg-blue-50';
      case 'CANCELLED': return 'bg-red-50';
      default: return 'bg-amber-50';
    }
  };

  const downloadAgreement = async (orderId) => {
     try {
       const token = localStorage.getItem('token');
       const response = await axios({
         url: `http://localhost:5000/api/farmer/agreement/${orderId}`,
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

  if (loading) return <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Tracking your shipments...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Order Tracking</h2>
        <p className="text-slate-500 font-medium mt-1">Monitor your sugarcane shipments and active contracts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Active Contracts</h3>
          <div className="space-y-4 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
            {orders.filter(o => o.status !== 'REJECTED' && o.status !== 'CANCELLED').length > 0 ? 
              orders.filter(o => o.status !== 'REJECTED' && o.status !== 'CANCELLED').map(order => (
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
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedOrder?._id === order._id ? 'text-neutral-500' : 'text-slate-400'}`}>
                    #{order._id.slice(-6)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedOrder?._id === order._id ? 'bg-white/10 text-white' : getStatusBg(order.status) + ' ' + getStatusColor(order.status)
                  }`}>
                    {order.status}
                  </span>
                </div>
                <h4 className="font-bold text-lg leading-tight mb-2">{order.demandId?.title || 'Sugarcane Delivery'}</h4>
                <div className="flex items-center gap-2 opacity-60 text-sm font-medium">
                  <Package size={14} />
                  <span>{order.quantity} Tons committed</span>
                </div>
                <div className="mt-4 flex gap-2">
                  {order.quantity > 0 ? (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                          setContributionData({
                            quantity: order.quantity,
                            type: order.contributionType || 'Individual'
                          });
                          setIsEditModalOpen(true);
                        }}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedOrder?._id === order._id 
                            ? 'bg-white/10 text-white hover:bg-white/20' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                          setIsDetailsModalOpen(true);
                        }}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedOrder?._id === order._id 
                            ? 'bg-white/10 text-white hover:bg-white/20' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        Details
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveContribution(order._id);
                      }}
                      className="w-full py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
                    >
                      Remove Inactive Order
                    </button>
                  )}
                </div>
              </button>
            )) : (
              <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center font-bold text-slate-400 uppercase text-xs tracking-widest">
                No active orders found
              </div>
            )}
          </div>
        </div>

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
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order ID: <span className="text-slate-900">#{selectedOrder._id}</span></p>
                     </div>
                  </div>
                   <div className="flex gap-3">
                      {selectedOrder.quantity > 0 ? (
                        <>
                          <button 
                            onClick={() => {
                              setContributionData({
                                 quantity: selectedOrder.quantity,
                                 type: selectedOrder.contributionType || 'Individual'
                              });
                              setIsEditModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold shadow-lg hover:border-blue-200 hover:text-blue-600 transition active:scale-95"
                          >
                            <Edit size={18} />
                            Edit Order
                          </button>
                          <button 
                           onClick={() => downloadAgreement(selectedOrder._id)}
                           className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-95"
                          >
                            <Download size={18} />
                            Agreement
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleRemoveContribution(selectedOrder._id)}
                          className="flex items-center gap-2 px-8 py-3 bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition active:scale-95"
                        >
                          <X size={18} />
                          Remove Order
                        </button>
                      )}
                   </div>
               </div>

               <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={16} /> Shipment Progress
                    </h4>
                    <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                       {[
                         { title: 'Order Accepted', subtitle: 'Factory Confirmation', stat: 'ACCEPTED', lvl: 1 },
                         { title: 'Processing', subtitle: 'Preparing to Pack', stat: 'PROCESSING', lvl: 2 },
                         { title: 'Dispatched', subtitle: 'Driver Assigned', stat: 'DISPATCHED', lvl: 3 },
                         { title: 'In Transit', subtitle: 'On the way', stat: 'IN_TRANSIT', lvl: 4 },
                         { title: 'Arrived', subtitle: 'Reached Factory', stat: 'ARRIVED', lvl: 5 },
                         { title: 'Delivered', subtitle: 'Completed & Checked', stat: 'DELIVERED', lvl: 6 },
                       ].map((step, idx) => {
                           const statusMap = { 'PENDING': 0, 'ACCEPTED': 1, 'PROCESSING': 2, 'DISPATCHED': 3, 'IN_TRANSIT': 4, 'ARRIVED': 5, 'DELIVERED': 6 };
                           const currentLvl = statusMap[selectedOrder.status] || 0;
                           const isAchieved = currentLvl >= step.lvl;
                           return (
                             <div key={idx} className="relative pl-10">
                                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-md z-10 transition-colors ${isAchieved ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                <div className="flex flex-col">
                                   <span className={`font-bold ${isAchieved ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</span>
                                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{step.subtitle}</span>
                                </div>
                             </div>
                           );
                       })}
                    </div>
                  </div>

                  <div className="space-y-8">
                     <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                           <Info size={20} className="text-slate-400" />
                           <h4 className="font-bold text-slate-900">Logistics Details</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between">
                              <span className="text-sm font-bold text-slate-400">Total Quantity</span>
                              <span className="font-bold text-slate-900">{selectedOrder.quantity} Tons</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-sm font-bold text-slate-400">Current Rate</span>
                              <span className="font-bold text-emerald-600">₹{selectedOrder.demandId?.ratePerTon || 0}/T</span>
                           </div>
                           <div className="flex justify-between pt-4 border-t border-slate-200/60">
                              <span className="text-sm font-bold text-slate-400">Est. Total Pay</span>
                              <span className="text-lg font-black text-slate-900">₹{(selectedOrder.quantity * (selectedOrder.demandId?.ratePerTon || 0)).toLocaleString()}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                        <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm border border-blue-50">
                           <Truck size={20} />
                        </div>
                        <div>
                           <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">Dispatch vehicle</p>
                           <p className="font-bold text-slate-900">{selectedOrder.dispatchDetails?.vehicleNumber || 'Not assigned'}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-bold uppercase tracking-widest">
              Select an order to view details
            </div>
          )}
        </div>
      </div>

      {/* Edit Contribution Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Modify Commitment</h3>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Order Summary: #{selectedOrder._id.slice(-6)}</p>
              </div>
              <button 
               onClick={() => setIsEditModalOpen(false)}
               className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateContribution} className="p-8 space-y-8">
               {/* Type Toggle */}
               <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setContributionData({...contributionData, type: 'Individual'})}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${contributionData.type === 'Individual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setContributionData({...contributionData, type: 'Pool'})}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${contributionData.type === 'Pool' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Pool
                  </button>
               </div>

               {contributionData.type === 'Pool' ? (
                 <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Update Quantity (Tons)</label>
                   <div className="relative">
                     <input 
                      type="number" required
                      className="w-full bg-slate-50 border-none px-6 py-4 rounded-2xl text-xl font-black outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all"
                      placeholder="00"
                      value={contributionData.quantity}
                      onChange={(e) => setContributionData({...contributionData, quantity: e.target.value})}
                     />
                     <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase tracking-widest">Tons</span>
                   </div>
                 </div>
               ) : (
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100/50 text-center space-y-2">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Full Batch Requirement</p>
                   <p className="text-3xl font-black text-slate-900">
                     {selectedOrder.demandId?.remainingQuantity || selectedOrder.demandId?.totalQuantityRequired - (selectedOrder.demandId?.fulfilledQuantity - selectedOrder.quantity)} Tons
                   </p>
                   <p className="text-xs font-medium text-slate-500 italic">Individual mode automatically scales to the highest available capacity.</p>
                </div>
               )}

               <div className="space-y-4">
                  <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition active:scale-95 text-sm uppercase tracking-widest">
                    Save Changes
                  </button>
                  <button 
                    type="button"
                    onClick={handleResetContribution}
                    className="w-full py-5 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 font-black rounded-2xl transition active:scale-95 text-sm uppercase tracking-widest"
                  >
                    Cancel Order (Set 0)
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Investment Details</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Order Summary: #{selectedOrder._id.slice(-6)}</p>
              </div>
              <button 
               onClick={() => setIsDetailsModalOpen(false)}
               className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-3xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Company / Factory</p>
                     <p className="text-xl font-black text-slate-900">{selectedOrder.factoryId?.name || 'Sugarcane Factory'}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                     <p className={`text-xl font-black uppercase tracking-tighter ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</p>
                  </div>
               </div>

               <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2.5rem] space-y-6">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Stock Commitment</p>
                        <p className="text-4xl font-black text-slate-900">{selectedOrder.quantity} <span className="text-lg text-slate-400">Tons</span></p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Rate per Ton</p>
                        <p className="text-2xl font-black text-slate-900">₹{selectedOrder.demandId?.ratePerTon || '0'}</p>
                     </div>
                  </div>

                  <div className="h-px bg-emerald-100"></div>

                  <div className="flex justify-between items-center">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Estimated Value</p>
                     <p className="text-3xl font-black text-emerald-600">₹{((selectedOrder.quantity || 0) * (selectedOrder.demandId?.ratePerTon || 0)).toLocaleString()}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Calendar size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Created</p>
                      <p className="text-sm font-bold text-slate-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
               </div>

               <button 
                 onClick={() => setIsDetailsModalOpen(false)}
                 className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 transition active:scale-95 text-sm uppercase tracking-widest mt-4"
               >
                 Close Summary
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
