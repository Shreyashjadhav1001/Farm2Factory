import React, { useState, useEffect } from 'react';
import { Star, User, Heart, ChevronRight, Settings, Trash2, CreditCard, Receipt, Search, Filter, CheckCircle, Clock, Download, X, QrCode, AlertCircle, TrendingUp, DollarSign, ArrowRight, FileText, MapPin, Users, Loader2 } from 'lucide-react';
import apiClient from '../api/apiClient';
import { dummyFarmers } from '../data/dummyFarmers';
import { dummyOrders } from '../data/dummyOrders';

const WishlistAndRating = () => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [farmers, setFarmers] = useState(dummyFarmers);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const wishlistRes = await apiClient.get('/wishlist');
      if (wishlistRes.data && wishlistRes.data.length > 0) {
        setFarmers(wishlistRes.data);
      }
      
      const ordersRes = await apiClient.get('/orders/factory-orders');
      const allOrders = [...ordersRes.data, ...dummyOrders];
      
      // Generate dynamic transactions from all orders to ensure 100% consistency
      const generatedTxns = [];
      allOrders.forEach(order => {
        const totalAmount = order.quantity * (order.demandId?.ratePerTon || 0);
        if (totalAmount <= 0) return;

        const orderId = order._id;
        const farmerName = order.farmerId?.name || "Farmer";
        
        // 20% Advance - Usually marked as Completed in demo to show history
        generatedTxns.push({
          _id: `ADV-${orderId.slice(-6)}`,
          orderId,
          farmerName,
          amount: Math.round(totalAmount * 0.2),
          date: new Date(order.createdAt || Date.now()).toLocaleDateString(),
          status: 'Completed',
          type: "Advance Payment (20%)"
        });

        // 80% Final / Balance - Can be Pending or Completed based on order status
        generatedTxns.push({
          _id: `BAL-${orderId.slice(-6)}`,
          orderId,
          farmerName,
          amount: Math.round(totalAmount * 0.8),
          date: new Date(order.updatedAt || Date.now()).toLocaleDateString(),
          status: order.status === 'DELIVERED' || order.status === 'Delivered' || order.paymentStatus === 'Paid' ? 'Completed' : 'Pending',
          type: "Final Settlement (80%)"
        });
      });

      // Sort by date descending
      setTransactions(generatedTxns.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Supplier Card Component
  const SupplierCard = ({ farmer }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-blue-200 transition-all group">
      <div className="flex items-center space-x-5">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-100 uppercase">
          {farmer.avatar || (farmer.name ? farmer.name.charAt(0) : 'F')}
        </div>
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-xl font-black text-slate-900">{farmer.name}</h4>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
              farmer.qualityTag === 'Excellent' || farmer.rating >= 4.5 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {farmer.qualityTag || (farmer.rating >= 4.5 ? 'Excellent' : 'Trusted')}
            </span>
          </div>
          <div className="flex items-center text-slate-500 text-sm font-medium">
            <MapPin className="h-4 w-4 mr-1 text-slate-400" />
            {farmer.location || 'Maharashtra, India'}
          </div>
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center text-amber-500">
               {[1,2,3,4,5].map(star => (
                 <Star key={star} className={`h-4 w-4 ${star <= Math.round(farmer.rating || 0) ? 'fill-current' : 'text-slate-200 fill-none'}`} />
               ))}
               <span className="ml-2 text-sm font-black text-slate-900">{(farmer.rating || 0).toFixed(1)}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-slate-500">{(farmer.totalDeliveries || 0)} Deliveries</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button 
          onClick={() => { setSelectedFarmer(farmer); setIsRatingModalOpen(true); }}
          className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-lg truncate"
        >
          <Settings className="h-4 w-4 mr-2" />
          Edit Rating
        </button>
        <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  // Transaction Row Component
  const TransactionRow = ({ txn }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-blue-200 transition-all">
      <div className="flex items-center space-x-4 flex-1">
        <div className={`p-3 rounded-xl ${txn.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
          {txn.status === 'Completed' ? <CheckCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
        </div>
        <div>
          <h5 className="font-bold text-slate-900">{txn.farmerName}</h5>
          <p className="text-xs text-slate-500 tracking-tight">Ref: {txn.orderId} • {txn.type}</p>
        </div>
      </div>
      
      <div className="text-center md:text-right flex-1">
        <p className="text-sm font-black text-slate-900">₹{txn.amount.toLocaleString()}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase">{txn.date}</p>
      </div>

      <div className="flex items-center space-x-3 flex-1 justify-end">
        {txn.status === 'Pending' ? (
          <button 
            onClick={() => { setSelectedTxn(txn); setIsPaymentModalOpen(true); setPaymentDone(false); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-100 transition whitespace-nowrap"
          >
            Make Payment
          </button>
        ) : (
          <button 
            onClick={() => { setSelectedTxn(txn); setIsInvoiceOpen(true); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition flex items-center whitespace-nowrap"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Invoice
          </button>
        )}
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
      <Loader2 className="animate-spin h-10 w-10 mb-4 text-blue-600" />
      <p className="font-bold tracking-widest text-xs uppercase">Auditing Financial Records...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Suppliers & Finance</h2>
          <p className="text-slate-500 mt-1">Manage your preferred farmers and monitor payment transactions.</p>
        </div>
        
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'suppliers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Preferred Suppliers
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'finance' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Finance & Payments
          </button>
        </div>
      </div>

      {activeTab === 'suppliers' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <h3 className="text-lg font-black text-slate-800 flex items-center">
                 <Heart className="h-5 w-5 mr-2 text-red-500 fill-current" />
                 Your Verified Network
               </h3>
               <div className="flex space-x-2">
                 <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600">
                    <Filter className="h-4 w-4" />
                 </button>
               </div>
            </div>
            {farmers.length > 0 ? (
                farmers.map((farmer) => (
                    <SupplierCard key={farmer._id} farmer={farmer} />
                ))
            ) : (
                <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <User className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold">No suppliers in your network yet.</p>
                </div>
            )}
          </div>

          <div className="lg:col-span-1 border-l border-slate-100 pl-4 space-y-8 hidden lg:block">
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">Demo Insights</h3>
                   <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                          <TrendingUp className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth</p>
                          <p className="text-xl font-black">+14% Supply Efficiency</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                          <DollarSign className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savings</p>
                          <p className="text-xl font-black">₹12,400 Optimized</p>
                        </div>
                      </div>
                   </div>
                   <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest transition">
                     View Advanced Reports
                   </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
           <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <h3 className="text-lg font-black text-slate-800 flex items-center">
                 <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                 Transaction History
               </h3>
               <span className="text-xs font-bold text-slate-400">{transactions.length} Records Found</span>
            </div>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                  transactions.map((txn) => (
                    <TransactionRow key={txn._id} txn={txn} />
                  ))
              ) : (
                  <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <Receipt className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold">No transactions recorded yet.</p>
                  </div>
              )}
            </div>
        </div>
      )}

      {/* Rating Modal */}
      {isRatingModalOpen && selectedFarmer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 pb-0">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Experience Feedback</h3>
                    <p className="text-slate-500 mt-1">Rate your interaction with <strong>{selectedFarmer.name}</strong></p>
                  </div>
                  <button onClick={() => setIsRatingModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
               </div>
               
               <div className="flex justify-center space-x-2 py-8">
                 {[1,2,3,4,5].map(star => (
                   <button 
                    key={star} 
                    onClick={() => {
                        const updated = farmers.map(f => f._id === selectedFarmer._id ? {...f, rating: star} : f);
                        setFarmers(updated);
                        setSelectedFarmer({...selectedFarmer, rating: star});
                    }}
                    className="transition-transform active:scale-90"
                   >
                     <Star className={`h-12 w-12 ${star <= Math.round(selectedFarmer.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                   </button>
                 ))}
               </div>

               <div className="space-y-4">
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Internal Comment</span>
                    <textarea 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                      rows="3"
                      placeholder="e.g., Exceptionally clean harvest, timely delivery."
                    ></textarea>
                  </label>
                  <div className="flex space-x-2">
                    {['Exceptional', 'Reliable', 'Needs Check'].map(tag => (
                      <button key={tag} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-[10px] font-black uppercase text-slate-600 transition">
                        {tag}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
            <div className="p-8">
               <button 
                onClick={() => setIsRatingModalOpen(false)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-100 transition shadow-lg active:scale-95"
               >
                 Confirm Metrics
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedTxn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-8 bg-slate-900 text-white">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-black">Escrow Settlement</h3>
                   <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-500 hover:text-white transition">
                      <X className="h-6 w-6" />
                   </button>
                </div>
                
                <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payable to {selectedTxn.farmerName}</p>
                   <div className="flex items-end justify-between">
                      <h4 className="text-4xl font-black tracking-tighter text-emerald-400">₹{selectedTxn.amount.toLocaleString()}</h4>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Verification ID</p>
                        <p className="text-sm font-mono text-white/50">{selectedTxn.orderId}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 space-y-8">
                {paymentDone ? (
                   <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-emerald-600" />
                      </div>
                      <h4 className="text-2xl font-black text-slate-900">Payment Processed!</h4>
                      <p className="text-slate-500 mt-2">Funds have been successfully transferred to the supplier's verified bank account.</p>
                      <button 
                        onClick={() => {
                            const updated = transactions.map(t => t._id === selectedTxn._id ? {...t, status: 'Completed'} : t);
                            setTransactions(updated);
                            setIsPaymentModalOpen(false);
                        }}
                        className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                      >
                        Great, Thanks!
                      </button>
                   </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center">
                       <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 mb-4 group cursor-pointer hover:border-blue-400 transition-all">
                          <QrCode className="h-32 w-32 text-slate-800" />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan to verify bank node</p>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 shrink-0" />
                          <p className="text-xs text-blue-800 font-medium leading-relaxed">Ensure you have cross-checked the load weighment receipt before releasing final balance.</p>
                       </div>
                       
                       <button 
                        onClick={() => setPaymentDone(true)}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 transition active:scale-95"
                       >
                         Release Payment Now
                       </button>
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceOpen && selectedTxn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                   <div className="p-3 bg-slate-900 rounded-xl">
                      <FileText className="h-6 w-6 text-white" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase">Payment Receipt</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Copy • SHA-256 Verified</p>
                   </div>
                </div>
                <button onClick={() => setIsInvoiceOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
             </div>

             <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-10">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Billing From</p>
                      <p className="font-bold text-slate-900">Farm2Factory Platform</p>
                      <p className="text-sm text-slate-500 mt-1">Industrial Estate, Phase II, Satara, MH 415004</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Beneficiary</p>
                      <p className="font-bold text-slate-900">{selectedTxn.farmerName}</p>
                      <p className="text-sm text-slate-500 mt-1">Primary Node: SAT-BK-009212</p>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           <th className="px-6 py-3">Description</th>
                           <th className="px-6 py-3 text-right">Reference</th>
                           <th className="px-6 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-bold text-slate-700">
                        <tr className="border-t border-slate-100">
                           <td className="px-6 py-4">{selectedTxn.type}</td>
                           <td className="px-6 py-4 text-right">{selectedTxn.orderId}</td>
                           <td className="px-6 py-4 text-right">₹{selectedTxn.amount.toLocaleString()}</td>
                        </tr>
                      </tbody>
                   </table>
                </div>

                <div className="flex justify-between items-center p-6 bg-slate-900 rounded-2xl text-white">
                   <span className="text-sm font-black uppercase tracking-widest text-slate-400">Total Settlement</span>
                   <span className="text-2xl font-black">₹{selectedTxn.amount.toLocaleString()}</span>
                </div>
             </div>

             <div className="p-8 bg-slate-50 flex gap-4">
                <button 
                  onClick={() => {
                    alert('Digital PDF generated for local printer.');
                    setIsInvoiceOpen(false);
                  }}
                  className="flex-1 py-4 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 transition flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Save as PDF
                </button>
                <button className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition">
                  <ArrowRight className="h-5 w-5" />
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default WishlistAndRating;
