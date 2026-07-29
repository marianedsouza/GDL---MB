import { useState, useEffect, useMemo } from 'react';
import { Brain, Loader2, ChevronDown, ChevronUp, Search, AlertCircle, TrendingUp, Users, Heart, BarChart3, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

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

export default function ArchetypeProfiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ArchetypeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterDominant, setFilterDominant] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchProfiles();
  }, []);

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
        const data = await res.json();
        setProfiles(data);
      } else {
        setFetchError('Erro ao carregar perfis.');
      }
    } catch (err) {
      setFetchError('Erro de conexão.');
    } finally {
      setLoading(false);
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
    return { total: profiles.length, mostCommon, avgWounded, topEvolution, dominantCount };
  }, [profiles]);

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
          <button onClick={() => { setLoading(true); setFetchError(''); fetchProfiles(); }}
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-xs text-slate-400 mt-0.5">Mapeamentos realizados</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dominante</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.mostCommon?.[0] || '-'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stats.mostCommon?.[1] || 0} lideranças</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-600" />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ferida Média</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.avgWounded}%</p>
            <p className="text-xs text-slate-400 mt-0.5">Intensidade média da sombra</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Evolução</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.topEvolution?.[0] || '-'}</p>
            <p className="text-xs text-slate-400 mt-0.5">Arquétipo Self mais comum</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Perfis Arquetípicos</h1>
          <p className="text-slate-500 text-sm">Estudo completo de cada líder</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
        <div className="space-y-4">
          {filtered.map(profile => {
            const isExpanded = expandedId === profile.id;
            const sorted = Object.entries(profile.percentages || {})
              .sort(([, a], [, b]) => (b as number) - (a as number));
            const displayName = profile.leader?.name || profile.leader_name || 'Desconhecido';
            const dominantInfo = ARCHETYPE_INFO[profile.dominant?.name];
            const potencyInfo = ARCHETYPE_INFO[profile.potency?.name || profile.secondary?.name];
            const shadowInfo = ARCHETYPE_INFO[profile.shadow?.name || ''];
            const evoInfo = ARCHETYPE_INFO[profile.evolution?.name];

            return (
              <div key={profile.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : profile.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {displayName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{displayName}</h3>
                      <p className="text-xs text-slate-500">{profile.leader?.phone || profile.leader?.email || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${dominantInfo?.bg || 'bg-slate-50 border-slate-200'} ${dominantInfo?.color || 'text-slate-600'}`}>
                        {profile.dominant?.name || '-'} {profile.dominant?.score || 0}%
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        Ferida {profile.wounded?.score || 0}%
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                        <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Persona</p>
                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mt-0.5">Dominante</p>
                        <p className="text-lg font-bold text-indigo-700 mt-1">{profile.dominant?.name || '-'}</p>
                        <p className="text-[10px] text-indigo-400 mt-1">{dominantInfo?.jung || ''}</p>
                        <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${profile.dominant?.score || 0}%` }} />
                        </div>
                        <p className="text-sm text-indigo-500 mt-1">{profile.dominant?.score || 0}%</p>
                        <p className="text-[10px] text-indigo-500/70 mt-2 leading-relaxed">{dominantInfo?.luz || ''}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                        <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Anima/Animus</p>
                        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mt-0.5">Potência</p>
                        <p className="text-lg font-bold text-amber-700 mt-1">{profile.potency?.name || profile.secondary?.name || '-'}</p>
                        <p className="text-[10px] text-amber-400 mt-1">{potencyInfo?.jung || ''}</p>
                        <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${profile.potency?.score || profile.secondary?.score || 0}%` }} />
                        </div>
                        <p className="text-sm text-amber-500 mt-1">{profile.potency?.score || profile.secondary?.score || 0}%</p>
                        <p className="text-[10px] text-amber-500/70 mt-2 leading-relaxed">{potencyInfo?.luz || ''}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-red-50 border border-slate-200">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sombra</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Arquétipo Reprimido</p>
                        <p className="text-lg font-bold text-slate-600 mt-1">{profile.shadow?.name || 'Sombra'}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{shadowInfo?.jung || 'Inconsciente Pessoal'}</p>
                        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${profile.shadow?.score || 0}%` }} />
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{profile.shadow?.score || 0}%</p>
                        <p className="text-[10px] text-slate-500/70 mt-2 leading-relaxed">{shadowInfo?.sombra || 'Conteúdo reprimido que pode estar sendo projetado nos outros.'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                        <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Complexo</p>
                        <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mt-0.5">Ferida / Sombra</p>
                        <p className="text-lg font-bold text-rose-700 mt-1">{profile.wounded?.score || profile.shadowIntensity || 0}%</p>
                        <div className="mt-2 w-full bg-rose-200 rounded-full h-2">
                          <div className="bg-rose-400 h-2 rounded-full" style={{ width: `${profile.wounded?.score || profile.shadowIntensity || 0}%` }} />
                        </div>
                        <p className="text-sm text-rose-500 mt-1">{profile.wounded?.score || profile.shadowIntensity || 0}%</p>
                        <p className="text-[10px] text-rose-500/70 mt-2 leading-relaxed">Medo de fracasso, necessidade de aprovação, evitação de conflitos — essas são as vozes do Complexo.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                        <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Self</p>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mt-0.5">Evolução</p>
                        <p className="text-lg font-bold text-emerald-700 mt-1">{profile.evolution?.name || '-'}</p>
                        <p className="text-[10px] text-emerald-400 mt-1">{evoInfo?.jung || ''}</p>
                        <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${profile.evolution?.score || 0}%` }} />
                        </div>
                        <p className="text-sm text-emerald-500 mt-1">{profile.evolution?.score || 0}%</p>
                        <p className="text-[10px] text-emerald-500/70 mt-2 leading-relaxed">{evoInfo?.luz || ''}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Interpretação Junguiana</h4>
                      <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                        <div className="p-3 sm:p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                          <p className="font-semibold text-indigo-700 mb-1">Persona: {profile.dominant?.name}</p>
                          <p>{dominantInfo?.luz || ''}</p>
                          {dominantInfo?.mensagem && <p className="text-indigo-600 mt-2 italic">"{dominantInfo.mensagem}"</p>}
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-100">
                          <p className="font-semibold text-amber-700 mb-1">Potência: {profile.potency?.name || profile.secondary?.name}</p>
                          <p>{potencyInfo?.luz || ''}</p>
                          {potencyInfo?.mensagem && <p className="text-amber-600 mt-2 italic">"{potencyInfo.mensagem}"</p>}
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="font-semibold text-slate-700 mb-1">Sombra: {profile.shadow?.name || 'Sombra'}</p>
                          <p className="text-slate-600">{shadowInfo?.sombra || 'Padrão inconsciente que pode estar sendo projetado nos outros.'}</p>
                          {shadowInfo?.mensagem && <p className="text-slate-500 mt-2 italic">"{shadowInfo.mensagem}"</p>}
                          <p className="text-slate-400 mt-2 text-xs">Quanto menor a pontuação, mais esse arquétipo foi reprimido.</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                          <p className="font-semibold text-emerald-700 mb-1">Self / Individuação: {profile.evolution?.name}</p>
                          <p className="text-emerald-600">{evoInfo?.luz || ''}</p>
                          {evoInfo?.mensagem && <p className="text-emerald-600 mt-2 italic">"{evoInfo.mensagem}"</p>}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Perfil Arquetípico Completo</h4>
                      <p className="text-xs text-slate-400 mb-3">10 arquétipos de personalidade (Pearson) + conceitos Junguianos</p>
                      <div className="space-y-2">
                        {sorted.map(([name, score]) => {
                          const info = ARCHETYPE_INFO[name] || { label: name, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', bar: 'bg-slate-400' };
                          const isDominant = name === profile.dominant?.name;
                          const isShadow = name === profile.shadow?.name;
                          const isEvolution = name === profile.evolution?.name && !isDominant;
                          return (
                            <div key={name} className={`flex items-center gap-3 p-3 rounded-lg border ${info.bg}`}>
                              <span className={`text-sm font-bold w-24 shrink-0 ${info.color}`}>{info.label}</span>
                              <div className="flex-1 bg-white/60 rounded-full h-2">
                                <div className={`h-2 rounded-full ${info.bar}`} style={{ width: `${score}%`, opacity: isShadow ? 0.4 : 0.7 }} />
                              </div>
                              <span className="text-xs text-slate-500 w-8 text-right">{score}%</span>
                              <div className="hidden sm:flex gap-1 shrink-0">
                                {isDominant && <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">Persona</span>}
                                {isShadow && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Sombra</span>}
                                {isEvolution && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">Self</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
