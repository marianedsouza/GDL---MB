import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Trash2, Link as LinkIcon, Users, ExternalLink, Download, Share2, Copy, Check, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

interface Leader {
  _id: string;
  name: string;
  phone: string;
  leadsCount: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newCep, setNewCep] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newAddressNumber, setNewAddressNumber] = useState('');
  const [newCepError, setNewCepError] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLeaders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setLeaders(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setFetchError('Erro ao carregar dados: ' + (errData.details || errData.error || res.status));
      }
    } catch (err) {
      setFetchError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setNewCep(val);
    
    if (val.length === 8) {
      setLoadingCep(true);
      setNewCepError('');
      setNewStreet('');
      setNewCity('');
      try {
        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const data = await res.json();
        
        if (data.erro) {
          setNewCepError('CEP não encontrado.');
        } else if (data.uf !== 'MS') {
          setNewCepError('Apenas endereços do Mato Grosso do Sul (MS) são aceitos.');
        } else {
          setNewStreet(data.logradouro || '');
          setNewCity(data.localidade || '');
        }
      } catch (err) {
        setNewCepError('Erro ao buscar o CEP.');
      } finally {
        setLoadingCep(false);
      }
    } else {
      setNewCepError('');
      setNewStreet('');
      setNewCity('');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newEmail || !newCpf || !newCep || !newAddressNumber) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    if (newCepError) {
      alert("Por favor, corrija o CEP antes de salvar.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const fullAddress = newStreet ? `${newStreet}, ${newAddressNumber} - ${newCity} (CEP: ${newCep})` : `${newCep}, Número: ${newAddressNumber}`;
      
      const res = await fetch('/api/leaders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newName, 
          phone: newPhone,
          email: newEmail,
          cpf: newCpf,
          address: fullAddress
        })
      });

      if (res.ok) {
        setNewName('');
        setNewPhone('');
        setNewEmail('');
        setNewCpf('');
        setNewCep('');
        setNewStreet('');
        setNewCity('');
        setNewAddressNumber('');
        setNewCepError('');
        setShowAddForm(false);
        fetchLeaders();
      } else {
        const errorData = await res.json();
        if (errorData.details && errorData.details.includes("Could not find the")) {
           alert("As colunas 'email', 'cpf' e 'address' precisam ser adicionadas à tabela 'leaders' no seu painel do Supabase para salvar esses dados. Erro: " + errorData.details);
        } else {
           alert(`Erro ao salvar liderança: ${errorData.details || errorData.error}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao salvar liderança.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza? Isso apagará todos os contatos vinculados a este líder.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leaders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchLeaders();
      } else {
        const errorData = await res.json();
        alert(`Erro ao apagar liderança: ${errorData.details || errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao apagar liderança.");
    }
  };

  const getFormUrl = (id: string) => {
    return `${window.location.origin}/form/${id}`;
  };

  const downloadQR = async (leaderId: string, leaderName: string) => {
    const svgEl = document.getElementById(`qr-${leaderId}`);
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 4;
      canvas.height = img.height * 4;
      ctx!.scale(4, 4);
      ctx!.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const a = document.createElement('a');
      a.download = `qrcode-${leaderName.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  const generateQRImage = async (leaderId: string): Promise<Blob | null> => {
    const svgEl = document.getElementById(`qr-${leaderId}`);
    if (!svgEl) return null;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * 4;
        canvas.height = img.height * 4;
        const ctx = canvas.getContext('2d');
        ctx!.scale(4, 4);
        ctx!.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  };

  const copyLink = async (leaderId: string) => {
    try {
      await navigator.clipboard.writeText(getFormUrl(leaderId));
      setCopiedId(leaderId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt('Copie o link manualmente:', getFormUrl(leaderId));
    }
  };

  const shareWhatsApp = async (leaderId: string, leaderName: string) => {
    const formUrl = getFormUrl(leaderId);
    const message = `*Formulário de Cadastro - ${leaderName}*\n\nAcesse o link abaixo para se cadastrar:\n${formUrl}`;

    const qrBlob = await generateQRImage(leaderId);

    if (navigator.share && qrBlob) {
      const qrFile = new File([qrBlob], `qrcode-${leaderName}.png`, { type: 'image/png' });
      try {
        await navigator.share({ files: [qrFile], text: message });
        return;
      } catch {}
    }

    if (navigator.share) {
      try {
        await navigator.share({ text: message });
        return;
      } catch {}
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lideranças</h1>
          <p className="text-slate-500">Gerencie seus líderes e seus respectivos QR Codes.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/cadastro"
            target="_blank"
            className="flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-5 h-5 mr-2" /> Formulário Público
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      ) : fetchError ? (
        <div className="text-center py-16 bg-white rounded-xl border border-red-200 border-dashed">
          <AlertCircle className="mx-auto h-12 w-12 text-red-300 mb-3" />
          <p className="text-red-500 font-medium">{fetchError}</p>
          <button onClick={() => { setLoading(true); setFetchError(''); fetchLeaders(); }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tentar novamente
          </button>
          <button onClick={() => navigate('/admin/login')}
            className="mt-2 mx-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
          >
            Fazer login novamente
          </button>
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma liderança cadastrada</p>
          <p className="text-sm text-slate-400 mt-1">Clique em "Novo Líder" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leaders.map(leader => (
            <div key={leader._id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{leader.name}</h3>
                  <p className="text-slate-500 text-sm">{leader.phone}</p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/leads/${leader._id}`}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Ver Contatos"
                  >
                    <Users className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(leader._id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir Líder"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-white p-2 border border-slate-200 rounded-lg">
                    <QRCodeSVG id={`qr-${leader._id}`} value={getFormUrl(leader._id)} size={80} level="L" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => downloadQR(leader._id, leader.name)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Baixar QR Code"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => shareWhatsApp(leader._id, leader.name)}
                      className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Compartilhar no WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 mb-1">
                    Link do Formulário
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <input 
                      type="text"
                      readOnly
                      value={getFormUrl(leader._id)}
                      className="text-xs w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-500 truncate outline-none"
                    />
                    <button
                      onClick={() => copyLink(leader._id)}
                      className={`p-1.5 border rounded transition-colors ${
                        copiedId === leader._id
                          ? 'text-green-600 bg-green-50 border-green-200'
                          : 'text-slate-400 hover:text-slate-600 bg-slate-50 border-slate-200'
                      }`}
                      title="Copiar Link"
                    >
                      {copiedId === leader._id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a 
                      href={getFormUrl(leader._id)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 rounded transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
                      {leader.leadsCount} {leader.leadsCount === 1 ? 'Contato' : 'Contatos'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
