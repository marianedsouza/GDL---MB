import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const app = express();

app.use(express.json());

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obmewxohvzlcjykqktqk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Zm_tNXmMNySXA-f7DINFSA_uYeY7ODS';
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-admin';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

// Middleware for Admin Auth
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// --- API ROUTES ---

// Admin Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

// Get all leaders (Admin)
app.get('/api/leaders', authMiddleware, async (req, res) => {
  try {
    const { data: leaders, error } = await supabase
      .from('leaders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const leadersWithCount = await Promise.all((leaders || []).map(async (leader) => {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('leader_id', leader.id);
      
      const { data: archetype } = await supabase
        .from('archetype_responses')
        .select('id')
        .eq('leader_id', leader.id)
        .maybeSingle();

      return { 
        ...leader, 
        _id: leader.id,
        leadsCount: count || 0,
        archetypeCompleted: !!archetype
      };
    }));

    res.json(leadersWithCount);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar lideranças", details: err.message });
  }
});

// Create a leader (Admin)
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
    console.error(err);
    res.status(500).json({ error: "Erro ao criar liderança", details: err.message });
  }
});

// Delete a leader (Admin)

// Create a leader (Public)
app.post('/api/public/leaders', async (req, res) => {
  try {
    const payload = req.body;
    
    // Convert camelCase payload to snake_case for Supabase if needed,
    // or just pass payload directly (Supabase column names should match keys)
    // Based on previous code, let's just convert it:
    const dbPayload = {
      full_name: payload.fullName,
      name: payload.name,
      cpf: payload.cpf,
      birth_date: payload.birthDate,
      phone: payload.phone,
      email: payload.email,
      sexo: payload.sexo,
      neighborhood: payload.neighborhood,
      administrative_region: Array.isArray(payload.administrativeRegions) ? payload.administrativeRegions.join(', ') : payload.administrativeRegions,
      city: payload.city,
      role: payload.role,
      segment: payload.segment,
      target_neighborhoods: payload.targetNeighborhoods,
      estimated_mobilization: payload.estimatedMobilization,
      has_whatsapp_group: payload.hasWhatsappGroup,
      whatsapp_group_participants: payload.whatsappGroupParticipants,
      available_days: payload.availableDays,
      has_vehicle: payload.hasVehicle,
      can_walk: payload.canWalk,
      can_organize_meetings: payload.canOrganizeMeetings,
      can_host_meetings: payload.canHostMeetings,
      skills: payload.skills,
      commitment_agreed: payload.commitmentAgreed,
      direct_leader: payload.directLeader,
      address: `${payload.street || ''}, ${payload.addressNumber || 'S/N'} - ${payload.neighborhood || ''}, ${payload.city || ''} - CEP: ${payload.cep || ''}`
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
    res.status(500).json({ error: "Erro ao criar liderança", details: err.message });
  }
});

// Delete a leader (Admin)
app.delete('/api/leaders/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete leads first (if not cascading)
    await supabase.from('leads').delete().eq('leader_id', id);
    
    const { error } = await supabase.from('leaders').delete().eq('id', id);

    if (error) throw error;
    
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar liderança", details: err.message });
  }
});

// Get all leads (Admin)
app.get('/api/leads', authMiddleware, async (req, res) => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        leader:leaders(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedLeads = (leads || []).map(lead => ({
      ...lead,
      _id: lead.id,
      leaderId: lead.leader ? { _id: lead.leader.id, name: lead.leader.name } : null
    }));

    res.json(mappedLeads);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar contatos", details: err.message });
  }
});

// Get leads by leader (Admin)
app.get('/api/leaders/:id/leads', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        leader:leaders(id, name)
      `)
      .eq('leader_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedLeads = (leads || []).map(lead => ({
      ...lead,
      _id: lead.id,
      leaderId: lead.leader ? { _id: lead.leader.id, name: lead.leader.name } : null
    }));

    res.json(mappedLeads);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar contatos", details: err.message });
  }
});

// Public: Get leader info for form
app.get('/api/public/leaders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: leader, error } = await supabase
      .from('leaders')
      .select('id, name')
      .eq('id', id)
      .single();

    if (error || !leader) return res.status(404).json({ error: "Líder não encontrado" });
    
    res.json({ ...leader, _id: leader.id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro", details: err.message });
  }
});

// Public: Submit lead form
app.post('/api/public/leads', async (req, res) => {
  try {
    const { leaderId, registeredBy, name, preferredName, birthDate, sexo, phone, email, cpf, street, number, neighborhood, administrativeRegions, city, contactOrigins, segments, relationshipLevels, influencePotentials, nextActions, observations } = req.body;
    
    const { data: leader, error: leaderError } = await supabase
      .from('leaders')
      .select('id')
      .eq('id', leaderId)
      .single();

    if (leaderError || !leader) return res.status(404).json({ error: "Líder inválido" });

    // Check for duplicate lead by CPF
    const { data: existingLead } = await supabase
      .from('leads')
      .select('leader_id')
      .eq('cpf', cpf)
      .maybeSingle();

    if (existingLead) {
      const { data: originalLeader } = await supabase
        .from('leaders')
        .select('name')
        .eq('id', existingLead.leader_id)
        .single();

      return res.status(409).json({
        error: "lead_exists",
        message: `Este contato já foi cadastrado pela liderança ${originalLeader?.name || 'desconhecida'}`
      });
    }

    const { error } = await supabase
      .from('leads')
      .insert([{
        leader_id: leaderId,
        registered_by: registeredBy,
        name,
        preferred_name: preferredName,
        birth_date: birthDate,
        sexo,
        phone, email, cpf,
        street,
        address_number: number,
        neighborhood,
        administrative_region: Array.isArray(administrativeRegions) ? administrativeRegions.join(', ') : administrativeRegions,
        city,
        contact_origin: contactOrigins,
        segment: segments,
        relationship_level: relationshipLevels,
        influence_potential: influencePotentials,
        next_action: nextActions,
        observations,
      }]);

    if (error) throw error;
    
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar contato", details: err.message });
  }
});

// Public: Save archetype mapping responses
app.post('/api/public/archetype', async (req, res) => {
  try {
    const { leaderId, leaderName, answers, brandSingle, brandMulti, textAnswers, results } = req.body;

    const { error } = await supabase
      .from('archetype_responses')
      .insert([{
        leader_id: leaderId,
        leader_name: leaderName,
        answers,
        brand_single: brandSingle,
        brand_multi: brandMulti,
        text_answers: textAnswers,
        dominant: results.dominant,
        secondary: results.secondary,
        potency: results.potency || results.secondary,
        shadow: results.shadow,
        wounded: results.wounded,
        evolution: results.evolution,
        percentages: results.percentages,
      }]);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar mapeamento", details: err.message });
  }
});

// Public: Get full archetype mapping for a leader
app.get('/api/public/archetype/:leaderId', async (req, res) => {
  try {
    const { leaderId } = req.params;
    const { data, error } = await supabase
      .from('archetype_responses')
      .select('*')
      .eq('leader_id', leaderId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Mapeamento não encontrado' });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar mapeamento', details: err.message });
  }
});

// Admin: Get all archetype profiles with leader info
app.get('/api/archetype/profiles', authMiddleware, async (req, res) => {
  try {
    const { data: archetypes, error } = await supabase
      .from('archetype_responses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const profiles = await Promise.all((archetypes || []).map(async (a) => {
      const { data: leader } = await supabase
        .from('leaders')
        .select('full_name, name, phone, email, cpf')
        .eq('id', a.leader_id)
        .single();
      return { ...a, leader: leader || null };
    }));

    res.json(profiles);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar perfis', details: err.message });
  }
});

// Public: Check if leader completed archetype mapping
app.get('/api/public/archetype/check/:leaderId', async (req, res) => {
  try {
    const { leaderId } = req.params;
    const { data, error } = await supabase
      .from('archetype_responses')
      .select('id, created_at')
      .eq('leader_id', leaderId)
      .maybeSingle();
    if (error) throw error;
    res.json({ completed: !!data, submittedAt: data?.created_at || null });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao verificar mapeamento', details: err.message });
  }
});

// --- VITE MIDDLEWARE & SERVER ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
