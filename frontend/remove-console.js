const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/queries/home.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/console\.error\(.*?\)/g, '// console.error(...)');

fs.writeFileSync(filePath, content);
console.log('Removed console errors');
