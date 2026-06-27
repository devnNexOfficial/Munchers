import os
import re

src_dir = r"d:\Munchers\frontend\src"

pages = {
    "Home Screen": r"app[\\/]\(user\)[\\/]page\.tsx",
    "Cart": r"app[\\/]\(user\)[\\/]cart[\\/]page\.tsx",
    "Checkout": r"app[\\/]\(user\)[\\/]checkout[\\/]page\.tsx",
    "Order Tracker": r"app[\\/]\(user\)[\\/]track[\\/]page\.tsx",
    "Profile": r"app[\\/]\(user\)[\\/]profile[\\/]page\.tsx",
    "Customizer": r"app[\\/]\(user\)[\\/]customize[\\/]page\.tsx",
    "Restaurant KDS": r"app[\\/]\(restaurant\)[\\/]kds[\\/]page\.tsx",
    "Restaurant Menu": r"app[\\/]\(restaurant\)[\\/]menu[\\/]page\.tsx",
    "Restaurant Inventory": r"app[\\/]\(restaurant\)[\\/]inventory[\\/]page\.tsx",
    "Restaurant Deals": r"app[\\/]\(restaurant\)[\\/]deals[\\/]page\.tsx",
    "Restaurant Orders": r"app[\\/]\(restaurant\)[\\/]orders[\\/]page\.tsx",
    "Restaurant Analytics": r"app[\\/]\(restaurant\)[\\/]analytics[\\/]page\.tsx",
    "Restaurant Feedback": r"app[\\/]\(restaurant\)[\\/]feedback[\\/]page\.tsx",
    "Restaurant Settings": r"app[\\/]\(restaurant\)[\\/]settings[\\/]page\.tsx",
    "Restaurant Staff": r"app[\\/]\(restaurant\)[\\/]staff[\\/]page\.tsx",
    "Developer Dashboard": r"app[\\/]developer[\\/]dashboard[\\/]page\.tsx",
}

def analyze_page(filepath, page_name):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return f"Could not read {filepath}"

    loading = "Yes (Suspense/Skeleton)" if "Suspense" in content or "animate-pulse" in content or "Skeleton" in content or "Spinner" in content or "Loader" in content or "loading" in content.lower() else "No"
    empty = "Yes" if "empty" in content.lower() or "length === 0" in content or "No " in content else "No"
    error = "Yes" if "error" in content.lower() or "catch" in content else "No"
    
    breakpoints = []
    if "sm:" in content: breakpoints.append("sm")
    if "md:" in content: breakpoints.append("md")
    if "lg:" in content: breakpoints.append("lg")
    if "xl:" in content: breakpoints.append("xl")
    resp = "Yes (" + ", ".join(breakpoints) + ")" if breakpoints else "No"
    
    images = re.findall(r'<Image[^>]*alt=(?:\"\"|\'\'|\{\""\}|\{\'\%\'})', content)
    missing_alt = "Missing alt on some Images" if images else "All seem to have alt"
    
    components = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"]@\/components[^>]+', content)
    comp_list = []
    for c in components:
        comp_list.extend([x.strip() for x in c.split(",")])
    
    inline_styles = "Yes" if "style={{" in content or "w-[1" in content or "h-[1" in content else "No"
    
    urdu = "Yes" if "_ur" in content or "rtl" in content.lower() or "urdu" in content.lower() else "No"
    
    return f"""### {page_name}
| Check | Result |
|---|---|
| 1. Page/Route name | {page_name} |
| 2. Loading state | {loading} |
| 3. Empty state | {empty} |
| 4. Error state | {error} |
| 5. Responsive check | {resp} |
| 6. Accessibility check | {missing_alt} |
| 7. Reusable components used | {", ".join(comp_list) if comp_list else "None"} |
| 8. One-off/custom styling | {inline_styles} |
| 9. Console warnings/errors | N/A (Static analysis) |
| 10. Leftover Urdu/RTL code | {urdu} |
"""

report = "# UI/UX Audit Report\n\n"

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if not f.endswith(".tsx"): continue
        path = os.path.join(root, f)
        for name, pattern in pages.items():
            if re.search(pattern, path):
                report += analyze_page(path, name) + "\n"

with open("d:/Munchers/frontend/ui_ux_report_draft.md", "w", encoding="utf-8") as f:
    f.write(report)
print("Draft written")
