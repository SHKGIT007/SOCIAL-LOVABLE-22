import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Swal from 'sweetalert2';

const SystemSettings = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [form, setForm] = useState<{
    type?: string;
    api_url?: string;
    value?: string;
    is_active?: boolean;
    cloudinary_cloud_name?: string;
    cloudinary_api_key?: string;
    cloudinary_api_secret?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSettings(); }, []);
  const fetchSettings = async () => {
    setLoading(true);
    const res = await apiService.getSystemSettings();
    const settingsArr = Array.isArray(res.data) ? res.data : [];
    setSettings(settingsArr);
    // If only one record exists, use it to set form values
    if (settingsArr.length > 0) {
      const s = settingsArr[0];
      const newForm = {
        type: s.type || '',
        api_url: s.api_url || '',
        value: s.api_key || '',
        is_active: s.is_active,
        cloudinary_cloud_name: s.cloudinary_cloud_name || '',
        cloudinary_api_key: s.cloudinary_api_key || '',
        cloudinary_api_secret: s.cloudinary_api_secret || '',
      };
      setForm(newForm);
    } else {
      setForm({});
      console.log('No settings found, form set to empty object');
    }
    setLoading(false);
  };

  const handleChange = (key, value) => setForm({ ...form, [key]: value });
  const handleUpdate = async () => {
    setLoading(true);
    // Send all values as a single object
    const updates = {
      type: form.type || '',
      is_active: Boolean(form.is_active),
      api_url: form.api_url || '',
      api_key: form.value || '',
      cloudinary_cloud_name: form.cloudinary_cloud_name || '',
      cloudinary_api_key: form.cloudinary_api_key || '',
      cloudinary_api_secret: form.cloudinary_api_secret || '',
    };
    const updateData = await apiService.updateSystemSettings({ settings: updates });

    console.log("Update Response: ", updateData);
    setLoading(false);
    fetchSettings();

    if(updateData.status == true) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Settings updated successfully.'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: updateData.message || 'Failed to update settings.'
      });
    }
    
  };


  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">System Settings</h2>
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Provider</h3>
          <select
            className="w-full mb-2 border rounded-lg px-3 py-2"
            value={form.type ?? ''}
            onChange={e => handleChange('type', e.target.value)}
          >
            <option value="">Select AI Provider Type</option>
            <option value="groq">Groq</option>
            <option value="openai">OpenAI</option>
            <option value="anyscale">Anyscale</option>
            <option value="other">Other</option>
          </select>
          <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
          <input
            className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            placeholder="API URL"
            value={form.api_url ?? ''}
            onChange={e => handleChange('api_url', e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            placeholder="API Key"
            value={form.value ?? ''}
            onChange={e => handleChange('value', e.target.value)}
          />
          <div className="flex items-center mt-2">
            <input type="checkbox" checked={Boolean(form.is_active)} onChange={e => handleChange('is_active', e.target.checked)} />
            <span className="ml-2">Active</span>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cloudinary</h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Name</label>
          <input
            className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            placeholder="Cloud Name"
            value={form.cloudinary_cloud_name ?? ''}
            onChange={e => handleChange('cloudinary_cloud_name', e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            placeholder="API Key"
            value={form.cloudinary_api_key ?? ''}
            onChange={e => handleChange('cloudinary_api_key', e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
          <input
            className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            placeholder="API Secret"
            value={form.cloudinary_api_secret ?? ''}
            onChange={e => handleChange('cloudinary_api_secret', e.target.value)}
          />
        </div>
        <button
          className={`w-full py-3 bg-indigo-600 text-white font-bold rounded-lg ${(!form['type'] || !form['api_url'] || !form['value']) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading || !form['type'] || !form['api_url'] || !form['value']}
          onClick={handleUpdate}
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </DashboardLayout>
  );
};
export default SystemSettings;
