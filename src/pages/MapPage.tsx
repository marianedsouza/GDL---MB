import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Popup, Tooltip, Marker, GeoJSON, Polyline } from 'react-leaflet';
import L from 'leaflet';
import AdminLayout from '../components/AdminLayout';
import { MapPin, Users, Phone, User, Navigation } from 'lucide-react';

interface Lead {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  neighborhood?: string;
  city?: string;
  street?: string;
  address_number?: string;
  birth_date?: string;
  latitude?: number | null;
  longitude?: number | null;
  registered_by?: string;
}

interface ContactGroup {
  lat: number;
  lng: number;
  color: string;
  leaderNames: string[];
  contacts: (Lead & { leaderName: string; age: number | null })[];
}

interface LeaderMapData {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  leads: Lead[];
}

const LEADER_COLORS = [
  '#ff796a', '#3498db', '#07aa30', '#f39c12', '#d468ff',
  '#85d604', '#ff8c27', '#d314b3', '#16a085', '#ff1900',
  '#0c00af', '#136e39', '#cc5200', '#792a9b', '#2c3e50',
  '#ffde22', '#8a0202',
];

const DEFAULT_CENTER: [number, number] = [-20.4697, -54.6201];

function calcAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const match = birthDate.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) return null;
  const today = new Date();
  let age = today.getFullYear() - year;
  const hadBirthday = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hadBirthday) age--;
  return age >= 0 ? age : null;
}

interface NeighborhoodFeature {
  type: string;
  properties: { name?: string; regiao_urb?: string; populacao?: number };
  geometry: { type: string; coordinates: number[][][] };
}

const REGION_COLORS: Record<string, string> = {
  CENTRO: '#ff0037',
  SEGREDO: '#a571ff',
  PROSA: '#b208a9',
  BANDEIRA: '#fd7f3c',
  ANHANDUIZINHO: '#16a34a',
  LAGOA: '#2563eb',
  IMBIRUSSU: '#ffc23e',
};

export default function MapPage() {
  const [data, setData] = useState<LeaderMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeader, setSelectedLeader] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [showAllContacts, setShowAllContacts] = useState(true);
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodFeature[]>([]);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  useEffect(() => {
    if (!showNeighborhoods || neighborhoods.length > 0) return;
    setLoadingNeighborhoods(true);
    fetch('/regioes-urbanas.json')
      .then(r => r.json())
      .then(data => {
        if (data?.features) setNeighborhoods(data.features);
        else console.error('Resposta inválida de /regioes-urbanas.json:', data);
      })
      .catch(err => console.error('Erro ao carregar regiões urbanas:', err))
      .finally(() => setLoadingNeighborhoods(false));
  }, [showNeighborhoods]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/map-data', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const d: LeaderMapData[] = await res.json();
          setData(d);

          const valid = d.filter(l => l.latitude != null && l.longitude != null);
          if (valid.length > 0) {
            const avgLat = valid.reduce((s, l) => s + l.latitude!, 0) / valid.length;
            const avgLng = valid.reduce((s, l) => s + l.longitude!, 0) / valid.length;
            setMapCenter([avgLat, avgLng]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const leaderColorMap = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((leader, i) => {
      map.set(leader._id, LEADER_COLORS[i % LEADER_COLORS.length]);
    });
    return map;
  }, [data]);

  const visibleData = useMemo(() => {
    if (selectedLeader) {
      return data.filter(l => l._id === selectedLeader);
    }
    return data;
  }, [data, selectedLeader]);

  const filteredLeads = useMemo(() => {
    if (!showAllContacts && selectedLeader) {
      return data.find(l => l._id === selectedLeader)?.leads || [];
    }
    if (!showAllContacts) return [];
    return data.flatMap(l => l.leads);
  }, [data, showAllContacts, selectedLeader]);

  const leaderGroups = useMemo(() => {
    const groups = new Map<string, { lat: number; lng: number; leaders: { leader: LeaderMapData; color: string }[] }>();

    visibleData.forEach(leader => {
      if (leader.latitude == null || leader.longitude == null) return;
      const key = `${leader.latitude.toFixed(6)},${leader.longitude.toFixed(6)}`;
      let group = groups.get(key);
      if (!group) {
        group = { lat: leader.latitude, lng: leader.longitude, leaders: [] };
        groups.set(key, group);
      }
      group.leaders.push({ leader, color: leaderColorMap.get(leader._id) || '#333' });
    });

    return [...groups.values()];
  }, [visibleData, leaderColorMap]);

  const contactGroups = useMemo(() => {
    const groups = new Map<string, ContactGroup>();

    visibleData.forEach(leader => {
      (showAllContacts || selectedLeader === leader._id ? leader.leads : []).forEach(lead => {
        if (lead.latitude == null || lead.longitude == null) return;
        const key = `${lead.latitude.toFixed(6)},${lead.longitude.toFixed(6)}`;
        let group = groups.get(key);
        if (!group) {
          group = {
            lat: lead.latitude,
            lng: lead.longitude,
            color: leaderColorMap.get(leader._id) || '#333',
            leaderNames: [],
            contacts: [],
          };
          groups.set(key, group);
        }
        group.contacts.push({ ...lead, leaderName: leader.name, age: calcAge(lead.birth_date) });
        if (!group.leaderNames.includes(leader.name)) group.leaderNames.push(leader.name);
      });
    });

    const list = [...groups.values()];
    list.forEach(group => {
      if (group.leaderNames.length > 1) group.color = '#475569';
    });
    return list;
  }, [visibleData, showAllContacts, selectedLeader, leaderColorMap]);

  const coResidentLeaderIds = useMemo(() => {
    const byCoord = new Map<string, string[]>();
    data.forEach(leader => {
      if (leader.latitude == null || leader.longitude == null) return;
      const key = `${leader.latitude.toFixed(6)},${leader.longitude.toFixed(6)}`;
      const list = byCoord.get(key) || [];
      list.push(leader._id);
      byCoord.set(key, list);
    });
    const set = new Set<string>();
    byCoord.forEach(list => {
      if (list.length > 1) list.forEach(id => set.add(id));
    });
    return set;
  }, [data]);

  const lines = useMemo(() => {
    const lns: { positions: [number, number][]; color: string; leadId: string; leaderId: string; leaderName: string; label: string }[] = [];
    const seen = new Set<string>();

    data.forEach(leader => {
      if (leader.latitude == null || leader.longitude == null) return;
      const leaderPos: [number, number] = [leader.latitude, leader.longitude];

      (showAllContacts || selectedLeader === leader._id ? leader.leads : []).forEach(lead => {
        if (lead.latitude == null || lead.longitude == null) return;
        const groupKey = `${lead.latitude.toFixed(6)},${lead.longitude.toFixed(6)}`;
        const lineKey = `${leader._id}|${groupKey}`;
        if (seen.has(lineKey)) return;
        seen.add(lineKey);
        lns.push({
          positions: [leaderPos, [lead.latitude, lead.longitude]],
          color: coResidentLeaderIds.has(leader._id) ? '#475569' : (leaderColorMap.get(leader._id) || '#333'),
          leadId: lead._id,
          leaderId: leader._id,
          leaderName: leader.name,
          label: lead.name,
        });
      });
    });

    return lns;
  }, [data, showAllContacts, selectedLeader, leaderColorMap, coResidentLeaderIds]);

  const stats = useMemo(() => {
    const totalLeaders = data.length;
    const totalLeads = data.reduce((s, l) => s + l.leads.length, 0);
    const locatedLeaders = data.filter(l => l.latitude != null).length;
    const locatedLeads = data.reduce((s, l) => s + l.leads.filter(c => c.latitude != null).length, 0);
    return { totalLeaders, totalLeads, locatedLeaders, locatedLeads };
  }, [data]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mapa Estratégico</h1>
        <p className="text-slate-500 mt-1">Visualize lideranças e contatos no mapa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" /> Lideranças
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalLeaders}</p>
          <p className="text-xs text-slate-400">{stats.locatedLeaders} com localização</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <User className="w-4 h-4" /> Contatos
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalLeads}</p>
          <p className="text-xs text-slate-400">{stats.locatedLeads} com localização</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" /> Filtro
          </div>
          <select
            value={selectedLeader || ''}
            onChange={(e) => {
              setSelectedLeader(e.target.value || null);
            }}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="">Todas as lideranças</option>
            {data.map(l => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <Navigation className="w-4 h-4" /> Visibilidade
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showAllContacts}
              onChange={(e) => setShowAllContacts(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            Mostrar contatos e fios de conexão
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={showNeighborhoods}
              onChange={(e) => setShowNeighborhoods(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            Micro regiões (7 Regiões Urbanas)
            {loadingNeighborhoods && <span className="text-xs text-slate-400">carregando...</span>}
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-24 text-slate-500">Carregando mapa...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-4 h-[600px] lg:h-[700px]">
              <MapContainer
                center={mapCenter}
                zoom={12}
                className="h-full w-full"
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {showNeighborhoods && neighborhoods.length > 0 && (
                  <GeoJSON
                    key="neighborhoods"
                    data={{ type: 'FeatureCollection', features: neighborhoods } as any}
                    style={(feature) => {
                      const name = (feature.properties as any)?.regiao_urb || '';
                      const color = REGION_COLORS[name] || '#475569';
                      return {
                        color,
                        weight: 2.5,
                        fillColor: color,
                        fillOpacity: 0.12,
                      };
                    }}
                    onEachFeature={(feature, layer) => {
                      const props = feature.properties as any;
                      const name = props?.regiao_urb || props?.name || '';
                      if (name) {
                        const pop = props?.populacao ? ` · ${props.populacao.toLocaleString('pt-BR')} hab.` : '';
                        layer.bindTooltip(name + pop, { permanent: true, direction: 'center', className: 'text-xs font-bold bg-white/85 border rounded px-1.5 py-0.5 shadow-sm' });
                      }
                    }}
                  />
                )}
                {lines.map(line => (
                  <Polyline
                    key={`line-${line.leadId}`}
                    positions={line.positions}
                    pathOptions={{
                      color: line.color,
                      weight: 2,
                      opacity: 0.55,
                      dashArray: '4 5',
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -6]} permanent={false}>
                      <div className="text-xs">
                        <span className="font-medium">{line.label}</span> → {line.leaderName}
                      </div>
                    </Tooltip>
                  </Polyline>
                ))}
                {leaderGroups.map((g, i) => {
                  const single = g.leaders.length === 1;
                  const color = single ? g.leaders[0].color : '#475569';
                  const totalLeads = g.leaders.reduce((s, l) => s + (l.leader.leads?.length || 0), 0);
                  const icon = L.divIcon({
                    className: '',
                    html: single
                      ? `<div style="position:relative;display:flex;align-items:center;justify-content:center">
                      <div style="
                        position:absolute;width:44px;height:44px;
                        border-radius:50%;
                        background:${color};
                        opacity:0.4;
                        animation:radar-ping 2s ease-out infinite;
                      "></div>
                      <div style="
                        width:44px;height:44px;
                        background:${color};
                        border:3px solid white;
                        border-radius:50%;
                        display:flex;align-items:center;justify-content:center;
                        font-size:13px;font-weight:700;color:white;
                        box-shadow:0 2px 8px rgba(0,0,0,0.3);
                        position:relative;z-index:1;
                      ">
                        ${totalLeads}
                      </div>
                    </div>`
                      : `<div style="
                        position:relative;display:flex;align-items:center;justify-content:center;
                      ">
                        <div style="
                          width:44px;height:44px;
                          background:${color};
                          border:3px solid white;
                          border-radius:50%;
                          display:flex;align-items:center;justify-content:center;
                          font-size:13px;font-weight:700;color:white;
                          box-shadow:0 2px 8px rgba(0,0,0,0.3);
                        ">${totalLeads}</div>
                        <div style="
                          position:absolute;top:-6px;right:-6px;
                          width:18px;height:18px;
                          background:#16a34a;
                          border:2px solid white;
                          border-radius:50%;
                          display:flex;align-items:center;justify-content:center;
                          font-size:12px;font-weight:700;color:white;
                          line-height:1;
                        ">+</div>
                      </div>`,
                    iconSize: [44, 44],
                    iconAnchor: [22, 22],
                  });

                  return (
                    <Marker
                      key={`leader-group-${g.lat}-${g.lng}-${i}`}
                      position={[g.lat, g.lng]}
                      icon={icon}
                    >
                      <Tooltip direction="top" offset={[0, -22]} permanent={false}>
                        <div className="text-xs font-medium">
                          {single ? g.leaders[0].leader.name : `${g.leaders.length} lideranças`}
                        </div>
                      </Tooltip>
                      <Popup>
                        <div className="text-sm min-w-[180px]">
                          <div className="font-bold text-base mb-1" style={{ color }}>
                            {single ? `👤 ${g.leaders[0].leader.name}` : `👥 ${g.leaders.length} lideranças neste endereço`}
                          </div>
                          <div className="text-xs text-slate-500 mb-1">{totalLeads} contato(s)</div>
                          <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                            {g.leaders.map(l => (
                              <div key={l.leader._id} className="border-t border-slate-100 pt-1.5">
                                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                                  {l.leader.name}
                                </div>
                                {l.leader.phone && (
                                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3" /> {l.leader.phone}
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-400">{(l.leader.leads?.length || 0)} contato(s)</div>
                              </div>
                            ))}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">Liderança(s)</div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                {contactGroups.map((group, gi) => {
                  const single = group.contacts.length === 1;
                  const icon = L.divIcon({
                    className: '',
                    html: single
                      ? `<div style="width:20px;height:20px;background:${group.color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`
                      : `<div style="width:26px;height:26px;background:${group.color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:white;box-shadow:0 1px 4px rgba(0,0,0,0.3)">${group.contacts.length}</div>`,
                    iconSize: single ? [20, 20] : [26, 26],
                    iconAnchor: single ? [10, 10] : [13, 13],
                  });

                  const isMixed = group.leaderNames.length > 1;

                  return (
                    <Marker
                      key={`group-${group.lat}-${group.lng}-${gi}`}
                      position={[group.lat, group.lng]}
                      icon={icon}
                    >
                      <Tooltip direction="top" offset={[0, -12]} permanent={false}>
                        <div className="text-xs font-medium">
                          {single ? group.contacts[0].name : `${group.contacts.length} contatos`}
                        </div>
                      </Tooltip>
                      <Popup>
                        <div className="text-sm min-w-[210px]">
                          <div className="font-bold text-base mb-1" style={{ color: group.color }}>
                            📍 {single ? 'Contato' : `${group.contacts.length} contatos`}
                          </div>
                          {group.contacts[0].neighborhood && (
                            <div className="text-xs text-slate-400 mb-1">{group.contacts[0].neighborhood}</div>
                          )}
                          {group.leaderNames.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mb-2">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">
                                {group.leaderNames.length > 1 ? 'Lideranças:' : 'Liderança:'}
                              </span>
                              {group.leaderNames.map((ln) => (
                                <span key={ln} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                  {ln}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="max-h-[220px] overflow-y-auto space-y-2">
                            {group.contacts.map((c, j) => (
                              <div key={c._id || j} className="border-t border-slate-100 pt-1.5">
                                <div className="font-semibold text-slate-800">
                                  {c.name}
                                  {c.age != null && <span className="text-slate-400 font-normal"> · {c.age} anos</span>}
                                </div>
                                {c.phone && (
                                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3" /> {c.phone}
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-400">via {c.leaderName}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-slate-200 p-4 max-h-[300px] lg:max-h-[700px] overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Legenda</h3>
              <div className="space-y-2">
                {data.length === 0 && (
                  <p className="text-xs text-slate-400">Nenhum dado disponível</p>
                )}
                {data.map((leader) => {
                  const color = leaderColorMap.get(leader._id);
                  const hasCoords = leader.latitude != null;
                  return (
                    <button
                      key={leader._id}
                      onClick={() => {
                        setSelectedLeader(selectedLeader === leader._id ? null : leader._id);
                        if (selectedLeader === leader._id) setShowAllContacts(false);
                      }}
                      className={`w-full text-left flex items-center gap-2 p-2 rounded-lg transition-colors text-xs ${
                        selectedLeader === leader._id ? 'bg-slate-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="flex-1 truncate font-medium text-slate-700">
                        {leader.name}
                      </span>
                      <span className="text-slate-400 shrink-0">{leader.leads.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
