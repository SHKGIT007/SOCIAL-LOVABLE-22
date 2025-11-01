import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSettings(); }, []);
  const fetchSettings = async () => {
    setLoading(true);
    const res = await apiService.getSystemSettings();
    const settingsArr = Array.isArray(res.data?.data) ? res.data.data : [];
    setSettings(settingsArr);
    setForm(settingsArr.reduce((acc, item) => {
      acc[item.key] = item.value;
      acc['cloudinary_cloud_name'] = item.cloudinary_cloud_name || '';
      acc['cloudinary_api_key'] = item.cloudinary_api_key || '';
      acc['cloudinary_api_secret'] = item.cloudinary_api_secret || '';
      return acc;
    }, {}));
    setLoading(false);
  };

  const handleChange = (key, value) => setForm({ ...form, [key]: value });
  const handleUpdate = async () => {
    setLoading(true);
    const updates = settings.map(item => ({ ...item, value: form[item.key], cloudinary_cloud_name: form['cloudinary_cloud_name'], cloudinary_api_key: form['cloudinary_api_key'], cloudinary_api_secret: form['cloudinary_api_secret'] }));
    await apiService.updateSystemSettings(updates);
    setLoading(false);
    fetchSettings();
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">System Settings</h2>
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Provider</h3>
          <select
            className="w-full mb-2 border rounded-lg px-3 py-2"
            value={form['type'] || ''}
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
            value={form['api_url'] || ''}
            onChange={e => handleChange('api_url', e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            placeholder="API Key"
            value={form['value'] || ''}
            onChange={e => handleChange('value', e.target.value)}
          />
          <div className="flex items-center mt-2">
            <input type="checkbox" checked={form['is_active'] === 'true' || form['is_active'] === true} onChange={e => handleChange('is_active', e.target.checked)} />
            <span className="ml-2">Active</span>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cloudinary</h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Name</label>
          <input
            className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            placeholder="Cloud Name"
            value={form['cloudinary_cloud_name'] || ''}
            onChange={e => handleChange('cloudinary_cloud_name', e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            placeholder="API Key"
            value={form['cloudinary_api_key'] || ''}
            onChange={e => handleChange('cloudinary_api_key', e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
          <input
            className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            placeholder="API Secret"
            value={form['cloudinary_api_secret'] || ''}
            onChange={e => handleChange('cloudinary_api_secret', e.target.value)}
          />
        </div>
        <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg" disabled={loading} onClick={handleUpdate}>
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </DashboardLayout>
  );
};
export default SystemSettings;
