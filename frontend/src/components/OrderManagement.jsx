import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, Package, ArrowRight, Download, QrCode, User, Phone, MapPin, Calendar, CreditCard, FileText, ChevronDown, ChevronUp, Clock, ShieldCheck, Loader2, Users } from 'lucide-react';
import apiClient from '../api/apiClient';
import { jsPDF } from 'jspdf';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    driverName: '', driverPhone: '', vehicleNumber: '', expectedDelivery: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/orders/factory-orders');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await apiClient.patch(`/orders/update-status/${orderId}`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleStartDispatch = async (orderId) => {
    if (!dispatchForm.driverName) return alert('Driver name is required.');
    try {
      await apiClient.post(`/orders/dispatch/${orderId}`, dispatchForm);
      fetchOrders();
    } catch (err) {
      alert('Failed to start dispatch.');
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      await apiClient.post(`/orders/deliver/${orderId}`);
      fetchOrders();
    } catch (err) {
      alert('Failed to confirm receipt.');
    }
  };

  const handleMakePayment = async (orderId) => {
    try {
      await apiClient.post(`/orders/pay/${orderId}`);
      alert('Payment successful and Wallet Updated!');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to make payment.');
    }
  };

  const getStatusStep = (status) => {
    const steps = ['Created', 'Packed', 'Dispatched', 'In Transit', 'Delivered'];
    const statusMap = {
      'PENDING': 0, 'ACCEPTED': 0, 'PROCESSING': 1, 'Packed': 1, 'Processing': 1,
      'DISPATCHED': 2, 'Dispatched': 2,
      'IN_TRANSIT': 3, 'In Transit': 3,
      'ARRIVED': 4, 'DELIVERED': 5, 'Delivered': 5
    };
    return statusMap[status] !== undefined ? statusMap[status] : 0;
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s?.includes('delivered')) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (s?.includes('transit') || s?.includes('dispatched')) return 'text-blue-700 bg-blue-100 border-blue-200';
    return 'text-amber-700 bg-amber-100 border-amber-200';
  };

  const generatePDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('F2F - PURCHASE AGREEMENT', 105, 30, { align: 'center' });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 40, 190, 40);
    
    doc.setFontSize(12);
    doc.text(`Order Ref: ${order._id}`, 20, 55);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 55);
    
    doc.setFontSize(14);
    doc.text('1. Parties involved', 20, 75);
    doc.setFontSize(11);
    doc.text(`Buyer (Factory): ${order.demandId?.title || 'Farm2Factory Verified'}`, 20, 85);
    doc.text(`Seller (Farmer): ${order.farmerId?.name || 'Verified Farmer'}`, 20, 92);
    
    doc.setFontSize(14);
    doc.text('2. Commodity & Pricing', 20, 110);
    doc.setFontSize(11);
    doc.text(`Items: Sugarcane (Standard Quality)`, 20, 120);
    doc.text(`Quantity: ${order.quantity} Tons`, 20, 127);
    doc.text(`Rate/Ton: ₹${order.demandId?.ratePerTon?.toLocaleString() || 'N/A'}`, 20, 134);
    doc.text(`Total Payable: ₹${(order.quantity * (order.demandId?.ratePerTon || 0)).toLocaleString()}`, 20, 141);
    
    doc.line(20, 240, 80, 240);
    doc.text('Buyer Signature', 20, 250);
    
    doc.line(130, 240, 190, 240);
    doc.text('Seller Signature', 130, 250);
    
    doc.save(`F2F_Agreement_${order._id.slice(-6)}.pdf`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
      <Loader2 className="animate-spin h-10 w-10 mb-4 text-blue-600" />
      <p className="font-bold">Syncing Supply Chain Data...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order Management</h2>
          <p className="text-slate-500 mt-1">Cross-check shipments, track logistics, and manage payments.</p>
        </div>
        <div className="hidden md:flex space-x-2">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 flex items-center">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Active Blockchain Tracking
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order._id;
          const currentStep = getStatusStep(order.status);
          const steps = ['Created', 'Packed', 'Dispatched', 'In Transit', 'Delivered'];
          const totalAmount = order.quantity * (order.demandId?.ratePerTon || 0);

          return (
            <div key={order._id} className={`bg-white rounded-3xl border transition-all duration-300 ${isExpanded ? 'shadow-2xl border-blue-400' : 'shadow-sm border-slate-100 hover:border-blue-200'}`}>
              {/* Header Card */}
              <div className="p-6 md:p-8 cursor-pointer" onClick={() => {
                  if (isExpanded) {
                      setExpandedOrderId(null);
                  } else {
                      setExpandedOrderId(order._id);
                      setDispatchForm({
                          driverName: order.dispatchDetails?.driverName || '',
                          vehicleNumber: order.dispatchDetails?.vehicleNumber || '',
                          driverPhone: order.dispatchDetails?.driverPhone || '',
                          expectedDelivery: order.dispatchDetails?.expectedDelivery ? new Date(order.dispatchDetails.expectedDelivery).toISOString().split('T')[0] : ''
                      });
                  }
              }}>
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                  <div className="flex items-start space-x-5">
                    <div className={`p-4 rounded-2xl ${getStatusColor(order.status).replace('text-', 'bg-').split(' ')[1].replace('bg-', 'bg-opacity-20 bg-')}`}>
                      <Package className={`h-8 w-8 ${getStatusColor(order.status).split(' ')[0]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">#{order._id.slice(-8)}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 truncate">{order.demandId?.title || 'Direct Procurement'}</h3>
                      <p className="text-slate-500 font-medium flex items-center mt-1">
                        <User className="h-4 w-4 mr-1 text-slate-400" />
                        Lead Farmer: {order.farmerId?.name || 'Group Supply'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 px-2 lg:px-8 border-l border-r border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                      <p className="text-lg font-black text-slate-900">{order.quantity} <span className="text-xs font-bold text-slate-400">Tons</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
                      <p className="text-lg font-black text-emerald-600">₹{totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(order.status)}`}>
                         <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusColor(order.status).split(' ')[0].replace('text-', 'bg-')}`}></div>
                         {order.status}
                      </span>
                    </div>
                    <div className="hidden md:flex items-center justify-center">
                      {isExpanded ? <ChevronUp className="h-6 w-6 text-slate-300" /> : <ChevronDown className="h-6 w-6 text-slate-300" />}
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline Bar */}
                <div className="mt-10 px-4">
                  <div className="relative flex justify-between items-center">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-white ${idx <= currentStep ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' : 'bg-slate-100 text-slate-300'}`}>
                          {idx < currentStep ? <CheckCircle className="h-5 w-5" /> : (idx === currentStep ? <Clock className="h-5 w-5 animate-pulse" /> : <Package className="h-4 w-4" />)}
                        </div>
                        <span className={`text-[10px] font-black mt-3 uppercase tracking-tighter ${idx <= currentStep ? 'text-slate-900' : 'text-slate-300'}`}>{step}</span>
                      </div>
                    ))}
                    <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -z-0 rounded-full"></div>
                    <div className="absolute top-5 left-0 h-1 bg-blue-600 transition-all duration-1000 -z-0 rounded-full shadow-sm" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Expanded Detail View */}
              {isExpanded && (
                <div className="px-8 pb-8 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                    {/* Farmers & Supply Details */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 text-slate-800 font-black uppercase text-xs tracking-widest">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Supplier Breakdown</span>
                      </div>
                      <div className="space-y-3">
                        {(order.farmers || [{ name: order.farmerId?.name || 'Assigned Farmer', quantity: order.quantity }]).map((f, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="flex items-center">
                               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 mr-3">{(f.name || 'F').charAt(0)}</div>
                               <span className="text-sm font-bold text-slate-700">{f.name}</span>
                             </div>
                             <span className="text-xs font-black text-slate-900">{f.quantity} Tons</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logistics & Dispatch */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 text-slate-800 font-black uppercase text-xs tracking-widest">
                        <Truck className="h-4 w-4 text-emerald-600" />
                        <span>Logistics Pipeline</span>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        {/* Status Check -> Render Form or Display */}
                        {(order.status === 'ACCEPTED' || order.status === 'PROCESSING' || order.status === 'PENDING') ? (
                          <div className="space-y-4">
                             <h4 className="text-sm font-bold text-slate-900 border-b pb-2 mb-2">1. Setup Dispatch & Logistics</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Driver Name</label>
                                    <input value={dispatchForm.driverName} onChange={e => setDispatchForm({...dispatchForm, driverName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Driver Phone</label>
                                    <input value={dispatchForm.driverPhone} onChange={e => setDispatchForm({...dispatchForm, driverPhone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Vehicle Number</label>
                                    <input value={dispatchForm.vehicleNumber} onChange={e => setDispatchForm({...dispatchForm, vehicleNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Expected Arrival</label>
                                    <input type="date" value={dispatchForm.expectedDelivery} onChange={e => setDispatchForm({...dispatchForm, expectedDelivery: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                                </div>
                             </div>
                             <div className="pt-2">
                                <button onClick={(e) => { e.stopPropagation(); handleStartDispatch(order._id); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition">Save & Mark Dispatched</button>
                             </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                               <div><p className="text-[10px] uppercase font-black text-slate-400">Driver</p><p className="text-sm font-bold text-slate-900">{order.dispatchDetails?.driverName || 'N/A'}</p></div>
                               <div><p className="text-[10px] uppercase font-black text-slate-400">Phone</p><p className="text-sm font-bold text-slate-900">{order.dispatchDetails?.driverPhone || 'N/A'}</p></div>
                               <div><p className="text-[10px] uppercase font-black text-slate-400">Vehicle</p><p className="text-sm font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded inline-block">{order.dispatchDetails?.vehicleNumber || 'N/A'}</p></div>
                               <div><p className="text-[10px] uppercase font-black text-slate-400">Expected</p><p className="text-sm font-bold text-slate-900">{order.dispatchDetails?.expectedDelivery ? new Date(order.dispatchDetails.expectedDelivery).toLocaleDateString() : 'N/A'}</p></div>
                             </div>
                             
                             <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-3">
                               {order.status === 'DISPATCHED' && (
                                   <button onClick={(e) => { e.stopPropagation(); updateStatus(order._id, 'IN_TRANSIT'); }} className="flex-1 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl transition text-sm">Mark In-Transit</button>
                               )}
                               {order.status === 'IN_TRANSIT' && (
                                   <button onClick={(e) => { e.stopPropagation(); updateStatus(order._id, 'ARRIVED'); }} className="flex-1 px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold rounded-xl transition text-sm">Mark Arrived</button>
                               )}
                               {order.status === 'ARRIVED' && (
                                   <button onClick={(e) => { e.stopPropagation(); handleMarkDelivered(order._id); }} className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition text-sm">Confirm Factory Receipt</button>
                               )}
                               {order.status === 'DELIVERED' && (
                                   <div className="w-full px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs flex justify-center items-center border border-emerald-100">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Receipt Confirmed (Proceed to Financial Summary)
                                   </div>
                               )}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financials & Documents */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 text-slate-800 font-black uppercase text-xs tracking-widest">
                        <CreditCard className="h-4 w-4 text-amber-600" />
                        <span>Financial Summary</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500 font-medium">Payment Status</span>
                           <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${order.paymentStatus === 'Paid' ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                             {order.paymentStatus}
                           </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500 font-medium">Pre-payment Paid</span>
                           <span className="font-bold text-slate-900">₹{order.paymentDetails?.preOrderAmount?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-dashed pt-2">
                           <span className="text-slate-900 font-black">Balance Due</span>
                           <span className="font-black text-red-600 text-base">₹{(totalAmount - (order.paymentDetails?.preOrderAmount || 0)).toLocaleString()}</span>
                        </div>
                        {order.paymentStatus !== 'Paid' && order.status === 'DELIVERED' && (
                          <div className="pt-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleMakePayment(order._id); }}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow uppercase tracking-wider text-xs"
                            >
                              Pay Remaining Balance
                            </button>
                          </div>
                        )}
                        
                        <div className="pt-4 flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); generatePDF(order); }}
                            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-lg"
                          >
                            <Download className="h-4 w-4" />
                            <span>Agreement</span>
                          </button>
                          <button 
                            className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition border border-blue-100"
                            onClick={(e) => { e.stopPropagation(); alert('Invoice generation is available in high-res download.'); }}
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderManagement;
