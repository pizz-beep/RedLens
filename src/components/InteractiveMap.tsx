import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Crime } from '../App';

// Fix Leaflet default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface InteractiveMapProps {
  crimes: Crime[];
  onSelectLocation?: (location: string, lat: number, lng: number) => void;
  onReportCrime?: (lat: number, lng: number) => void;
  selectedLocation?: string;
}

// Component to handle heatmap layer
function HeatmapLayer({ crimes }: { crimes: Crime[] }) {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore - Leaflet.heat plugin
    if (!window.L.heatLayer) {
      // Load heatmap plugin dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        createHeatmap();
      };
    } else {
      createHeatmap();
    }

    function createHeatmap() {
      // Convert crimes to heatmap points [lat, lng, intensity]
      const heatData = crimes.map(crime => {
        const intensity = crime.severity === 'high' ? 1 : crime.severity === 'medium' ? 0.6 : 0.3;
        return [crime.latitude, crime.longitude, intensity];
      });

      // @ts-ignore
      const heat = L.heatLayer(heatData, {
        radius: 30,
        blur: 25,
        maxZoom: 16,
        max: 1.0,
        gradient: {
          0.0: '#0000ff',
          0.4: '#00ffff',
          0.6: '#00ff00',
          0.8: '#ffff00',
          1.0: '#ff0000'
        }
      }).addTo(map);

      return () => {
        map.removeLayer(heat);
      };
    }
  }, [crimes, map]);

  return null;
}

// Custom pulsing marker for high severity crimes
const PulsingIcon = (severity: string) => {
  const color = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f97316' : '#eab308';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative;">
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          background: ${color};
          border-radius: 50%;
          opacity: 0.3;
          animation: pulse 2s infinite;
        "></div>
        <div style="
          position: relative;
          width: 20px;
          height: 20px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% {
            transform: scale(0.5);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export function InteractiveMap({ crimes, onSelectLocation, selectedLocation }: InteractiveMapProps) {
  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);
  
  // Bangalore center
  const center: [number, number] = [12.9716, 77.5946];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f97316';
      case 'low': return '#eab308';
      default: return '#6b7280';
    }
  };

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border-2 border-zinc-800 shadow-2xl">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        zoomControl={false}
      >
        {/* Dark themed map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Heatmap Layer */}
        <HeatmapLayer crimes={crimes} />

        {/* Crime Markers */}
        {crimes.map((crime) => (
          <Marker
            key={crime.id}
            position={[crime.latitude, crime.longitude]}
            icon={PulsingIcon(crime.severity)}
            eventHandlers={{
              click: () => {
                setSelectedCrime(crime);
                if (onSelectLocation) {
                  onSelectLocation(crime.location, crime.latitude, crime.longitude);
                }
              }
            }}
          >
            <Popup className="custom-popup">
              <div className="bg-zinc-900 text-white p-3 rounded-lg min-w-[250px]">
                <div className="flex items-start gap-3 mb-2">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${getSeverityColor(crime.severity)}20` }}
                  >
                    <AlertTriangle 
                      className="w-5 h-5" 
                      style={{ color: getSeverityColor(crime.severity) }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{crime.type}</h3>
                    <p className="text-xs text-zinc-400">{crime.location}</p>
                  </div>
                  <div 
                    className="px-2 py-1 rounded text-xs font-semibold"
                    style={{ 
                      backgroundColor: `${getSeverityColor(crime.severity)}20`,
                      color: getSeverityColor(crime.severity)
                    }}
                  >
                    {crime.severity}
                  </div>
                </div>
                <p className="text-sm text-zinc-300 mb-2">{crime.description}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>📅 {crime.date}</span>
                  <span>🕐 {crime.time}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Circles for hotspot visualization - SMALLER SIZES */}
        {crimes.map((crime) => (
          <Circle
            key={`circle-${crime.id}`}
            center={[crime.latitude, crime.longitude]}
            radius={crime.severity === 'high' ? 150 : crime.severity === 'medium' ? 100 : 60}
            pathOptions={{
              color: getSeverityColor(crime.severity),
              fillColor: getSeverityColor(crime.severity),
              fillOpacity: 0.12,
              weight: 1.5,
              opacity: 0.3
            }}
          />
        ))}
      </MapContainer>

      {/* Floating Stats Overlay */}
      <div className="absolute top-4 left-4 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-2xl z-[1000]">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-500" />
          Crime Hotspots
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-zinc-400">
              {crimes.filter(c => c.severity === 'high').length} High Severity
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-xs text-zinc-400">
              {crimes.filter(c => c.severity === 'medium').length} Medium
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs text-zinc-400">
              {crimes.filter(c => c.severity === 'low').length} Low
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-2xl z-[1000]">
        <p className="text-xs text-zinc-400 mb-2">Heat Intensity</p>
        <div className="flex items-center gap-1">
          <div className="w-8 h-3 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-600 rounded" />
          <span className="text-xs text-zinc-500 ml-1">Low → High</span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 p-2 rounded-lg hover:bg-zinc-800 transition-colors">
          <span className="text-white text-lg">+</span>
        </button>
        <button className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 p-2 rounded-lg hover:bg-zinc-800 transition-colors">
          <span className="text-white text-lg">−</span>
        </button>
      </div>
    </div>
  );
}
