const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// We need to remove the "Novo Líder" button and the whole `showAddForm` conditional rendering.
// And remove the `handleCreate` function entirely if it exists.
const createBtn = `<button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {showAddForm ? 'Cancelar' : <><Plus className="w-5 h-5 mr-2" /> Novo Líder</>}
          </button>`;
code = code.replace(createBtn, '');

// Removing the form part:
// We can use a regex or string replacement to take out the {showAddForm && ( ... )} block.
// Since it's huge, regex could be simpler:
code = code.replace(/\{showAddForm && \([\s\S]*?\}\)/, '');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('patched Dashboard.tsx');
