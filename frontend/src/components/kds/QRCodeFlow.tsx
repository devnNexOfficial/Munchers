/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';

// Using external API for simplicity as requested
const generateQRUrl = (url: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

export default function QRCodeFlow({ qrEnabled }: { qrEnabled: boolean }) {
  const [maxTables, setMaxTables] = useState<number>(10);
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  if (!qrEnabled) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-[#D62828] mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">QR Dine-in is Disabled</h2>
        <p className="text-gray-500">Enable QR in Settings first to generate table QR codes.</p>
      </div>
    );
  }

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://muncherz.com'; // fallback
  };

  const getTableUrl = (table: number) => `${getBaseUrl()}/?table=${table}`;

  const renderSingleView = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto text-center print:shadow-none print:border-0 print:p-0">
      <div className="print:hidden mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Select Table Number</label>
        <input 
          type="number" 
          min="1" 
          max={maxTables} 
          value={selectedTable} 
          onChange={(e) => setSelectedTable(Number(e.target.value))}
          className="w-full text-center border border-gray-300 rounded p-2 focus:ring-[#D62828] mb-4"
        />
      </div>

      <div className="border-4 border-[#0A0A0A] p-4 rounded-xl inline-block mb-4">
        <h3 className="text-2xl font-black text-[#D62828] uppercase mb-4 tracking-wider">Table {selectedTable}</h3>
        <img src={generateQRUrl(getTableUrl(selectedTable))} alt={`Table ${selectedTable} QR`} className="mx-auto" />
        <p className="text-xs text-gray-500 mt-4 font-medium uppercase tracking-widest">Scan to Order</p>
      </div>

      <div className="print:hidden">
        <button 
          onClick={() => window.print()}
          className="w-full bg-[#D62828] text-white font-bold py-3 rounded-lg hover:bg-[#b02121] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Print QR Code
        </button>
      </div>
    </div>
  );

  const renderGridView = () => {
    const tables = Array.from({ length: maxTables }, (_, i) => i + 1);
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-0 print:p-0">
        <div className="print:hidden flex items-center justify-between mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Total Tables</label>
            <input 
              type="number" 
              min="1" 
              value={maxTables} 
              onChange={(e) => setMaxTables(Number(e.target.value))}
              className="border border-gray-300 rounded p-1 w-24 focus:ring-[#D62828]"
            />
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-[#D62828] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#b02121] transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4">
          {tables.map(t => (
            <div key={t} className="border-2 border-gray-200 p-4 rounded-xl text-center page-break-inside-avoid">
              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-wide">Table {t}</h3>
              <img src={generateQRUrl(getTableUrl(t))} alt={`Table ${t} QR`} className="mx-auto w-32 h-32 mb-2" />
              <p className="text-[10px] text-gray-500 font-bold uppercase">Muncherz Dine-in</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="print:hidden flex justify-center gap-2 mb-8">
        <button 
          onClick={() => setViewMode('single')}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${viewMode === 'single' ? 'bg-[#0A0A0A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Single QR
        </button>
        <button 
          onClick={() => setViewMode('grid')}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${viewMode === 'grid' ? 'bg-[#0A0A0A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Grid View (Print All)
        </button>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-flow-container, #qr-flow-container * {
            visibility: visible;
          }
          #qr-flow-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .page-break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>

      <div id="qr-flow-container">
        {viewMode === 'single' ? renderSingleView() : renderGridView()}
      </div>
    </div>
  );
}
