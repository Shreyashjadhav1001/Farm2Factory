import React, { useState, useEffect } from 'react';
import { ShieldCheck, Landmark, MapPin, Scale, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const FarmerKYC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    aadharNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    farmLocation: '',
    farmSize: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [kycStatus, setKycStatus] = useState('unverified');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/farmer/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data) {
          setFormData({
            fullName: res.data.fullName || '',
            aadharNumber: res.data.aadharNumber || '',
            bankAccountNumber: res.data.bankAccountNumber || '',
            ifscCode: res.data.ifscCode || '',
            farmLocation: '', 
            farmSize: ''
          });
          setKycStatus(res.data.kycStatus || 'unverified');
        }
      } catch (err) {
        console.error('Error fetching KYC data', err);
      } finally {
        setFetching(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.aadharNumber.length !== 12) {
      setError('Aadhar Number must be exactly 12 digits');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/farmer/kyc', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('KYC Details Saved Successfully!');
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      setKycStatus('submitted');
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting KYC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        <div className="bg-neutral-900 p-8 text-white relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold mb-2">Complete Your KYC</h2>
            <p className="text-neutral-400">Please provide accurate information for verification and secure payments.</p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck size={120} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

          {/* Personal & ID Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Landmark size={20} className="text-emerald-500" />
              <h3 className="font-bold text-slate-800 text-lg">Identity & Bank Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name (As per Aadhar)</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Aadhar Number</label>
                <input 
                  type="text" required maxLength="12"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  placeholder="12 digit number"
                  value={formData.aadharNumber}
                  onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Bank Account Number</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  placeholder="Enter account number"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">IFSC Code</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none uppercase"
                  placeholder="HDFC0001234"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Farm Details Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin size={20} className="text-emerald-500" />
              <h3 className="font-bold text-slate-800 text-lg">Farm Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Farm Location</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  placeholder="Town/Village Name"
                  value={formData.farmLocation}
                  onChange={(e) => setFormData({...formData, farmLocation: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Farm Size (Acres)</label>
                <div className="relative">
                  <input 
                    type="number" required
                    className="w-full pl-4 pr-16 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                    placeholder="e.g. 5"
                    value={formData.farmSize}
                    onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase tracking-widest">Acres</span>
                </div>
              </div>
            </div>
          </section>

          {kycStatus === 'submitted' && (
            <div className="bg-blue-50 text-blue-600 p-6 rounded-2xl flex items-center gap-4 border border-blue-100 mb-8">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <ShieldCheck className="text-blue-500" />
              </div>
              <div>
                <p className="font-black uppercase tracking-widest text-[10px]">Current Status</p>
                <p className="text-lg font-black tracking-tight">KYC Application Submitted</p>
                <p className="text-xs font-medium text-blue-400">You can update your details anytime before verification.</p>
              </div>
            </div>
          )}

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full ${kycStatus === 'submitted' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'} disabled:bg-slate-300 text-white font-extrabold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest text-sm`}
            >
              {loading ? 'Processing...' : (
                <>
                  {kycStatus === 'submitted' ? 'Update KYC Details' : 'Submit KYC Data'}
                  <ChevronRight size={20} />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1.5">
              <Scale size={14} />
              By clicking submit, you agree to our terms of data handling.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerKYC;
