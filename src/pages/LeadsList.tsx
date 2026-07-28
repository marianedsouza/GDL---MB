import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Calendar, MapPin, Tag, UserCheck } from 'lucide-react';
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

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = leaderId ? `/api/leaders/${leaderId}/leads` : '/api/leads';
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setLeads(data);
          
          if (leaderId && data.length === 0) {
            // Se nao tiver leads mas tiver leaderId, buscar o nome do lider para exibir
            const leaderRes = await fetch(`/api/public/leaders/${leaderId}`);
            if (leaderRes.ok) {
               const leaderData = await leaderRes.json();
               setLeaderName(leaderData.name);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [leaderId]);

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
          Total: {leads.length} {leads.length === 1 ? 'pessoa' : 'pessoas'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <User className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Nenhum contato encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3">Responsável</th>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Contato</th>
                  <th className="px-6 py-3">Localização</th>
                  <th className="px-6 py-3">Segmento</th>
                  <th className="px-6 py-3">Influência</th>
                  {!leaderId && <th className="px-6 py-3">Liderança</th>}
                  <th className="px-6 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {lead.registered_by ? (
                        <span className="flex items-center">
                          <UserCheck className="w-4 h-4 mr-1.5 text-slate-400" />
                          {lead.registered_by}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium">
                      <div className="flex flex-col">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-slate-400" />
                          {lead.name}
                        </span>
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
                    {!leaderId && (
                      <td className="px-6 py-4">
                        <Link 
                          to={`/admin/leads/${lead.leaderId._id}`}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          {lead.leaderId.name}
                        </Link>
                      </td>
                    )}
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
      )}
    </AdminLayout>
  );
}
