import React, { useState, useEffect } from 'react';
import { ShieldCheck, Landmark, MapPin, Scale, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslate } from '../../hooks/useTranslate';

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

  const [
    title,
    desc,
    identityLabel,
    fullNameLabel,
    aadharLabel,
    bankAccLabel,
    ifscLabel,
    farmInfoLabel,
    farmLocLabel,
    farmSizeLabel,
    submitBtn,
    updateBtn,
    processingLabel,
    termsLabel,
    submittedStatus,
    updateMsg
  ] = useTranslate([
    "Complete Your KYC",
    "Please provide accurate information for verification and secure payments.",
    "Identity & Bank Details",
    "Full Name (As per Aadhar)",
    "Aadhar Number",
    "Bank Account Number",
    "IFSC Code",
    "Farm Information",
    "Farm Location",
    "Farm Size (Acres)",
    "Submit KYC Data",
    "Update KYC Details",
    "Processing...",
    "By clicking submit, you agree to our terms of data handling.",
    "KYC Application Submitted",
    "You can update your details anytime before verification."
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/farmer/dashboard', {
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
      const res = await axios.post('/api/farmer/kyc', formData, {
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
          <div className="relative z-10 text-left">
            <h2 className="text-3xl font-extrabold mb-2 transition-opacity duration-300">{title}</h2>
            <p className="text-neutral-400 transition-opacity duration-300">{desc}</p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck size={120} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Landmark size={20} className="text-emerald-500" />
              <h3 className="font-bold text-slate-800 text-lg transition-opacity duration-300">{identityLabel}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 transition-opacity duration-300">{fullNameLabel}</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 transition-opacity duration-300">{aadharLabel}</label>
                <input 
                  type="text" required maxLength="12"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  value={formData.aadharNumber}
                  onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 transition-opacity duration-300">{bankAccLabel}</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 transition-opacity duration-300">{ifscLabel}</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none uppercase"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin size={20} className="text-emerald-500" />
              <h3 className="font-bold text-slate-800 text-lg transition-opacity duration-300">{farmInfoLabel}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 transition-opacity duration-300">{farmLocLabel}</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  value={formData.farmLocation}
                  onChange={(e) => setFormData({...formData, farmLocation: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 transition-opacity duration-300">{farmSizeLabel}</label>
                <div className="relative">
                  <input 
                    type="number" required
                    className="w-full pl-4 pr-16 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                    value={formData.farmSize}
                    onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase tracking-widest">Acres</span>
                </div>
              </div>
            </div>
          </section>

          {kycStatus === 'submitted' && (
            <div className="bg-blue-50 text-blue-600 p-6 rounded-2xl flex items-center gap-4 border border-blue-100 mb-8 text-left">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <ShieldCheck className="text-blue-500" />
              </div>
              <div>
                <p className="font-black uppercase tracking-widest text-[10px] transition-opacity duration-300">Status</p>
                <p className="text-lg font-black tracking-tight transition-opacity duration-300">{submittedStatus}</p>
                <p className="text-xs font-medium text-blue-400 transition-opacity duration-300">{updateMsg}</p>
              </div>
            </div>
          )}

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full ${kycStatus === 'submitted' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'} disabled:bg-slate-300 text-white font-extrabold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest text-sm`}
            >
              <span className="transition-opacity duration-300">
                {loading ? processingLabel : (kycStatus === 'submitted' ? updateBtn : submitBtn)}
              </span>
              {!loading && <ChevronRight size={20} />}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1.5 transition-opacity duration-300">
              <Scale size={14} />
              {termsLabel}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerKYC;
