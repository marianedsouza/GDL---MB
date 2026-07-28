import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Phone, CheckCircle2, AlertCircle, Mail, MapPin, CreditCard } from 'lucide-react';

export default function PublicForm() {
  const { leaderId } = useParams();
  const [leaderName, setLeaderName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [cepError, setCepError] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeader = async () => {
      try {
        const res = await fetch(`/api/public/leaders/${leaderId}`);
        if (res.ok) {
          const data = await res.json();
          setLeaderName(data.name);
        } else {
          setError('Liderança não encontrada.');
        }
      } catch (err) {
        setError('Erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };
    if (leaderId) fetchLeader();
  }, [leaderId]);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCep(val);
    
    if (val.length === 8) {
      setLoadingCep(true);
      setCepError('');
      setStreet('');
      setCity('');
      try {
        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const data = await res.json();
        
        if (data.erro) {
          setCepError('CEP não encontrado.');
        } else if (data.uf !== 'MS') {
          setCepError('Apenas endereços do Mato Grosso do Sul (MS) são aceitos.');
        } else {
          setStreet(data.logradouro || '');
          setCity(data.localidade || '');
          // document.getElementById('addressNumber')?.focus(); // Optional
        }
      } catch (err) {
        setCepError('Erro ao buscar o CEP.');
      } finally {
        setLoadingCep(false);
      }
    } else {
      setCepError('');
      setStreet('');
      setCity('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !cpf || !cep || !addressNumber) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (cepError) {
      setError('Por favor, corrija o CEP antes de enviar.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const fullAddress = street ? `${street}, ${addressNumber} - ${city} (CEP: ${cep})` : `${cep}, Número: ${addressNumber}`;
      const res = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leaderId, 
          name, 
          phone, 
          email, 
          cpf, 
          address: fullAddress
        })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao enviar o formulário.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500">Carregando...</div>
      </div>
    );
  }

  if (error && !leaderName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Ops!</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full border border-slate-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Sucesso!</h1>
          <p className="text-slate-600">Seus dados foram enviados e vinculados à liderança de <strong className="text-slate-800">{leaderName}</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="bg-indigo-600 px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro</h1>
          <p className="text-indigo-100 text-sm">
            Preencha seus dados para se conectar com<br/>
            <strong className="text-white text-lg mt-1 block">{leaderName}</strong>
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">CPF</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone / WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">CEP (Apenas MS)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={9}
                  value={cep}
                  onChange={handleCepChange}
                  className={`block w-full pl-11 pr-4 py-3 bg-slate-50 border ${cepError ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all`}
                  placeholder="00000-000"
                />
              </div>
              {loadingCep && <p className="text-xs text-slate-500 mt-1">Buscando CEP...</p>}
              {cepError && <p className="text-xs text-red-600 mt-1">{cepError}</p>}
            </div>

            {street && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Rua</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Cidade</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Número</label>
                  <input
                    id="addressNumber"
                    type="text"
                    required
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    placeholder="Ex: 123"
                  />
                </div>
              </div>
            )}

            {!street && !cepError && cep.length === 8 && !loadingCep && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Número</label>
                  <input
                    type="text"
                    required
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    placeholder="Ex: 123"
                  />
                </div>
            )}

            <button
              type="submit"
              disabled={submitting || !!cepError || loadingCep}
              className="w-full mt-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? 'Enviando...' : 'Enviar Dados'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
