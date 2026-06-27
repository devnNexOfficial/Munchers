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

// Replace all occurrences of catch(e), catch(err), : any
const catchReplacements = [
  [/catch\s*\(\s*e\s*\)\s*\{/g, 'catch {'],
  [/catch\s*\(\s*err\s*\)\s*\{/g, 'catch {'],
  [/: any/g, ': unknown']
];

const allFiles = [
  'app/(developer)/dashboard/DeveloperDashboardClient.tsx',
  'app/(developer)/dashboard/PaymentSuccessRateCard.tsx',
  'app/(developer)/dashboard/ActiveUsersCard.tsx',
  'app/(developer)/dashboard/ActivityLogViewer.tsx',
  'app/(developer)/dashboard/AppHealthCard.tsx',
  'app/(developer)/dashboard/DbStatusCard.tsx',
  'app/(developer)/dashboard/ErrorLogViewer.tsx',
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
  'app/kitchen/KitchenOrdersView.tsx',
  'app/(developer)/dashboard/types.ts',
  'app/(restaurant)/analytics/AnalyticsClientWrapper.tsx',
  'app/(restaurant)/analytics/DateRangePicker.tsx',
  'app/(restaurant)/deals/DealFormDialog.tsx',
  'app/(restaurant)/deals/DealItemsPanel.tsx',
  'app/(restaurant)/delivery/DeliverySettingsTab.tsx',
  'app/(restaurant)/feedback/page.tsx',
  'app/(restaurant)/menu/ImageUploadField.tsx',
  'app/(restaurant)/menu/IngredientTab.tsx',
  'app/(restaurant)/menu/MenuItemTab.tsx',
  'app/(restaurant)/reports/ReportDateRangePicker.tsx',
  'app/(restaurant)/riders/RidersList.tsx',
  'components/CustomerReceiptTemplate.tsx',
  'components/KOTTemplate.tsx',
  'components/kds/RestaurantSettingsPage.tsx'
];

for (const file of allFiles) {
  replaceInFile(file, catchReplacements);
}
console.log('Fixed all err/e and any occurrences');
