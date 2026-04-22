import React, { useState, useEffect, useRef } from 'react';
import { Scale, Sprout, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const PlusIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const FarmProfile = () => {
  const fileInputRef = useRef(null);
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    fullName: '', farmLocation: '', farmSize: '',
    sugarcaneVariety: '', expectedHarvestMonth: '', estimatedYield: '', images: []
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/farmer/farm-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/farmer/update-profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setProfile(prev => ({ ...prev, images: [...(prev.images || []), ...imageUrls] }));
  };

  const removeImage = (index) => {
    setProfile(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 text-neutral-400 font-bold uppercase tracking-widest animate-pulse">
      {t('profile.loading')}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('profile.title')}</h2>
          <p className="text-slate-500 font-medium mt-1">{t('profile.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${isEditing ? 'bg-slate-200 text-slate-600' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700'}`}
        >
          {isEditing ? t('profile.cancelEdit') : t('profile.editProfile')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-10">
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: t('profile.fullName'),       key: 'fullName',              type: 'text' },
                  { label: t('profile.farmLocation'),   key: 'farmLocation',          type: 'text' },
                  { label: t('profile.farmSize'),       key: 'farmSize',              type: 'number' },
                  { label: t('profile.variety'),        key: 'sugarcaneVariety',      type: 'text' },
                  { label: t('profile.harvestMonth'),   key: 'expectedHarvestMonth',  type: 'text' },
                  { label: t('profile.estimatedYield'), key: 'estimatedYield',        type: 'number' },
                ].map(({ label, key, type }) => (
                  <div key={key} className="space-y-2 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
                    <input
                      type={type}
                      disabled={!isEditing}
                      className="w-full bg-slate-50 border-none px-5 py-3.5 rounded-xl font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500/20 disabled:opacity-60 transition"
                      value={profile[key]}
                      onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                    />
                  </div>
                ))}
                {isEditing && (
                  <div className="md:col-span-2 pt-4">
                    <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition active:scale-[0.98]">
                      {t('profile.saveChanges')}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-10">
            <h3 className="text-xl font-black text-slate-800 mb-8 px-1">{t('profile.cropPhotos')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              {profile.images?.map((url, i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 group relative">
                  <img src={url} alt={`Crop ${i}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg z-10">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div
                onClick={() => fileInputRef.current.click()}
                className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition cursor-pointer bg-slate-50/50"
              >
                <PlusIcon size={32} className="mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('profile.addPhoto')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-neutral-900 rounded-[2rem] p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500 rounded-2xl"><Sprout size={24} className="text-white" /></div>
              <h4 className="font-bold text-lg">{t('profile.farmOverview')}</h4>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Scale size={20} className="text-neutral-500 mt-1" />
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">{t('profile.totalCapacity')}</p>
                  <p className="font-bold text-xl">{profile.farmSize * 40 || 0} Tons <span className="text-xs text-neutral-500 font-medium">{t('profile.est')}</span></p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Calendar size={20} className="text-neutral-500 mt-1" />
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">{t('profile.nextHarvest')}</p>
                  <p className="font-bold text-xl">{profile.expectedHarvestMonth || 'Not Set'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 text-left">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={24} className="text-emerald-600" />
              <h4 className="font-bold text-emerald-900">{t('profile.yieldPotential')}</h4>
            </div>
            <p className="text-sm text-emerald-700 font-medium leading-relaxed">
              {t('profile.yieldMsgPrefix')} {(profile.farmSize * 35).toLocaleString()} - {(profile.farmSize * 45).toLocaleString()} {t('profile.yieldMsgSuffix')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmProfile;
