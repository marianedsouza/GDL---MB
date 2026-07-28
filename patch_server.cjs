const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "direct_leader: payload.directLeader",
  "direct_leader: payload.directLeader,\n      address: `${payload.street || ''}, ${payload.addressNumber || 'S/N'} - ${payload.neighborhood || ''}, ${payload.city || ''} - CEP: ${payload.cep || ''}`"
);

fs.writeFileSync('server.ts', code);
console.log('Patched server.ts');
