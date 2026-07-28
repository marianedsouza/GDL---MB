import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Calendar } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  address?: string;
  createdAt: string;
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
                  <th className="px-6 py-3">Nome / CPF</th>
                  <th className="px-6 py-3">Contato</th>
                  <th className="px-6 py-3">Endereço</th>
                  {!leaderId && <th className="px-6 py-3">Liderança</th>}
                  <th className="px-6 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-800 font-medium">
                      <div className="flex flex-col">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-slate-400" />
                          {lead.name}
                        </span>
                        {lead.cpf && <span className="text-xs text-slate-500 mt-1 ml-6">{lead.cpf}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col space-y-1 text-sm">
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-slate-400" />
                          {lead.phone}
                        </span>
                        {lead.email && <span className="text-xs text-slate-500 ml-6 truncate max-w-[150px]">{lead.email}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {lead.address ? (
                        <span className="line-clamp-2 max-w-[200px]" title={lead.address}>{lead.address}</span>
                      ) : (
                        '-'
                      )}
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
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
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
