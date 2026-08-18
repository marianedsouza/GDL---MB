import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Calendar, MapPin, UserCheck, Search, X, Filter, Star } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  registered_by?: string;
  neighborhood?: string;
  city?: string;
  administrative_region?: string;
  contact_origin?: string[];
  segment?: string[];
  relationship_level?: string[];
  influence_potential?: string[];
  next_action?: string[];
  observations?: string;
  created_at: string;
  leaderId: {
    _id: string;
    name: string;
  };
}

export default function LeadsList() {
  const { leaderId } = useParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderName, setLeaderName] = useState<string>('');
  const [searchInput, setSearchInput] = useState('');
  const [filterLeaderInput, setFilterLeaderInput] = useState('');
  const [filterSegmentInput, setFilterSegmentInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterLeader, setFilterLeader] = useState('');
  const [filterSegment, setFilterSegment] = useState('');
  const [leaders, setLeaders] = useState<{ _id: string; name: string }[]>([]);

  const allSegments = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => l.segment?.forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [leads]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = leaderId ? `/api/leaders/${leaderId}/leads` : '/api/leads';
        const [leadsRes, leadersRes] = await Promise.all([
          fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
          !leaderId ? fetch('/api/leaders', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null)
        ]);

        if (leadsRes.ok) {
          const data = await leadsRes.json();
          setLeads(data);

          if (leaderId && data.length === 0) {
            const leaderRes = await fetch(`/api/public/leaders/${leaderId}`);
            if (leaderRes.ok) {
              const leaderData = await leaderRes.json();
              setLeaderName(leaderData.name);
            }
          }
        }

        if (leadersRes?.ok) {
          const data = await leadersRes.json();
          setLeaders(data.map((l: any) => ({ _id: l._id, name: l.name })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [leaderId]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = lead.name.toLowerCase().includes(q);
        const matchPhone = lead.phone.includes(q);
        const matchEmail = lead.email?.toLowerCase().includes(q);
        const matchNeighborhood = lead.neighborhood?.toLowerCase().includes(q);
        const matchCity = lead.city?.toLowerCase().includes(q);
        const matchRegisteredBy = lead.registered_by?.toLowerCase().includes(q);
        if (!(matchName || matchPhone || matchEmail || matchNeighborhood || matchCity || matchRegisteredBy)) return false;
      }

      if (filterLeader && lead.leaderId._id !== filterLeader) return false;

      if (filterSegment && !lead.segment?.includes(filterSegment)) return false;

      return true;
    });
  }, [leads, search, filterLeader, filterSegment]);

  const applyFilters = () => {
    setSearch(searchInput);
    setFilterLeader(filterLeaderInput);
    setFilterSegment(filterSegmentInput);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilterLeaderInput('');
    setFilterSegmentInput('');
    setSearch('');
    setFilterLeader('');
    setFilterSegment('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters();
  };

  const hasActiveFilters = search || filterLeader || filterSegment;

  return (
    <AdminLayout>
      <div className="mb-8">
        {leaderId && (
          <Link to="/admin/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Lideranças
          </Link>
        )}
        <h1 className="text-2xl font-bold text-slate-800">
          {leaderId
            ? `Contatos de ${leads[0]?.leaderId?.name || leaderName || 'Líder'}`
            : 'Todos os Contatos'
          }
        </h1>
        <p className="text-slate-500 mt-1">
          {filteredLeads.length} {filteredLeads.length === 1 ? 'pessoa' : 'pessoas'}
          {hasActiveFilters && ` (filtrados de ${leads.length})`}
        </p>
      </div>

      {!loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Filtros</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <X className="w-3 h-3" /> Limpar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nome, telefone, email, bairro..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            {!leaderId && (
              <select
                value={filterLeaderInput}
                onChange={(e) => setFilterLeaderInput(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="">Todas as lideranças</option>
                {leaders.map((l) => (
                  <option key={l._id} value={l._id}>{l.name}</option>
                ))}
              </select>
            )}

            <select
              value={filterSegmentInput}
              onChange={(e) => setFilterSegmentInput(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="">Todos os segmentos</option>
              {allSegments.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Filtrar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <User className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">
            {hasActiveFilters ? 'Nenhum contato encontrado com esses filtros' : 'Nenhum contato cadastrado'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm md:hidden">
            <div className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <div key={lead._id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-slate-800 font-medium truncate">
                        <User className="w-4 h-4 mr-1.5 text-slate-400 inline-block -mt-0.5" />
                        {lead.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center truncate">
                        <Phone className="w-3 h-3 mr-1 shrink-0" /> {lead.phone}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400 whitespace-nowrap">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Link
                      to={`/admin/leads/${lead.leaderId._id}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      <UserCheck className="w-3 h-3 mr-1" /> {lead.leaderId.name}
                    </Link>
                    {lead.neighborhood && (
                      <span className="inline-flex items-center text-xs text-slate-500">
                        <MapPin className="w-3 h-3 mr-1 shrink-0" />
                        {lead.neighborhood}{lead.city ? ` - ${lead.city}` : ''}
                      </span>
                    )}
                  </div>

                  {lead.segment && lead.segment.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {lead.segment.slice(0, 3).map((s) => (
                        <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          {s}
                        </span>
                      ))}
                      {lead.segment.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{lead.segment.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {lead.email && <span className="truncate max-w-full">{lead.email}</span>}
                    {lead.registered_by && (
                      <span className="inline-flex items-center">
                        <UserCheck className="w-3 h-3 mr-1 shrink-0" />
                        Cadastro: {lead.registered_by}
                      </span>
                    )}
                    {lead.influence_potential && lead.influence_potential.length > 0 && (
                      <span className="inline-flex items-center" title={lead.influence_potential.join(', ')}>
                        <Star className="w-3 h-3 mr-1 shrink-0" />
                        {lead.influence_potential.slice(0, 1)}
                        {lead.influence_potential.length > 1 ? '…' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Contato</th>
                    <th className="px-6 py-3">Localização</th>
                    <th className="px-6 py-3">Segmento</th>
                    <th className="px-6 py-3">Influência</th>
                    <th className="px-6 py-3">Liderança</th>
                    <th className="px-6 py-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-800 font-medium">
                        <div className="flex flex-col">
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-slate-400" />
                            {lead.name}
                          </span>
                          {lead.registered_by && (
                            <span className="flex items-center text-xs text-slate-400 mt-1 ml-6">
                              <UserCheck className="w-3 h-3 mr-1 text-slate-300" />
                              {lead.registered_by}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex flex-col space-y-1 text-sm">
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1.5 text-slate-400" />
                            {lead.phone}
                          </span>
                          {lead.email && <span className="text-xs text-slate-500 truncate max-w-[150px]">{lead.email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs max-w-[140px]">
                        {lead.neighborhood ? (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1 shrink-0" />
                            {lead.neighborhood}{lead.city ? ` - ${lead.city}` : ''}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {lead.segment && lead.segment.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[140px]">
                            {lead.segment.slice(0, 2).map((s) => (
                              <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                {s}
                              </span>
                            ))}
                            {lead.segment.length > 2 && (
                              <span className="text-[10px] text-slate-400">+{lead.segment.length - 2}</span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs max-w-[120px]">
                        {lead.influence_potential && lead.influence_potential.length > 0 ? (
                          <span title={lead.influence_potential.join(', ')} className="line-clamp-2">
                            {lead.influence_potential.join(', ')}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/leads/${lead.leaderId._id}`}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          {lead.leaderId.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
