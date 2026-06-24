'use client';

import { useState } from 'react';
import DateRangePicker, { DateRange } from './DateRangePicker';
import DailySummaryPanel from './DailySummaryPanel';
import RevenueChart from './RevenueChart';
import HeatmapPanel from './HeatmapPanel';
import PopularItemsPanel from './PopularItemsPanel';

// Assuming we would pass initial data down, but since components 
// are already written to fetch on mount, we'll just render them.
export default function AnalyticsClientWrapper({ initialSummary, initialPopular }: any) {
  const today = new Date().toISOString().split('T')[0];
  const [range, setRange] = useState<DateRange>({ from: today, to: today });

  return (
    <>
      <DateRangePicker range={range} onChange={setRange} />
      <DailySummaryPanel range={range} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart range={range} />
        <HeatmapPanel range={range} />
      </div>

      <PopularItemsPanel range={range} />
    </>
  );
}
