const fs = require('fs');
const path = require('path');

function replaceAllInFile(filePath, replacements) {
  const fullPath = path.join(__dirname, 'src', filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const [search, replace] of replacements) {
    if (typeof search === 'string') {
      content = content.split(search).join(replace);
    } else {
      content = content.replace(search, replace);
    }
  }
  fs.writeFileSync(fullPath, content);
}

const anyFiles = [
  'app/(developer)/dashboard/ErrorLogViewer.tsx',
  'app/(restaurant)/analytics/DateRangePicker.tsx',
  'app/(restaurant)/deals/DealFormDialog.tsx',
  'app/(restaurant)/deals/DealsList.tsx',
  'app/(restaurant)/feedback/FeedbackList.tsx',
  'app/(restaurant)/inventory/InventoryList.tsx',
  'app/(restaurant)/menu/IngredientTab.tsx',
  'app/(restaurant)/menu/MenuItemTab.tsx',
  'app/(restaurant)/reports/FinanceReportTab.tsx',
  'app/(restaurant)/reports/ReportDateRangePicker.tsx',
  'app/(restaurant)/riders/RidersList.tsx',
  'components/CustomerReceiptTemplate.tsx',
  'components/KOTTemplate.tsx'
];

for (const file of anyFiles) {
  replaceAllInFile(file, [
    [/:\s*any/g, ': unknown']
  ]);
}

// 9. AnalyticsClientWrapper
replaceAllInFile('app/(restaurant)/analytics/AnalyticsClientWrapper.tsx', [
  [/initialSummary,\s*initialPopular,\s*/g, ""]
]);

// 8. InventoryRow
replaceAllInFile('app/(restaurant)/inventory/InventoryRow.tsx', [
  [/const \[pendingAvailabilityUpdate,\s*setPendingAvailabilityUpdate\]\s*=\s*useState<boolean>\(false\);/g, ""]
]);

// 3. QuickAddSection
replaceAllInFile('components/cart/QuickAddSection.tsx', [
  [/import Image from 'next\/image'(\r?\n)/g, ""],
  [/import \{ motion \} from 'framer-motion'(\r?\n)/g, ""],
  [/import \{ useCartStore \} from '@\/store\/useCartStore'(\r?\n)/g, ""]
]);

// 4. CheckoutFormHeader
replaceAllInFile('components/checkout/CheckoutFormHeader.tsx', [
  [/initialPhone,\r?\n\s*/g, ""]
]);

// 5. ItemDetailModal and ItemDetailPricing
replaceAllInFile('components/home/ItemDetailModal.tsx', [
  [/import \{ formatPrice \} from '@\/lib\/utils\/formatPrice'(\r?\n)/g, ""]
]);
replaceAllInFile('components/home/ItemDetailPricing.tsx', [
  [/import \{ formatPrice \} from '@\/lib\/utils\/formatPrice'(\r?\n)/g, ""]
]);

// 6. AddressesSection
replaceAllInFile('components/profile/AddressesSection.tsx', [
  [/const \[addresses, setAddresses\] = useState/g, "const [addresses] = useState"]
]);

// 11. print-order.ts empty interface
replaceAllInFile('lib/print-order.ts', [
  [/export interface PrintOrderOptions\s*\{\s*\}/g, "export interface PrintOrderOptions { _empty?: never; }"]
]);

// 12. middleware.ts options unused
replaceAllInFile('middleware.ts', [
  [/const options = \{[\s\S]*?\};/g, ""]
]);

console.log('Fixed more occurrences');
