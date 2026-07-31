const q = '[out:json][timeout:25];area["name"="Campo Grande"]["admin_level"="8"]->.city;relation(area.city)["admin_level"="10"]["type"="boundary"]["boundary"="administrative"];out geom;';
const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q, headers: { 'User-Agent': 'GDL-MB/1.0' } });
const data = await r.json();
const names = data.elements?.filter((el: any) => el.tags?.name).map((el: any) => el.tags.name) || [];
const regions = ['Anhanduizinho', 'Bandeira', 'Centro', 'Imbirussu', 'Lagoa', 'Prosa', 'Segredo'];
console.log('Urban regions found in admin_level=10 data:', names.filter((n: string) => regions.includes(n)));
console.log('Total names:', names.length);
