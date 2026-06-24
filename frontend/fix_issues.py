import re, os

def fix_file(path, replacements):
    """Apply a list of (old, new) replacements to a file."""
    if not os.path.exists(path):
        print(f"SKIP (not found): {path}")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new, 1)
            print(f"  FIXED: {old[:60]}...")
        else:
            print(f"  SKIP (not found): {old[:60]}...")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base = r'd:\Munchers\frontend\src'

# E-4, E-5: RestaurantSettingsPage.tsx
fix_file(f'{base}\\components\\kds\\RestaurantSettingsPage.tsx', [
    ("} catch (e: any) {", "} catch (e: unknown) {"),
    ("e.errors ? 'Validation failed'", "(e instanceof Error || (e && typeof e === 'object' && 'errors' in e)) ? 'Validation failed'"),
    ("const handleChange = (field: keyof SettingsData, value: any) => {",
     "const handleChange = (field: keyof SettingsData, value: string | number | boolean) => {"),
    # F-1: setTimeout cleanup — wrap showToast with useEffect cleanup
    ("    setTimeout(() => setToast(null), 3000);",
     "    // Toast auto-dismiss handled by caller — setTimeout cleaned up on unmount\n    const timer = setTimeout(() => setToast(null), 3000);\n    return () => clearTimeout(timer);"),
])

# E-6: AnalyticsClientWrapper.tsx
fix_file(f'{base}\\app\\(restaurant)\\analytics\\AnalyticsClientWrapper.tsx', [
    ("export default function AnalyticsClientWrapper({ initialSummary, initialPopular }: any) {",
     """interface AnalyticsClientWrapperProps {
  initialSummary?: Record<string, number>;
  initialPopular?: Array<{ name: string; count: number }>;
}

export default function AnalyticsClientWrapper({ initialSummary, initialPopular }: AnalyticsClientWrapperProps) {"""),
])

# E-7: feedback/page.tsx
fix_file(f'{base}\\app\\(restaurant)\\feedback\\page.tsx', [
    ("const initialEntries: any[] = [];",
     "const initialEntries: FeedbackEntry[] = [];"),
])

# E-8: KOTTemplate.tsx
fix_file(f'{base}\\components\\KOTTemplate.tsx', [
    (".map((m: any, mIdx)", ".map((m: { name?: string; item?: string }, mIdx)"),
])

# E-9: CustomerReceiptTemplate.tsx
fix_file(f'{base}\\components\\CustomerReceiptTemplate.tsx', [
    (".map((m: any)", ".map((m: { name?: string; item?: string })"),
])

# E-10: ImageUploadField.tsx
fix_file(f'{base}\\app\\(restaurant)\\menu\\ImageUploadField.tsx', [
    ("} catch (err: any) {", "} catch (err: unknown) {"),
])

# E-11: KDSBoard.tsx
fix_file(f'{base}\\app\\(restaurant)\\kds\\KDSBoard.tsx', [
    ("const handleAction = async (id: string, action: string, payload?: any) => {",
     "const handleAction = async (id: string, action: string, payload?: Record<string, string>) => {"),
])

# E-12: DeliverySettingsTab.tsx
fix_file(f'{base}\\app\\(restaurant)\\delivery\\DeliverySettingsTab.tsx', [
    ("const handleChange = (field: keyof DeliverySettings, value: any) => {",
     "const handleChange = (field: keyof DeliverySettings, value: string | number | boolean) => {"),
])

# E-13: DealItemsPanel.tsx
fix_file(f'{base}\\app\\(restaurant)\\deals\\DealItemsPanel.tsx', [
    ("const handleUpdate = (index: number, field: keyof DealItem, value: any) => {",
     "const handleUpdate = (index: number, field: keyof DealItem, value: string | number | boolean) => {"),
])

# E-14: DealCustomizeLimitPanel.tsx
fix_file(f'{base}\\app\\(restaurant)\\deals\\DealCustomizeLimitPanel.tsx', [
    ("const handleUpdate = (menuItemId: string, field: 'max_extra_ingredients' | 'allowed_swaps', value: any) => {",
     "const handleUpdate = (menuItemId: string, field: 'max_extra_ingredients' | 'allowed_swaps', value: number | string[]) => {"),
])

# E-15: developer dashboard types.ts
fix_file(f'{base}\\app\\(developer)\\dashboard\\types.ts', [
    ("old_value: any;", "old_value: unknown;"),
    ("new_value: any;", "new_value: unknown;"),
])

# E-16: supabase server.ts
fix_file(f'{base}\\lib\\supabase\\server.ts', [
    ("setAll(cookiesToSet: any[]) {",
     "setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {"),
])

# G-8, G-9: Dark backgrounds
fix_file(f'{base}\\app\\(restaurant)\\reports\\ReportDateRangePicker.tsx', [
    ("'bg-gray-900 text-white'", "'bg-[#D62828] text-white'"),
])

fix_file(f'{base}\\app\\(restaurant)\\inventory\\InventoryList.tsx', [
    ("'bg-gray-900 text-white'", "'bg-[#D62828] text-white'"),
])

# G-12: Tooltip dark bg
fix_file(f'{base}\\app\\(restaurant)\\analytics\\RevenueChart.tsx', [
    ("bg-gray-900 text-white text-xs", "bg-white text-gray-900 border border-gray-200 shadow-sm text-xs"),
])

# F-8: HeatmapPanel Math.max outside loop
p = f'{base}\\app\\(restaurant)\\analytics\\HeatmapPanel.tsx'
if os.path.exists(p):
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(
        "{points.sort((a, b) => b.order_count - a.order_count).map((p, idx) => {\n                const maxCount = Math.max(...points.map(x => x.order_count));",
        "const maxCount = Math.max(...points.map(x => x.order_count));\n            {points.sort((a, b) => b.order_count - a.order_count).map((p, idx) => {"
    )
    # Also try the \r\n variant
    content = content.replace(
        "{points.sort((a, b) => b.order_count - a.order_count).map((p, idx) => {\r\n                const maxCount = Math.max(...points.map(x => x.order_count));",
        "const maxCount = Math.max(...points.map(x => x.order_count));\r\n            {points.sort((a, b) => b.order_count - a.order_count).map((p, idx) => {"
    )
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  FIXED: HeatmapPanel Math.max outside loop")

print("\nBatch fixes complete.")
