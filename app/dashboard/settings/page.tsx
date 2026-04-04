'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, CalendarClock } from 'lucide-react';

const FEE_CYCLES = [
  { value: 'monthly', label: 'Monthly', description: 'Fee is due every month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Fee is due every 3 months' },
  { value: 'half_yearly', label: 'Half Yearly', description: 'Fee is due every 6 months' },
  { value: 'yearly', label: 'Yearly', description: 'Fee is due once a year' },
];

export default function Settings() {
  const [membershipFee, setMembershipFee] = useState('500.00');
  const [feeCycle, setFeeCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (Array.isArray(data)) {
        const feeSetting = data.find((s: any) => s.setting_key === 'membership_fee');
        if (feeSetting) {
          setMembershipFee(feeSetting.setting_value);
        }
        const cycleSetting = data.find((s: any) => s.setting_key === 'fee_cycle');
        if (cycleSetting) {
          setFeeCycle(cycleSetting.setting_value);
        }
      } else if (data.error) {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Save membership fee
      const feeResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_key: 'membership_fee',
          setting_value: membershipFee
        }),
      });

      // Save fee cycle
      const cycleResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_key: 'fee_cycle',
          setting_value: feeCycle
        }),
      });

      if (feeResponse.ok && cycleResponse.ok) {
        setMessage('Settings updated successfully!');
      } else {
        setMessage('Failed to update settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  const selectedCycleInfo = FEE_CYCLES.find(c => c.value === feeCycle);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            <p className="text-sm text-gray-500">Configure application defaults</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Membership Fee Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Membership Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                step="0.01"
                value={membershipFee}
                onChange={(e) => setMembershipFee(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Enter amount"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 italic">
              * This fee will automatically be applied to every new student registration as a pending payment.
            </p>
          </div>

          {/* Fee Cycle Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="h-5 w-5 text-indigo-600" />
              <label className="block text-sm font-semibold text-gray-800">
                Fee Payment Cycle
              </label>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Choose how often students need to pay their membership fee. Students whose cycle period has elapsed will automatically appear on the Pending Payments page.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {FEE_CYCLES.map((cycle) => (
                <label
                  key={cycle.value}
                  className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    feeCycle === cycle.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="fee_cycle"
                    value={cycle.value}
                    checked={feeCycle === cycle.value}
                    onChange={(e) => setFeeCycle(e.target.value)}
                    className="sr-only"
                  />
                  {feeCycle === cycle.value && (
                    <div className="absolute top-2 right-2 h-5 w-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <span className={`text-sm font-bold ${feeCycle === cycle.value ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {cycle.label}
                  </span>
                  <span className={`text-xs mt-1 ${feeCycle === cycle.value ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {cycle.description}
                  </span>
                </label>
              ))}
            </div>

            {selectedCycleInfo && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Current Setting:</strong> Students will be expected to pay <strong>₹{membershipFee}</strong> every <strong>{selectedCycleInfo.label.toLowerCase()}</strong>. 
                  Once a student pays, their next fee will automatically become due after the {selectedCycleInfo.label.toLowerCase()} period ends.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
