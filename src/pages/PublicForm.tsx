import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Phone, CheckCircle2, AlertCircle, Mail, MapPin, Users, Target, Star, ArrowRight, FileText, UserCheck } from 'lucide-react';
import { getRegioesPorBairro } from '../utils/regioes';

const REGIOES = ['Anhanduizinho', 'Bandeira', 'Centro', 'Imbirussu', 'Lagoa', 'Prosa', 'Segredo', 'Distritos', 'Outro'];
const ORIGENS = ['Reunião', 'Visita domiciliar', 'Evento', 'Igreja', 'Escola', 'Universidade', 'Comércio', 'Indicação', 'Redes sociais', 'Outro'];
const SEGMENTOS = ['Mulheres', 'Juventude', 'Empresários', 'Comércio', 'Educação', 'Saúde', 'Evangélico', 'Católico', 'Universitário', 'Servidor Público', 'Agronegócio', 'Comunidade', 'Outro'];
const RELACIONAMENTOS = ['Primeiro contato', 'Já conhece o Marquinhos Trad', 'Simpatizante', 'Apoiador', 'Liderança comunitária', 'Parceiro estratégico'];
const INFLUENCIAS = ['Eleitor individual', 'Influencia a família', 'Influencia amigos ou vizinhos', 'Liderança comunitária', 'Liderança religiosa', 'Empresário', 'Profissional de referência na área', 'Formador de opinião', 'Influenciador digital', 'Outro'];
const PROXIMOS_PASSOS = ['Enviar material da campanha', 'Adicionar ao grupo de WhatsApp', 'Convidar para uma reunião', 'Agendar visita gravada do candidato', 'Agendar reunião', 'Convidar para evento', 'Sem ação no momento', 'Outro'];

export default function PublicForm() {
  const { leaderId } = useParams();
  const [leaderName, setLeaderName] = useState('');
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sexo, setSexo] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [administrativeRegions, setAdministrativeRegions] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [cepError, setCepError] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [contactOrigins, setContactOrigins] = useState<string[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [relationshipLevels, setRelationshipLevels] = useState<string[]>([]);
  const [influencePotentials, setInfluencePotentials] = useState<string[]>([]);
  const [nextActions, setNextActions] = useState<string[]>([]);
  const [observations, setObservations] = useState('');

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
      } catch {
        setError('Erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };
    if (leaderId) fetchLeader();
  }, [leaderId]);

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCep(val);

    if (val.length === 8) {
      setLoadingCep(true);
      setCepError('');
      setStreet('');
      setNumber('');
      setNeighborhood('');
      setCity('');
      setAdministrativeRegions([]);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const data = await res.json();

        if (data.erro) {
          setCepError('CEP não encontrado.');
        } else if (data.uf !== 'MS') {
          setCepError('Apenas endereços do Mato Grosso do Sul (MS) são aceitos.');
        } else {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setAdministrativeRegions(getRegioesPorBairro(data.bairro || '', data.localidade || ''));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !cpf) {
      setError('Preencha os campos obrigatórios: Nome, Telefone e CPF.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leaderId,
            registeredBy: leaderName,
            name,
            phone,
            email,
            cpf,
            street,
            number,
          neighborhood,
          administrativeRegions,
          city,
          contactOrigins,
          segments,
          relationshipLevels,
          influencePotentials,
          nextActions,
          observations,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else if (res.status === 409) {
        const data = await res.json();
        setError(data.message || 'Este contato já foi cadastrado por outra liderança.');
      } else {
        const data = await res.json();
        if (data.details && data.details.includes('Could not find the')) {
          setError('Erro: É necessário adicionar as novas colunas à tabela leads no Supabase. ' + data.details);
        } else {
          setError(data.error || 'Erro ao enviar o formulário.');
        }
      }
    } catch {
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
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Contato Registrado!</h1>
          <p className="text-slate-600">
            Os dados foram vinculados à liderança de <strong className="text-slate-800">{leaderName}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 px-8 py-10 text-center text-white">
          <h1 className="text-3xl font-bold mb-1">Cadastro de Contatos</h1>
          <p className="text-indigo-100 text-lg font-medium">Equipe MB</p>
          <p className="text-indigo-200 text-sm mt-2">Campanha Marquinhos Trad 2026</p>
        </div>

        <div className="px-6 sm:px-8 py-6 bg-indigo-50 border-b border-indigo-100 text-sm text-slate-700">
          <p>
            Este formulário tem como objetivo registrar os contatos realizados pela Equipe MB durante visitas, reuniões, eventos e ações de campo. As informações serão utilizadas exclusivamente para organização da campanha e fortalecimento da nossa base de relacionamento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <UserCheck className="h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-xs text-indigo-500 font-medium uppercase tracking-wider">Responsável pelo cadastro</span>
              <p className="text-sm font-semibold text-indigo-800">{leaderName}</p>
            </div>
          </div>

          {/* BLOCO 1 – Dados do Contato */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" /> BLOCO 1 – DADOS DO CONTATO
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Nome do contato" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Como prefere ser chamado <span className="text-red-500">*</span>
                </label>
                <input required type="text" value={preferredName} onChange={(e) => setPreferredName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Apelido ou nome social" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Data de nascimento <span className="text-red-500">*</span>
                </label>
                <input required type="text" value={birthDate} onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                  let formatted = val;
                  if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
                  if (val.length > 4) formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
                  setBirthDate(formatted);
                }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="dd/mm/aaaa" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail <span className="text-slate-400 text-xs">(opcional)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="email@exemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input required type="text" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Sexo <span className="text-red-500">*</span>
                </label>
                <select required value={sexo} onChange={(e) => setSexo(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
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
                <input
                  type="text"
                  required
                  value={cep}
                  onChange={handleCepChange}
                  maxLength={8}
                  placeholder="Somente números"
                  className={`w-full px-4 py-3 bg-slate-50 border ${cepError ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none`}
                />
                {loadingCep && <p className="text-xs text-indigo-600 mt-1">Buscando CEP...</p>}
                {cepError && <p className="text-xs text-red-600 mt-1">{cepError}</p>}
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rua / Logradouro</label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Rua" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Número</label>
                <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="S/N" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bairro</label>
                <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Bairro" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Região Administrativa (detectada pelo CEP)</label>
                <input
                  type="text"
                  readOnly
                  value={administrativeRegions.length > 0 ? administrativeRegions.join(', ') : 'Nenhuma região detectada'}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 outline-none cursor-default"
                />
                <label className="block text-sm font-medium text-slate-700 mb-2 mt-3">Ajuste manualmente (pode selecionar mais de uma)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(city ? getRegioesPorCidade(city) : REGIOES).map((r) => (
                    <label key={r} className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-colors ${administrativeRegions.includes(r) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input
                        type="checkbox"
                        checked={administrativeRegions.includes(r)}
                        onChange={() => setAdministrativeRegions(toggleArrayItem(administrativeRegions, r))}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-700">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cidade</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Cidade" />
              </div>
            </div>
          </section>

          {/* BLOCO 4 – Origem do Contato */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" /> BLOCO 3 – ORIGEM DO CONTATO
            </h2>
            <p className="text-sm text-slate-500 mb-3">Como esse contato foi realizado?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ORIGENS.map((item) => (
                <label key={item} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${contactOrigins.includes(item) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={contactOrigins.includes(item)} onChange={() => setContactOrigins(toggleArrayItem(contactOrigins, item))} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </section>

          {/* BLOCO 5 – Segmento */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" /> BLOCO 4 – SEGMENTO
            </h2>
            <p className="text-sm text-slate-500 mb-3">Este contato pertence a qual segmento?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SEGMENTOS.map((item) => (
                <label key={item} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${segments.includes(item) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={segments.includes(item)} onChange={() => setSegments(toggleArrayItem(segments, item))} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </section>

          {/* BLOCO 6 – Nível de Relacionamento */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Star className="h-5 w-5 text-indigo-600" /> BLOCO 5 – NÍVEL DE RELACIONAMENTO
            </h2>
            <p className="text-sm text-slate-500 mb-3">Como você classificaria esse contato?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {RELACIONAMENTOS.map((item) => (
                <label key={item} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${relationshipLevels.includes(item) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={relationshipLevels.includes(item)} onChange={() => setRelationshipLevels(toggleArrayItem(relationshipLevels, item))} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </section>

          {/* BLOCO 7 – Potencial de Influência */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Star className="h-5 w-5 text-indigo-600" /> <span>BLOCO 6 – POTENCIAL DE INFLUÊNCIA</span> <span className="text-yellow-500 text-lg">⭐</span>
            </h2>
            <p className="text-sm text-slate-500 mb-3">Qual o potencial de influência dessa pessoa?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INFLUENCIAS.map((item) => (
                <label key={item} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${influencePotentials.includes(item) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={influencePotentials.includes(item)} onChange={() => setInfluencePotentials(toggleArrayItem(influencePotentials, item))} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </section>

          {/* BLOCO 8 – Próxima Ação */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-indigo-600" /> BLOCO 7 – PRÓXIMA AÇÃO
            </h2>
            <p className="text-sm text-slate-500 mb-3">Qual será o próximo passo com esse contato?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROXIMOS_PASSOS.map((item) => (
                <label key={item} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${nextActions.includes(item) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={nextActions.includes(item)} onChange={() => setNextActions(toggleArrayItem(nextActions, item))} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </section>

          {/* BLOCO 9 – Observações */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" /> BLOCO 8 – OBSERVAÇÕES
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Observações importantes</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none resize-y"
                placeholder="Ex: Tem forte influência no bairro. Demonstrou interesse em participar da campanha..."
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Enviando...' : 'Registrar Contato'}
          </button>
        </form>
      </div>
    </div>
  );
}
