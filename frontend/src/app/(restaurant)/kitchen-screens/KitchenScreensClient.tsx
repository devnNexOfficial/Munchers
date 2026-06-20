'use client';

import { useState, useEffect } from 'react';

// Assuming @/lib/supabase exists in a real scenario to consume backend API.
// import { supabase } from '@/lib/supabase';

export interface KitchenScreen {
  id: string;
  name: string;
  is_active: boolean;
  last_seen: string | null;
  created_at: string;
  // pin is omitted intentionally as UI is consume-only
}

export function KitchenScreensClient() {
  const [screens, setScreens] = useState<KitchenScreen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');

  // Initial load effect (Mocked to avoid crash without backend)
  useEffect(() => {
    // async function fetchScreens() {
    //   const { data } = await supabase.from('kitchen_screens').select('id, name, is_active, last_seen, created_at').order('created_at', { ascending: false });
    //   if (data) setScreens(data);
    // }
    // fetchScreens();
    setScreens([
      {
        id: '1',
        name: 'Prep Station A',
        is_active: true,
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
    ]);
    setIsLoading(false);
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setScreens(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    
    // try {
    //   await supabase.from('kitchen_screens').update({ is_active: !currentStatus }).eq('id', id);
    // } catch (e) {
    //   // Revert on error
    //   setScreens(prev => prev.map(s => s.id === id ? { ...s, is_active: currentStatus } : s));
    // }
  };

  const handleAddScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenName.trim()) return;

    const tempId = Math.random().toString();
    const newScreen: KitchenScreen = {
      id: tempId,
      name: newScreenName,
      is_active: true,
      last_seen: null,
      created_at: new Date().toISOString(),
    };

    setScreens(prev => [newScreen, ...prev]);
    setIsAdding(false);
    setNewScreenName('');

    // try {
    //   const { data } = await supabase.from('kitchen_screens').insert({ name: newScreenName, is_active: true }).select('id').single();
    //   if (data) {
    //     setScreens(prev => prev.map(s => s.id === tempId ? { ...s, id: data.id } : s));
    //   }
    // } catch (e) {
    //   setScreens(prev => prev.filter(s => s.id !== tempId));
    // }
  };

  if (isLoading) return <div className="text-gray-500 font-medium">Loading screens...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[#D62828] text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
        >
          Add new screen
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddScreen} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Screen Name
            </label>
            <input
              id="name"
              type="text"
              value={newScreenName}
              onChange={(e) => setNewScreenName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F7B731]"
              placeholder="e.g. Line Chef Monitor"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-[#D62828] text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewScreenName('');
            }}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {screens.map(screen => (
          <div key={screen.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">{screen.name}</h3>
                {screen.is_active ? (
                  <span className="bg-[#F7B731] bg-opacity-20 text-[#D62828] text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                    Active
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Last seen: {screen.last_seen ? new Date(screen.last_seen).toLocaleString() : 'Never'}
              </p>
            </div>
            
            <button
              onClick={() => handleToggleActive(screen.id, screen.is_active)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                screen.is_active 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-[#F7B731] text-black hover:bg-yellow-500'
              }`}
            >
              {screen.is_active ? 'Revoke' : 'Activate'}
            </button>
          </div>
        ))}
        {screens.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-100">
            No kitchen screens registered. Click "Add new screen" to begin.
          </div>
        )}
      </div>
    </div>
  );
}
