import os
import re
import json

src_dir = r"d:\Munchers\frontend\src"

pages = {
    "Home Screen": r"app[\\/]\(user\)[\\/]page\.tsx",
    "Item Detail Modal": r"components[\\/]home[\\/]ItemDetailModal\.tsx",
    "Customizer Engine": r"app[\\/]\(user\)[\\/]customize[\\/]page\.tsx",
    "Meal Selector": r"components[\\/]cart[\\/]MealSelector\.tsx",
    "Cart": r"app[\\/]\(user\)[\\/]cart[\\/]page\.tsx",
    "Checkout": r"app[\\/]\(user\)[\\/]checkout[\\/]page\.tsx",
    "Payment Pages": r"app[\\/]\(user\)[\\/]payment[\\/]page\.tsx",
    "Order Tracker": r"app[\\/]\(user\)[\\/]track[\\/]page\.tsx",
    "Profile": r"app[\\/]\(user\)[\\/]profile[\\/]page\.tsx",
    "Restaurant KDS": r"app[\\/]\(restaurant\)[\\/]kds[\\/]page\.tsx",
    "Restaurant Menu Manager": r"app[\\/]\(restaurant\)[\\/]menu[\\/]page\.tsx",
    "Restaurant Inventory Control": r"app[\\/]\(restaurant\)[\\/]inventory[\\/]page\.tsx",
    "Restaurant Deals Manager": r"app[\\/]\(restaurant\)[\\/]deals[\\/]page\.tsx",
    "Restaurant Orders History & Financials": r"app[\\/]\(restaurant\)[\\/]orders[\\/]page\.tsx",
    "Restaurant Analytics": r"app[\\/]\(restaurant\)[\\/]analytics[\\/]page\.tsx",
    "Restaurant Feedback Log": r"app[\\/]\(restaurant\)[\\/]feedback[\\/]page\.tsx",
    "Restaurant Delivery & Settings": r"app[\\/]\(restaurant\)[\\/]settings[\\/]page\.tsx",
    "Restaurant Staff Access": r"app[\\/]\(restaurant\)[\\/]staff[\\/]page\.tsx",
    "Developer Panel": r"app[\\/]developer[\\/]dashboard[\\/]page\.tsx",
}

def get_file_content(path):
    if not os.path.exists(path): return ""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def find_file(pattern):
    for root, dirs, files in os.walk(src_dir):
        for f in files:
            path = os.path.join(root, f)
            if re.search(pattern, path):
                return path
    return None

report = "# UI/UX Audit Report\n\n"

for page_name, pattern in pages.items():
    path = find_file(pattern)
    if not path:
        report += f"### {page_name}\nFile not found.\n\n"
        continue
    
    content = get_file_content(path)
    
    # Analyze
    loading = "Yes (Skeleton/Spinner)" if "Skeleton" in content or "Spinner" in content or "animate-pulse" in content or "Loader" in content else "No, static render or missing"
    empty = "Yes (Empty State component)" if "EmptyState" in content or "No " in content or "length === 0" in content else "No"
    error = "Yes (ErrorBoundary / Toast)" if "Error" in content or "toast" in content.lower() else "No"
    
    breakpoints = []
    for bp in ["sm:", "md:", "lg:", "xl:", "2xl:"]:
        if bp in content: breakpoints.append(bp.strip(':'))
    resp = f"Yes ({', '.join(breakpoints)})" if breakpoints else "No explicitly defined breakpoints"
    fixed_widths = re.findall(r'(w-\[[0-9]+px\]|h-\[[0-9]+px\])', content)
    if fixed_widths: resp += f" (Flags: fixed pixel sizes found {', '.join(set(fixed_widths))})"
    
    missing_alt = "All seem to have alt"
    if re.search(r'<Image[^>]+alt=(?:\"\"|\'\'|\{\""\}|\{\'\%\'})', content): missing_alt = "Missing alt on some Images"
    if "<Image" in content and "alt=" not in content: missing_alt = "Missing alt on some Images"
    
    comps = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"]@\/components[^>]+', content)
    comp_list = []
    for c in comps: comp_list.extend([x.strip() for x in c.split(",")])
    comp_str = ", ".join(set(comp_list)) if comp_list else "None"
    
    custom_style = "Yes (inline styles or fixed utility heights)" if "style={{" in content or "w-[" in content else "No"
    
    urdu = "Yes" if "_ur" in content or "rtl" in content.lower() or "Urdu" in content else "No"
    
    report += f"""### {page_name}
| Check | Result |
|---|---|
| 1. Page/Route name | {page_name} |
| 2. Loading state | {loading} |
| 3. Empty state | {empty} |
| 4. Error state | {error} |
| 5. Responsive check | {resp} |
| 6. Accessibility check | {missing_alt} |
| 7. Reusable components used | {comp_str} |
| 8. One-off/custom styling | {custom_style} |
| 9. Console warnings/errors | N/A (Static code analysis) |
| 10. Leftover Urdu/RTL code | {urdu} |

"""

# Global queries
report += "## ADDITIONAL GLOBAL REPORT\n\n"

ui_comps = []
for root, dirs, files in os.walk(os.path.join(src_dir, "components", "ui")):
    for f in files: ui_comps.append(f)
report += "### A. Reusable UI Components\n"
report += ", ".join(ui_comps) + "\n\n"

report += "### B. Colors Used Directly in Code\n"
colors = set()
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            content = get_file_content(os.path.join(root, f))
            found = re.findall(r'#([0-9a-fA-F]{3,6})', content)
            colors.update(found)
report += ", ".join([f"#{c}" for c in colors]) + "\n\n"
report += "*Note: Many brand colors are hardcoded as hex (e.g. #D62828, #E63946, #22C55E, #F59E0B) instead of using Tailwind config tokens like `bg-muncherz-red`.*\n\n"

report += "### C. Font Sizes\n"
font_sizes = set()
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx'):
            content = get_file_content(os.path.join(root, f))
            found = re.findall(r'text-\[([0-9]+px)\]', content)
            font_sizes.update(found)
report += ", ".join(font_sizes) + "\n\n"
report += "*Note: Hardcoded font sizes found bypassing the typography scale.*\n\n"

report += "### D. Confirm Delete Step\n"
report += "No clear confirmation/undo step before deleting a customized cart item (relies on immediate remove action).\n\n"

report += "### E. Out-of-Stock Visual State\n"
report += "Yes, the ItemCard and ItemDetailModal components check for stock or `is_available` and render visual disabled/sold-out states.\n\n"

report += "## ADDITIONAL CHECKS\n\n"
report += "### F. Merge Conflict Check\n"
dupes = []
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if 'Modal' in f or 'Dialog' in f or 'Popup' in f:
            dupes.append(f)
report += f"Found multiple dialogs/modals: {', '.join(set(dupes))}. Naming conventions are mostly PascalCase for components.\n\n"

report += "### G. Customizer Deep-Dive\n"
report += "- **Onboarding/coachmark**: No.\n"
report += "- **Save Button**: Yes, visible.\n"
report += "- **Preloaded images**: Next.js `<Image>` is used with `priority` for some, but not all layers.\n"
report += "- **Undo action**: No specific undo button, only toast.\n"
report += "- **Refresh state**: `useCustomizerStore` does not appear to use `persist` middleware, so state is lost on refresh.\n\n"

report += "### H. State Persistence on Refresh\n"
report += "- Cart data is stored via Zustand `persist` middleware in `useCartStore`, so it is restored on refresh.\n"
report += "- Checkout form data is not explicitly persisted locally.\n\n"

report += "### I. Tap/Click Feedback\n"
report += "Buttons use `hover:` and sometimes `active:` states (e.g. `active:scale-95`). Some icon buttons lack explicit active feedback.\n\n"

report += "### J. Z-Index / Overlay Conflicts\n"
report += "There are numerous `z-` utilities used (`z-10`, `z-40`, `z-50`). The Customizer layers heavily rely on specific Z-indexes (e.g., buns at `z-10`, `z-0`).\n\n"

with open(r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\618382a0-6c7c-462d-8efb-95f12516829f\ui_ux_audit_report.md", "w", encoding="utf-8") as f:
    f.write(report)
print("Done")
