import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Briefcase, CheckCircle2, AlertCircle, Loader2, ExternalLink, Copy, Check, UserCheck, Info } from 'lucide-react';
import { getRegioesPorBairro } from '../utils/regioes';
import { formatPhone, formatCpf, formatCep } from '../utils/masks';

const REGIOES = ['Anhanduizinho', 'Bandeira', 'Centro', 'Imbirussu', 'Lagoa', 'Prosa', 'Segredo', 'Distritos', 'Outro'];
const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

export default function CadastroLideranca() {
  const [formData, setFormData] = useState({
    fullName: '',
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    cpf: '',
    sexo: '',
    cep: '',
    street: '',
    addressNumber: '',
    neighborhood: '',
    administrativeRegions: [] as string[],
    city: '',
    role: '',
    directLeader: '',
    segment: '',
    targetNeighborhoods: '',
    estimatedMobilization: '',
    hasWhatsappGroup: '',
    whatsappGroupParticipants: '',
    availableDays: '',
    hasVehicle: '',
    canWalk: '',
    canOrganizeMeetings: '',
    canHostMeetings: '',
    skills: [] as string[],
    commitmentAgreed: false,
    lgpdAgreed: false
  });

  const [customSkill, setCustomSkill] = useState('');
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  const [searchParams] = useSearchParams();
  const urlLeaderId = searchParams.get('leaderId');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedLeaderId, setSubmittedLeaderId] = useState('');
  const [error, setError] = useState('');
  const [cepError, setCepError] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    fetch('/api/public/form-status')
      .then(r => r.json())
      .then(data => setFormActive(data.active ?? true))
      .catch(() => {});
  }, []);


  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep: val }));

    if (val.length === 8) {
      setLoadingCep(true);
      setCepError('');
      try {
        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const data = await res.json();

        if (data.erro) {
          setCepError('CEP não encontrado.');
        } else if (data.uf !== 'MS') {
          setCepError('Apenas endereços do Mato Grosso do Sul (MS) são aceitos.');
        } else {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            administrativeRegions: getRegioesPorBairro(data.bairro || '', data.localidade || ''),
            cep: val
          }));
        }
      } catch {
        setCepError('Erro ao buscar o CEP.');
      } finally {
        setLoadingCep(false);
      }
    } else {
      setCepError('');
    }
  };

  const getRegioesPorCidade = (cidade: string): string[] => {
    const c = cidade.toLowerCase().trim();
    if (c === 'campo grande') {
      return ['Anhanduizinho', 'Bandeira', 'Centro', 'Imbirussu', 'Lagoa', 'Prosa', 'Segredo', 'Outro'];
    }
    return ['Distritos', 'Outro'];
  };

  const toggleAvailableDay = (day: string) => {
    const current = formData.availableDays ? formData.availableDays.split(', ').filter(Boolean) : [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    setFormData({ ...formData, availableDays: next.join(', ') });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name: fieldName, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (fieldName === 'commitmentAgreed' || fieldName === 'lgpdAgreed') {
        setFormData({ ...formData, [fieldName]: checked });
      } else {
        const newSkills = checked 
          ? [...formData.skills, value] 
          : formData.skills.filter(s => s !== value);
        setFormData({ ...formData, skills: newSkills });
      }
    } else {
      setFormData({ ...formData, [fieldName]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.commitmentAgreed) {
      setError('Você deve concordar com o termo de compromisso.');
      return;
    }
    if (!formData.lgpdAgreed) {
      setError('Você deve concordar com o termo de consentimento LGPD.');
      return;
    }
    setSubmitting(true);
    setError('');

    const skills = formData.skills.includes('Outra') && customSkill.trim()
      ? [...formData.skills.filter(s => s !== 'Outra'), customSkill.trim()]
      : formData.skills;

    try {
      const res = await fetch('/api/public/leaders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: formatPhone(formData.phone), skills })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setSubmittedLeaderId(data._id || data.id);
      } else {
        if (data.details && data.details.includes("Could not find the")) {
           setError("Erro: Você precisa adicionar as novas colunas à tabela 'leaders' no Supabase. " + data.details);
        } else {
           setError(data.error || 'Erro ao realizar cadastro.');
        }
      }
    } catch (err) {
      setError('Erro de conexão ao enviar o formulário.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!formActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full border border-slate-200">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Link Pausado</h1>
          <p className="text-slate-600">Este link está temporariamente indisponível. Entre em contato com os administradores.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-slate-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Cadastro Realizado!</h2>
          <p className="text-slate-600 mb-2">
            Obrigado por se juntar à Equipe MB, <strong>{formData.fullName}</strong>.
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Seu cadastro foi realizado com sucesso.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 text-slate-600 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Fazer novo cadastro
            </button>
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Guarde este link para continuar depois</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/cadastro?leaderId=${submittedLeaderId}`}
                className="text-xs w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 truncate outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/cadastro?leaderId=${submittedLeaderId}`);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className={`p-2 border rounded-lg transition-colors shrink-0 ${
                  copiedUrl
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : 'text-slate-400 hover:text-slate-600 bg-white border-slate-200'
                }`}
              >
                {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={`/cadastro?leaderId=${submittedLeaderId}`}
                className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg transition-colors shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 px-8 py-10 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">Cadastro de Lideranças</h1>
          <p className="text-indigo-100">Equipe MB</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* BLOCO 1 – DADOS PESSOAIS */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" /> BLOCO 1 – DADOS PESSOAIS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Nome completo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Como prefere ser chamado <span className="text-red-500">*</span>
                </label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Apelido ou nome social" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Data de nascimento <span className="text-red-500">*</span>
                </label>
                <input required type="text" name="birthDate" value={formData.birthDate} onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                  let formatted = val;
                  if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
                  if (val.length > 4) formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
                  setFormData(prev => ({ ...prev, birthDate: formatted }));
                }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="dd/mm/aaaa" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input required type="tel" name="phone" value={formatPhone(formData.phone)} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail <span className="text-slate-400 text-xs">(opcional)</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="email@exemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input required type="text" name="cpf" value={formatCpf(formData.cpf)} onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, '').slice(0, 11) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Sexo <span className="text-red-500">*</span>
                </label>
                <select required name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                  <option value="">Selecione...</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Nao-binario">Não-binário</option>
                  <option value="Travesti_Mulher_Trans">Travesti / Mulher Trans</option>
                  <option value="Homem_Trans">Homem Trans</option>
                  <option value="Genero_Fluido">Gênero Fluido</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro_nao_informar">Prefiro não informar</option>
                </select>
              </div>
            </div>
          </section>

          {/* BLOCO 2 – LOCALIZAÇÃO */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" /> BLOCO 2 – LOCALIZAÇÃO
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">CEP <span className="text-red-500">*</span></label>
                <input type="text" name="cep" value={formatCep(formData.cep)} onChange={handleCepChange} maxLength={9} placeholder="00000-000" className={`w-full px-4 py-3 bg-slate-50 border ${cepError ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none`} />
                {loadingCep && <p className="text-xs text-indigo-600 mt-1">Buscando CEP...</p>}
                {cepError && <p className="text-xs text-red-600 mt-1">{cepError}</p>}
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rua / Logradouro</label>
                <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Rua" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Número</label>
                <input type="text" name="addressNumber" value={formData.addressNumber} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="S/N" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bairro</label>
                <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Bairro" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Região Administrativa (detectada pelo CEP)</label>
                <select
                  value={formData.administrativeRegions[0] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, administrativeRegions: e.target.value ? [e.target.value] : [] }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="">Selecione...</option>
                  {(formData.city ? getRegioesPorCidade(formData.city) : REGIOES).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cidade</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Cidade" />
              </div>
            </div>
          </section>

          {/* BLOCO 3 – Estrutura da Equipe */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" /> BLOCO 3 – Estrutura da Equipe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-sm font-medium text-slate-700">Cargo</label>
                  <button
                    type="button"
                    onClick={() => setShowRoleInfo(!showRoleInfo)}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                    aria-label="O que significa cada cargo?"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                {showRoleInfo && (
                  <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
                    <p><strong className="text-slate-800">Liderança Territorial:</strong> atua nos bairros, comunidades, associações e comércios.</p>
                    <p><strong className="text-slate-800">Liderança Temática:</strong> atua em nichos como saúde, educação, segurança pública e etc.</p>
                  </div>
                )}
                <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                  <option value="">Selecione...</option>
                  <option value="Liderança Territorial">Liderança Territorial</option>
                  <option value="Liderança Temática">Liderança Temática</option>
                  <option value="Simpatizantes / Eleitores">Simpatizantes / Eleitores</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Liderança Direta</label>
                <select required name="directLeader" value={formData.directLeader} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                  <option value="">Selecione...</option>
                  {['Mayara', 'Renata', 'Júlio', 'Hugo', 'Beatriz', 'Ellen', 'Ariadne', 'Patrícia', 'Dudi'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* BLOCO 4 – Atuação */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">4</span> BLOCO 4 – Atuação
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qual segmento você representa?</label>
                <input type="text" name="segment" value={formData.segment} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quais bairros pretende atuar?</label>
                <input type="text" name="targetNeighborhoods" value={formData.targetNeighborhoods} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantas pessoas acredita mobilizar?</label>
                <input type="number" name="estimatedMobilization" value={formData.estimatedMobilization} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Possui grupo de WhatsApp?</label>
                  <select name="hasWhatsappGroup" value={formData.hasWhatsappGroup} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantos participantes possui?</label>
                  <input type="number" name="whatsappGroupParticipants" value={formData.whatsappGroupParticipants} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>
              </div>
            </div>
          </section>

          {/* BLOCO 5 – Disponibilidade */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">5</span> BLOCO 5 – Disponibilidade
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Dias disponíveis</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DIAS_SEMANA.map(day => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <input type="checkbox" checked={formData.availableDays.split(', ').includes(day)} onChange={() => toggleAvailableDay(day)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                      <span className="text-sm font-medium text-slate-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Possui veículo?</label>
                <select name="hasVehicle" value={formData.hasVehicle} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pode participar de caminhadas?</label>
                <select name="canWalk" value={formData.canWalk} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pode organizar reuniões?</label>
                <select name="canOrganizeMeetings" value={formData.canOrganizeMeetings} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pode receber reunião em casa?</label>
                <select name="canHostMeetings" value={formData.canHostMeetings} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
            </div>
          </section>

          {/* BLOCO 6 – Habilidades */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">6</span> BLOCO 6 – Habilidades
            </h2>
            <p className="text-sm text-slate-500 mb-4">Marcar todas que possui.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Redes sociais', 'Fotografia', 'Vídeo', 'Organização de Reunião', 'Comunicação', 'Oratória', 'Captação', 'Motorista', 'Promover Caminhadas', 'Promover Visita', 'Saúde', 'Educação', 'Outra'].map(skill => (
                <label key={skill} className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <input type="checkbox" name="skill" value={skill} onChange={handleChange} checked={formData.skills.includes(skill)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">{skill}</span>
                </label>
              ))}
            </div>
            {formData.skills.includes('Outra') && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Qual habilidade? <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Digite a habilidade"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            )}
          </section>

          {/* BLOCO 7 – Compromisso */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">7</span> BLOCO 7 – Compromisso
            </h2>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-5">
              <div>
                <p className="text-slate-700 mb-4">
                  Declaro que participarei da Equipe MB com responsabilidade, ética e comprometimento.
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input required type="checkbox" name="commitmentAgreed" onChange={handleChange} checked={formData.commitmentAgreed} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                  <span className="font-semibold text-slate-800">Concordo. <span className="text-red-500 text-xs font-bold">obrigatório</span></span>
                </label>
              </div>
              <div className="border-t border-slate-200 pt-5">
                <p className="text-slate-700 mb-4">
                  Declaro que li e concordo com o tratamento dos meus dados pessoais (nome, CPF, telefone, e-mail e endereço) pela Equipe MB para fins exclusivos de cadastro, comunicação e mobilização da liderança política, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Sei que posso solicitar, a qualquer momento, a correção ou a exclusão dos meus dados.
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input required type="checkbox" name="lgpdAgreed" onChange={handleChange} checked={formData.lgpdAgreed} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                  <span className="font-semibold text-slate-800">Concordo com o termo LGPD. <span className="text-red-500 text-xs font-bold">obrigatório</span></span>
                </label>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Enviando...' : 'Finalizar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}
