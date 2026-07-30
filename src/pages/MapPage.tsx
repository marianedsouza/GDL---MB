import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, Marker, GeoJSON } from 'react-leaflet';
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
  latitude?: number | null;
  longitude?: number | null;
  registered_by?: string;
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
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b',
  '#2980b9', '#27ae60', '#d35400', '#8e44ad', '#2c3e50',
];

const DEFAULT_CENTER: [number, number] = [-20.4697, -54.6201];

interface NeighborhoodFeature {
  type: string;
  properties: { name: string };
  geometry: { type: string; coordinates: number[][][] };
}

export default function MapPage() {
  const [data, setData] = useState<LeaderMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeader, setSelectedLeader] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodFeature[]>([]);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  useEffect(() => {
    if (!showNeighborhoods || neighborhoods.length > 0) return;
    setLoadingNeighborhoods(true);
    const query = `[out:json];area["name"="Campo Grande"]["admin_level"="8"]->.city;relation(area.city)["admin_level"="10"]["type"="boundary"]["boundary"="administrative"];out geom;`;
    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        const features: NeighborhoodFeature[] = (data.elements || [])
          .filter((el: any) => el.tags?.name && el.geometry?.length > 0)
          .map((el: any) => ({
            type: 'Feature',
            properties: { name: el.tags.name },
            geometry: {
              type: 'Polygon',
              coordinates: [el.geometry.map((p: any) => [p.lon, p.lat])],
            },
          }));
        setNeighborhoods(features);
      })
      .catch(err => console.error('Erro ao carregar bairros:', err))
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

  const points = useMemo(() => {
    const pts: { lat: number; lng: number; type: 'leader' | 'lead'; label: string; leaderId: string; leaderName: string; phone?: string }[] = [];

    visibleData.forEach(leader => {
      if (leader.latitude != null && leader.longitude != null) {
        pts.push({
          lat: leader.latitude,
          lng: leader.longitude,
          type: 'leader',
          label: leader.name,
          leaderId: leader._id,
          leaderName: leader.name,
          phone: leader.phone,
        });
      }

      (showAllContacts || selectedLeader === leader._id ? leader.leads : []).forEach(lead => {
        if (lead.latitude != null && lead.longitude != null) {
          pts.push({
            lat: lead.latitude,
            lng: lead.longitude,
            type: 'lead',
            label: lead.name,
            leaderId: leader._id,
            leaderName: leader.name,
            phone: lead.phone,
          });
        }
      });
    });

    return pts;
  }, [visibleData, showAllContacts, selectedLeader]);

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
              if (!e.target.value) setShowAllContacts(false);
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
            Mostrar todos os contatos
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={showNeighborhoods}
              onChange={(e) => setShowNeighborhoods(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            Micro regiões dos bairros
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
                    key={neighborhoods.length}
                    data={{ type: 'FeatureCollection', features: neighborhoods } as any}
                    style={() => ({
                      color: '#475569',
                      weight: 1.5,
                      fillColor: '#94a3b8',
                      fillOpacity: 0.15,
                    })}
                    onEachFeature={(feature, layer) => {
                      if (feature.properties?.name) {
                        layer.bindTooltip(feature.properties.name, { permanent: false, direction: 'center', className: 'text-xs font-medium' });
                      }
                    }}
                  />
                )}
                {points.map((p, i) => {
                  const color = leaderColorMap.get(p.leaderId) || '#333';
                  const isLeader = p.type === 'leader';

                  if (isLeader) {
                    const count = data.find(l => l._id === p.leaderId)?.leads.length || 0;
                    const icon = L.divIcon({
                      className: '',
                      html: `<div style="position:relative;display:flex;align-items:center;justify-content:center">
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
                          ${count}
                        </div>
                      </div>`,
                      iconSize: [44, 44],
                      iconAnchor: [22, 22],
                    });

                    return (
                      <Marker
                        key={`${p.type}-${p.leaderId}-${i}`}
                        position={[p.lat, p.lng]}
                        icon={icon}
                      >
                        <Tooltip direction="top" offset={[0, -22]} permanent={false}>
                          <div className="text-xs font-medium">{p.label}</div>
                        </Tooltip>
                        <Popup>
                          <div className="text-sm min-w-[160px]">
                            <div className="font-bold text-base mb-1" style={{ color }}>👤 {p.label}</div>
                            <div className="text-xs text-slate-500 mb-1">{count} contato(s)</div>
                            {p.phone && (
                              <div className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" /> {p.phone}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 mt-1">Liderança</div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  }

                  return (
                    <CircleMarker
                      key={`${p.type}-${p.leaderId}-${i}`}
                      center={[p.lat, p.lng]}
                      radius={6}
                      pathOptions={{
                        color: '#fff',
                        fillColor: color,
                        fillOpacity: 0.8,
                        weight: 2,
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -6]} permanent={false}>
                        <div className="text-xs font-medium">{p.label}</div>
                      </Tooltip>
                      <Popup>
                        <div className="text-sm min-w-[160px]">
                          <div className="font-bold text-base mb-1" style={{ color }}>📋 {p.label}</div>
                          <div className="text-xs text-slate-500 mb-1">{p.leaderName}</div>
                          {p.phone && (
                            <div className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" /> {p.phone}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-1">Contato</div>
                        </div>
                      </Popup>
                    </CircleMarker>
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
