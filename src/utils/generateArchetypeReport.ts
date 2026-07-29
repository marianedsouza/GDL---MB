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

const PW = 210;
const PH = 297;
const MG = 15;
const CW = PW - 2 * MG;
const GAP = 4;
const FOOTER_Y = PH - 8;

export function generateArchetypeReport(profiles: ArchetypeProfile[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = MG;

  function addHeader() {
    doc.setFillColor('#4f46e5');
    doc.rect(0, 0, PW, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor('#ffffff');
    doc.text('RELATÓRIO DE ESTUDO ARQUETÍPICO', PW / 2, 8, { align: 'center' });
  }

  function addFooter() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor('#cbd5e1');
    doc.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      PW / 2, FOOTER_Y, { align: 'center' }
    );
  }

  function newPage() {
    doc.addPage();
    y = MG;
    addHeader();
    addFooter();
  }

  function need(space: number) {
    if (y + space > FOOTER_Y - 5) newPage();
  }

  function sectionTitle(text: string) {
    need(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#1e293b');
    doc.text(text, MG, y);
    y += GAP + 1;
  }

  function drawBar(cx: number, cy: number, cw: number, pct: number, color: string, bh = 3) {
    doc.setFillColor('#e2e8f0');
    doc.roundedRect(cx, cy, cw, bh, 1.5, 1.5, 'F');
    if (pct > 0) {
      doc.setFillColor(color);
      doc.roundedRect(cx, cy, cw * (pct / 100), bh, 1.5, 1.5, 'F');
    }
  }

  function card3(cx: number, cy: number, cw: number, color: string, title: string, sub: string, name: string, pct: number, jung: string, detail: string) {
    const ch = 44;
    need(ch);
    doc.setFillColor('#f8fafc');
    doc.setDrawColor('#e2e8f0');
    doc.roundedRect(cx, cy, cw, ch, 3, 3, 'FD');
    const ix = cx + GAP;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor('#94a3b8');
    doc.text(title, ix, cy + 6);
    doc.setFontSize(5.5);
    doc.setTextColor('#64748b');
    doc.text(sub, ix, cy + 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(color);
    doc.text(name, ix, cy + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor('#94a3b8');
    doc.text(jung, ix, cy + 23);
    drawBar(ix, cy + 26, cw - 8, pct, color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(color);
    doc.text(`${pct}%`, ix, cy + 33);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor('#64748b');
    const dl = doc.splitTextToSize(detail, cw - 8);
    doc.text(dl.slice(0, 1), ix, cy + 38);
  }

  addHeader();
  addFooter();

  // --- Cover ---
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor('#1e293b');
  doc.text('Relatório de Estudo Arquetípico', PW / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, PW / 2, y, { align: 'center' });
  y += 6;
  doc.text(`${profiles.length} liderança(s) selecionada(s)`, PW / 2, y, { align: 'center' });
  y += 6;

  doc.setDrawColor('#e2e8f0');
  doc.line(MG, y, PW - MG, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#1e293b');
  doc.text('Lideranças neste relatório:', MG, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#475569');
  for (const p of profiles) {
    need(GAP);
    doc.text(`- ${p.leader?.name || p.leader_name || 'Desconhecido'}`, MG + 3, y);
    y += 4;
  }
  y += GAP;

  // --- Profile sections (one per page) ---
  for (const [idx, profile] of profiles.entries()) {
    if (idx > 0) newPage();
    need(14);

    const displayName = profile.leader?.name || profile.leader_name || 'Desconhecido';
    const contactInfo = profile.leader?.phone || profile.leader?.email || '';

    // Profile header
    doc.setFillColor('#f1f5f9');
    doc.roundedRect(MG, y, CW, 11, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#1e293b');
    doc.text(displayName, MG + 6, y + 7);
    if (contactInfo) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor('#64748b');
      doc.text(contactInfo, MG + CW - 6, y + 7, { align: 'right' });
    }
    y += 17;

    // --- 3 cards row ---
    const cw = (CW - 12) / 3;
    const cards = [
      { c: '#4f46e5', t: 'PERSONA', s: 'DOMINANTE', n: profile.dominant?.name || '-', p: profile.dominant?.score || 0 },
      { c: '#d97706', t: 'ANIMA/ANIMUS', s: 'POTÊNCIA', n: profile.potency?.name || profile.secondary?.name || '-', p: profile.potency?.score || profile.secondary?.score || 0 },
      { c: '#64748b', t: 'SOMBRA', s: 'ARQUÉTIPO REPRIMIDO', n: profile.shadow?.name || 'Sombra', p: profile.shadow?.score || 0 },
    ];

    for (let i = 0; i < 3; i++) {
      const info = getInfo(cards[i].n);
      card3(
        MG + i * (cw + 6), y, cw,
        cards[i].c, cards[i].t, cards[i].s,
        cards[i].n, cards[i].p,
        cards[i].t === 'SOMBRA' ? 'Inconsciente Pessoal' : info.jung,
        cards[i].t === 'SOMBRA' ? info.sombra || 'Conteúdo reprimido' : info.luz
      );
    }
    y += 48;

    // --- 2 cards row ---
    need(36);
    const cw2 = (CW - 6) / 2;

    // Complexo
    const wScore = profile.wounded?.score ?? profile.shadowIntensity ?? 0;
    doc.setFillColor('#f8fafc');
    doc.setDrawColor('#e2e8f0');
    doc.roundedRect(MG, y, cw2, 34, 3, 3, 'FD');
    let ix = MG + GAP;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor('#94a3b8');
    doc.text('COMPLEXO', ix, y + 6);
    doc.setFontSize(5.5);
    doc.setTextColor('#64748b');
    doc.text('FERIDA / SOMBRA', ix, y + 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#e11d48');
    doc.text(`${wScore}%`, ix, y + 21);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor('#64748b');
    doc.text('Medo de fracasso, necessidade de aprovação, evitação de conflitos', ix, y + 29);

    // Evolution
    const evoInfo = getInfo(profile.evolution?.name || '');
    const evoX = MG + cw2 + 6;
    doc.setFillColor('#f8fafc');
    doc.setDrawColor('#e2e8f0');
    doc.roundedRect(evoX, y, cw2, 34, 3, 3, 'FD');
    ix = evoX + GAP;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor('#94a3b8');
    doc.text('SELF', ix, y + 6);
    doc.setFontSize(5.5);
    doc.setTextColor('#64748b');
    doc.text('EVOLUÇÃO', ix, y + 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#059669');
    doc.text(profile.evolution?.name || '-', ix, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor('#94a3b8');
    doc.text(evoInfo.jung, ix, y + 23);
    drawBar(ix, y + 26, cw2 - 8, profile.evolution?.score || 0, '#059669');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor('#059669');
    doc.text(`${profile.evolution?.score || 0}%`, ix, y + 33);
    y += 40;

    // --- Full archetype profile table ---
    sectionTitle('Perfil Arquetípico Completo');

    need(4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor('#94a3b8');
    doc.text('10 arquétipos de personalidade (Pearson) + conceitos Junguianos', MG, y);
    y += GAP + 1;

    const sorted = Object.entries(profile.percentages || {}).sort(([, a], [, b]) => (b as number) - (a as number));
    const colW = [24, CW - 50, 26];
    const rh = 4.5;

    need(rh);
    doc.setFillColor('#f1f5f9');
    doc.rect(MG, y, CW, rh, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor('#475569');
    doc.text('Arquétipo', MG + 3, y + 3);
    doc.text('Percentual', MG + colW[0] + 3, y + 3);
    doc.text('Função', MG + colW[0] + colW[1] + 3, y + 3);
    y += rh;

    const isDominant = (n: string) => n === profile.dominant?.name;
    const isShadow = (n: string) => n === profile.shadow?.name;
    const isEvolution = (n: string) => n === profile.evolution?.name && !isDominant(n);

    for (const [name, score] of sorted) {
      need(rh + 1);
      const info = getInfo(name);
      const pct = score as number;
      let role = '';
      if (isDominant(name)) role = 'Persona';
      else if (isShadow(name)) role = 'Sombra';
      else if (isEvolution(name)) role = 'Self';

      doc.setFillColor('#ffffff');
      doc.setDrawColor('#e2e8f0');
      doc.rect(MG, y, CW, rh, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(info.color);
      doc.text(info.label, MG + 3, y + 3);
      drawBar(MG + colW[0], y + 1, colW[1], pct, info.color);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor('#64748b');
      doc.text(`${pct}%`, MG + colW[0] + colW[1] + 3, y + 3);
      if (role) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        const rc: Record<string, string> = { Persona: '#6366f1', Sombra: '#64748b', Self: '#059669' };
        doc.setTextColor(rc[role] || '#64748b');
        doc.text(role, MG + colW[0] + colW[1] + 18, y + 3);
      }
      y += rh;
    }

    // --- Jungian interpretation ---
    y += GAP;
    sectionTitle('Interpretação Junguiana');

    const items = [
      { label: `Persona: ${profile.dominant?.name}`, text: getInfo(profile.dominant?.name || '').luz, msg: getInfo(profile.dominant?.name || '').mensagem, bg: '#eef2ff', border: '#e0e7ff', tc: '#4338ca' },
      { label: `Potência: ${profile.potency?.name || profile.secondary?.name}`, text: getInfo(profile.potency?.name || profile.secondary?.name || '').luz, msg: getInfo(profile.potency?.name || profile.secondary?.name || '').mensagem, bg: '#fffbeb', border: '#fde68a', tc: '#d97706' },
      { label: `Sombra: ${profile.shadow?.name || 'Sombra'}`, text: getInfo(profile.shadow?.name || '').sombra || 'Padrão inconsciente', msg: getInfo(profile.shadow?.name || '').mensagem, bg: '#f8fafc', border: '#e2e8f0', tc: '#475569' },
      { label: `Self / Individuação: ${profile.evolution?.name}`, text: getInfo(profile.evolution?.name || '').luz, msg: getInfo(profile.evolution?.name || '').mensagem, bg: '#ecfdf5', border: '#a7f3d0', tc: '#059669' },
    ];

    for (const item of items) {
      need(14);
      doc.setFillColor(item.bg);
      doc.setDrawColor(item.border);
      doc.roundedRect(MG, y, CW, 13, 3, 3, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(item.tc);
      doc.text(item.label, MG + GAP, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor('#64748b');
      const tl = doc.splitTextToSize(item.text, CW - 8);
      doc.text(tl.slice(0, 1), MG + GAP, y + 9);
      if (item.msg) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(5.5);
        doc.setTextColor(item.tc);
        const ml = doc.splitTextToSize(`"${item.msg}"`, CW - 8);
        if (ml.length > 0) doc.text(ml.slice(0, 1), MG + GAP, y + 12);
      }
      y += 15;
    }

    y += GAP;
  }

  doc.save(`relatorio-arquetipos-${new Date().toISOString().split('T')[0]}.pdf`);
}
