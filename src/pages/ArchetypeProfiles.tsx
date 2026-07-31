import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ChevronDown, Search, AlertCircle, TrendingUp, Users, Heart, BarChart3, CheckSquare, Square, FileText, Phone, User, Quote, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { generateArchetypeReport } from '../utils/generateArchetypeReport';

interface ArchetypeProfile {
  id: string;
  leader_id: string;
  leader_name: string;
  dominant: { name: string; score: number };
  secondary: { name: string; score: number };
  potency?: { name: string; score: number };
  shadow: { name?: string; score: number };
  shadowIntensity?: number;
  wounded?: { score: number };
  evolution: { name: string; score: number };
  percentages: Record<string, number>;
  created_at: string;
  leader: { full_name: string; name: string; phone: string; email: string; cpf: string } | null;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  neighborhood: string;
}

const ARCHETYPE_INFO: Record<string, { label: string; color: string; bg: string; bar: string; jung: string; luz: string; sombra: string; mensagem: string }> = {
  Cuidadora: { label: 'Cuidadora', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500', jung: 'Persona Materna', luz: 'Acolhimento, empatia, proteção, generosidade', sombra: 'Autossacrifício, codependência, culpa ao dizer não', mensagem: 'Seu dom é nutrir. Lembre-se: para cuidar do outro é preciso cuidar de si.' },
  Rebelde: { label: 'Rebelde', color: 'text-red-600', bg: 'bg-red-50 border-red-200', bar: 'bg-red-500', jung: 'Sombra do Sistema', luz: 'Inovação, coragem de romper, autenticidade', sombra: 'Raiva destrutiva, rebeldia por impulso, isolamento', mensagem: 'Sua força está em questionar. Canalize sua rebeldia para transformar o que precisa ser mudado.' },
  Sábia: { label: 'Sábia', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', bar: 'bg-blue-500', jung: 'Self — O Sábio', luz: 'Conhecimento, reflexão, discernimento, consciência', sombra: 'Distanciamento emocional, arrogância intelectual, obsessão por respostas', mensagem: 'Sua sabedoria ilumina. Compartilhe o que sabe sem perder a humildade de aprender.' },
  Exploradora: { label: 'Exploradora', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', bar: 'bg-amber-500', jung: 'Animus — Busca', luz: 'Independência, liberdade, descoberta, autoconfiança', sombra: 'Inquietude, incapacidade de se comprometer, fuga emocional', mensagem: 'Sua alma busca novos horizontes. Explore o mundo externo sem fugir do seu mundo interno.' },
  Criadora: { label: 'Criadora', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', bar: 'bg-violet-500', jung: 'Self Criativo', luz: 'Criatividade, inovação, originalidade, expressão', sombra: 'Perfeccionismo paralisante, inconclusão, autocrítica excessiva', mensagem: 'Você é um canal de criação. Dê forma ao que existe dentro de você sem medo do julgamento.' },
  Governante: { label: 'Governante', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', bar: 'bg-purple-500', jung: 'Persona de Poder', luz: 'Liderança, visão estratégica, responsabilidade, ordem', sombra: 'Autoritarismo, necessidade de controle, medo de delegar', mensagem: 'Você nasceu para liderar. Lembre-se: poder verdadeiro é servir com responsabilidade.' },
  Inocente: { label: 'Inocente', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', bar: 'bg-sky-500', jung: 'Self Original', luz: 'Otimismo, pureza, esperança, simplicidade', sombra: 'Ingenuidade, negação da realidade, dependência', mensagem: 'Guarde sua essência pura. Confiar na vida é belo, mas a maturidade exige discernimento.' },
  Amante: { label: 'Amante', color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200', bar: 'bg-pink-500', jung: 'Anima — Eros', luz: 'Paixão, conexão profunda, beleza, encantamento', sombra: 'Carência afetiva, idealização do outro, ciúmes', mensagem: 'Seu coração sente com profundidade. Ame sem se perder no outro — a união verdadeira começa dentro de você.' },
  Mago: { label: 'Mago', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', bar: 'bg-indigo-500', jung: 'Self Transpessoal', luz: 'Intuição, transformação, propósito, transcendência', sombra: 'Manipulação, escapismo espiritual, desconexão da realidade', mensagem: 'Você é um agente de transformação. Use seu poder para curar, não para controlar.' },
  Guerreira: { label: 'Guerreira', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', bar: 'bg-orange-500', jung: 'Persona Heroica', luz: 'Coragem, disciplina, determinação, resiliência', sombra: 'Agressividade, rigidez, exaustão por superexigência', mensagem: 'Sua força é admirável. Mas a verdadeira guerreira sabe quando lutar e quando descansar.' },
  Boba: { label: 'Boba', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', bar: 'bg-yellow-500', jung: 'Trickster', luz: 'Humor, leveza, espontaneidade, alegria', sombra: 'Irresponsabilidade, fuga emocional, cinismo', mensagem: 'O riso é sua sabedoria. Use a leveza para desarmar, não para esconder a verdade.' },
  Sombra: { label: 'Sombra', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', bar: 'bg-slate-400', jung: 'Inconsciente Pessoal', luz: 'Autoconhecimento profundo, integração, humildade', sombra: 'Projeção nos outros, negação, autossabotagem', mensagem: 'O que você rejeita em si mesma ainda te governa. Integrar a sombra é o caminho para a liberdade.' },
};

const ALL_ARCHETYPES = Object.keys(ARCHETYPE_INFO);

function ArchetypeCard({ title, subtitle, name, score, info, gradient, accent }: {
  title: string; subtitle: string; name: string; score: number;
  info?: typeof ARCHETYPE_INFO[keyof typeof ARCHETYPE_INFO];
  gradient: string; accent: string;
}) {
  return (
    <div className={`p-4 rounded-xl ${gradient} border ${accent} relative overflow-hidden`}>
      <div className="relative z-10">
        <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wider">{title}</p>
        <p className="text-xs font-semibold opacity-50 uppercase tracking-wider mt-0.5">{subtitle}</p>
        <p className={`text-lg font-bold mt-1 ${info?.color || 'text-slate-700'}`}>{name || '-'}</p>
        <p className="text-[10px] opacity-50 mt-0.5">{info?.jung || ''}</p>
        <div className="mt-2 w-full bg-white/40 rounded-full h-2">
          <div className={`h-2 rounded-full ${info?.bar || 'bg-slate-400'}`} style={{ width: `${score}%` }} />
        </div>
        <p className={`text-sm font-bold mt-1 ${info?.color || 'text-slate-500'}`}>{score}%</p>
        <p className="text-[10px] opacity-60 mt-2 leading-relaxed">{info?.luz || ''}</p>
      </div>
    </div>
  );
}

export default function ArchetypeProfiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ArchetypeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [leadsMap, setLeadsMap] = useState<Record<string, Lead[]>>({});
  const [leadsLoading, setLeadsLoading] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [filterDominant, setFilterDominant] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filtered.map(p => p.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const handleDownloadPdf = () => {
    const selected = profiles.filter(p => selectedIds.has(p.id));
    if (selected.length === 0) return;
    generateArchetypeReport(selected);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/archetype/profiles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
        return;
      }
      if (res.ok) {
        setProfiles(await res.json());
      } else {
        setFetchError('Erro ao carregar perfis.');
      }
    } catch {
      setFetchError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async (leaderId: string) => {
    if (leadsMap[leaderId]) return;
    setLeadsLoading(prev => ({ ...prev, [leaderId]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leaders/${leaderId}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeadsMap(prev => ({ ...prev, [leaderId]: data }));
      }
    } catch {
      // ignore
    } finally {
      setLeadsLoading(prev => ({ ...prev, [leaderId]: false }));
    }
  };

  const filtered = useMemo(() => {
    let result = profiles.filter(p => {
      const name = p.leader_name || p.leader?.name || '';
      const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase());
      const matchesDominant = !filterDominant || p.dominant?.name === filterDominant;
      return matchesSearch && matchesDominant;
    });
    result.sort((a, b) => {
      if (sortBy === 'name') return (a.leader_name || '').localeCompare(b.leader_name || '');
      if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'dominant') return (b.dominant?.score || 0) - (a.dominant?.score || 0);
      if (sortBy === 'wounded') return (b.wounded?.score || 0) - (a.wounded?.score || 0);
      return 0;
    });
    return result;
  }, [profiles, search, filterDominant, sortBy]);

  const stats = useMemo(() => {
    if (profiles.length === 0) return null;
    const dominantCount: Record<string, number> = {};
    let totalWounded = 0;
    const evolutionCount: Record<string, number> = {};
    for (const p of profiles) {
      if (p.dominant?.name) dominantCount[p.dominant.name] = (dominantCount[p.dominant.name] || 0) + 1;
      totalWounded += p.wounded?.score || 0;
      if (p.evolution?.name) evolutionCount[p.evolution.name] = (evolutionCount[p.evolution.name] || 0) + 1;
    }
    const mostCommon = Object.entries(dominantCount).sort(([, a], [, b]) => b - a)[0];
    const avgWounded = Math.round(totalWounded / profiles.length);
    const topEvolution = Object.entries(evolutionCount).sort(([, a], [, b]) => b - a)[0];
    return { total: profiles.length, mostCommon, avgWounded, topEvolution };
  }, [profiles]);

  const handleToggle = (profileId: string, leaderId: string) => {
    setExpandedId(prev => prev === profileId ? null : profileId);
    if (expandedId !== profileId) {
      fetchLeads(leaderId);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      </AdminLayout>
    );
  }

  if (fetchError) {
    return (
      <AdminLayout>
        <div className="text-center py-16 bg-white rounded-xl border border-red-200 border-dashed">
          <AlertCircle className="mx-auto h-12 w-12 text-red-300 mb-3" />
          <p className="text-red-500 font-medium">{fetchError}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button onClick={() => { setLoading(true); setFetchError(''); fetchProfiles(); }}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
              Tentar novamente
            </button>
            <button onClick={() => navigate('/admin/login')}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
              Fazer login novamente
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, bg: 'bg-indigo-100', color: 'text-indigo-600', label: 'Total', value: stats.total, sub: 'Mapeamentos realizados' },
            { icon: TrendingUp, bg: 'bg-purple-100', color: 'text-purple-600', label: 'Dominante', value: stats.mostCommon?.[0] || '-', sub: `${stats.mostCommon?.[1] || 0} lideranças` },
            { icon: Heart, bg: 'bg-rose-100', color: 'text-rose-600', label: 'Ferida Média', value: `${stats.avgWounded}%`, sub: 'Intensidade média da sombra' },
            { icon: BarChart3, bg: 'bg-emerald-100', color: 'text-emerald-600', label: 'Evolução', value: stats.topEvolution?.[0] || '-', sub: 'Arquétipo Self mais comum' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Perfis Arquetípicos</h1>
          <p className="text-slate-500 text-sm">Estudo completo de cada líder</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" /> Gerar Relatório PDF ({selectedIds.size})
            </motion.button>
          )}
          <button onClick={selectAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
            <CheckSquare className="w-4 h-4" /> Selecionar Todos
          </button>
          {selectedIds.size > 0 && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={clearSelection}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
              <Square className="w-4 h-4" /> Limpar
            </motion.button>
          )}
          <div className="relative flex-1 sm:flex-initial min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar líder..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600 w-full sm:w-48" />
          </div>
          <select value={filterDominant} onChange={e => setFilterDominant(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600">
            <option value="">Todos arquétipos</option>
            {ALL_ARCHETYPES.map(a => (
              <option key={a} value={a}>{ARCHETYPE_INFO[a]?.label || a}</option>
            ))}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600">
            <option value="name">Nome</option>
            <option value="date">Data</option>
            <option value="dominant">% Dominante</option>
            <option value="wounded">% Ferida</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <Brain className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">
            {profiles.length === 0 ? 'Nenhum mapeamento realizado ainda' : 'Nenhum resultado'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(profile => {
            const isExpanded = expandedId === profile.id;
            const sorted = Object.entries(profile.percentages || {})
              .sort(([, a], [, b]) => (b as number) - (a as number));
            const displayName = profile.leader?.name || profile.leader_name || 'Desconhecido';
            const dominantInfo = ARCHETYPE_INFO[profile.dominant?.name];
            const potencyInfo = ARCHETYPE_INFO[profile.potency?.name || profile.secondary?.name];
            const shadowInfo = ARCHETYPE_INFO[profile.shadow?.name || ''];
            const evoInfo = ARCHETYPE_INFO[profile.evolution?.name];
            const leads = leadsMap[profile.leader_id];
            const loadingLeads = leadsLoading[profile.leader_id];

            return (
              <motion.div
                key={profile.id}
                layout
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="flex items-stretch">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSelect(profile.id)}
                    className={`flex items-center justify-center px-4 border-r transition-colors ${selectedIds.has(profile.id) ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'text-slate-300 hover:text-slate-400 border-slate-100'}`}
                  >
                    {selectedIds.has(profile.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleToggle(profile.id, profile.leader_id)}
                    className={`flex-1 flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors text-left ${selectedIds.has(profile.id) ? 'bg-indigo-50/30' : ''}`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {displayName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{displayName}</h3>
                        <p className="text-xs text-slate-500">{profile.leader?.phone || profile.leader?.email || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="hidden sm:flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${dominantInfo?.bg || 'bg-slate-50 border-slate-200'} ${dominantInfo?.color || 'text-slate-600'}`}>
                          {profile.dominant?.name || '-'} {profile.dominant?.score || 0}%
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                          Ferida {profile.wounded?.score || 0}%
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </motion.div>
                    </div>
                  </motion.button>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 border-t border-slate-100 pt-4">
                        <div className="text-center mb-4">
                          <p className="text-slate-500 text-xs">Resultado para</p>
                          <p className="text-xl font-bold text-slate-800">{displayName}</p>
                        </div>

                        {/* Base Junguiana */}
                        <div className="max-w-lg mx-auto rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 sm:p-6 mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100">
                              <Quote className="h-3.5 w-3.5 text-indigo-500" />
                            </span>
                            <h4 className="text-sm font-semibold text-indigo-700">Base Junguiana</h4>
                          </div>
                          <blockquote className="border-l-2 border-indigo-200 pl-4">
                            <p className="text-xs leading-relaxed text-indigo-700 italic">
                              "Individuação significa tornar-se um ser uno, e na medida em que a individualidade
                              abrange nossa unicidade mais íntima, tornar-se o próprio Self."
                            </p>
                            <footer className="mt-1.5 text-[11px] font-medium text-indigo-400">— Carl Jung</footer>
                          </blockquote>
                          <p className="mt-4 text-[11px] leading-relaxed text-indigo-500">
                            Este mapeamento integra os arquétipos estruturais de Jung (Persona, Sombra, Anima/Animus, Self)
                            com a jornada do herói de Joseph Campbell e Carol Pearson.
                          </p>
                        </div>

                        {/* 5 Archetype Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                          <ArchetypeCard
                            title="Persona" subtitle="Dominante"
                            name={profile.dominant?.name || '-'} score={profile.dominant?.score || 0}
                            info={dominantInfo} gradient="bg-gradient-to-br from-indigo-50 to-purple-50" accent="border-indigo-100"
                          />
                          <ArchetypeCard
                            title="Anima/Animus" subtitle="Potência"
                            name={profile.potency?.name || profile.secondary?.name || '-'} score={profile.potency?.score || profile.secondary?.score || 0}
                            info={potencyInfo} gradient="bg-gradient-to-br from-amber-50 to-orange-50" accent="border-amber-100"
                          />
                          <ArchetypeCard
                            title="Sombra" subtitle="Arquétipo Reprimido"
                            name={profile.shadow?.name || 'Sombra'} score={profile.shadow?.score || 0}
                            info={shadowInfo} gradient="bg-gradient-to-br from-slate-50 to-red-50" accent="border-slate-200"
                          />
                          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 relative overflow-hidden">
                            <div className="relative z-10">
                              <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Complexo</p>
                              <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mt-0.5">Ferida / Sombra</p>
                              <p className="text-lg font-bold text-rose-700 mt-1">{profile.wounded?.score || profile.shadowIntensity || 0}%</p>
                              <div className="mt-2 w-full bg-white/40 rounded-full h-2">
                                <div className="bg-rose-400 h-2 rounded-full" style={{ width: `${profile.wounded?.score || profile.shadowIntensity || 0}%` }} />
                              </div>
                              <p className="text-sm font-bold text-rose-500 mt-1">{profile.wounded?.score || profile.shadowIntensity || 0}%</p>
                              <p className="text-[10px] text-rose-500/70 mt-2 leading-relaxed">Medo de fracasso, necessidade de aprovação, evitação de conflitos</p>
                            </div>
                          </div>
                          <ArchetypeCard
                            title="Self" subtitle="Evolução"
                            name={profile.evolution?.name || '-'} score={profile.evolution?.score || 0}
                            info={evoInfo} gradient="bg-gradient-to-br from-emerald-50 to-teal-50" accent="border-emerald-100"
                          />
                        </div>

                        {/* Jungian Interpretation */}
                        <div className="border-t border-slate-100 pt-4 mb-4">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            Interpretação Junguiana
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600">
                            {[
                              { label: `Persona: ${profile.dominant?.name}`, text: dominantInfo?.luz || '', msg: dominantInfo?.mensagem, bg: 'bg-indigo-50 border-indigo-100', color: 'text-indigo-700', msgColor: 'text-indigo-600' },
                              { label: `Potência: ${profile.potency?.name || profile.secondary?.name}`, text: potencyInfo?.luz || '', msg: potencyInfo?.mensagem, bg: 'bg-amber-50 border-amber-100', color: 'text-amber-700', msgColor: 'text-amber-600' },
                              { label: `Sombra: ${profile.shadow?.name || 'Sombra'}`, text: shadowInfo?.sombra || 'Padrão inconsciente que pode estar sendo projetado nos outros.', msg: shadowInfo?.mensagem, bg: 'bg-slate-50 border-slate-200', color: 'text-slate-700', msgColor: 'text-slate-500' },
                              { label: `Self / Individuação: ${profile.evolution?.name}`, text: evoInfo?.luz || '', msg: evoInfo?.mensagem, bg: 'bg-emerald-50 border-emerald-100', color: 'text-emerald-700', msgColor: 'text-emerald-600' },
                            ].map((item, i) => (
                              <div key={i} className={`p-3 sm:p-4 rounded-xl ${item.bg}`}>
                                <p className={`font-semibold ${item.color} mb-1`}>{item.label}</p>
                                <p>{item.text}</p>
                                {item.msg && (
                                  <p className={`${item.msgColor} mt-2 italic text-xs`}>
                                    <Quote className="w-3 h-3 inline -mt-0.5 mr-0.5 opacity-60" />
                                    {item.msg}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Leads / Contatos Section */}
                        <div className="border-t border-slate-100 pt-4 mb-4">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-500" />
                            Contatos Trazidos por {displayName}
                            {leads && <span className="text-xs font-normal text-slate-400 ml-1">({leads.length})</span>}
                          </h4>
                          {loadingLeads ? (
                            <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                              <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                              Carregando contatos...
                            </div>
                          ) : leads && leads.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {leads.map(lead => (
                                <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                                    {lead.name?.charAt(0) || '?'}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{lead.name}</p>
                                    {lead.phone && (
                                      <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {lead.phone}
                                      </p>
                                    )}
                                    {lead.neighborhood && (
                                      <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <User className="w-3 h-3" /> {lead.neighborhood}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 py-3">Nenhum contato cadastrado por esta liderança.</p>
                          )}
                        </div>

                        {/* Detailed Archetype Analysis */}
                        <div className="border-t border-slate-100 pt-4 mt-4">
                          <h4 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            Análise Detalhada dos Arquétipos
                          </h4>
                          <p className="text-xs text-slate-400 mb-3">Compreenda cada arquétipo e sua manifestação na personalidade</p>
                          <div className="space-y-3">
                            {sorted.map(([name, score]) => {
                              const info = ARCHETYPE_INFO[name];
                              if (!info) return null;
                              return (
                                <div key={name} className={`p-4 rounded-xl border ${info.bg || 'bg-slate-50 border-slate-200'}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className={`text-sm font-bold ${info.color || 'text-slate-600'}`}>{info.label || name}</p>
                                    <span className="text-xs text-slate-400 font-semibold">{score}%</span>
                                  </div>
                                  <div className="w-full bg-white/60 rounded-full h-1.5 mb-2">
                                    <div className={`h-1.5 rounded-full ${info.bar || 'bg-slate-400'}`} style={{ width: `${score}%`, opacity: 0.6 }} />
                                  </div>
                                  <p className="text-xs text-slate-500"><span className="font-medium text-slate-600">Luz:</span> {info.luz}</p>
                                  <p className="text-xs text-slate-500 mt-0.5"><span className="font-medium text-slate-600">Sombra:</span> {info.sombra}</p>
                                  <p className="text-xs text-slate-500 mt-1 italic">{info.mensagem}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
