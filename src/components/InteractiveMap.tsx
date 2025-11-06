import { useState, useEffect, useRef } from "react";
import { MapPin, Plus, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./ui/button";
import { Crime } from "../App";

interface InteractiveMapProps {
  crimes: Crime[];
  onSelectLocation: (
    location: string,
    lat: number,
    lng: number,
  ) => void;
  onReportCrime?: (lat: number, lng: number) => void;
  selectedLocation?: string;
}

export function InteractiveMap({
  crimes,
  onSelectLocation,
  onReportCrime,
  selectedLocation,
}: InteractiveMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredLocation, setHoveredLocation] = useState<
    string | null
  >(null);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
    lat: number;
    lng: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // Group crimes by location
  const crimesByLocation = crimes.reduce(
    (acc, crime) => {
      const key = `${crime.latitude},${crime.longitude}`;
      if (!acc[key])
        acc[key] = {
          location: crime.location,
          crimes: [],
          lat: crime.latitude,
          lng: crime.longitude,
        };
      acc[key].crimes.push(crime);
      return acc;
    },
    {} as Record<
      string,
      {
        location: string;
        crimes: Crime[];
        lat: number;
        lng: number;
      }
    >,
  );

  const locationGroups = Object.values(crimesByLocation);

  // Dynamic scaling
  const [mapSize, setMapSize] = useState({
    width: 1200,
    height: 700,
  });
  useEffect(() => {
    const updateSize = () =>
      setMapSize({
        width: window.innerWidth * 0.95,
        height: window.innerHeight * 0.7,
      });
    updateSize();
    window.addEventListener("resize", updateSize);
    return () =>
      window.removeEventListener("resize", updateSize);
  }, []);

  const latLngToPixel = (lat: number, lng: number) => {
    const { width, height } = mapSize;
    const centerLat = 40.7589;
    const centerLng = -73.9851;
    const scale = 8000 * zoom;
    const x = width / 2 + (lng - centerLng) * scale + pan.x;
    const y = height / 2 - (lat - centerLat) * scale + pan.y;
    return { x, y };
  };

  const pixelToLatLng = (x: number, y: number) => {
    const { width, height } = mapSize;
    const centerLat = 40.7589;
    const centerLng = -73.9851;
    const scale = 8000 * zoom;
    const lng = centerLng + (x - width / 2 - pan.x) / scale;
    const lat = centerLat - (y - height / 2 - pan.y) / scale;
    return { lat, lng };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging)
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleMapClick = (
    e: React.MouseEvent<SVGSVGElement>,
  ) => {
    if (!isDragging && onReportCrime) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { lat, lng } = pixelToLatLng(x, y);
      setClickPosition({ x, y, lat, lng });
      setTimeout(() => setClickPosition(null), 3000);
    }
  };

  const getSeverityColor = (s: string) =>
    s === "high"
      ? "#ef4444"
      : s === "medium"
        ? "#f97316"
        : s === "low"
          ? "#eab308"
          : "#71717a";

  const getHighestSeverity = (crimes: Crime[]) =>
    crimes.reduce((max, crime) => {
      const order = { high: 3, medium: 2, low: 1 };
      return order[crime.severity as keyof typeof order] >
        order[max.severity as keyof typeof order]
        ? crime
        : max;
    }).severity;

  return (
    <div className="relative w-full bg-zinc-950 overflow-hidden rounded-b-3xl">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-zinc-900/40 to-zinc-950/90 pointer-events-none" />

      <svg
        ref={svgRef}
        className="w-full h-[75vh] cursor-grab active:cursor-grabbing transition-all duration-300"
        viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMapClick}
      >
        {/* Grid and glow */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#27272a"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        <rect
          width={mapSize.width}
          height={mapSize.height}
          fill="#18181b"
        />
        <rect
          width={mapSize.width}
          height={mapSize.height}
          fill="url(#grid)"
          opacity="0.4"
        />

        {/* Heat zones */}
        {locationGroups.map((group, i) => {
          const pos = latLngToPixel(group.lat, group.lng);
          const severity = getHighestSeverity(group.crimes);
          const radius = Math.min(
            group.crimes.length * 28,
            100,
          );
          return (
            <circle
              key={`heat-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={radius}
              fill={getSeverityColor(severity)}
              opacity="0.15"
            />
          );
        })}

        {/* Markers */}
        {locationGroups.map((group, i) => {
          const pos = latLngToPixel(group.lat, group.lng);
          const severity = getHighestSeverity(group.crimes);
          const isHovered = hoveredLocation === group.location;
          const isSelected =
            selectedLocation === group.location;
          const markerSize = isHovered || isSelected ? 18 : 12;

          return (
            <g
              key={i}
              transform={`translate(${pos.x}, ${pos.y})`}
              onMouseEnter={() =>
                setHoveredLocation(group.location)
              }
              onMouseLeave={() => setHoveredLocation(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectLocation(
                  group.location,
                  group.lat,
                  group.lng,
                );
              }}
              className="cursor-pointer transition-all"
            >
              <circle
                r={markerSize}
                fill={getSeverityColor(severity)}
                stroke="white"
                strokeWidth="2"
                className="drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              />
              {(isHovered || isSelected) && (
                <>
                  <text
                    y="-25"
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {group.location}
                  </text>
                  <text
                    y="-10"
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="10"
                  >
                    {group.crimes.length} reports
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
        {[
          {
            icon: <ZoomIn />,
            action: () => setZoom(Math.min(zoom * 1.2, 3)),
          },
          {
            icon: <ZoomOut />,
            action: () => setZoom(Math.max(zoom / 1.2, 0.5)),
          },
          {
            icon: (
              <span className="text-xs font-medium">Reset</span>
            ),
            action: () => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            },
          },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800/70 border border-zinc-700 hover:border-red-500 text-white backdrop-blur-md shadow-md hover:shadow-red-500/30 transition-all"
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 shadow-lg backdrop-blur-md text-xs z-10">
        <h4 className="text-white mb-2 font-semibold">
          Severity Levels
        </h4>
        {["High", "Medium", "Low"].map((lvl, i) => {
          const colors = [
            "bg-red-600",
            "bg-orange-500",
            "bg-yellow-500",
          ];
          return (
            <div
              key={i}
              className="flex items-center gap-2 mb-1"
            >
              <div
                className={`w-3 h-3 rounded-full ${colors[i]} border border-white`}
              />
              <span className="text-zinc-300">{lvl}</span>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-blue-600/10 border border-blue-600/30 text-blue-400 px-3 py-2 rounded-lg text-xs backdrop-blur-md shadow-sm">
        <MapPin className="w-3 h-3 inline mr-1" /> Drag to pan •
        Click markers for details
      </div>
    </div>
  );
}