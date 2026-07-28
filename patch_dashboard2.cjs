const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const startIdx = code.indexOf('{showAddForm && (');
const endIdx = code.indexOf(')}', code.indexOf('</form>', startIdx)) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  code = code.slice(0, startIdx) + code.slice(endIdx);
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
  console.log('Removed form block');
} else {
  console.log('Could not find form block');
}
