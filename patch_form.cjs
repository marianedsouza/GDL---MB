const fs = require('fs');
let code = fs.readFileSync('src/pages/CadastroLideranca.tsx', 'utf8');
code = code.replace("email: '',", "email: '',\n    cep: '',\n    street: '',\n    addressNumber: '',");
code = code.replace("const [error, setError] = useState('');", "const [error, setError] = useState('');\n  const [cepError, setCepError] = useState('');\n  const [loadingCep, setLoadingCep] = useState(false);");

const cepHandler = `
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, cep: val });
    
    if (val.length === 8) {
      setLoadingCep(true);
      setCepError('');
      try {
        const res = await fetch(\`https://viacep.com.br/ws/\${val}/json/\`);
        const data = await res.json();
        
        if (data.erro) {
          setCepError('CEP não encontrado.');
        } else {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            cep: val
          }));
        }
      } catch (err) {
        setCepError('Erro ao buscar o CEP.');
      } finally {
        setLoadingCep(false);
      }
    } else {
      setCepError('');
    }
  };
`;

code = code.replace("const handleChange = ", cepHandler + "\n  const handleChange = ");

const addressBlockOriginal = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                <input required type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Região Administrativa</label>
                <input type="text" name="administrativeRegion" value={formData.administrativeRegion} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
            </div>`;

const addressBlockNew = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                <input required type="text" name="cep" value={formData.cep} onChange={handleCepChange} maxLength={8} placeholder="Somente números" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                {loadingCep && <span className="text-xs text-indigo-600 mt-1">Buscando CEP...</span>}
                {cepError && <span className="text-xs text-red-600 mt-1">{cepError}</span>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Rua / Logradouro</label>
                <input required type="text" name="street" value={formData.street} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número / Complemento</label>
                <input type="text" name="addressNumber" value={formData.addressNumber} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                <input required type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Região Administrativa</label>
                <input type="text" name="administrativeRegion" value={formData.administrativeRegion} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
            </div>`;

code = code.replace(addressBlockOriginal, addressBlockNew);
fs.writeFileSync('src/pages/CadastroLideranca.tsx', code);
console.log('patched CadastroLideranca.tsx');
