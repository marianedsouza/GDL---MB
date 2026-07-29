import jsPDF from 'jspdf';

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

const ARCHETYPE_INFO: Record<string, { label: string; color: string; jung: string; luz: string; sombra: string; mensagem: string }> = {
  Cuidadora: { label: 'Cuidadora', color: '#059669', jung: 'Persona Materna', luz: 'Acolhimento, empatia, proteção, generosidade', sombra: 'Autossacrifício, codependência, culpa ao dizer não', mensagem: 'Seu dom é nutrir. Lembre-se: para cuidar do outro é preciso cuidar de si.' },
  Rebelde: { label: 'Rebelde', color: '#dc2626', jung: 'Sombra do Sistema', luz: 'Inovação, coragem de romper, autenticidade', sombra: 'Raiva destrutiva, rebeldia por impulso, isolamento', mensagem: 'Sua força está em questionar. Canalize sua rebeldia para transformar o que precisa ser mudado.' },
  Sábia: { label: 'Sábia', color: '#2563eb', jung: 'Self — O Sábio', luz: 'Conhecimento, reflexão, discernimento, consciência', sombra: 'Distanciamento emocional, arrogância intelectual, obsessão por respostas', mensagem: 'Sua sabedoria ilumina. Compartilhe o que sabe sem perder a humildade de aprender.' },
  Exploradora: { label: 'Exploradora', color: '#d97706', jung: 'Animus — Busca', luz: 'Independência, liberdade, descoberta, autoconfiança', sombra: 'Inquietude, incapacidade de se comprometer, fuga emocional', mensagem: 'Sua alma busca novos horizontes. Explore o mundo externo sem fugir do seu mundo interno.' },
  Criadora: { label: 'Criadora', color: '#7c3aed', jung: 'Self Criativo', luz: 'Criatividade, inovação, originalidade, expressão', sombra: 'Perfeccionismo paralisante, inconclusão, autocrítica excessiva', mensagem: 'Você é um canal de criação. Dê forma ao que existe dentro de você sem medo do julgamento.' },
  Governante: { label: 'Governante', color: '#9333ea', jung: 'Persona de Poder', luz: 'Liderança, visão estratégica, responsabilidade, ordem', sombra: 'Autoritarismo, necessidade de controle, medo de delegar', mensagem: 'Você nasceu para liderar. Lembre-se: poder verdadeiro é servir com responsabilidade.' },
  Inocente: { label: 'Inocente', color: '#0ea5e9', jung: 'Self Original', luz: 'Otimismo, pureza, esperança, simplicidade', sombra: 'Ingenuidade, negação da realidade, dependência', mensagem: 'Guarde sua essência pura. Confiar na vida é belo, mas a maturidade exige discernimento.' },
  Amante: { label: 'Amante', color: '#ec4899', jung: 'Anima — Eros', luz: 'Paixão, conexão profunda, beleza, encantamento', sombra: 'Carência afetiva, idealização do outro, ciúmes', mensagem: 'Seu coração sente com profundidade. Ame sem se perder no outro — a união verdadeira começa dentro de você.' },
  Mago: { label: 'Mago', color: '#6366f1', jung: 'Self Transpessoal', luz: 'Intuição, transformação, propósito, transcendência', sombra: 'Manipulação, escapismo espiritual, desconexão da realidade', mensagem: 'Você é um agente de transformação. Use seu poder para curar, não para controlar.' },
  Guerreira: { label: 'Guerreira', color: '#ea580c', jung: 'Persona Heroica', luz: 'Coragem, disciplina, determinação, resiliência', sombra: 'Agressividade, rigidez, exaustão por superexigência', mensagem: 'Sua força é admirável. Mas a verdadeira guerreira sabe quando lutar e quando descansar.' },
  Boba: { label: 'Boba', color: '#ca8a04', jung: 'Trickster', luz: 'Humor, leveza, espontaneidade, alegria', sombra: 'Irresponsabilidade, fuga emocional, cinismo', mensagem: 'O riso é sua sabedoria. Use a leveza para desarmar, não para esconder a verdade.' },
  Sombra: { label: 'Sombra', color: '#64748b', jung: 'Inconsciente Pessoal', luz: 'Autoconhecimento profundo, integração, humildade', sombra: 'Projeção nos outros, negação, autossabotagem', mensagem: 'O que você rejeita em si mesma ainda te governa. Integrar a sombra é o caminho para a liberdade.' },
};

function getInfo(name: string) {
  return ARCHETYPE_INFO[name] || { label: name, color: '#64748b', jung: '', luz: '', sombra: '', mensagem: '' };
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - 2 * MARGIN;

export function generateArchetypeReport(profiles: ArchetypeProfile[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = MARGIN;

  function header() {
    doc.setFillColor('#4f46e5');
    doc.rect(0, 0, PAGE_W, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor('#ffffff');
    doc.text('RELATÓRIO DE ESTUDO ARQUETÍPICO', PAGE_W / 2, 8, { align: 'center' });
  }

  function footer() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor('#cbd5e1');
    doc.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      PAGE_W / 2, PAGE_H - 8, { align: 'center' }
    );
  }

  function newPage() {
    doc.addPage();
    y = MARGIN;
    header();
    footer();
  }

  function checkPage(needed: number) {
    if (y + needed > PAGE_H - 15) {
      newPage();
    }
  }

  header();
  footer();

  // --- Cover ---
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor('#1e293b');
  doc.text('Relatório de Estudo Arquetípico', PAGE_W / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, PAGE_W / 2, y, { align: 'center' });
  y += 6;

  doc.text(`${profiles.length} liderança(s) selecionada(s)`, PAGE_W / 2, y, { align: 'center' });
  y += 6;

  doc.setDrawColor('#e2e8f0');
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#1e293b');
  doc.text('Lideranças neste relatório:', MARGIN, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#475569');
  for (const p of profiles) {
    checkPage(4);
    doc.text(`- ${p.leader?.name || p.leader_name || 'Desconhecido'}`, MARGIN + 3, y);
    y += 4;
  }

  // --- Profile sections ---
  for (const profile of profiles) {
    checkPage(20);

    const displayName = profile.leader?.name || profile.leader_name || 'Desconhecido';
    const contactInfo = profile.leader?.phone || profile.leader?.email || '';

    // Profile header
    doc.setFillColor('#f1f5f9');
    doc.roundedRect(MARGIN, y, CONTENT_W, 12, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#1e293b');
    doc.text(displayName, MARGIN + 6, y + 8);

    if (contactInfo) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor('#64748b');
      doc.text(contactInfo, MARGIN + CONTENT_W - 6, y + 8, { align: 'right' });
    }

    y += 18;

    // --- 3 archetype cards side by side ---
    checkPage(50);

    const cardW = (CONTENT_W - 12) / 3;

    function drawSmallCard(cx: number, color: string, title: string, sub: string, name: string, pct: number, jung: string, detail: string, msg: string) {
      doc.setFillColor('#f8fafc');
      doc.setDrawColor('#e2e8f0');
      doc.roundedRect(cx, y, cardW, 46, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor('#94a3b8');
      doc.text(title, cx + 4, y + 6);
      doc.setFontSize(5.5);
      doc.setTextColor('#64748b');
      doc.text(sub, cx + 4, y + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(color);
      doc.text(name, cx + 4, y + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor('#94a3b8');
      doc.text(jung, cx + 4, y + 23);

      // Bar
      doc.setFillColor('#e2e8f0');
      doc.roundedRect(cx + 4, y + 26, cardW - 8, 4, 2, 2, 'F');
      if (pct > 0) {
        doc.setFillColor(color);
        doc.roundedRect(cx + 4, y + 26, (cardW - 8) * (pct / 100), 4, 2, 2, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(color);
      doc.text(`${pct}%`, cx + 4, y + 34);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor('#64748b');
      const dLines = doc.splitTextToSize(detail, cardW - 8);
      doc.text(dLines.slice(0, 2), cx + 4, y + 39);
    }

    const cards = [
      { c: '#4f46e5', t: 'PERSONA', s: 'DOMINANTE', n: profile.dominant?.name || '-', p: profile.dominant?.score || 0 },
      { c: '#d97706', t: 'ANIMA/ANIMUS', s: 'POTÊNCIA', n: profile.potency?.name || profile.secondary?.name || '-', p: profile.potency?.score || profile.secondary?.score || 0 },
      { c: '#64748b', t: 'SOMBRA', s: 'ARQUÉTIPO REPRIMIDO', n: profile.shadow?.name || 'Sombra', p: profile.shadow?.score || 0 },
    ];

    for (let i = 0; i < 3; i++) {
      const info = getInfo(cards[i].n);
      drawSmallCard(
        MARGIN + i * (cardW + 6),
        cards[i].c,
        cards[i].t, cards[i].s,
        cards[i].n, cards[i].p,
        info.jung || (cards[i].t === 'SOMBRA' ? 'Inconsciente Pessoal' : ''),
        cards[i].t === 'SOMBRA' ? info.sombra || 'Conteúdo reprimido' : info.luz,
        info.mensagem
      );
    }

    y += 50;

    // --- 2 bottom cards ---
    checkPage(40);

    const card2W = (CONTENT_W - 6) / 2;

    // Complexo card
    const wScore = profile.wounded?.score ?? profile.shadowIntensity ?? 0;
    doc.setFillColor('#f8fafc');
    doc.setDrawColor('#e2e8f0');
    doc.roundedRect(MARGIN, y, card2W, 36, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor('#94a3b8');
    doc.text('COMPLEXO', MARGIN + 4, y + 6);
    doc.setFontSize(5.5);
    doc.setTextColor('#64748b');
    doc.text('FERIDA / SOMBRA', MARGIN + 4, y + 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#e11d48');
    doc.text(`${wScore}%`, MARGIN + 4, y + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor('#64748b');
    doc.text('Medo de fracasso, necessidade de aprovação, evitação de conflitos', MARGIN + 4, y + 29);

    // Evolution card
    const evoInfo = getInfo(profile.evolution?.name || '');
    const evoX = MARGIN + card2W + 6;
    doc.setFillColor('#f8fafc');
    doc.setDrawColor('#e2e8f0');
    doc.roundedRect(evoX, y, card2W, 36, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor('#94a3b8');
    doc.text('SELF', evoX + 4, y + 6);
    doc.setFontSize(5.5);
    doc.setTextColor('#64748b');
    doc.text('EVOLUÇÃO', evoX + 4, y + 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#059669');
    doc.text(profile.evolution?.name || '-', evoX + 4, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor('#94a3b8');
    doc.text(evoInfo.jung, evoX + 4, y + 23);

    // Bar
    doc.setFillColor('#e2e8f0');
    doc.roundedRect(evoX + 4, y + 26, card2W - 8, 4, 2, 2, 'F');
    if ((profile.evolution?.score || 0) > 0) {
      doc.setFillColor('#059669');
      doc.roundedRect(evoX + 4, y + 26, (card2W - 8) * ((profile.evolution?.score || 0) / 100), 4, 2, 2, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor('#059669');
    doc.text(`${profile.evolution?.score || 0}%`, evoX + 4, y + 34);

    y += 42;

    // --- Full archetype profile table ---
    checkPage(85);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#1e293b');
    doc.text('Perfil Arquetípico Completo', MARGIN, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor('#94a3b8');
    doc.text('10 arquétipos de personalidade (Pearson) + conceitos Junguianos', MARGIN, y);
    y += 4;

    const sorted = Object.entries(profile.percentages || {}).sort(([, a], [, b]) => (b as number) - (a as number));

    // Table header
    const colW = [26, CONTENT_W - 54, 28];
    const rh = 5;

    doc.setFillColor('#f1f5f9');
    doc.rect(MARGIN, y, CONTENT_W, rh, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor('#475569');
    doc.text('Arquétipo', MARGIN + 3, y + 3.5);
    doc.text('Percentual', MARGIN + colW[0] + 3, y + 3.5);
    doc.text('Função', MARGIN + colW[0] + colW[1] + 3, y + 3.5);
    y += rh;

    const isDominant = (n: string) => n === profile.dominant?.name;
    const isShadow = (n: string) => n === profile.shadow?.name;
    const isEvolution = (n: string) => n === profile.evolution?.name && !isDominant(n);

    for (const [name, score] of sorted) {
      checkPage(rh + 1);

      const info = getInfo(name);
      const pct = score as number;

      let role = '';
      if (isDominant(name)) role = 'Persona';
      else if (isShadow(name)) role = 'Sombra';
      else if (isEvolution(name)) role = 'Self';

      doc.setFillColor('#ffffff');
      doc.setDrawColor('#e2e8f0');
      doc.rect(MARGIN, y, CONTENT_W, rh, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(info.color);
      doc.text(info.label, MARGIN + 3, y + 3.5);

      // Bar
      doc.setFillColor('#e2e8f0');
      doc.roundedRect(MARGIN + colW[0], y + 1, colW[1], 3, 1.5, 1.5, 'F');
      if (pct > 0) {
        doc.setFillColor(info.color);
        doc.roundedRect(MARGIN + colW[0], y + 1, colW[1] * (pct / 100), 3, 1.5, 1.5, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor('#64748b');
      doc.text(`${pct}%`, MARGIN + colW[0] + colW[1] + 3, y + 3.5);

      if (role) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        const roleC: Record<string, string> = { Persona: '#6366f1', Sombra: '#64748b', Self: '#059669' };
        doc.setTextColor(roleC[role] || '#64748b');
        doc.text(role, MARGIN + colW[0] + colW[1] + 20, y + 3.5);
      }

      y += rh;
    }

    // --- Jungian interpretation ---
    y += 4;
    checkPage(70);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#1e293b');
    doc.text('Interpretação Junguiana', MARGIN, y);
    y += 5;

    const interpretations = [
      { label: `Persona: ${profile.dominant?.name}`, text: getInfo(profile.dominant?.name || '').luz, msg: getInfo(profile.dominant?.name || '').mensagem, bg: '#eef2ff', border: '#e0e7ff', tc: '#4338ca' },
      { label: `Potência: ${profile.potency?.name || profile.secondary?.name}`, text: getInfo(profile.potency?.name || profile.secondary?.name || '').luz, msg: getInfo(profile.potency?.name || profile.secondary?.name || '').mensagem, bg: '#fffbeb', border: '#fde68a', tc: '#d97706' },
      { label: `Sombra: ${profile.shadow?.name || 'Sombra'}`, text: getInfo(profile.shadow?.name || '').sombra || 'Padrão inconsciente', msg: getInfo(profile.shadow?.name || '').mensagem, bg: '#f8fafc', border: '#e2e8f0', tc: '#475569' },
      { label: `Self / Individuação: ${profile.evolution?.name}`, text: getInfo(profile.evolution?.name || '').luz, msg: getInfo(profile.evolution?.name || '').mensagem, bg: '#ecfdf5', border: '#a7f3d0', tc: '#059669' },
    ];

    for (const interp of interpretations) {
      checkPage(16);

      const boxH = 14;

      doc.setFillColor(interp.bg);
      doc.setDrawColor(interp.border);
      doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(interp.tc);
      doc.text(interp.label, MARGIN + 4, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor('#64748b');
      const tLines = doc.splitTextToSize(interp.text, CONTENT_W - 8);
      doc.text(tLines.slice(0, 1), MARGIN + 4, y + 9);

      if (interp.msg) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(5.5);
        doc.setTextColor(interp.tc);
        const mLines = doc.splitTextToSize(`"${interp.msg}"`, CONTENT_W - 8);
        if (mLines.length > 0) doc.text(mLines.slice(0, 1), MARGIN + 4, y + 13);
      }

      y += boxH + 2;
    }

    y += 4;
  }

  doc.save(`relatorio-arquetipos-${new Date().toISOString().split('T')[0]}.pdf`);
}
