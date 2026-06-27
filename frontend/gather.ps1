echo "--- A. UI Components ---" > metrics.txt
Get-ChildItem -Path d:\Munchers\frontend\src\components\ui -Recurse -Filter *.tsx | Select-Object FullName | Out-File -Append metrics.txt
echo "--- B. Colors ---" >> metrics.txt
git grep -E "#[0-9a-fA-F]{3,8}|rgb\(" -- d:\Munchers\frontend\src | Out-File -Append metrics.txt
echo "--- C. Font Sizes ---" >> metrics.txt
git grep -E "text-\[[0-9]+px\]" -- d:\Munchers\frontend\src | Out-File -Append metrics.txt
echo "--- D. Cart Delete ---" >> metrics.txt
git grep -E -i "delete|remove|confirm" -- d:\Munchers\frontend\src\components\cart | Out-File -Append metrics.txt
echo "--- E. Out of stock ---" >> metrics.txt
git grep -E -i "stock|sold|available" -- d:\Munchers\frontend\src\components\home d:\Munchers\frontend\src\components\menu | Out-File -Append metrics.txt
echo "--- F. Duplicates ---" >> metrics.txt
Get-ChildItem -Path d:\Munchers\frontend\src -Recurse -Include *Modal*,*Dialog*,*Popup* | Select-Object FullName | Out-File -Append metrics.txt
echo "--- G/H. Customizer & Store ---" >> metrics.txt
git grep -i "localstorage\|sessionstorage\|persist" -- d:\Munchers\frontend\src\store | Out-File -Append metrics.txt
echo "--- I. Active State ---" >> metrics.txt
git grep -i "active:" -- d:\Munchers\frontend\src\components | Out-File -Append metrics.txt
echo "--- J. Z-Index ---" >> metrics.txt
git grep -E "z-[0-9]+" -- d:\Munchers\frontend\src | Out-File -Append metrics.txt
