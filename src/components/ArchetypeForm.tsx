import { useState } from 'react';
import { Brain, Heart, Shield, AlertTriangle, Compass, ChevronLeft, ChevronRight, Star, MessageSquare } from 'lucide-react';

const SCALE = [
  { value: 1, label: 'Discordo totalmente', short: '1' },
  { value: 2, label: 'Discordo', short: '2' },
  { value: 3, label: 'Neutro', short: '3' },
  { value: 4, label: 'Concordo', short: '4' },
  { value: 5, label: 'Concordo totalmente', short: '5' },
];

const SCALE_MOBILE = [
  { value: 1, label: 'Discordo totalmente', short: '1' },
  { value: 2, label: 'Discordo', short: '2' },
  { value: 3, label: 'Neutro', short: '3' },
  { value: 4, label: 'Concordo', short: '4' },
  { value: 5, label: 'Concordo totalmente', short: '5' },
];

interface Question {
  id: number;
  text: string;
  archetype: string;
}

const AXES: { key: string; title: string; subtitle: string; icon: any; questions: Question[] }[] = [
  {
    key: 'identidade',
    title: 'Eixo 1 – Identidade',
    subtitle: 'Quem sou?',
    icon: Brain,
    questions: [
      { id: 1, text: 'Gosto de seguir meu próprio caminho.', archetype: 'Exploradora' },
      { id: 2, text: 'Busco constantemente aprender algo novo.', archetype: 'Sábia' },
      { id: 3, text: 'Costumo questionar regras estabelecidas.', archetype: 'Rebelde' },
      { id: 4, text: 'Tenho facilidade para liderar pessoas.', archetype: 'Governante' },
      { id: 5, text: 'Acredito que tudo acontece por uma razão.', archetype: 'Mago' },
      { id: 6, text: 'Gosto de explorar possibilidades diferentes.', archetype: 'Exploradora' },
      { id: 7, text: 'Prefiro segurança à aventura.', archetype: 'Inocente' },
      { id: 8, text: 'Sou reconhecida por minha criatividade.', archetype: 'Criadora' },
      { id: 9, text: 'Tenho necessidade de independência.', archetype: 'Exploradora' },
      { id: 10, text: 'As pessoas costumam procurar minha orientação.', archetype: 'Sábia' },
    ],
  },
  {
    key: 'relacionamentos',
    title: 'Eixo 2 – Relacionamentos',
    subtitle: 'Como me conecto?',
    icon: Heart,
    questions: [
      { id: 11, text: 'Cuidar dos outros é algo natural para mim.', archetype: 'Cuidadora' },
      { id: 12, text: 'Tenho dificuldade em pedir ajuda.', archetype: 'Guerreira' },
      { id: 13, text: 'Sinto necessidade de me sentir escolhida.', archetype: 'Amante' },
      { id: 14, text: 'Costumo assumir responsabilidades emocionais dos outros.', archetype: 'Cuidadora' },
      { id: 15, text: 'Procuro criar harmonia nos ambientes.', archetype: 'Amante' },
      { id: 16, text: 'Valorizo conexões profundas.', archetype: 'Amante' },
      { id: 17, text: 'Tenho medo de rejeição.', archetype: 'Sombra' },
      { id: 18, text: 'Gosto de fazer parte de grupos.', archetype: 'Inocente' },
      { id: 19, text: 'Sou protetora com quem amo.', archetype: 'Cuidadora' },
      { id: 20, text: 'Busco reconhecimento nas relações.', archetype: 'Amante' },
    ],
  },
  {
    key: 'poder',
    title: 'Eixo 3 – Poder e Autonomia',
    subtitle: 'Como lido com liderança e autonomia?',
    icon: Shield,
    questions: [
      { id: 21, text: 'Tenho facilidade para tomar decisões.', archetype: 'Governante' },
      { id: 22, text: 'Costumo assumir o controle das situações.', archetype: 'Governante' },
      { id: 23, text: 'Me incomoda depender dos outros.', archetype: 'Exploradora' },
      { id: 24, text: 'Sinto que nasci para realizar algo grande.', archetype: 'Mago' },
      { id: 25, text: 'Gosto de influenciar pessoas.', archetype: 'Governante' },
      { id: 26, text: 'Assumo riscos quando acredito em algo.', archetype: 'Rebelde' },
      { id: 27, text: 'Tenho coragem para recomeçar.', archetype: 'Guerreira' },
      { id: 28, text: 'Sou determinada diante dos obstáculos.', archetype: 'Guerreira' },
      { id: 29, text: 'Persisto mesmo quando ninguém acredita.', archetype: 'Guerreira' },
      { id: 30, text: 'Tenho disciplina para atingir objetivos.', archetype: 'Guerreira' },
    ],
  },
  {
    key: 'feridas',
    title: 'Eixo 4 – Feridas e Sombra',
    subtitle: 'O que me paralisa?',
    icon: AlertTriangle,
    questions: [
      { id: 31, text: 'Tenho medo de fracassar.', archetype: 'Sombra' },
      { id: 32, text: 'Tenho medo de não ser suficiente.', archetype: 'Sombra' },
      { id: 33, text: 'Sinto necessidade de aprovação.', archetype: 'Sombra' },
      { id: 34, text: 'Evito conflitos.', archetype: 'Sombra' },
      { id: 35, text: 'Tenho dificuldade em confiar.', archetype: 'Sombra' },
      { id: 36, text: 'Costumo me comparar.', archetype: 'Sombra' },
      { id: 37, text: 'Carrego mágoas antigas.', archetype: 'Sombra' },
      { id: 38, text: 'Tenho receio de mostrar vulnerabilidade.', archetype: 'Sombra' },
      { id: 39, text: 'Me sinto responsável pela felicidade dos outros.', archetype: 'Cuidadora' },
      { id: 40, text: 'Já abandonei sonhos por medo.', archetype: 'Sombra' },
    ],
  },
  {
    key: 'proposito',
    title: 'Eixo 5 – Propósito e Expansão',
    subtitle: 'O que me move?',
    icon: Compass,
    questions: [
      { id: 41, text: 'Quero deixar um legado.', archetype: 'Governante' },
      { id: 42, text: 'Sinto que minha vida tem um propósito maior.', archetype: 'Mago' },
      { id: 43, text: 'Busco autoconhecimento.', archetype: 'Sábia' },
      { id: 44, text: 'Gosto de ajudar pessoas a se transformarem.', archetype: 'Mago' },
      { id: 45, text: 'Tenho forte intuição.', archetype: 'Mago' },
      { id: 46, text: 'Sou atraída por espiritualidade.', archetype: 'Mago' },
      { id: 47, text: 'Acredito em processos de cura e evolução.', archetype: 'Mago' },
      { id: 48, text: 'Quero impactar positivamente a sociedade.', archetype: 'Governante' },
      { id: 49, text: 'Busco coerência entre quem sou e o que faço.', archetype: 'Sábia' },
      { id: 50, text: 'Estou disposta a me reinventar.', archetype: 'Exploradora' },
    ],
  },
];

const BRAND_QUESTIONS = [
  {
    id: 51,
    text: 'O propósito é…',
    type: 'single',
    options: [
      { label: 'Ajudar as pessoas a criarem algo', archetype: 'Criadora' },
      { label: 'Ser engraçado e fazer as pessoas se divertirem', archetype: 'Boba' },
      { label: 'Conectar as pessoas e ajudar a construir relacionamento', archetype: 'Amante' },
      { label: 'Questionar e não seguir os padrões do sistema', archetype: 'Rebelde' },
      { label: 'Permitir desacelerar a vida agitada', archetype: 'Inocente' },
      { label: 'Transmitir sofisticação e possuir alto valor', archetype: 'Governante' },
      { label: 'Promover a beleza e a elegância', archetype: 'Amante' },
      { label: 'Convidar o olhar para dentro', archetype: 'Mago' },
      { label: 'Motivar a superar limites', archetype: 'Guerreira' },
      { label: 'Acolher e promover o bem-estar', archetype: 'Cuidadora' },
      { label: 'Ajudar as pessoas a buscarem a própria individualidade', archetype: 'Exploradora' },
    ],
  },
  {
    id: 52,
    text: 'Você ou sua Marca está no caminho certo quando…',
    type: 'multi',
    options: [
      { label: 'Questiona os padrões e luta por uma causa vital', archetype: 'Rebelde' },
      { label: 'Usa coragem, força e metas para superar limites', archetype: 'Guerreira' },
      { label: 'As pessoas a procuram em busca de instrução e direcionamento', archetype: 'Sábia' },
      { label: 'Experimenta a emoção de fazer algo novo', archetype: 'Exploradora' },
      { label: 'Promove satisfação em um momento simples do dia-a-dia', archetype: 'Inocente' },
      { label: 'Assume a liderança, ajudando os clientes a assumir seus poderes', archetype: 'Governante' },
      { label: 'Pode se expressar livremente e criar', archetype: 'Criadora' },
      { label: 'Ajuda alguém a se sentir melhor', archetype: 'Cuidadora' },
      { label: 'Ajuda a pessoa a se questionar', archetype: 'Sábia' },
      { label: 'Se conecta com o outro ao ponto de formar comunidades', archetype: 'Amante' },
      { label: 'Conecta o mundo interior e exterior, criando algo visionário', archetype: 'Mago' },
      { label: 'Ajuda as pessoas a se sentirem especiais, exalando beleza e poder pessoal', archetype: 'Amante' },
    ],
  },
  {
    id: 53,
    text: 'Qual imagem você deseja transmitir…',
    type: 'multi',
    options: [
      { label: 'Otimista', archetype: 'Inocente' },
      { label: 'Inteligente', archetype: 'Sábia' },
      { label: 'Intuitiva', archetype: 'Mago' },
      { label: 'Bem-humorada', archetype: 'Boba' },
      { label: 'Cheia de charme', archetype: 'Amante' },
      { label: 'Forte', archetype: 'Guerreira' },
      { label: 'Cheia de ideias', archetype: 'Criadora' },
      { label: 'Elegante', archetype: 'Amante' },
      { label: 'Poderosa', archetype: 'Governante' },
      { label: 'Questionadora', archetype: 'Rebelde' },
      { label: 'Autônoma', archetype: 'Exploradora' },
      { label: 'Acolhedora', archetype: 'Cuidadora' },
      { label: 'Sincera', archetype: 'Inocente' },
      { label: 'Soberana', archetype: 'Governante' },
      { label: 'Criativa', archetype: 'Criadora' },
    ],
  },
];

const TEXT_QUESTIONS = [
  { id: 54, text: 'Quais são seus sonhos e aspirações pessoais ou que sonhos projeta para sua marca?' },
  { id: 55, text: 'O que te motiva a levantar todos os dias?' },
  { id: 56, text: 'Qual seu principal objetivo na vida?' },
  { id: 57, text: 'Como você gostaria de ser lembrado ou que sua marca seja lembrada?' },
];

const TOTAL_STEPS = AXES.length + 2;
const SCALE_QUESTION_COUNT = AXES.reduce((acc, a) => acc + a.questions.length, 0);

interface ArchetypeFormProps {
  leaderId: string;
  leaderName: string;
}

export default function ArchetypeForm({ leaderId, leaderName }: ArchetypeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [brandSingle, setBrandSingle] = useState<string>('');
  const [brandMulti, setBrandMulti] = useState<Record<number, string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [renderError, setRenderError] = useState('');
  const [showFinalScreen, setShowFinalScreen] = useState(false);

  const isScaleStep = currentStep < AXES.length;
  const isBrandStep = currentStep === AXES.length;
  const isTextStep = currentStep === AXES.length + 1;
  const isLast = currentStep === TOTAL_STEPS - 1;

  const axis = isScaleStep ? AXES[currentStep] : null;
  const questions = axis?.questions || [];

  const scaleAnswered: number = Object.keys(answers).length;
  const brandQAnswered: number = brandSingle ? 1 : 0;
  const brandMultiAnswered: number = Object.keys(brandMulti).reduce((acc: number, k: string) => acc + ((brandMulti[Number(k)]?.length || 0) > 0 ? 1 : 0), 0);
  const textAnswered: number = Object.keys(textAnswers).filter((k: string) => textAnswers[Number(k)]?.trim()).length;
  const totalAnswered: number = scaleAnswered + brandQAnswered + brandMultiAnswered + textAnswered;
  const totalQuestions = SCALE_QUESTION_COUNT + BRAND_QUESTIONS.length + TEXT_QUESTIONS.length;

  const isCurrentComplete = isScaleStep
    ? questions.every((q) => answers[q.id] !== undefined)
    : true;

  const goNext = () => {
    if (isLast) return;
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrev = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleBrandMulti = (qId: number, label: string) => {
    setBrandMulti((prev) => {
      const current = prev[qId] || [];
      return {
        ...prev,
        [qId]: current.includes(label)
          ? current.filter((i) => i !== label)
          : [...current, label],
      };
    });
  };

  const calculateResults = () => {
    const scores: Record<string, { sum: number; count: number }> = {};
    const shadowAnswers: { id: number; value: number }[] = [];

    AXES.forEach((a) => {
      a.questions.forEach((q) => {
        const value = answers[q.id] || 3;
        const arch = q.archetype;
        if (arch === 'Sombra') {
          shadowAnswers.push({ id: q.id, value });
          return;
        }
        if (!scores[arch]) scores[arch] = { sum: 0, count: 0 };
        scores[arch].sum += value;
        scores[arch].count += 1;
      });
    });

    BRAND_QUESTIONS.forEach((q) => {
      if (q.type === 'single' && brandSingle) {
        const opt = q.options.find((o) => o.label === brandSingle);
        if (opt) {
          if (!scores[opt.archetype]) scores[opt.archetype] = { sum: 0, count: 0 };
          scores[opt.archetype].sum += 5;
          scores[opt.archetype].count += 1;
        }
      }
      if (q.type === 'multi') {
        const selected = brandMulti[q.id] || [];
        selected.forEach((label) => {
          const opt = q.options.find((o) => o.label === label);
          if (opt) {
            if (!scores[opt.archetype]) scores[opt.archetype] = { sum: 0, count: 0 };
            scores[opt.archetype].sum += 5;
            scores[opt.archetype].count += 1;
          }
        });
      }
    });

    const percentages: Record<string, number> = {};
    Object.entries(scores).forEach(([arch, data]) => {
      percentages[arch] = Math.round((data.sum / (data.count * 5)) * 100);
    });

    const sorted = Object.entries(percentages).sort(([, a], [, b]) => b - a);
    const shadowScore = shadowAnswers.length > 0
      ? Math.round((shadowAnswers.reduce((acc, s) => acc + s.value, 0) / (shadowAnswers.length * 5)) * 100)
      : 0;

    const activeArchetypes = sorted.filter(([, s]) => s > 0);
    const dominant = activeArchetypes[0] || ['', 0];
    const potency = activeArchetypes[1] || activeArchetypes[0] || ['', 0];

    const shadowArchetypeEntry = [...activeArchetypes].reverse().find(([name]) => name !== dominant[0] && name !== 'Boba') || activeArchetypes[activeArchetypes.length - 1] || ['', 0];

    const evolutionCandidates = ['Governante', 'Mago', 'Sábia', 'Criadora', 'Exploradora'];
    const evolution = evolutionCandidates
      .map((a) => ({ name: a, score: percentages[a] || 0 }))
      .sort((a, b) => b.score - a.score)
      .find((a) => a.name !== dominant[0]) || { name: 'Governante', score: 0 };

    return {
      dominant: { name: dominant[0], score: dominant[1] },
      potency: { name: potency[0], score: potency[1] },
      secondary: { name: potency[0], score: potency[1] },
      shadow: { name: shadowArchetypeEntry[0], score: shadowArchetypeEntry[1] },
      shadowIntensity: shadowScore,
      wounded: { score: shadowScore },
      evolution: { name: evolution.name, score: evolution.score },
      percentages,
    };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    let result;
    try {
      result = calculateResults();
    } catch (err: any) {
      setSubmitError('Erro ao calcular resultados: ' + (err.message || 'erro inesperado'));
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/public/archetype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaderId,
          leaderName,
          answers,
          brandSingle,
          brandMulti,
          textAnswers,
          results: result,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.details || errData.error || 'Erro ao salvar');
      }
      setShowFinalScreen(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar mapeamento. Verifique se o banco de dados foi configurado.');
    } finally {
      setSubmitting(false);
    }
  };

  if (showFinalScreen) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center">
          <div className="bg-gradient-to-r from-[#8A63C8] to-[#469AC5] px-8 py-10 text-white">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img src="/logo-synaptessence.png" alt="SynaptEssence" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
            </div>
            <h1 className="text-2xl font-bold">Mapeamento Concluído!</h1>
            <p className="text-[#E7D9F5] mt-1">Plataforma Estratégica</p>
          </div>
          <div className="p-8 space-y-4">
            <div className="w-16 h-16 bg-[#F3ECFB] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#8A63C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-xl font-bold text-slate-800">Obrigado, {leaderName}!</p>
            <p className="text-slate-500 text-sm">
              Seu mapeamento arquetípico foi concluído com sucesso. Seus resultados já estão disponíveis para análise da equipe.
            </p>

            <p className="text-xs text-slate-400">
              Você pode fechar esta página. Seus dados foram registrados com segurança.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stepLabel = isScaleStep
    ? `Eixo ${currentStep + 1}`
    : isBrandStep
    ? 'Marca'
    : 'Reflexão';

  const stepIcon = isScaleStep
    ? axis!.icon
    : isBrandStep
    ? Star
    : MessageSquare;

  const StepIcon = stepIcon;

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="bg-gradient-to-r from-[#8A63C8] to-[#469AC5] px-4 sm:px-8 py-5 sm:py-8 text-center text-white">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 overflow-hidden">
              <img src="/logo-synaptessence.png" alt="SynaptEssence" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold">Plataforma Estratégica</h1>
            <p className="text-[#E7D9F5] text-xs sm:text-sm">Método: SynaptEssence360®</p>
            <p className="text-[#D3C0EC] text-[10px] sm:text-xs mt-1 sm:mt-2">Tecnologia Social de Desenvolvimento Humano Integral</p>
            <p className="text-[#D3C0EC] text-[10px] sm:text-xs mt-1 sm:mt-2">
              {totalAnswered} de {totalQuestions} perguntas respondidas
            </p>
            <div className="mt-2 sm:mt-3 w-full bg-white/20 rounded-full h-1.5 max-w-md mx-auto">
              <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }} />
            </div>
          </div>

          <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-1 sm:pb-2">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-[#8A63C8] uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                <StepIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {stepLabel}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">
                Etapa {currentStep + 1} de {TOTAL_STEPS}
              </span>
            </div>
            {isScaleStep && axis && <p className="text-xs sm:text-sm text-slate-500">{axis.subtitle}</p>}
            {isBrandStep && <p className="text-xs sm:text-sm text-slate-500">Posicionamento e identidade</p>}
            {isTextStep && <p className="text-xs sm:text-sm text-slate-500">Suas aspirações e motivações</p>}
            <div className="flex gap-1 mt-2 sm:mt-3">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                  i < currentStep ? 'bg-[#8A63C8]' : i === currentStep ? 'bg-[#8A63C8]' : 'bg-slate-200'
                }`} />
              ))}
            </div>
          </div>

          <div className="p-3 sm:p-8 space-y-3 sm:space-y-6">
            {isScaleStep && questions.map((q) => (
              <div key={q.id} className="p-3 sm:p-5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-white px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-200 shrink-0 mt-0.5">
                    {q.id}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-800">{q.text}</p>
                </div>
                <div className="pl-0 sm:pl-8">
                  <div className="grid grid-cols-5 gap-1 sm:gap-1.5 mb-1">
                    {SCALE.map((s) => (
                      <button key={s.value} type="button" onClick={() => setAnswer(q.id, s.value)}
                        className={`py-2.5 sm:py-3 px-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all min-h-[40px] sm:min-h-[44px] ${
                          answers[q.id] === s.value
                            ? 'bg-[#8A63C8] text-white shadow-sm ring-2 ring-[#C9B5E8]'
                            : 'bg-white text-slate-600 border border-slate-200 active:bg-[#F3ECFB]'
                        }`}
                      >
                        <span className="block leading-tight">{s.value}</span>
                      </button>
                    ))}
                  </div>
                  <div className="hidden sm:flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Discordo totalmente</span>
                    <span>Neutro</span>
                    <span>Concordo totalmente</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 sm:hidden">
                    <span>Discordo</span>
                    <span>Concordo</span>
                  </div>
                </div>
              </div>
            ))}

            {isBrandStep && BRAND_QUESTIONS.map((q) => (
              <div key={q.id} className="p-3 sm:p-5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-white px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-200 shrink-0 mt-0.5">
                    {q.id}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-800">{q.text}</p>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  {q.options.map((opt) =>
                    q.type === 'single' ? (
                      <label key={opt.label} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                        brandSingle === opt.label
                          ? 'border-[#A98AD8] bg-[#F3ECFB]'
                          : 'border-slate-200 bg-white active:border-[#D3C0EC]'
                      }`}>
                        <input type="radio" name={`brand-${q.id}`} checked={brandSingle === opt.label}
                          onChange={() => setBrandSingle(opt.label)}
                          className="w-4 h-4 shrink-0 text-[#8A63C8] border-slate-300 focus:ring-[#8A63C8]" />
                        <span className="text-xs sm:text-sm text-slate-700 leading-tight">{opt.label}</span>
                      </label>
                    ) : (
                      <label key={opt.label} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                        (brandMulti[q.id] || []).includes(opt.label)
                          ? 'border-[#A98AD8] bg-[#F3ECFB]'
                          : 'border-slate-200 bg-white active:border-[#D3C0EC]'
                      }`}>
                        <input type="checkbox" checked={(brandMulti[q.id] || []).includes(opt.label)}
                          onChange={() => toggleBrandMulti(q.id, opt.label)}
                          className="w-4 h-4 shrink-0 text-[#8A63C8] rounded border-slate-300 focus:ring-[#8A63C8]" />
                        <span className="text-xs sm:text-sm text-slate-700 leading-tight">{opt.label}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            ))}

            {isTextStep && TEXT_QUESTIONS.map((q) => (
              <div key={q.id} className="p-3 sm:p-5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-white px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-200 shrink-0 mt-0.5">
                    {q.id}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-800">{q.text}</p>
                </div>
                <div>
                  <textarea
                    value={textAnswers[q.id] || ''}
                    onChange={(e) => setTextAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8A63C8] outline-none text-xs sm:text-sm resize-y"
                    placeholder="Escreva aqui..."
                  />
                </div>
              </div>
            ))}
          </div>

          {submitError && (
            <div className="px-3 sm:px-8 pb-2">
              <div className="p-3 sm:p-4 bg-red-50 text-red-700 rounded-xl text-xs sm:text-sm border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                {submitError}
              </div>
            </div>
          )}
          <div className="px-3 sm:px-8 pb-3 sm:pb-8 flex items-center justify-between gap-2">
            <button type="button" onClick={goPrev} disabled={currentStep === 0}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[40px] sm:min-h-[44px]"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {isScaleStep && !isCurrentComplete && (
                <span className="text-[10px] sm:text-xs text-amber-600">Responda todas para continuar</span>
              )}

              {isLast ? (
                <button type="button" onClick={handleSubmit} disabled={submitting}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#8A63C8] to-[#469AC5] text-white text-xs sm:text-sm font-bold rounded-xl hover:from-[#6E49AC] hover:to-[#3E7FC0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md min-h-[40px] sm:min-h-[44px]"
                >
                  {submitting ? 'Processando...' : 'Finalizar'}
                </button>
              ) : (
                <button type="button" onClick={goNext} disabled={isScaleStep && !isCurrentComplete}
                  className="flex items-center gap-1 sm:gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#8A63C8] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#6E49AC] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md min-h-[40px] sm:min-h-[44px]"
                >
                  <span className="hidden sm:inline">Próximo</span> <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
