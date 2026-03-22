import React, { useState, useEffect } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import apiClient from '../api/apiClient';

const CreateDemandForm = ({ onClose, onDemandCreated, editData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    ratePerTon: '',
    totalQuantityRequired: '',
    minQuantityPerFarmer: '',
    startDate: '',
    endDate: '',
    location: '',
    transportResponsibility: 'Factory',
    demandType: 'Individual',
    locationCoordinates: { type: 'Point', coordinates: [74.5815, 16.8524] } // Default to Sangli
  });
  
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      // Format dates for input[type="date"]
      const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
      };

      setFormData({
        ...editData,
        startDate: formatDate(editData.startDate),
        endDate: formatDate(editData.endDate),
        locationCoordinates: editData.locationCoordinates || { type: 'Point', coordinates: [74.5815, 16.8524] }
      });
    }
  }, [editData]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.address;
          const city = address.city || address.town || address.village || address.district || "";
          const state = address.state || "";
          const locationName = city ? `${city}, ${state}` : state;

          setFormData(prev => ({
            ...prev,
            location: locationName || prev.location,
            locationCoordinates: {
              type: "Point",
              coordinates: [longitude, latitude]
            }
          }));
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          alert("Could not fetch location name, but coordinates saved.");
          setFormData(prev => ({
            ...prev,
            locationCoordinates: {
              type: "Point",
              coordinates: [longitude, latitude]
            }
          }));
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        setLocLoading(false);
        alert("Location permission denied or error occurred.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editData) {
        await apiClient.put(`/demands/update-demand/${editData._id}`, formData);
      } else {
        await apiClient.post('/demands/create-demand', formData);
      }
      onDemandCreated();
      onClose();
    } catch (err) {
      console.error('Error saving demand:', err);
      alert(err.response?.data?.message || 'Failed to save demand');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">
            {editData ? 'Edit Demand' : 'Create New Demand'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Demand Title</label>
              <input 
                name="title" 
                value={formData.title}
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="e.g. Winter Season Sugarcane Batch" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rate per Ton (₹)</label>
              <input 
                name="ratePerTon" 
                type="number" 
                value={formData.ratePerTon}
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="3200" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Total Quantity (Tons)</label>
              <input 
                name="totalQuantityRequired" 
                type="number" 
                value={formData.totalQuantityRequired}
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="1000" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Min Qty per Farmer (Tons)</label>
              <input 
                name="minQuantityPerFarmer" 
                type="number" 
                value={formData.minQuantityPerFarmer}
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="10" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <div className="relative">
                <input 
                  name="location" 
                  value={formData.location}
                  onChange={handleChange} 
                  required 
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Sangli Factory Unit 1" 
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                  title="Detect my location"
                >
                  {locLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
                </button>
              </div>
              {formData.locationCoordinates?.coordinates?.[0] !== 0 && (
                <p className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
                  GPS Coordinates captured: {formData.locationCoordinates.coordinates[1].toFixed(4)}, {formData.locationCoordinates.coordinates[0].toFixed(4)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
              <input 
                name="startDate" 
                type="date" 
                value={formData.startDate}
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
              <input 
                name="endDate" 
                type="date" 
                value={formData.endDate}
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Transport</label>
              <select 
                name="transportResponsibility" 
                value={formData.transportResponsibility}
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Factory">Factory</option>
                <option value="Farmer">Farmer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Demand Type</label>
              <select 
                name="demandType" 
                value={formData.demandType}
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Individual">Individual Farmer</option>
                <option value="Pool">Pool Demand</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (editData ? 'Updating...' : 'Publishing...') : (editData ? 'Update Demand' : 'Publish Demand')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDemandForm;
