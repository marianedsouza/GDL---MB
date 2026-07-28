import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Phone, CheckCircle2, AlertCircle, Mail, MapPin, MessageSquare, Users, Target, Star, ArrowRight, FileText, UserCheck } from 'lucide-react';

const RESPONSAVEIS = ['Silvia Renata', 'Júlio', 'Gledson', 'Ellen', 'Ariadne', 'Patrícia', 'Hugo', 'Beatriz', 'Cira', 'Dudi', 'Outro'];
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

  const [registeredBy, setRegisteredBy] = useState('');
  const [registeredByOther, setRegisteredByOther] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [administrativeRegion, setAdministrativeRegion] = useState('');
  const [city, setCity] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredBy || !name || !phone) {
      setError('Preencha os campos obrigatórios: Responsável, Nome e Telefone.');
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
          registeredBy: registeredBy === 'Outro' ? registeredByOther : registeredBy,
          name,
          phone,
          email,
          neighborhood,
          administrativeRegion,
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

          {/* BLOCO 1 – Responsável */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" /> BLOCO 1 – RESPONSÁVEL PELO CADASTRO
            </h2>
            <p className="text-sm text-slate-500 mb-4">Esse campo permitirá gerar relatórios por liderança e acompanhar a produtividade de cada equipe.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Quem realizou este cadastro? <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={registeredBy}
                onChange={(e) => setRegisteredBy(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="">Selecione...</option>
                {RESPONSAVEIS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {registeredBy === 'Outro' && (
                <input
                  type="text"
                  required
                  value={registeredByOther}
                  onChange={(e) => setRegisteredByOther(e.target.value)}
                  placeholder="Especifique..."
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              )}
            </div>
          </section>

          {/* BLOCO 2 – Dados do Contato */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" /> BLOCO 2 – DADOS DO CONTATO
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
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail <span className="text-slate-400 text-xs">(opcional)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="email@exemplo.com" />
              </div>
            </div>
          </section>

          {/* BLOCO 3 – Localização */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" /> BLOCO 3 – LOCALIZAÇÃO
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bairro</label>
                <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Bairro" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Região Administrativa</label>
                <select value={administrativeRegion} onChange={(e) => setAdministrativeRegion(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
                  <option value="">Selecione...</option>
                  {REGIOES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
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
              <Target className="h-5 w-5 text-indigo-600" /> BLOCO 4 – ORIGEM DO CONTATO
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
              <Users className="h-5 w-5 text-indigo-600" /> BLOCO 5 – SEGMENTO
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
              <Star className="h-5 w-5 text-indigo-600" /> BLOCO 6 – NÍVEL DE RELACIONAMENTO
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
              <Star className="h-5 w-5 text-indigo-600" /> <span>BLOCO 7 – POTENCIAL DE INFLUÊNCIA</span> <span className="text-yellow-500 text-lg">⭐</span>
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
              <ArrowRight className="h-5 w-5 text-indigo-600" /> BLOCO 8 – PRÓXIMA AÇÃO
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
              <FileText className="h-5 w-5 text-indigo-600" /> BLOCO 9 – OBSERVAÇÕES
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
