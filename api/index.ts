import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obmewxohvzlcjykqktqk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Zm_tNXmMNySXA-f7DINFSA_uYeY7ODS';
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-admin';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Get all leaders
app.get('/api/leaders', authMiddleware, async (req, res) => {
  try {
    const { data: leaders, error } = await supabase
      .from('leaders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const leadersWithCount = await Promise.all(
      (leaders || []).map(async (leader) => {
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('leader_id', leader.id);
        return { ...leader, _id: leader.id, leadsCount: count || 0 };
      })
    );
    res.json(leadersWithCount);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar lideranças', details: err.message });
  }
});

// Create leader (Admin)
app.post('/api/leaders', authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, cpf, address } = req.body;
    const { data: leader, error } = await supabase
      .from('leaders')
      .insert([{ name, phone, email, cpf, address }])
      .select()
      .single();
    if (error) throw error;
    res.json({ ...leader, _id: leader.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar liderança', details: err.message });
  }
});

// Delete a leader
app.delete('/api/leaders/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('leads').delete().eq('leader_id', id);
    const { error } = await supabase.from('leaders').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao deletar liderança', details: err.message });
  }
});

// Get all leads
app.get('/api/leads', authMiddleware, async (req, res) => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*, leader:leaders(id, name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const mapped = (leads || []).map((lead) => ({
      ...lead, _id: lead.id,
      leaderId: lead.leader ? { _id: lead.leader.id, name: lead.leader.name } : null,
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar contatos', details: err.message });
  }
});

// Get leads by leader
app.get('/api/leaders/:id/leads', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*, leader:leaders(id, name)')
      .eq('leader_id', id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const mapped = (leads || []).map((lead) => ({
      ...lead, _id: lead.id,
      leaderId: lead.leader ? { _id: lead.leader.id, name: lead.leader.name } : null,
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar contatos', details: err.message });
  }
});

// Public: get leader info
app.get('/api/public/leaders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: leader, error } = await supabase
      .from('leaders')
      .select('id, name')
      .eq('id', id)
      .single();
    if (error || !leader) return res.status(404).json({ error: 'Líder não encontrado' });
    res.json({ ...leader, _id: leader.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro', details: err.message });
  }
});

// Public: create leader (self-registration)
app.post('/api/public/leaders', async (req, res) => {
  try {
    const p = req.body;
    const dbPayload = {
      full_name: p.fullName,
      name: p.name,
      cpf: p.cpf,
      birth_date: p.birthDate,
      phone: p.phone,
      email: p.email,
      neighborhood: p.neighborhood,
      administrative_region: p.administrativeRegion,
      city: p.city,
      role: p.role,
      segment: p.segment,
      target_neighborhoods: p.targetNeighborhoods,
      estimated_mobilization: p.estimatedMobilization,
      has_whatsapp_group: p.hasWhatsappGroup,
      whatsapp_group_participants: p.whatsappGroupParticipants,
      available_days: p.availableDays,
      has_vehicle: p.hasVehicle,
      can_walk: p.canWalk,
      can_organize_meetings: p.canOrganizeMeetings,
      can_host_meetings: p.canHostMeetings,
      skills: p.skills,
      commitment_agreed: p.commitmentAgreed,
      direct_leader: p.directLeader,
      address: `${p.street || ''}, ${p.addressNumber || 'S/N'} - ${p.neighborhood || ''}, ${p.city || ''} - CEP: ${p.cep || ''}`,
    };
    const { data: leader, error } = await supabase
      .from('leaders')
      .insert([dbPayload])
      .select()
      .single();
    if (error) throw error;
    res.json({ ...leader, _id: leader.id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar liderança', details: err.message });
  }
});

// Public: submit lead form
app.post('/api/public/leads', async (req, res) => {
  try {
    const { leaderId, name, phone, email, cpf, address } = req.body;
    const { data: leader, error: leaderError } = await supabase
      .from('leaders')
      .select('id')
      .eq('id', leaderId)
      .single();
    if (leaderError || !leader) return res.status(404).json({ error: 'Líder inválido' });
    const { error } = await supabase
      .from('leads')
      .insert([{ leader_id: leaderId, name, phone, email, cpf, address }]);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao salvar contato', details: err.message });
  }
});

export default app;
