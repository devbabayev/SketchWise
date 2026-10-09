import React, { useState, useEffect } from 'react';
import { Lock, Check } from 'lucide-react';

export default function AdminPanel() {
  const [tokenStatus, setTokenStatus] = useState(false);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/token-status')
      .then(res => res.json())
      .then(data => setTokenStatus(data.hasToken))
      .catch(err => console.error(err));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (res.ok) {
        setTokenStatus(true);
        setMessage('Token updated successfully!');
      } else {
        setMessage(data.error || 'Failed to update token');
      }
    } catch (err) {
      setMessage('Error updating token');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-[#161616] p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Lock className="text-indigo-500 w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-black/50 border border-white/5 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${tokenStatus ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">
            AI Token Status: <strong className="text-white">{tokenStatus ? 'Configured' : 'Missing'}</strong>
          </span>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">New AI Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            <Check className="w-5 h-5" />
            Save Configuration
          </button>

          {message && (
            <p className="text-center text-sm mt-4 text-gray-300">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
