import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Brain } from 'lucide-react';
import ArchetypeForm from '../components/ArchetypeForm';

export default function ArchetypeAccess() {
  const { leaderId } = useParams<{ leaderId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!leaderId) {
      setError('ID do líder não informado.');
      setLoading(false);
      return;
    }
    checkArchetype(leaderId);
  }, [leaderId]);

  const checkArchetype = async (id: string) => {
    try {
      const leaderRes = await fetch(`/api/public/leaders/${id}`);
      if (!leaderRes.ok) {
        setError('Líder não encontrado.');
        setLoading(false);
        return;
      }
      const leaderData = await leaderRes.json();
      setLeaderName(leaderData.name);

      const checkRes = await fetch(`/api/public/archetype/check/${id}`);
      const checkData = await checkRes.json();
      setAlreadyCompleted(checkData.completed);
    } catch {
      setError('Erro ao verificar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm text-center border border-slate-200">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-[#8A63C8] animate-spin mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl shadow-sm text-center border border-slate-200">
          <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">Erro</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return <ArchetypeForm leaderId={leaderId!} leaderName={leaderName} />;
  }

  if (alreadyCompleted) {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white p-6 sm:p-8 rounded-2xl shadow-sm text-center border border-slate-200">
          <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Mapeamento já realizado!</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-2">
            Olá, <strong>{leaderName}</strong>!
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            Você já completou o Mapeamento Arquetípico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white p-6 sm:p-8 rounded-2xl shadow-sm text-center border border-slate-200">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center mx-auto mb-4 sm:mb-5 overflow-hidden">
          <img src="/logo-synaptessence.png" alt="SynaptEssence" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Mapeamento Arquetípico</h2>
        <p className="text-sm sm:text-base text-slate-600 mb-2">
          Olá, <strong>{leaderName}</strong>!
        </p>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8">
          Descubra seu perfil de liderança através do mapeamento arquetípico da Plataforma Estratégica.
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-[#8A63C8] to-[#469AC5] text-white text-sm sm:text-base font-bold rounded-xl hover:from-[#6E49AC] hover:to-[#3E7FC0] transition-all shadow-md mx-auto"
        >
          <Brain className="w-4 h-4 sm:w-5 sm:h-5" /> Iniciar Mapeamento
        </button>
      </div>
    </div>
  );
}
