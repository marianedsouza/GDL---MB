import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obmewxohvzlcjykqktqk.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  if (!key) throw new Error('Supabase key not configured');
  return createClient(url, key);
}

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
    const { data: leaders, error } = await getSupabase()
      .from('leaders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const leadersWithCount = await Promise.all(
      (leaders || []).map(async (leader) => {
        const { count } = await getSupabase()
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('leader_id', leader.id);
        const { data: archetype } = await getSupabase()
          .from('archetype_responses')
          .select('id')
          .eq('leader_id', leader.id)
          .maybeSingle();
        return { ...leader, _id: leader.id, leadsCount: count || 0, archetypeCompleted: !!archetype };
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
    const { data: leader, error } = await getSupabase()
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
    await getSupabase().from('leads').delete().eq('leader_id', id);
    const { error } = await getSupabase().from('leaders').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao deletar liderança', details: err.message });
  }
});

// Get all leads
app.get('/api/leads', authMiddleware, async (req, res) => {
  try {
    const { data: leads, error } = await getSupabase()
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
    const { data: leads, error } = await getSupabase()
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
    const { data: leader, error } = await getSupabase()
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
      sexo: p.sexo,
      neighborhood: p.neighborhood,
      administrative_region: Array.isArray(p.administrativeRegions) ? p.administrativeRegions.join(', ') : p.administrativeRegions,
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
      lgpd_agreed: p.lgpdAgreed,
      direct_leader: p.directLeader,
      address: `${p.street || ''}, ${p.addressNumber || 'S/N'} - ${p.neighborhood || ''}, ${p.city || ''} - CEP: ${p.cep || ''}`,
    };
    const { data: leader, error } = await getSupabase()
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
    const { leaderId, registeredBy, name, preferredName, birthDate, sexo, phone, email, cpf, street, number, neighborhood, administrativeRegions, city, contactOrigins, segments, relationshipLevels, influencePotentials, nextActions, observations } = req.body;
    const { data: leader, error: leaderError } = await getSupabase()
      .from('leaders')
      .select('id')
      .eq('id', leaderId)
      .single();
    if (leaderError || !leader) return res.status(404).json({ error: 'Líder inválido' });

    // Check for duplicate lead by CPF
    const { data: existingLead } = await getSupabase()
      .from('leads')
      .select('leader_id')
      .eq('cpf', cpf)
      .maybeSingle();

    if (existingLead) {
      const { data: originalLeader } = await getSupabase()
        .from('leaders')
        .select('name')
        .eq('id', existingLead.leader_id)
        .single();

      return res.status(409).json({
        error: "lead_exists",
        message: `Este contato já foi cadastrado pela liderança ${originalLeader?.name || 'desconhecida'}`
      });
    }

    const { error } = await getSupabase()
      .from('leads')
      .insert([{
        leader_id: leaderId,
        registered_by: registeredBy,
        name,
        preferred_name: preferredName,
        birth_date: birthDate,
        sexo,
        phone,
        email,
        cpf,
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
    res.status(500).json({ error: 'Erro ao salvar contato', details: err.message });
  }
});

// Public: save archetype mapping
app.post('/api/public/archetype', async (req, res) => {
  try {
    const { leaderId, leaderName, answers, brandSingle, brandMulti, textAnswers, results } = req.body;
    const { error } = await getSupabase()
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
    res.status(500).json({ error: 'Erro ao salvar mapeamento', details: err.message });
  }
});

// Public: Get full archetype mapping for a leader
app.get('/api/public/archetype/:leaderId', async (req, res) => {
  try {
    const { leaderId } = req.params;
    const { data, error } = await getSupabase()
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
    const { data: archetypes, error } = await getSupabase()
      .from('archetype_responses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const profiles = await Promise.all((archetypes || []).map(async (a) => {
      const { data: leader } = await getSupabase()
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
    const { data, error } = await getSupabase()
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

// --- GEOCODING ---
function cleanAddress(raw: string): string {
  return raw
    .replace(/- CEP:?\s*\d{5}-?\d{3}/g, '')
    .replace(/- CEP:?\s*\d+/g, '')
    .replace(/\s*-\s*/g, ', ')
    .replace(/,,+/g, ',')
    .replace(/^,|,$/g, '')
    .trim();
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const clean = cleanAddress(address) + ', MS, Brasil';
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'GDL-MB/1.0' } });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.error('Geocode error:', address, err);
  }
  return null;
}

app.get('/api/map-data', authMiddleware, async (req, res) => {
  try {
    const sb = getSupabase();
    const { data: leaders, error } = await sb
      .from('leaders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result = await Promise.all((leaders || []).map(async (leader) => {
      let lat = leader.latitude;
      let lng = leader.longitude;

      if ((lat == null || lng == null) && leader.address) {
        const coords = await geocodeAddress(`${leader.address}, Brasil`);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          await sb.from('leaders').update({ latitude: lat, longitude: lng }).eq('id', leader.id);
        }
      }

      const { data: leadsData } = await sb
        .from('leads')
        .select('*')
        .eq('leader_id', leader.id);

      const leadsWithCoords = await Promise.all((leadsData || []).map(async (lead) => {
        let llat = lead.latitude;
        let llng = lead.longitude;

        if ((llat == null || llng == null) && (lead.street || lead.neighborhood || lead.city)) {
          const leadAddress = `${lead.street || ''}, ${lead.address_number || ''}, ${lead.neighborhood || ''}, ${lead.city || ''}, MS, Brasil`.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '').trim();
          if (leadAddress && leadAddress !== ', , , MS, Brasil' && leadAddress !== 'MS, Brasil') {
            const coords = await geocodeAddress(leadAddress);
            if (coords) {
              llat = coords.lat;
              llng = coords.lng;
              await sb.from('leads').update({ latitude: llat, longitude: llng }).eq('id', lead.id);
            }
          }
        }

        return {
          ...lead,
          _id: lead.id,
          latitude: llat,
          longitude: llng,
        };
      }));

      return {
        ...leader,
        _id: leader.id,
        latitude: lat,
        longitude: lng,
        leads: leadsWithCoords,
      };
    }));

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dados do mapa', details: err.message });
  }
});

export default app;
