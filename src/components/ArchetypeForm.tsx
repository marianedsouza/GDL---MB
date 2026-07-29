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

interface ArchetypeInfo {
  label: string;
  color: string;
  bg: string;
  jung: string;
  luz: string;
  sombra: string;
  mensagem: string;
}

const ARCHETYPE_DESCRIPTIONS: Record<string, ArchetypeInfo> = {
  Cuidadora: {
    label: 'Cuidadora', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200',
    jung: 'Persona Materna — Complexo Materno',
    luz: 'Acolhimento, empatia, proteção, generosidade',
    sombra: 'Autossacrifício, codependência, culpa ao dizer não',
    mensagem: 'Seu dom é nutrir. Lembre-se: para cuidar do outro é preciso cuidar de si.',
  },
  Rebelde: {
    label: 'Rebelde', color: 'text-red-600', bg: 'bg-red-50 border-red-200',
    jung: 'Sombra do Sistema — Questionamento do Status Quo',
    luz: 'Inovação, coragem de romper, autenticidade',
    sombra: 'Raiva destrutiva, rebeldia por impulso, isolamento',
    mensagem: 'Sua força está em questionar. Canalize sua rebeldia para transformar o que precisa ser mudado.',
  },
  Sábia: {
    label: 'Sábia', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200',
    jung: 'Self — O Velho Sábio, Busca pela Verdade',
    luz: 'Conhecimento, reflexão, discernimento, consciência',
    sombra: 'Distanciamento emocional, arrogância intelectual, obsessão por respostas',
    mensagem: 'Sua sabedoria ilumina. Compartilhe o que sabe sem perder a humildade de aprender.',
  },
  Exploradora: {
    label: 'Exploradora', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200',
    jung: 'Animus — O Explorador, Busca por Autonomia',
    luz: 'Independência, liberdade, descoberta, autoconfiança',
    sombra: 'Inquietude, incapacidade de se comprometer, fuga emocional',
    mensagem: 'Sua alma busca novos horizontes. Explore o mundo externo sem fugir do seu mundo interno.',
  },
  Criadora: {
    label: 'Criadora', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200',
    jung: 'Self Criativo — Imaginação e Expressão do Inconsciente',
    luz: 'Criatividade, inovação, originalidade, expressão',
    sombra: 'Perfeccionismo paralisante, inconclusão, autocrítica excessiva',
    mensagem: 'Você é uma canal de criação. Dê forma ao que existe dentro de você sem medo do julgamento.',
  },
  Governante: {
    label: 'Governante', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200',
    jung: 'Persona de Poder — Liderança e Responsabilidade Coletiva',
    luz: 'Liderança, visão estratégica, responsabilidade, ordem',
    sombra: 'Autoritarismo, necessidade de controle, medo de delegar',
    mensagem: 'Você nasceu para liderar. Lembre-se: poder verdadeiro é servir com responsabilidade.',
  },
  Inocente: {
    label: 'Inocente', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200',
    jung: 'Self Original — O Paraíso Perdido, Confiança na Vida',
    luz: 'Otimismo, pureza, esperança, simplicidade',
    sombra: 'Ingenuidade, negação da realidade, dependência',
    mensagem: 'Guarde sua essência pura. Confiar na vida é belo, mas a maturidade exige discernimento.',
  },
  Amante: {
    label: 'Amante', color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200',
    jung: 'Anima — Eros, Conexão e Desejo de União',
    luz: 'Paixão, conexão profunda, beleza, encantamento',
    sombra: 'Carência afetiva, idealização do outro, ciúmes',
    mensagem: 'Seu coração sente com profundidade. Ame sem se perder no outro — a união verdadeira começa dentro de você.',
  },
  Mago: {
    label: 'Mago', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200',
    jung: 'Self Transpessoal — Individuação, Transformação Alquímica',
    luz: 'Intuição, transformação, propósito, transcendência',
    sombra: 'Manipulação, escapismo espiritual, desconexão da realidade',
    mensagem: 'Você é um agente de transformação. Use seu poder para curar, não para controlar.',
  },
  Guerreira: {
    label: 'Guerreira', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200',
    jung: 'Persona Heroica — Coragem e Disciplina na Jornada',
    luz: 'Coragem, disciplina, determinação, resiliência',
    sombra: 'Agressividade, rigidez, exaustão por superexigência',
    mensagem: 'Sua força é admirável. Mas a verdadeira guerreira sabe quando lutar e quando descansar.',
  },
  Boba: {
    label: 'Boba', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200',
    jung: 'Trickster — O Bobo Sagrado, Sabedoria através do Riso',
    luz: 'Humor, leveza, espontaneidade, alegria',
    sombra: 'Irresponsabilidade, fuga emocional, cinismo',
    mensagem: 'O riso é sua sabedoria. Use a leveza para desarmar, não para esconder a verdade.',
  },
  Sombra: {
    label: 'Sombra', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200',
    jung: 'Sombra — Conteúdo Reprimido do Inconsciente Pessoal',
    luz: 'Autoconhecimento profundo, integração, humildade',
    sombra: 'Projeção nos outros, negação, autossabotagem',
    mensagem: 'O que você rejeita em si mesma ainda te governa. Integrar a sombra é o caminho para a liberdade.',
  },
};

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
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [renderError, setRenderError] = useState('');

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
    setResults(result);

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
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar mapeamento. Verifique se o banco de dados foi configurado.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && results) {
    try {
      const pcts = results.percentages || {};
      const sorted = Object.entries(pcts).sort(([, a], [, b]) => (b as number) - (a as number));

      const jungianConcepts: Record<string, { layer: string; desc: string }> = {
        Persona: { layer: 'Persona', desc: 'A máscara social que você apresenta ao mundo. Quem você aprendeu a ser para ser aceita.' },
        Potencia: { layer: 'Anima / Animus', desc: 'O potencial ainda não vivido. A parte de você que busca expressão e espera sua vez.' },
        Sombra: { layer: 'Sombra', desc: 'Aquilo que você rejeita em si mesma. Quanto menor a pontuação, mais esse arquétipo foi reprimido.' },
        Ferido: { layer: 'Complexo Emocional', desc: 'Suas feridas e medos inconscientes. Onde a energia psíquica fica bloqueada.' },
        Self: { layer: 'Self', desc: 'A totalidade em movimento. Para onde o processo de individuação está te levando.' },
      };

      const dominant = results.dominant || { name: '', score: 0 };
      const potency = results.potency || results.secondary || { name: '', score: 0 };
      const shadow = results.shadow || { name: '', score: 0 };
      const wounded = results.wounded || { score: results.shadowIntensity || 0 };
      const evolution = results.evolution || { name: '', score: 0 };

      const dominantInfo = ARCHETYPE_DESCRIPTIONS[dominant.name];
      const potencyInfo = ARCHETYPE_DESCRIPTIONS[potency.name];
      const shadowInfo = ARCHETYPE_DESCRIPTIONS[shadow.name];
      const evoInfo = ARCHETYPE_DESCRIPTIONS[evolution.name];

      return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-8 py-6 sm:py-10 text-center text-white">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold">Mapeamento Arquetípico</h1>
                <p className="text-indigo-100 text-xs sm:text-sm mt-1">NeuroEssence360®️</p>
              </div>

              <div className="p-3 sm:p-8 space-y-4 sm:space-y-6">
                {submitError && (
                  <div className="p-3 sm:p-4 bg-amber-50 text-amber-800 rounded-xl text-xs sm:text-sm border border-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <p className="font-semibold text-xs sm:text-sm">Resultado gerado localmente</p>
                      <p className="text-amber-700 mt-1">{submitError}</p>
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-slate-500">Resultado para</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-800">{leaderName}</p>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-xs sm:text-sm text-indigo-800">
                  <p className="font-semibold mb-1">Base Junguiana</p>
                  <p className="text-indigo-600 leading-relaxed">
                    "Individuação significa tornar-se um ser uno, e na medida em que a individualidade
                    abrange nossa unicidade mais íntima, tornar-se o próprio Self." — Carl Jung
                  </p>
                  <p className="text-indigo-500 mt-2">
                    Este mapeamento integra os arquétipos estruturais de Jung (Persona, Sombra, Anima/Animus, Self)
                    com a jornada do herói de Joseph Campbell e Carol Pearson.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                    <p className="text-[10px] sm:text-xs font-semibold text-indigo-500 uppercase tracking-wider">{jungianConcepts.Persona.layer}</p>
                    <p className="text-[10px] sm:text-xs text-indigo-400 mb-1">Arquétipo Dominante</p>
                    <p className="text-xl sm:text-2xl font-bold text-indigo-700 mt-1">{dominant.name || '---'}</p>
                    <p className="text-[10px] text-indigo-400 mt-1">{dominantInfo?.jung || ''}</p>
                    <div className="mt-2 w-full bg-indigo-200 rounded-full h-2 sm:h-2.5">
                      <div className="bg-indigo-600 h-2 sm:h-2.5 rounded-full" style={{ width: `${dominant.score}%` }} />
                    </div>
                    <p className="text-xs sm:text-sm text-indigo-500 mt-1">{dominant.score}%</p>
                    <p className="text-[10px] sm:text-xs text-indigo-500/70 mt-2 leading-relaxed">{jungianConcepts.Persona.desc}</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                    <p className="text-[10px] sm:text-xs font-semibold text-amber-500 uppercase tracking-wider">{jungianConcepts.Potencia.layer}</p>
                    <p className="text-[10px] sm:text-xs text-amber-400 mb-1">Arquétipo de Potência</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">{potency.name || '---'}</p>
                    <p className="text-[10px] text-amber-400 mt-1">{potencyInfo?.jung || ''}</p>
                    <div className="mt-2 w-full bg-amber-200 rounded-full h-2 sm:h-2.5">
                      <div className="bg-amber-500 h-2 sm:h-2.5 rounded-full" style={{ width: `${potency.score}%` }} />
                    </div>
                    <p className="text-xs sm:text-sm text-amber-500 mt-1">{potency.score}%</p>
                    <p className="text-[10px] sm:text-xs text-amber-500/70 mt-2 leading-relaxed">{jungianConcepts.Potencia.desc}</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-50 to-red-50 border border-slate-200">
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{jungianConcepts.Sombra.layer}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Arquétipo Sombra</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-600 mt-1">{shadow.name || 'Sombra'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{shadowInfo?.jung || 'Conteúdo reprimido'}</p>
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-2 sm:h-2.5">
                      <div className="bg-slate-400 h-2 sm:h-2.5 rounded-full" style={{ width: `${shadow.score}%` }} />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">{shadow.score}%</p>
                    <p className="text-[10px] sm:text-xs text-slate-500/70 mt-2 leading-relaxed">{jungianConcepts.Sombra.desc}</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                    <p className="text-[10px] sm:text-xs font-semibold text-rose-500 uppercase tracking-wider">{jungianConcepts.Ferido.layer}</p>
                    <p className="text-[10px] sm:text-xs text-rose-400 mb-1">Intensidade da Ferida</p>
                    <p className="text-xl sm:text-2xl font-bold text-rose-700 mt-1">{wounded.score || 0}%</p>
                    <div className="mt-2 w-full bg-rose-200 rounded-full h-2 sm:h-2.5">
                      <div className="bg-rose-400 h-2 sm:h-2.5 rounded-full" style={{ width: `${wounded.score || 0}%` }} />
                    </div>
                    <p className="text-[10px] sm:text-xs text-rose-500/70 mt-2 leading-relaxed">{jungianConcepts.Ferido.desc}</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 sm:col-span-2">
                    <p className="text-[10px] sm:text-xs font-semibold text-emerald-500 uppercase tracking-wider">{jungianConcepts.Self.layer}</p>
                    <p className="text-[10px] sm:text-xs text-emerald-400 mb-1">Arquétipo de Evolução</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">{evolution.name || '---'}</p>
                    <p className="text-[10px] text-emerald-400 mt-1">{evoInfo?.jung || ''}</p>
                    <div className="mt-2 w-full bg-emerald-200 rounded-full h-2 sm:h-2.5">
                      <div className="bg-emerald-500 h-2 sm:h-2.5 rounded-full" style={{ width: `${evolution.score}%` }} />
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-500 mt-1">{evolution.score}%</p>
                    <p className="text-[10px] sm:text-xs text-emerald-500/70 mt-2 leading-relaxed">{jungianConcepts.Self.desc}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 sm:pt-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Perfil Arquetípico Completo</h3>
                  <p className="text-xs text-slate-400 mb-3">10 arquétipos de personalidade (Pearson) + conceitos Junguianos</p>
                  <div className="space-y-1.5 sm:space-y-2">
                    {sorted.map(([name, score]) => {
                      const info = (ARCHETYPE_DESCRIPTIONS as any)[name];
                      const isShadow = name === (shadow.name);
                      const isDominant = name === (dominant.name);
                      return (
                        <div key={name} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border ${info?.bg || 'bg-slate-50 border-slate-200'}`}>
                          <span className={`text-xs sm:text-sm font-bold w-16 sm:w-24 shrink-0 truncate ${info?.color || 'text-slate-600'}`}>{info?.label || name}</span>
                          <div className="flex-1 bg-white/60 rounded-full h-1.5 sm:h-2">
                            <div className={`h-1.5 sm:h-2 rounded-full ${(info?.color || 'text-slate-600').replace('text', 'bg')}`}
                              style={{ width: `${score}%`, opacity: isShadow ? 0.4 : 0.7 }} />
                          </div>
                          <span className="text-[10px] sm:text-xs text-slate-500 w-6 sm:w-8 text-right shrink-0">{score}%</span>
                          <div className="hidden sm:flex gap-1 shrink-0">
                            {isDominant && <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">Persona</span>}
                            {isShadow && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Sombra</span>}
                            {name === evolution.name && !isDominant && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">Self</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 sm:pt-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Interpretação Junguiana</h3>
                  <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <div className="p-3 sm:p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <p className="font-semibold text-indigo-700 mb-1">Persona: {dominant.name}</p>
                      <p>{dominantInfo?.luz || ''}</p>
                      {dominantInfo?.mensagem && <p className="text-indigo-600 mt-2 italic">"{dominantInfo.mensagem}"</p>}
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="font-semibold text-amber-700 mb-1">Potência: {potency.name}</p>
                      <p>{potencyInfo?.luz || ''}</p>
                      {potencyInfo?.mensagem && <p className="text-amber-600 mt-2 italic">"{potencyInfo.mensagem}"</p>}
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="font-semibold text-slate-700 mb-1">Sombra: {shadow.name}</p>
                      <p className="text-slate-600">{shadowInfo?.sombra || 'Padrão inconsciente que pode estar sendo projetado nos outros.'}</p>
                      <p className="text-slate-500 mt-2 text-xs">
                        Quanto menor a pontuação, mais esse arquétipo foi reprimido. A sombra não é ruim — é energia vital
                        que precisa ser integrada.
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-rose-50 border border-rose-100">
                      <p className="font-semibold text-rose-700 mb-1">Ferida: {wounded.score || 0}% de intensidade</p>
                      <p className="text-rose-600 text-xs">
                        Medo de fracasso, necessidade de aprovação, evitação de conflitos — essas são as vozes do
                        Complexo. O primeiro passo para curar é nomear.
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="font-semibold text-emerald-700 mb-1">Self / Individuação: {evolution.name}</p>
                      <p className="text-emerald-600">{evoInfo?.luz || ''}</p>
                      {evoInfo?.mensagem && <p className="text-emerald-600 mt-2 italic">"{evoInfo.mensagem}"</p>}
                      <p className="text-emerald-500 text-xs mt-2">
                        O arquétipo de evolução representa o próximo passo da sua jornada de individuação.
                        Não é sobre ser perfeita — é sobre ser completa.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-[10px] sm:text-xs text-slate-400 pt-2 sm:pt-4">
                  NeuroEssence360®️ — Método integrado de mapeamento arquetípico baseado em Jung, Campbell e Pearson.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (err: any) {
      return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-md text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Erro ao exibir resultados</h2>
            <p className="text-sm text-slate-600 mb-4">{err.message || 'Ocorreu um erro inesperado ao processar seus resultados.'}</p>
            <button onClick={() => { setSubmitted(false); setResults(null); setSubmitError(''); }}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all"
            >
              Voltar ao formulário
            </button>
          </div>
        </div>
      );
    }
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
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-8 py-5 sm:py-8 text-center text-white">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Brain className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold">Mapeamento Arquetípico</h1>
            <p className="text-indigo-100 text-xs sm:text-sm">NeuroEssence360®️</p>
            <p className="text-indigo-200 text-[10px] sm:text-xs mt-1 sm:mt-2">
              {totalAnswered} de {totalQuestions} perguntas respondidas
            </p>
            <div className="mt-2 sm:mt-3 w-full bg-white/20 rounded-full h-1.5 max-w-md mx-auto">
              <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }} />
            </div>
          </div>

          <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-1 sm:pb-2">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-indigo-600 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
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
                  i < currentStep ? 'bg-indigo-500' : i === currentStep ? 'bg-indigo-600' : 'bg-slate-200'
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
                            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                            : 'bg-white text-slate-600 border border-slate-200 active:bg-indigo-50'
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
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-slate-200 bg-white active:border-indigo-200'
                      }`}>
                        <input type="radio" name={`brand-${q.id}`} checked={brandSingle === opt.label}
                          onChange={() => setBrandSingle(opt.label)}
                          className="w-4 h-4 shrink-0 text-indigo-600 border-slate-300 focus:ring-indigo-600" />
                        <span className="text-xs sm:text-sm text-slate-700 leading-tight">{opt.label}</span>
                      </label>
                    ) : (
                      <label key={opt.label} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                        (brandMulti[q.id] || []).includes(opt.label)
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-slate-200 bg-white active:border-indigo-200'
                      }`}>
                        <input type="checkbox" checked={(brandMulti[q.id] || []).includes(opt.label)}
                          onChange={() => toggleBrandMulti(q.id, opt.label)}
                          className="w-4 h-4 shrink-0 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
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
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none text-xs sm:text-sm resize-y"
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
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md min-h-[40px] sm:min-h-[44px]"
                >
                  {submitting ? 'Processando...' : 'Ver Meu Resultado'}
                </button>
              ) : (
                <button type="button" onClick={goNext} disabled={isScaleStep && !isCurrentComplete}
                  className="flex items-center gap-1 sm:gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md min-h-[40px] sm:min-h-[44px]"
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
