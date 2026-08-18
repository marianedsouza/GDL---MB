import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const app = express();

app.use(express.json());

// Supabase connection
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obmewxohvzlcjykqktqk.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  if (!key) {
    console.error('Supabase key is empty. process.env.SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
    throw new Error('Supabase key not configured');
  }
  return createClient(url, key);
}

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
    const { data: leaders, error } = await getSupabase()
      .from('leaders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const leadersWithCount = await Promise.all((leaders || []).map(async (leader) => {
      const { count } = await getSupabase()
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('leader_id', leader.id);

      return { 
        ...leader, 
        _id: leader.id,
        leadsCount: count || 0
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
    
    const { data: leader, error } = await getSupabase()
      .from('leaders')
      .insert([{ name, phone, email, cpf, address }])
      .select()
      .single();

    if (error) throw error;

    if (leader.address && leader.latitude == null) {
      const coords = await geocodeWithFallback({ fullAddress: leader.address });
      if (coords) {
        await getSupabase().from('leaders').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', leader.id);
        leader.latitude = coords.lat;
        leader.longitude = coords.lng;
      }
    }

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
      lgpd_agreed: payload.lgpdAgreed,
      direct_leader: payload.directLeader,
      address: `${payload.street || ''}, ${payload.addressNumber || 'S/N'} - ${payload.neighborhood || ''}, ${payload.city || ''} - CEP: ${payload.cep || ''}`
    };

    const { data: leader, error } = await getSupabase()
      .from('leaders')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;

    if (leader.address && leader.latitude == null) {
      const coords = await geocodeWithFallback({
        street: payload.street,
        number: payload.addressNumber,
        neighborhood: payload.neighborhood,
        city: payload.city,
        fullAddress: leader.address,
      });
      if (coords) {
        await getSupabase().from('leaders').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', leader.id);
        leader.latitude = coords.lat;
        leader.longitude = coords.lng;
      }
    }

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
    await getSupabase().from('leads').delete().eq('leader_id', id);
    
    const { error } = await getSupabase().from('leaders').delete().eq('id', id);

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
    const { data: leads, error } = await getSupabase()
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
    const { data: leads, error } = await getSupabase()
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
    const { data: leader, error } = await getSupabase()
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

// Public: Check if a CPF is already registered by a leader
app.get('/api/public/leads/check-cpf/:cpf', async (req, res) => {
  try {
    const cpf = (req.params.cpf || '').replace(/\D/g, '');
    if (cpf.length !== 11) return res.json({ exists: false });

    const { data: existingLead, error } = await getSupabase()
      .from('leads')
      .select('leader_id')
      .eq('cpf', cpf)
      .maybeSingle();

    if (error) throw error;

    if (!existingLead) return res.json({ exists: false });

    const { data: originalLeader } = await getSupabase()
      .from('leaders')
      .select('name')
      .eq('id', existingLead.leader_id)
      .single();

    res.json({ exists: true, leaderName: originalLeader?.name || 'desconhecida', leaderId: existingLead.leader_id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao verificar CPF", details: err.message });
  }
});

// Public: Submit lead form
app.post('/api/public/leads', async (req, res) => {
  try {
    const { leaderId, registeredBy, name, preferredName, birthDate, sexo, phone, email, cpf, street, number, neighborhood, administrativeRegions, city, contactOrigins, segments, relationshipLevels, influencePotentials, nextActions, observations, lgpdAgreed } = req.body;
    
    const { data: leader, error: leaderError } = await getSupabase()
      .from('leaders')
      .select('id')
      .eq('id', leaderId)
      .single();

    if (leaderError || !leader) return res.status(404).json({ error: "Líder inválido" });

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

    const { data: createdLead, error } = await getSupabase()
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
        lgpd_agreed: lgpdAgreed,
      }])
      .select()
      .single();

    if (error) throw error;

    if (createdLead) {
      const coords = await geocodeWithFallback({ street, number, neighborhood, city });
      if (coords) {
        await getSupabase().from('leads').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', createdLead.id);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar contato", details: err.message });
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

// Tries progressively simpler address variants so a pin always appears
// when the exact street is not found on Nominatim/OSM (e.g. street exists
// as an avenue or under a different prefix).
async function geocodeWithFallback(parts: {
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  fullAddress?: string | null;
}): Promise<{ lat: number; lng: number } | null> {
  let s = (parts.street || '').trim();
  let n = (parts.number || '').trim();
  const b = (parts.neighborhood || '').trim();
  const c = (parts.city || '').trim();

  if (!s && parts.fullAddress) {
    const seg = cleanAddress(parts.fullAddress).split(',').map(x => x.trim()).filter(Boolean);
    if (seg.length >= 1) s = seg[0];
    if (seg.length >= 2 && /^\d/.test(seg[1])) n = seg[1];
  }

  const variants: string[] = [];
  if (s) variants.push(s);
  if (s.startsWith('Rua ')) {
    const rest = s.slice(4).trim();
    if (rest) {
      variants.push(rest);
      variants.push(`Avenida ${rest}`);
      variants.push(`Av. ${rest}`);
    }
  }
  const uniqueVariants = [...new Set(variants)];

  const candidates: string[] = [];
  if (parts.fullAddress) candidates.push(parts.fullAddress);
  for (const v of uniqueVariants) {
    if (b && c) {
      candidates.push([v, n, b, c].filter(Boolean).join(', '));
      candidates.push([v, b, c].filter(Boolean).join(', '));
    }
    if (c) candidates.push([v, c].filter(Boolean).join(', '));
  }
  if (b && c) candidates.push(`${b}, ${c}`);
  if (c) candidates.push(c);

  for (const candidate of candidates) {
    const coords = await geocodeAddress(candidate);
    if (coords) return coords;
  }
  return null;
}

// Get map data (leaders + leads with coordinates)
app.get('/api/map-data', authMiddleware, async (req, res) => {
  try {
    const sb = getSupabase();
    const { data: leaders, error } = await sb
      .from('leaders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const GEOCODE_BATCH = 15;
    let geocoded = 0;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const result = [];
    for (const leader of leaders || []) {
      let lat = leader.latitude;
      let lng = leader.longitude;

      if ((lat == null || lng == null) && (leader.address || leader.neighborhood || leader.city) && geocoded < GEOCODE_BATCH) {
        const coords = await geocodeWithFallback({
          neighborhood: leader.neighborhood,
          city: leader.city,
          fullAddress: leader.address,
        });
        geocoded++;
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          await sb.from('leaders').update({ latitude: lat, longitude: lng }).eq('id', leader.id);
        }
        await sleep(1100);
      }

      const { data: leadsData } = await sb
        .from('leads')
        .select('*')
        .eq('leader_id', leader.id);

      const leadsWithCoords = [];
      for (const lead of leadsData || []) {
        let llat = lead.latitude;
        let llng = lead.longitude;

        if ((llat == null || llng == null) && (lead.street || lead.neighborhood || lead.city) && geocoded < GEOCODE_BATCH) {
          const coords = await geocodeWithFallback({
            street: lead.street,
            number: lead.address_number,
            neighborhood: lead.neighborhood,
            city: lead.city,
          });
          geocoded++;
          if (coords) {
            llat = coords.lat;
            llng = coords.lng;
            await sb.from('leads').update({ latitude: llat, longitude: llng }).eq('id', lead.id);
          }
          await sleep(1100);
        }

        leadsWithCoords.push({
          ...lead,
          _id: lead.id,
          latitude: llat,
          longitude: llng,
        });
      }

      result.push({
        ...leader,
        _id: leader.id,
        latitude: lat,
        longitude: lng,
        leads: leadsWithCoords,
      });
    }

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dados do mapa', details: err.message });
  }
});

// Public: check contact form status (ON/OFF)
app.get('/api/public/form-status', async (_req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('form_settings')
      .select('form_active')
      .eq('id', 1)
      .single();
    if (error) throw error;
    res.json({ active: data?.form_active ?? true });
  } catch {
    res.json({ active: true });
  }
});

// Public: check lideranca form status (ON/OFF)
app.get('/api/public/lideranca-form-status', async (_req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('form_settings')
      .select('lideranca_form_active')
      .eq('id', 1)
      .single();
    if (error) throw error;
    res.json({ active: data?.lideranca_form_active ?? true });
  } catch {
    res.json({ active: true });
  }
});

// Admin: toggle both form statuses
app.put('/api/admin/form-status', authMiddleware, async (req, res) => {
  try {
    const { active, lideranca_active } = req.body;
    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (typeof active === 'boolean') update.form_active = active;
    if (typeof lideranca_active === 'boolean') update.lideranca_form_active = lideranca_active;
    const { error } = await getSupabase()
      .from('form_settings')
      .update(update)
      .eq('id', 1);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar status', details: err.message });
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
