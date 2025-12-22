import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Swal from 'sweetalert2';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState<'ai-provider' | 'cloudinary' | 'google-oauth'>('ai-provider');
  const [loading, setLoading] = useState(false);
  const [showAIProviderGuide, setShowAIProviderGuide] = useState(false);
  const [showCloudinaryGuide, setShowCloudinaryGuide] = useState(false);
  const [showGoogleOAuthGuide, setShowGoogleOAuthGuide] = useState(false);
  
  // AI Provider form state
  const [aiProviderForm, setAIProviderForm] = useState<{
    type?: string;
    api_url?: string;
    api_key?: string;
    is_active?: boolean;
  }>({});

  // Cloudinary form state
  const [cloudinaryForm, setCloudinaryForm] = useState<{
    cloudinary_cloud_name?: string;
    cloudinary_api_key?: string;
    cloudinary_api_secret?: string;
  }>({});

  // Google OAuth form state
  const [googleOAuthForm, setGoogleOAuthForm] = useState<{
    google_client_id?: string;
    google_client_secret?: string;
    google_redirect_uri?: string;
  }>({});

  useEffect(() => { 
    fetchAllCredentials(); 
  }, []);

  const fetchAllCredentials = async () => {
    setLoading(true);
    try {
      // Fetch all credentials in parallel
      const [aiRes, cloudinaryRes, googleRes] = await Promise.all([
        apiService.getAIProviderCredentials(),
        apiService.getCloudinaryCredentials(),
        apiService.getGoogleOAuthCredentials()
      ]);

      if (aiRes.status && aiRes.data) {
        setAIProviderForm({
          type: aiRes.data.type || '',
          api_url: aiRes.data.api_url || '',
          api_key: aiRes.data.api_key || '',
          is_active: aiRes.data.is_active || false,
        });
      }

      if (cloudinaryRes.status && cloudinaryRes.data) {
        setCloudinaryForm({
          cloudinary_cloud_name: cloudinaryRes.data.cloudinary_cloud_name || '',
          cloudinary_api_key: cloudinaryRes.data.cloudinary_api_key || '',
          cloudinary_api_secret: cloudinaryRes.data.cloudinary_api_secret || '',
        });
      }

      if (googleRes.status && googleRes.data) {
        setGoogleOAuthForm({
          google_client_id: googleRes.data.google_client_id || '',
          google_client_secret: googleRes.data.google_client_secret || '',
          google_redirect_uri: googleRes.data.google_redirect_uri || '',
        });
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
    setLoading(false);
  };

  const handleAIProviderChange = (key, value) => {
    const updatedForm = { ...aiProviderForm, [key]: value };
    
    // Auto-populate API URL based on provider type
    if (key === 'type' && value) {
      const apiUrls = {
        'groq': 'https://api.groq.com/openai/v1/chat/completions',
        'openai': 'https://api.openai.com/v1/chat/completions',
        'anyscale': 'https://api.endpoints.anyscale.com/v1/chat/completions',
        'other': ''
      };
      updatedForm.api_url = apiUrls[value] || '';
    }
    
    setAIProviderForm(updatedForm);
  };

  const handleCloudinaryChange = (key, value) => {
    setCloudinaryForm({ ...cloudinaryForm, [key]: value });
  };

  const handleGoogleOAuthChange = (key, value) => {
    setGoogleOAuthForm({ ...googleOAuthForm, [key]: value });
  };

  // Function to get AI Provider specific guide content
  const getAIProviderGuide = () => {
    const providerType = aiProviderForm.type;
    
    if (!providerType || providerType === '') {
      return {
        title: 'How to Get AI Provider Credentials',
        content: (
          <div>
            <p className="mb-3 text-sm text-gray-600">
              Please select an AI Provider Type from the dropdown above to see specific instructions for that provider.
            </p>
            <p className="text-sm text-gray-600">
              Available providers: <strong>Groq</strong>, <strong>OpenAI</strong>, <strong>Anyscale</strong>, and <strong>Other</strong>.
            </p>
          </div>
        )
      };
    }

    switch(providerType) {
      case 'groq':
        return {
          title: 'How to Get Groq API Credentials',
          content: (
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                <strong>Sign up:</strong> Create account at <a href="https://console.groq.com/signup" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">console.groq.com</a>
              </li>
              <li>
                <strong>Get API Key:</strong> Go to <strong>API Keys</strong> → <strong>"Create API Key"</strong> → Name it → Click <strong>"Submit"</strong>
              </li>
              <li>
                <strong>Copy credentials:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>API URL:</strong> <code className="bg-gray-100 px-1 rounded">https://api.groq.com/openai/v1/chat/completions</code> (auto-filled)</li>
                  <li><strong>API Key:</strong> Copy the key (starts with <code className="bg-gray-100 px-1 rounded">gsk_</code>) and paste below</li>
                </ul>
              </li>
            </ol>
          )
        };
      
      case 'openai':
        return {
          title: 'How to Get OpenAI API Credentials',
          content: (
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                <strong>Sign up:</strong> Create account at <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">platform.openai.com</a>
              </li>
              <li>
                <strong>Add payment:</strong> Go to <strong>Settings</strong> → <strong>Billing</strong> and add payment method (required)
              </li>
              <li>
                <strong>Get API Key:</strong> Go to <strong>API Keys</strong> → <strong>"Create new secret key"</strong> → Name it → <strong>"Create"</strong>
                <p className="text-xs text-red-600 mt-1 ml-4">⚠️ Copy immediately - key won't be shown again!</p>
              </li>
              <li>
                <strong>Copy credentials:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>API URL:</strong> <code className="bg-gray-100 px-1 rounded">https://api.openai.com/v1/chat/completions</code> (auto-filled)</li>
                  <li><strong>API Key:</strong> Paste the key (starts with <code className="bg-gray-100 px-1 rounded">sk-</code>)</li>
                </ul>
              </li>
            </ol>
          )
        };
      
      case 'anyscale':
        return {
          title: 'How to Get Anyscale API Credentials',
          content: (
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                <strong>Sign up:</strong> Create account at <a href="https://www.anyscale.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">anyscale.com</a>
              </li>
              <li>
                <strong>Get API Key:</strong> Go to <strong>Settings</strong> → <strong>API Keys</strong> → <strong>"Create API Key"</strong> → Name it → Copy the key
              </li>
              <li>
                <strong>Copy credentials:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>API URL:</strong> <code className="bg-gray-100 px-1 rounded">https://api.endpoints.anyscale.com/v1/chat/completions</code> (auto-filled)</li>
                  <li><strong>API Key:</strong> Paste the generated key below</li>
                </ul>
              </li>
            </ol>
          )
        };
      
      case 'other':
        return {
          title: 'How to Configure Other AI Provider',
          content: (
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                <strong>Get credentials:</strong> Sign up with your provider and get API key from their dashboard
              </li>
              <li>
                <strong>Find API endpoint:</strong> Check provider docs for chat completions endpoint (usually: <code className="bg-gray-100 px-1 rounded">https://api.provider.com/v1/chat/completions</code>)
              </li>
              <li>
                <strong>Enter below:</strong> Paste <strong>API URL</strong> and <strong>API Key</strong> in the form fields
              </li>
              <li>
                <strong>Note:</strong> Ensure provider supports OpenAI-compatible API format
              </li>
            </ol>
          )
        };
      
      default:
        return {
          title: 'How to Get AI Provider Credentials',
          content: (
            <p className="text-sm text-gray-600">Please select a provider type to see specific instructions.</p>
          )
        };
    }
  };

  const handleUpdateAIProvider = async () => {
    setLoading(true);
    try {
      // Get current settings to preserve other fields
      const currentSettings = await apiService.getSystemSettings();
      const current = currentSettings.data && currentSettings.data.length > 0 ? currentSettings.data[0] : {};
      
      const updates = {
        type: aiProviderForm.type || '',
        is_active: Boolean(aiProviderForm.is_active),
        api_url: aiProviderForm.api_url || '',
        api_key: aiProviderForm.api_key || '',
        // Preserve other settings
        cloudinary_cloud_name: current.cloudinary_cloud_name || '',
        cloudinary_api_key: current.cloudinary_api_key || '',
        cloudinary_api_secret: current.cloudinary_api_secret || '',
        google_client_id: current.google_client_id || '',
        google_client_secret: current.google_client_secret || '',
        google_redirect_uri: current.google_redirect_uri || '',
      };
      
      const updateData = await apiService.updateSystemSettings({ settings: updates });

      if(updateData.status === true) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'AI Provider settings updated successfully.'
        });
        fetchAllCredentials();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: updateData.message || 'Failed to update settings.'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update AI Provider settings.'
      });
    }
    setLoading(false);
  };

  const handleUpdateCloudinary = async () => {
    setLoading(true);
    try {
      // Get current settings to preserve other fields
      const currentSettings = await apiService.getSystemSettings();
      const current = currentSettings.data && currentSettings.data.length > 0 ? currentSettings.data[0] : {};
      
      const updates = {
        // Preserve AI Provider settings
        type: current.type || '',
        is_active: current.is_active || false,
        api_url: current.api_url || '',
        api_key: current.api_key || '',
        // Update Cloudinary settings
        cloudinary_cloud_name: cloudinaryForm.cloudinary_cloud_name || '',
        cloudinary_api_key: cloudinaryForm.cloudinary_api_key || '',
        cloudinary_api_secret: cloudinaryForm.cloudinary_api_secret || '',
        // Preserve Google OAuth settings
        google_client_id: current.google_client_id || '',
        google_client_secret: current.google_client_secret || '',
        google_redirect_uri: current.google_redirect_uri || '',
      };
      
      const updateData = await apiService.updateSystemSettings({ settings: updates });

      if(updateData.status === true) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Cloudinary settings updated successfully.'
        });
        fetchAllCredentials();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: updateData.message || 'Failed to update settings.'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update Cloudinary settings.'
      });
    }
    setLoading(false);
  };

  const handleUpdateGoogleOAuth = async () => {
    setLoading(true);
    try {
      // Get current settings to preserve other fields
      const currentSettings = await apiService.getSystemSettings();
      const current = currentSettings.data && currentSettings.data.length > 0 ? currentSettings.data[0] : {};
      
      const updates = {
        // Preserve AI Provider settings
        type: current.type || '',
        is_active: current.is_active || false,
        api_url: current.api_url || '',
        api_key: current.api_key || '',
        // Preserve Cloudinary settings
        cloudinary_cloud_name: current.cloudinary_cloud_name || '',
        cloudinary_api_key: current.cloudinary_api_key || '',
        cloudinary_api_secret: current.cloudinary_api_secret || '',
        // Update Google OAuth settings
        google_client_id: googleOAuthForm.google_client_id || '',
        google_client_secret: googleOAuthForm.google_client_secret || '',
        google_redirect_uri: googleOAuthForm.google_redirect_uri || '',
      };
      
      const updateData = await apiService.updateSystemSettings({ settings: updates });

      if(updateData.status === true) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Google OAuth settings updated successfully.'
        });
        fetchAllCredentials();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: updateData.message || 'Failed to update settings.'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update Google OAuth settings.'
      });
    }
    setLoading(false);
  };


  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">System Settings</h2>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('ai-provider')}
            className={`px-6 py-3 font-semibold text-sm transition-all ${
              activeTab === 'ai-provider'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            AI Provider
          </button>
          <button
            onClick={() => setActiveTab('cloudinary')}
            className={`px-6 py-3 font-semibold text-sm transition-all ${
              activeTab === 'cloudinary'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Cloudinary
          </button>
          <button
            onClick={() => setActiveTab('google-oauth')}
            className={`px-6 py-3 font-semibold text-sm transition-all ${
              activeTab === 'google-oauth'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Google OAuth
          </button>
        </div>

        {/* AI Provider Tab Content */}
        {activeTab === 'ai-provider' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">AI Provider Configuration</h3>
              <button
                onClick={() => setShowAIProviderGuide(!showAIProviderGuide)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showAIProviderGuide ? 'Hide Guide' : 'How to Get Credentials?'}
              </button>
            </div>

            {/* AI Provider Guide */}
            {showAIProviderGuide && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {getAIProviderGuide().title}
                </h4>
                <div className="text-sm text-gray-700">
                  {getAIProviderGuide().content}
                </div>
                {aiProviderForm.type && (
                  <div className="mt-3 p-3 bg-indigo-100 rounded border border-indigo-300">
                    <p className="text-xs text-indigo-800">
                      <strong>Quick Tip:</strong> After getting your credentials, paste them in the form fields below and click "Update AI Provider Settings" to save.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider Type</label>
              <select
                className="w-full mb-4 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={aiProviderForm.type ?? ''}
                onChange={e => handleAIProviderChange('type', e.target.value)}
              >
                <option value="">Select AI Provider Type</option>
                <option value="groq">Groq</option>
                <option value="openai">OpenAI</option>
                <option value="anyscale">Anyscale</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API URL
                {aiProviderForm.type && ['groq', 'openai', 'anyscale'].includes(aiProviderForm.type) && (
                  <span className="ml-2 text-xs text-gray-500 font-normal">(Auto-filled, can be edited)</span>
                )}
              </label>
              <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                placeholder={aiProviderForm.type ? "API URL will auto-populate" : "Select provider type first"}
                value={aiProviderForm.api_url ?? ''}
                onChange={e => handleAIProviderChange('api_url', e.target.value)}
              />
              {aiProviderForm.type === 'other' && (
                <p className="text-xs text-gray-500 mt-1">Enter your custom API endpoint URL (e.g., https://api.provider.com/v1/chat/completions)</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                placeholder="API Key"
                value={aiProviderForm.api_key ?? ''}
                onChange={e => handleAIProviderChange('api_key', e.target.value)}
              />
            </div>
            <div className="flex items-center mb-4">
              <input 
                type="checkbox" 
                checked={Boolean(aiProviderForm.is_active)} 
                onChange={e => handleAIProviderChange('is_active', e.target.checked)} 
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </div>
            <button
              className={`w-full py-3 bg-indigo-600 text-white font-bold rounded-lg transition-all ${
                (!aiProviderForm.type || !aiProviderForm.api_url || !aiProviderForm.api_key || loading) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-indigo-700'
              }`}
              disabled={loading || !aiProviderForm.type || !aiProviderForm.api_url || !aiProviderForm.api_key}
              onClick={handleUpdateAIProvider}
            >
              {loading ? 'Updating...' : 'Update AI Provider Settings'}
            </button>
          </div>
        )}

        {/* Cloudinary Tab Content */}
        {activeTab === 'cloudinary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Cloudinary Configuration</h3>
              <button
                onClick={() => setShowCloudinaryGuide(!showCloudinaryGuide)}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showCloudinaryGuide ? 'Hide Guide' : 'How to Get Credentials?'}
              </button>
            </div>

            {/* Cloudinary Guide */}
            {showCloudinaryGuide && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Get Cloudinary Credentials
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>Sign up:</strong> Create a free account at <a href="https://cloudinary.com/users/register/free" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">cloudinary.com</a>
                  </li>
                  <li>
                    <strong>Get credentials:</strong> Go to <strong>Dashboard</strong> → <strong>Account Details</strong> to find:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li><strong>Cloud Name</strong> (top right of dashboard)</li>
                      <li><strong>API Key</strong> (in Account Details)</li>
                      <li><strong>API Secret</strong> (click "Show" to reveal)</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Copy & paste:</strong> Copy all three values and paste them in the form fields below
                  </li>
                </ol>
                <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-300">
                  <p className="text-xs text-blue-800">
                    <strong>Quick Access:</strong> <a href="https://console.cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline font-medium">Cloudinary Console</a>
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Name</label>
              <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                placeholder="Cloud Name"
                value={cloudinaryForm.cloudinary_cloud_name ?? ''}
                onChange={e => handleCloudinaryChange('cloudinary_cloud_name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                placeholder="API Key"
                value={cloudinaryForm.cloudinary_api_key ?? ''}
                onChange={e => handleCloudinaryChange('cloudinary_api_key', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
              <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                placeholder="API Secret"
                value={cloudinaryForm.cloudinary_api_secret ?? ''}
                onChange={e => handleCloudinaryChange('cloudinary_api_secret', e.target.value)}
              />
            </div>
            <button
              className={`w-full py-3 bg-cyan-600 text-white font-bold rounded-lg transition-all ${
                (!cloudinaryForm.cloudinary_cloud_name || !cloudinaryForm.cloudinary_api_key || !cloudinaryForm.cloudinary_api_secret || loading) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-cyan-700'
              }`}
              disabled={loading || !cloudinaryForm.cloudinary_cloud_name || !cloudinaryForm.cloudinary_api_key || !cloudinaryForm.cloudinary_api_secret}
              onClick={handleUpdateCloudinary}
            >
              {loading ? 'Updating...' : 'Update Cloudinary Settings'}
            </button>
          </div>
        )}

        {/* Google OAuth Tab Content */}
        {activeTab === 'google-oauth' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Google OAuth Configuration</h3>
              <button
                onClick={() => setShowGoogleOAuthGuide(!showGoogleOAuthGuide)}
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showGoogleOAuthGuide ? 'Hide Guide' : 'How to Get Credentials?'}
              </button>
            </div>

            {/* Google OAuth Guide */}
            {showGoogleOAuthGuide && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Get Google OAuth Credentials
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>Go to Google Cloud Console:</strong> Visit <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">console.cloud.google.com</a> and sign in
                  </li>
                  <li>
                    <strong>Create/Select Project:</strong> Create a new project or select an existing one from the dropdown
                  </li>
                  <li>
                    <strong>OAuth Consent Screen:</strong> Go to <strong>"APIs & Services"</strong> → <strong>"OAuth consent screen"</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Select <strong>"External"</strong> user type</li>
                      <li>Fill app name, email, and add scopes: <code className="bg-gray-100 px-1 rounded">email</code>, <code className="bg-gray-100 px-1 rounded">profile</code>, <code className="bg-gray-100 px-1 rounded">openid</code></li>
                    </ul>
                  </li>
                  <li>
                    <strong>Create OAuth Client:</strong> Go to <strong>"Credentials"</strong> → <strong>"Create Credentials"</strong> → <strong>"OAuth client ID"</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Select <strong>"Web application"</strong></li>
                      <li>Add redirect URI: <code className="bg-gray-100 px-1 rounded">http://localhost:8080/auth/google/callback</code> (or your production URL)</li>
                      <li>Click <strong>"Create"</strong></li>
                    </ul>
                  </li>
                  <li>
                    <strong>Copy Credentials:</strong> Copy <strong>Client ID</strong> and <strong>Client Secret</strong> from the popup and paste below
                  </li>
                </ol>
                <div className="mt-3 p-2 bg-green-100 rounded border border-green-300">
                  <p className="text-xs text-green-800">
                    <strong>Security:</strong> Never commit Client Secret to public repositories. Use environment variables.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
              <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                placeholder="Client ID"
                value={googleOAuthForm.google_client_id ?? ''}
                onChange={e => handleGoogleOAuthChange('google_client_id', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
              <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                placeholder="Client Secret"
                value={googleOAuthForm.google_client_secret ?? ''}
                onChange={e => handleGoogleOAuthChange('google_client_secret', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URI (Optional)</label>
              <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                placeholder="Redirect URI"
                value={googleOAuthForm.google_redirect_uri ?? ''}
                onChange={e => handleGoogleOAuthChange('google_redirect_uri', e.target.value)}
              />
            </div>
            <button
              className={`w-full py-3 bg-green-600 text-white font-bold rounded-lg transition-all ${
                (!googleOAuthForm.google_client_id || !googleOAuthForm.google_client_secret || loading) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-green-700'
              }`}
              disabled={loading || !googleOAuthForm.google_client_id || !googleOAuthForm.google_client_secret}
              onClick={handleUpdateGoogleOAuth}
            >
              {loading ? 'Updating...' : 'Update Google OAuth Settings'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default SystemSettings;
