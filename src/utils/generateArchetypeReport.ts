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

function drawBar(doc: jsPDF, x: number, y: number, w: number, percent: number, color: string) {
  doc.setFillColor('#e2e8f0');
  doc.roundedRect(x, y, w, 5, 2, 2, 'F');
  if (percent > 0) {
    doc.setFillColor(color);
    doc.roundedRect(x, y, w * (percent / 100), 5, 2, 2, 'F');
  }
}

function addArchetypeCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  title: string,
  subtitle: string,
  archetypeName: string,
  score: number,
  jungText: string,
  detail: string,
  message: string
) {
  const info = getInfo(archetypeName);
  const color = info.color;

  doc.setFillColor('#f8fafc');
  doc.setDrawColor('#e2e8f0');
  doc.roundedRect(x, y, w, 58, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor('#94a3b8');
  doc.text(title, x + 6, y + 7);

  doc.setFontSize(6);
  doc.setTextColor('#64748b');
  doc.text(subtitle, x + 6, y + 12);

  doc.setFontSize(11);
  doc.setTextColor(color);
  doc.text(archetypeName || '-', x + 6, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor('#94a3b8');
  doc.text(jungText, x + 6, y + 28);

  drawBar(doc, x + 6, y + 31, w - 12, score, color);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(color);
  doc.text(`${score}%`, x + 6, y + 41);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor('#64748b');

  const lines = doc.splitTextToSize(detail, w - 12);
  const maxLines = 2;
  const showLines = lines.slice(0, maxLines);
  doc.text(showLines, x + 6, y + 47);

  if (message) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor('#475569');
    const msgLines = doc.splitTextToSize(`"${message}"`, w - 12);
    const startY = 47 + showLines.length * 3.5;
    if (startY + msgLines.length * 3 <= y + 58) {
      doc.text(msgLines.slice(0, 1), x + 6, startY);
    }
  }
}

export function generateArchetypeReport(profiles: ArchetypeProfile[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - 2 * margin;
  let y = margin;

  const addHeader = () => {
    doc.setFillColor('#4f46e5');
    doc.rect(0, 0, pageW, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor('#ffffff');
    doc.text('RELATÓRIO DE ESTUDO ARQUETÍPICO', pageW / 2, 8, { align: 'center' });
  };

  const addFooter = () => {
    const footerY = pageH - 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor('#cbd5e1');
    doc.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      pageW / 2,
      footerY,
      { align: 'center' }
    );
  };

  const addPage = () => {
    doc.addPage();
    y = margin;
    addHeader();
    addFooter();
  };

  // First page header
  addHeader();
  addFooter();

  // Title
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor('#1e293b');
  doc.text('Relatório de Estudo Arquetípico', pageW / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  const dateStr = `Data: ${new Date().toLocaleDateString('pt-BR')}`;
  doc.text(dateStr, pageW / 2, y, { align: 'center' });
  y += 6;

  doc.text(`${profiles.length} liderança(s) selecionada(s)`, pageW / 2, y, { align: 'center' });
  y += 6;

  doc.setDrawColor('#e2e8f0');
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // List of leaders
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#1e293b');
  doc.text('Lideranças neste relatório:', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#475569');
  for (const p of profiles) {
    const name = p.leader?.name || p.leader_name || 'Desconhecido';
    doc.text(`- ${name}`, margin + 3, y);
    y += 4;
    if (y > pageH - 25) {
      addPage();
    }
  }

  // Process each profile
  for (const profile of profiles) {
    if (y > pageH - 50) {
      addPage();
    } else {
      y += 6;
    }

    const displayName = profile.leader?.name || profile.leader_name || 'Desconhecido';
    const contactInfo = profile.leader?.phone || profile.leader?.email || '';

    // Profile header
    doc.setFillColor('#f1f5f9');
    doc.roundedRect(margin, y, contentW, 14, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor('#1e293b');
    doc.text(displayName, margin + 6, y + 9);

    if (contactInfo) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor('#64748b');
      doc.text(contactInfo, margin + contentW - 6, y + 9, { align: 'right' });
    }

    y += 20;

    // Archetype cards grid (2 rows x 5 cols, or 3+2)
    const cardW = (contentW - 12) / 3;
    const cardH = 58;

    const cards = [
      { title: 'PERSONA', subtitle: 'DOMINANTE', name: profile.dominant?.name || '-', score: profile.dominant?.score || 0, jung: getInfo(profile.dominant?.name || '').jung, detail: getInfo(profile.dominant?.name || '').luz, msg: getInfo(profile.dominant?.name || '').mensagem },
      { title: 'ANIMA/ANIMUS', subtitle: 'POTÊNCIA', name: profile.potency?.name || profile.secondary?.name || '-', score: profile.potency?.score || profile.secondary?.score || 0, jung: getInfo(profile.potency?.name || profile.secondary?.name || '').jung, detail: getInfo(profile.potency?.name || profile.secondary?.name || '').luz, msg: getInfo(profile.potency?.name || profile.secondary?.name || '').mensagem },
      { title: 'SOMBRA', subtitle: 'ARQUÉTIPO REPRIMIDO', name: profile.shadow?.name || 'Sombra', score: profile.shadow?.score || 0, jung: getInfo(profile.shadow?.name || '').jung || 'Inconsciente Pessoal', detail: getInfo(profile.shadow?.name || '').sombra || 'Conteúdo reprimido', msg: getInfo(profile.shadow?.name || '').mensagem },
    ];

    for (let i = 0; i < cards.length; i++) {
      const cx = margin + i * (cardW + 6);
      addArchetypeCard(doc, cx, y, cardW, cards[i].title, cards[i].subtitle, cards[i].name, cards[i].score, cards[i].jung, cards[i].detail, cards[i].msg);
    }

    y += cardH + 4;

    const card2W = (contentW - 6) / 2;
    const cards2 = [
      { title: 'COMPLEXO', subtitle: 'FERIDA / SOMBRA', name: `${profile.wounded?.score || profile.shadowIntensity || 0}%`, score: profile.wounded?.score || profile.shadowIntensity || 0, jung: '', detail: 'Medo de fracasso, necessidade de aprovação, evitação de conflitos', msg: '' },
      { title: 'SELF', subtitle: 'EVOLUÇÃO', name: profile.evolution?.name || '-', score: profile.evolution?.score || 0, jung: getInfo(profile.evolution?.name || '').jung, detail: getInfo(profile.evolution?.name || '').luz, msg: getInfo(profile.evolution?.name || '').mensagem },
    ];

    for (let i = 0; i < cards2.length; i++) {
      const cx = margin + i * (card2W + 6);
      const info = cards2[i];
      const color = info.name.includes('%') ? '#e11d48' : getInfo(info.name).color;
      const displayScore = info.name.includes('%') ? 0 : info.score;

      doc.setFillColor('#f8fafc');
      doc.setDrawColor('#e2e8f0');
      doc.roundedRect(cx, y, card2W, 48, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor('#94a3b8');
      doc.text(info.title, cx + 6, y + 7);

      doc.setFontSize(6);
      doc.setTextColor('#64748b');
      doc.text(info.subtitle, cx + 6, y + 12);

      if (info.name.includes('%')) {
        doc.setFontSize(16);
        doc.setTextColor(color);
        doc.text(info.name, cx + 6, y + 26);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor('#64748b');
        const detLines = doc.splitTextToSize(info.detail, card2W - 12);
        doc.text(detLines.slice(0, 3), cx + 6, y + 34);
      } else {
        doc.setFontSize(11);
        doc.setTextColor(color);
        doc.text(info.name, cx + 6, y + 22);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor('#94a3b8');
        doc.text(info.jung, cx + 6, y + 28);

        drawBar(doc, cx + 6, y + 31, card2W - 12, displayScore, color);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(color);
        doc.text(`${displayScore}%`, cx + 6, y + 41);
      }
    }

    y += 56;

    // Full archetype profile
    if (y > pageH - 45) {
      addPage();
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#1e293b');
    doc.text('Perfil Arquetípico Completo', margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor('#94a3b8');
    doc.text('10 arquétipos de personalidade (Pearson) + conceitos Junguianos', margin, y);
    y += 5;

    const sorted = Object.entries(profile.percentages || {}).sort(([, a], [, b]) => (b as number) - (a as number));

    // Table header
    const tableW = contentW;
    const colW = [28, tableW - 50, 22];
    const rowH = 5.5;

    doc.setFillColor('#f1f5f9');
    doc.rect(margin, y, tableW, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor('#475569');
    doc.text('Arquétipo', margin + 3, y + 3.8);
    doc.text('Percentual', margin + colW[0] + 3, y + 3.8);
    doc.text('Função', margin + colW[0] + colW[1] + 3, y + 3.8);
    y += rowH;

    const isDominant = (name: string) => name === profile.dominant?.name;
    const isShadow = (name: string) => name === profile.shadow?.name;
    const isEvolution = (name: string) => name === profile.evolution?.name && !isDominant(name);

    for (const [name, score] of sorted) {
      if (y > pageH - 15) {
        addPage();
      }

      const info = getInfo(name);
      const label = info.label;
      const pct = score as number;

      let role = '';
      if (isDominant(name)) role = 'Persona';
      else if (isShadow(name)) role = 'Sombra';
      else if (isEvolution(name)) role = 'Self';

      doc.setFillColor('#ffffff');
      doc.setDrawColor('#e2e8f0');
      doc.rect(margin, y, tableW, rowH, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(info.color);
      doc.text(label, margin + 3, y + 3.8);

      drawBar(doc, margin + colW[0], y + 1.5, colW[1], pct, info.color);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor('#64748b');
      doc.text(`${pct}%`, margin + colW[0] + colW[1] + 3, y + 3.8);

      if (role) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        const roleColors: Record<string, string> = { Persona: '#6366f1', Sombra: '#64748b', Self: '#059669' };
        doc.setTextColor(roleColors[role] || '#64748b');
        doc.text(role, margin + colW[0] + colW[1] + 14, y + 3.8);
      }

      y += rowH;
    }

    // Jungian interpretation
    y += 6;
    if (y > pageH - 30) {
      addPage();
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#1e293b');
    doc.text('Interpretação Junguiana', margin, y);
    y += 6;

    const interpretations = [
      { label: `Persona: ${profile.dominant?.name}`, text: getInfo(profile.dominant?.name || '').luz, msg: getInfo(profile.dominant?.name || '').mensagem, bg: '#eef2ff', border: '#e0e7ff', textColor: '#4338ca' },
      { label: `Potência: ${profile.potency?.name || profile.secondary?.name}`, text: getInfo(profile.potency?.name || profile.secondary?.name || '').luz, msg: getInfo(profile.potency?.name || profile.secondary?.name || '').mensagem, bg: '#fffbeb', border: '#fde68a', textColor: '#d97706' },
      { label: `Sombra: ${profile.shadow?.name || 'Sombra'}`, text: getInfo(profile.shadow?.name || '').sombra || 'Padrão inconsciente', msg: getInfo(profile.shadow?.name || '').mensagem, bg: '#f8fafc', border: '#e2e8f0', textColor: '#475569' },
      { label: `Self / Individuação: ${profile.evolution?.name}`, text: getInfo(profile.evolution?.name || '').luz, msg: getInfo(profile.evolution?.name || '').mensagem, bg: '#ecfdf5', border: '#a7f3d0', textColor: '#059669' },
    ];

    for (const interp of interpretations) {
      if (y > pageH - 20) {
        addPage();
      }

      doc.setFillColor(interp.bg);
      doc.setDrawColor(interp.border);
      doc.roundedRect(margin, y, contentW, 16, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(interp.textColor);
      doc.text(interp.label, margin + 4, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor('#64748b');
      const tLines = doc.splitTextToSize(interp.text, contentW - 8);
      doc.text(tLines.slice(0, 2), margin + 4, y + 8);

      if (interp.msg) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6);
        doc.setTextColor(interp.textColor);
        const msgLine = `"${interp.msg}"`;
        const mLines = doc.splitTextToSize(msgLine, contentW - 8);
        if (mLines.length > 0) {
          doc.text(mLines.slice(0, 1), margin + 4, y + 13);
        }
      }

      y += 19;
    }
  }

  // Save
  const fileName = `relatorio-arquetipos-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
