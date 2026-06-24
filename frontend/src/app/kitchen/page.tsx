'use client';

import { useState, useEffect } from 'react';
import KitchenOrdersView from './KitchenOrdersView';

export default function KitchenPage() {
  const [token, setToken] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('kitchen_session_token'));
  }, []);

  const handleNumberClick = (num: string) => {
    if (!isLocked && !isLoading && pin.length < 4) {
      setPin(prev => prev + num);
      setError(null);
    }
  };

  const handleClear = () => {
    if (!isLocked && !isLoading) { setPin(''); setError(null); }
  };

  const handleSubmit = async () => {
    if (isLocked || isLoading || pin.length !== 4) return;
    setIsLoading(true); setError(null);
    try {
      const res = await fetch('/api/kitchen/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('kitchen_session_token', data.token);
        setToken(data.token);
      } else {
        if (res.status === 429 || data.isLocked) {
          setIsLocked(true);
          setError('Screen locked. Contact Manager.');
        } else {
          setError(data.message || 'Incorrect PIN.');
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setPin('');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kitchen_session_token');
    setToken(null);
  };

  if (token) {
    return <KitchenOrdersView token={token} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kitchen Display</h1>
          <p className="text-gray-500 text-sm">Enter PIN to access orders</p>
        </div>
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className={`w-4 h-4 rounded-full ${index < pin.length ? 'bg-[#D62828]' : 'bg-gray-200'}`} />
          ))}
        </div>
        {error && <div className="mb-6 p-3 bg-red-50 text-[#D62828] text-sm text-center rounded-md font-medium">{error}</div>}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => handleNumberClick(num.toString())} disabled={isLocked || isLoading} className="h-16 text-2xl font-semibold text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50">{num}</button>
          ))}
          <button onClick={handleClear} disabled={isLocked || isLoading} className="h-16 text-lg font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50">Clear</button>
          <button onClick={() => handleNumberClick('0')} disabled={isLocked || isLoading} className="h-16 text-2xl font-semibold text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50">0</button>
          <button onClick={handleSubmit} disabled={isLocked || isLoading || pin.length !== 4} className={`h-16 text-lg font-medium rounded-xl transition-colors ${pin.length === 4 && !isLocked && !isLoading ? 'bg-[#F7B731] text-black hover:bg-yellow-500' : 'bg-gray-100 text-gray-400'}`}>Enter</button>
        </div>
        {isLocked && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-center"><p className="text-sm text-gray-500">Please unlock via the Restaurant Panel</p></div>
        )}
      </div>
    </div>
  );
}
