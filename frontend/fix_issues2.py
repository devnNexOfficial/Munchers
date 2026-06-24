import re, os

base = r'd:\Munchers\frontend\src'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# ============================================================
# FIX 5: AbortController for fetch race conditions
# ============================================================

# Pattern: each file does a useEffect with fetch, no cleanup.
# We need to add AbortController + cleanup return.

abort_files = {
    f'{base}\\app\\(restaurant)\\analytics\\DailySummaryPanel.tsx': {
        'old': """  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics/daily?from=${range.from}&to=${range.to}`);
        if (res.ok) setData(await res.json());
      } catch (e) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [range]);""",
        'new': """  useEffect(() => {
    const controller = new AbortController();
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics/daily?from=${range.from}&to=${range.to}`, { signal: controller.signal });
        if (res.ok && !controller.signal.aborted) setData(await res.json());
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    fetchSummary();
    return () => controller.abort();
  }, [range]);"""
    },
    f'{base}\\app\\(restaurant)\\analytics\\PopularItemsPanel.tsx': {
        'fetch_url': '/api/analytics/popular-items',
        'range_params': True
    },
    f'{base}\\app\\(restaurant)\\analytics\\HeatmapPanel.tsx': {
        'fetch_url': '/api/analytics/heatmap',
        'range_params': True
    },
    f'{base}\\app\\(restaurant)\\analytics\\RevenueChart.tsx': {
        'fetch_url': '/api/analytics/revenue-chart',
        'range_params': True
    },
}

# DailySummaryPanel — direct replacement
p = f'{base}\\app\\(restaurant)\\analytics\\DailySummaryPanel.tsx'
content = read_file(p)
old = abort_files[p]['old']
new = abort_files[p]['new']
# Try both line ending variants
for le_old, le_new in [('\n', '\n'), ('\r\n', '\r\n')]:
    old_v = old.replace('\n', le_old)
    new_v = new.replace('\n', le_new)
    if old_v in content:
        content = content.replace(old_v, new_v)
        print(f"FIXED AbortController: DailySummaryPanel.tsx")
        break
write_file(p, content)

# For the other analytics files, use a regex approach
for filepath in [
    f'{base}\\app\\(restaurant)\\analytics\\PopularItemsPanel.tsx',
    f'{base}\\app\\(restaurant)\\analytics\\HeatmapPanel.tsx',
    f'{base}\\app\\(restaurant)\\analytics\\RevenueChart.tsx',
]:
    content = read_file(filepath)
    fname = os.path.basename(filepath)
    
    # Add AbortController to the fetch useEffect
    # Pattern: useEffect(() => { ... fetch( ... }, [range]);
    # Add controller + signal + cleanup
    
    # Simple approach: find fetch() call and add signal, add cleanup return
    if 'controller.abort()' not in content:
        # Add controller creation after useEffect opening
        content = content.replace(
            "  useEffect(() => {\n",
            "  useEffect(() => {\n    const controller = new AbortController();\n",
            1
        )
        content = content.replace(
            "  useEffect(() => {\r\n",
            "  useEffect(() => {\r\n    const controller = new AbortController();\r\n",
            1
        )
        
        # Add signal to fetch calls
        content = re.sub(
            r"await fetch\(`([^`]+)`\)",
            r"await fetch(`\1`, { signal: controller.signal })",
            content,
            count=1
        )
        
        # Add cleanup return before }, [range]);
        content = content.replace(
            "  }, [range]);",
            "    return () => controller.abort();\n  }, [range]);",
            1
        )
        
        print(f"FIXED AbortController: {fname}")
    
    write_file(filepath, content)

# OrderHistoryTab and FinanceReportTab
for filepath in [
    f'{base}\\app\\(restaurant)\\reports\\OrderHistoryTab.tsx',
    f'{base}\\app\\(restaurant)\\reports\\FinanceReportTab.tsx',
]:
    content = read_file(filepath)
    fname = os.path.basename(filepath)
    
    if 'controller.abort()' not in content:
        # These use a different pattern — add controller to first useEffect
        content = content.replace(
            "  useEffect(() => {\n",
            "  useEffect(() => {\n    const controller = new AbortController();\n",
            1
        )
        content = content.replace(
            "  useEffect(() => {\r\n",
            "  useEffect(() => {\r\n    const controller = new AbortController();\r\n",
            1
        )
        
        # Add signal to first fetch
        content = re.sub(
            r"await fetch\(`([^`]+)`\)",
            r"await fetch(`\1`, { signal: controller.signal })",
            content,
            count=1
        )
        
        # Find first }, [ pattern and add cleanup
        # Use regex to find first closing of useEffect
        content = re.sub(
            r"(  }, \[[\w, ]+\]);",
            r"    return () => controller.abort();\n\1",
            content,
            count=1
        )
        
        print(f"FIXED AbortController: {fname}")
    
    write_file(filepath, content)

# ============================================================
# FIX 9: Replace <img> with next/image (remove eslint-disable too)
# ============================================================

# Remove all eslint-disable @next/next/no-img-element comments
img_files = [
    f'{base}\\components\\kds\\QRCodeFlow.tsx',
    f'{base}\\app\\(restaurant)\\menu\\CategoryTab.tsx',
    f'{base}\\app\\(restaurant)\\menu\\MenuItemTab.tsx',
    f'{base}\\app\\(restaurant)\\menu\\IngredientTab.tsx',
    f'{base}\\app\\(restaurant)\\menu\\ImageUploadField.tsx',
    f'{base}\\app\\(restaurant)\\feedback\\FeedbackRow.tsx',
    f'{base}\\app\\(restaurant)\\deals\\DealRow.tsx',
]

for filepath in img_files:
    if not os.path.exists(filepath):
        print(f"SKIP (not found): {filepath}")
        continue
    content = read_file(filepath)
    fname = os.path.basename(filepath)
    
    # Remove eslint-disable comment
    content = content.replace("/* eslint-disable @next/next/no-img-element */\n", "")
    content = content.replace("/* eslint-disable @next/next/no-img-element */\r\n", "")
    
    # Add Image import if not present
    if "import Image from 'next/image'" not in content:
        # Add after last import or after 'use client'
        if "from '" in content or 'from "' in content:
            # Find the last import line
            lines = content.split('\n')
            last_import = 0
            for i, line in enumerate(lines):
                if line.strip().startswith('import '):
                    last_import = i
            lines.insert(last_import + 1, "import Image from 'next/image';")
            content = '\n'.join(lines)
        else:
            content = "import Image from 'next/image';\n" + content
    
    # Replace <img> patterns with <Image>
    # Pattern: <img src={...} alt={...} className="..." />
    # We need to add width/height or fill prop
    
    # For small thumbnails (w-8, w-10, w-12), use explicit width/height
    content = re.sub(
        r'<img src=\{([^}]+)\} alt=\{([^}]+)\} className="([^"]*w-12[^"]*)" />',
        r'<Image src={\1} alt={\2} width={48} height={48} className="\3" />',
        content
    )
    content = re.sub(
        r'<img src=\{([^}]+)\} alt=\{([^}]+)\} className="([^"]*w-10[^"]*)" />',
        r'<Image src={\1} alt={\2} width={40} height={40} className="\3" />',
        content
    )
    content = re.sub(
        r'<img src=\{([^}]+)\} alt=\{([^}]+)\} className="([^"]*w-8[^"]*)" />',
        r'<Image src={\1} alt={\2} width={32} height={32} className="\3" />',
        content
    )
    # For w-24 h-24
    content = re.sub(
        r'<img src=\{([^}]+)\} alt="([^"]*)" className="([^"]*w-24[^"]*)" />',
        r'<Image src={\1} alt="\2" width={96} height={96} className="\3" />',
        content
    )
    # For w-full h-full (use fill)
    content = re.sub(
        r'<img src=\{([^}]+)\} alt="([^"]*)" className="([^"]*w-full h-full[^"]*)" />',
        r'<Image src={\1} alt="\2" fill className="\3" />',
        content
    )
    # For QR codes — mx-auto with specific sizes
    content = re.sub(
        r'<img src=\{([^}]+)\} alt=\{([^}]+)\} className="mx-auto" />',
        r'<Image src={\1} alt={\2} width={200} height={200} className="mx-auto" />',
        content
    )
    content = re.sub(
        r'<img src=\{([^}]+)\} alt=\{([^}]+)\} className="([^"]*w-32 h-32[^"]*)" />',
        r'<Image src={\1} alt={\2} width={128} height={128} className="\3" />',
        content
    )
    # Generic fallback: any remaining <img with class
    content = re.sub(
        r'<img src=\{([^}]+)\} alt="([^"]*)" className="([^"]*)" />',
        r'<Image src={\1} alt="\2" width={200} height={200} className="\3" />',
        content
    )
    # img with empty alt
    content = re.sub(
        r'<img src=\{([^}]+)\} alt="" className="([^"]*)" />',
        r'<Image src={\1} alt="" width={48} height={48} className="\2" />',
        content
    )
    
    write_file(filepath, content)
    print(f"FIXED img->Image: {fname}")

print("\nAll FIX 5 + FIX 9 done.")
