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

async function main() {
  console.log('Buscando lideranças sem coordenadas...');
  const { data: leaders } = await supabase
    .from('leaders')
    .select('id, address, latitude, longitude');

  if (!leaders) { console.log('Nenhuma liderança encontrada.'); return; }

  for (const leader of leaders) {
    if (leader.latitude && leader.longitude) continue;
    if (!leader.address) continue;

    const address = `${leader.address}, Brasil`;
    console.log(`Geocodificando liderança: ${address}`);
    const coords = await geocodeAddress(address);
    if (coords) {
      await supabase.from('leaders').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', leader.id);
      console.log(`  -> ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`  -> Sem resultados`);
    }
    await new Promise(r => setTimeout(r, 1100));
  }

  console.log('\nBuscando contatos sem coordenadas...');
  const { data: leads } = await supabase
    .from('leads')
    .select('id, street, address_number, neighborhood, city, latitude, longitude');

  if (!leads) { console.log('Nenhum contato encontrado.'); return; }

  for (const lead of leads) {
    if (lead.latitude && lead.longitude) continue;
    if (!lead.street && !lead.neighborhood && !lead.city) continue;

    const address = `${lead.street || ''}, ${lead.address_number || ''}, ${lead.neighborhood || ''}, ${lead.city || ''}, MS, Brasil`
      .replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '').trim();
    if (!address || address === ', , , MS, Brasil' || address === 'MS, Brasil') continue;

    console.log(`Geocodificando contato: ${address}`);
    const coords = await geocodeAddress(address);
    if (coords) {
      await supabase.from('leads').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', lead.id);
      console.log(`  -> ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`  -> Sem resultados`);
    }
    await new Promise(r => setTimeout(r, 1100));
  }

  console.log('\nConcluído!');
}

main().catch(console.error);
