const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  const fullPath = path.join(__dirname, 'src', filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(fullPath, content);
}

// 1. Fix catch (e) and catch (err)
const catchReplacements = [
  [/catch\s*\(\s*e\s*\)\s*\{/g, 'catch {'],
  [/catch\s*\(\s*err\s*\)\s*\{/g, 'catch {']
];

const filesWithCatch = [
  'app/(developer)/dashboard/DeveloperDashboardClient.tsx',
  'app/(developer)/dashboard/PaymentSuccessRateCard.tsx',
  'app/(restaurant)/analytics/HeatmapPanel.tsx',
  'app/(restaurant)/analytics/PopularItemsPanel.tsx',
  'app/(restaurant)/deals/DealsList.tsx',
  'app/(restaurant)/delivery/RiderTab.tsx',
  'app/(restaurant)/feedback/FeedbackList.tsx',
  'app/(restaurant)/inventory/InventoryList.tsx',
  'app/(restaurant)/kds/KDSBoard.tsx',
  'app/(restaurant)/reports/FinanceReportTab.tsx',
  'app/(restaurant)/reports/OrderHistoryTab.tsx',
  'app/(restaurant)/staff/StaffList.tsx',
  'app/kitchen/KitchenOrdersView.tsx'
];

for (const file of filesWithCatch) {
  replaceInFile(file, catchReplacements);
}

// 2. CustomizerPageClient
replaceInFile('app/(user)/customize/CustomizerPageClient.tsx', [
  ['<BurgerCanvas ingredients={[]} />', '<BurgerCanvas ingredients={ingredients} />']
]);

// 3. QuickAddSection
replaceInFile('components/cart/QuickAddSection.tsx', [
  ["import Image from 'next/image'\n", ""],
  ["import { motion } from 'framer-motion'\n", ""],
  ["import { useCartStore } from '@/store/useCartStore'\n", ""]
]);

// 4. CheckoutFormHeader
replaceInFile('components/checkout/CheckoutFormHeader.tsx', [
  ["initialPhone,\n", ""]
]);

// 5. ItemDetailModal and ItemDetailPricing
replaceInFile('components/home/ItemDetailModal.tsx', [
  ["import { formatPrice } from '@/lib/utils/formatPrice'\n", ""]
]);
replaceInFile('components/home/ItemDetailPricing.tsx', [
  ["import { formatPrice } from '@/lib/utils/formatPrice'\n", ""]
]);

// 6. AddressesSection
replaceInFile('components/profile/AddressesSection.tsx', [
  ["const [addresses, setAddresses] = useState", "const [addresses] = useState"]
]);

// 7. KDSBoard unused useRef, playBeep
replaceInFile('app/(restaurant)/kds/KDSBoard.tsx', [
  ["import { useState, useEffect, useRef } from 'react'", "import { useState, useEffect } from 'react'"],
  ["const playBeep = () => {", "// const playBeep = () => {"]
]);

// 8. InventoryRow
replaceInFile('app/(restaurant)/inventory/InventoryRow.tsx', [
  ["const [pendingAvailabilityUpdate, setPendingAvailabilityUpdate] = useState<boolean>(false);", ""]
]);

// 9. AnalyticsClientWrapper
replaceInFile('app/(restaurant)/analytics/AnalyticsClientWrapper.tsx', [
  ["initialSummary, initialPopular, ", ""]
]);

// 10. RestaurantSettingsPage
replaceInFile('components/kds/RestaurantSettingsPage.tsx', [
  ["const res = await fetch", "await fetch"]
]);

// 11. print-order.ts empty interface
replaceInFile('lib/print-order.ts', [
  ["export interface PrintOrderOptions {}", "export interface PrintOrderOptions { _empty?: never }"]
]);

// 12. middleware.ts options unused
replaceInFile('middleware.ts', [
  ["const options = {", ""]
]);

// Now for 'any' replacements
// We will replace 'any' with 'unknown' for these specific files
const anyFiles = [
  'app/(developer)/dashboard/DeveloperDashboardClient.tsx',
  'app/(developer)/dashboard/types.ts',
  'app/(restaurant)/analytics/AnalyticsClientWrapper.tsx',
  'app/(restaurant)/analytics/DateRangePicker.tsx',
  'app/(restaurant)/deals/DealFormDialog.tsx',
  'app/(restaurant)/deals/DealItemsPanel.tsx',
  'app/(restaurant)/deals/DealsList.tsx',
  'app/(restaurant)/delivery/DeliverySettingsTab.tsx',
  'app/(restaurant)/feedback/FeedbackList.tsx',
  'app/(restaurant)/feedback/page.tsx',
  'app/(restaurant)/inventory/InventoryList.tsx',
  'app/(restaurant)/kds/KDSBoard.tsx',
  'app/(restaurant)/menu/ImageUploadField.tsx',
  'app/(restaurant)/menu/IngredientTab.tsx',
  'app/(restaurant)/menu/MenuItemTab.tsx',
  'app/(restaurant)/reports/FinanceReportTab.tsx',
  'app/(restaurant)/reports/ReportDateRangePicker.tsx',
  'app/(restaurant)/riders/RidersList.tsx',
  'components/CustomerReceiptTemplate.tsx',
  'components/KOTTemplate.tsx',
  'components/kds/RestaurantSettingsPage.tsx'
];

for (const file of anyFiles) {
  replaceInFile(file, [
    [/: any/g, ': unknown']
  ]);
}

console.log("Fixes applied.");
