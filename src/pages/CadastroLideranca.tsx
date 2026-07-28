import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Briefcase, CheckCircle2 } from 'lucide-react';

export default function CadastroLideranca() {
  const [formData, setFormData] = useState({
    fullName: '',
    name: '',
    cpf: '',
    birthDate: '',
    phone: '',
    email: '',
    cep: '',
    street: '',
    addressNumber: '',
    neighborhood: '',
    administrativeRegion: '',
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
    commitmentAgreed: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cepError, setCepError] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);

  
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/D/g, '');
    setFormData({ ...formData, cep: val });
    
    if (val.length === 8) {
      setLoadingCep(true);
      setCepError('');
      try {
        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'commitmentAgreed') {
        setFormData({ ...formData, [name]: checked });
      } else {
        // Handle skills checkboxes
        const newSkills = checked 
          ? [...formData.skills, value] 
          : formData.skills.filter(s => s !== value);
        setFormData({ ...formData, skills: newSkills });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.commitmentAgreed) {
      setError('Você deve concordar com o termo de compromisso.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/public/leaders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
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

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-slate-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Cadastro Realizado!</h2>
          <p className="text-slate-600 mb-6">
            Obrigado por se juntar à Equipe MB.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Fazer novo cadastro
          </button>
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

          {/* BLOCO 1 - Dados Pessoais */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" /> BLOCO 1 – Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome como prefere ser chamado</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input required type="text" name="cpf" value={formData.cpf} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de nascimento</label>
                <input required type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone/WhatsApp</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
            </div>
          </section>

          {/* BLOCO 2 – Endereço */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" /> BLOCO 2 – Endereço
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </section>

          {/* BLOCO 3 – Estrutura da Equipe */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" /> BLOCO 3 – Estrutura da Equipe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                  <option value="">Selecione...</option>
                  <option value="Liderança Territorial">Liderança Territorial</option>
                  <option value="Liderança Temática">Liderança Temática</option>
                  <option value="Mobilizador Territorial">Mobilizador Territorial</option>
                  <option value="Apoio Operacional">Apoio Operacional</option>
                  <option value="Comunicação">Comunicação</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Liderança Direta</label>
                <select required name="directLeader" value={formData.directLeader} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                  <option value="">Selecione...</option>
                  {['Mayara', 'Silvia', 'Júlio', 'Hugo', 'Beatriz', 'Gledson', 'Ellen', 'Ariadne', 'Patrícia', 'Cira', 'Dudi'].map(l => (
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Dias disponíveis</label>
                <input type="text" name="availableDays" value={formData.availableDays} onChange={handleChange} placeholder="Ex: Segundas e Quartas à noite" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" />
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
              {['Redes sociais', 'Fotografia', 'Vídeo', 'Design', 'Organização de eventos', 'Comunicação', 'Oratória', 'Captação', 'Motorista', 'Jurídico', 'Saúde', 'Educação', 'Outra'].map(skill => (
                <label key={skill} className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <input type="checkbox" name="skill" value={skill} onChange={handleChange} checked={formData.skills.includes(skill)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">{skill}</span>
                </label>
              ))}
            </div>
          </section>

          {/* BLOCO 7 – Compromisso */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">7</span> BLOCO 7 – Compromisso
            </h2>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <p className="text-slate-700 mb-4">
                Declaro que participarei da Equipe MB com responsabilidade, ética e comprometimento.
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input required type="checkbox" name="commitmentAgreed" onChange={handleChange} checked={formData.commitmentAgreed} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                <span className="font-semibold text-slate-800">Concordo.</span>
              </label>
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
