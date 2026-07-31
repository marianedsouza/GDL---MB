import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obmewxohvzlcjykqktqk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Zm_tNXmMNySXA-f7DINFSA_uYeY7ODS';
const supabase = createClient(supabaseUrl, supabaseKey);

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

async function geocodeWithFallback(parts: {
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  fullAddress?: string | null;
}): Promise<{ lat: number; lng: number } | null> {
  const s = (parts.street || '').trim();
  const n = (parts.number || '').trim();
  const b = (parts.neighborhood || '').trim();
  const c = (parts.city || '').trim();
  const candidates: string[] = [];
  if (parts.fullAddress) candidates.push(parts.fullAddress);
  if (s && b && c) candidates.push([s, n, b, c].filter(Boolean).join(', '));
  if (b && c) candidates.push(`${b}, ${c}`);
  if (c) candidates.push(c);
  for (const candidate of candidates) {
    const coords = await geocodeAddress(candidate);
    if (coords) return coords;
  }
  return null;
}

async function main() {
  console.log('Buscando lideranças sem coordenadas...');
  const { data: leaders } = await supabase
    .from('leaders')
    .select('id, name, address, neighborhood, city, latitude, longitude');

  if (!leaders) { console.log('Nenhuma liderança encontrada.'); return; }

  let leadersFixed = 0;
  for (const leader of leaders) {
    if (leader.latitude && leader.longitude) continue;
    if (!leader.address && !leader.neighborhood && !leader.city) continue;

    console.log(`Geocodificando liderança: ${leader.name || leader.id}`);
    const coords = await geocodeWithFallback({
      neighborhood: leader.neighborhood,
      city: leader.city,
      fullAddress: leader.address,
    });
    if (coords) {
      await supabase.from('leaders').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', leader.id);
      leadersFixed++;
      console.log(`  -> ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`  -> Sem resultados`);
    }
    await new Promise(r => setTimeout(r, 1100));
  }
  console.log(`Lideranças atualizadas: ${leadersFixed}`);

  console.log('\nBuscando contatos sem coordenadas...');
  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, street, address_number, neighborhood, city, latitude, longitude');

  if (!leads) { console.log('Nenhum contato encontrado.'); return; }

  let leadsFixed = 0;
  for (const lead of leads) {
    if (lead.latitude && lead.longitude) continue;
    if (!lead.street && !lead.neighborhood && !lead.city) continue;

    console.log(`Geocodificando contato: ${lead.name || lead.id}`);
    const coords = await geocodeWithFallback({
      street: lead.street,
      number: lead.address_number,
      neighborhood: lead.neighborhood,
      city: lead.city,
    });
    if (coords) {
      await supabase.from('leads').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', lead.id);
      leadsFixed++;
      console.log(`  -> ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`  -> Sem resultados`);
    }
    await new Promise(r => setTimeout(r, 1100));
  }
  console.log(`Contatos atualizados: ${leadsFixed}`);

  console.log('\nConcluído!');
}

main().catch(console.error);
