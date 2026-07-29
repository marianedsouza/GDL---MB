import { useState, useEffect } from 'react';
import { Brain, Loader2, Users, ChevronDown, ChevronUp, Search } from 'lucide-react';
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

const ARCHETYPE_COLORS: Record<string, { label: string; color: string; bg: string; bar: string; jung: string }> = {
  Cuidadora: { label: 'Cuidadora', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500', jung: 'Persona Materna' },
  Rebelde: { label: 'Rebelde', color: 'text-red-600', bg: 'bg-red-50 border-red-200', bar: 'bg-red-500', jung: 'Sombra do Sistema' },
  Sábia: { label: 'Sábia', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', bar: 'bg-blue-500', jung: 'Self — O Sábio' },
  Exploradora: { label: 'Exploradora', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', bar: 'bg-amber-500', jung: 'Animus — Busca' },
  Criadora: { label: 'Criadora', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', bar: 'bg-violet-500', jung: 'Self Criativo' },
  Governante: { label: 'Governante', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', bar: 'bg-purple-500', jung: 'Persona de Poder' },
  Inocente: { label: 'Inocente', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', bar: 'bg-sky-500', jung: 'Self Original' },
  Amante: { label: 'Amante', color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200', bar: 'bg-pink-500', jung: 'Anima — Eros' },
  Mago: { label: 'Mago', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', bar: 'bg-indigo-500', jung: 'Self Transpessoal' },
  Guerreira: { label: 'Guerreira', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', bar: 'bg-orange-500', jung: 'Persona Heroica' },
  Boba: { label: 'Boba', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', bar: 'bg-yellow-500', jung: 'Trickster' },
  Sombra: { label: 'Sombra', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', bar: 'bg-slate-400', jung: 'Inconsciente Pessoal' },
};

export default function ArchetypeProfiles() {
  const [profiles, setProfiles] = useState<ArchetypeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/archetype/profiles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = profiles.filter(p =>
    !search || p.leader_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.leader?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Perfis Arquetípicos</h1>
          <p className="text-slate-500">Estudo completo de cada líder</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar líder..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600 w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      ) : filtered.length === 0 ? (
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

            return (
              <div key={profile.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : profile.id)}
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
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${ARCHETYPE_COLORS[profile.dominant?.name]?.bg || 'bg-slate-50 border-slate-200'} ${ARCHETYPE_COLORS[profile.dominant?.name]?.color || 'text-slate-600'}`}>
                        {profile.dominant?.name || '-'} {profile.dominant?.score || 0}%
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
                        <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${profile.dominant?.score || 0}%` }} />
                        </div>
                        <p className="text-sm text-indigo-500 mt-1">{profile.dominant?.score || 0}%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                        <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Anima/Animus</p>
                        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mt-0.5">Potência</p>
                        <p className="text-lg font-bold text-amber-700 mt-1">{profile.potency?.name || profile.secondary?.name || '-'}</p>
                        <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${profile.potency?.score || profile.secondary?.score || 0}%` }} />
                        </div>
                        <p className="text-sm text-amber-500 mt-1">{profile.potency?.score || profile.secondary?.score || 0}%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-red-50 border border-slate-200">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sombra</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Arquétipo Reprimido</p>
                        <p className="text-lg font-bold text-slate-600 mt-1">{profile.shadow?.name || 'Sombra'}</p>
                        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${profile.shadow?.score || 0}%` }} />
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{profile.shadow?.score || 0}%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                        <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Complexo</p>
                        <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mt-0.5">Ferida</p>
                        <p className="text-lg font-bold text-rose-700 mt-1">{profile.wounded?.score || profile.shadowIntensity || 0}%</p>
                        <div className="mt-2 w-full bg-rose-200 rounded-full h-2">
                          <div className="bg-rose-400 h-2 rounded-full" style={{ width: `${profile.wounded?.score || profile.shadowIntensity || 0}%` }} />
                        </div>
                        <p className="text-sm text-rose-500 mt-1">{profile.wounded?.score || profile.shadowIntensity || 0}%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                        <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Self</p>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mt-0.5">Evolução</p>
                        <p className="text-lg font-bold text-emerald-700 mt-1">{profile.evolution?.name || '-'}</p>
                        <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${profile.evolution?.score || 0}%` }} />
                        </div>
                        <p className="text-sm text-emerald-500 mt-1">{profile.evolution?.score || 0}%</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Perfil Completo</h4>
                      <div className="space-y-2">
                        {sorted.map(([name, score]) => {
                          const info = ARCHETYPE_COLORS[name] || { label: name, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', bar: 'bg-slate-400' };
                          return (
                            <div key={name} className={`flex items-center gap-3 p-3 rounded-lg border ${info.bg}`}>
                              <span className={`text-sm font-bold w-24 shrink-0 ${info.color}`}>{info.label}</span>
                              <div className="flex-1 bg-white/60 rounded-full h-2">
                                <div className={`h-2 rounded-full ${info.bar}`} style={{ width: `${score}%`, opacity: 0.7 }} />
                              </div>
                              <span className="text-xs text-slate-500 w-8 text-right">{score}%</span>
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