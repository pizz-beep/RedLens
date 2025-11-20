import { useState, useEffect } from "react";
import {
  MapPin,
  TrendingDown,
  TrendingUp,
  Shield,
  ChevronRight,
  Plus,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Calendar,
  Clock,
} from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { InteractiveMap } from "./InteractiveMap";
import { Crime } from "../App";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface MainMapViewProps {
  onViewProfile: () => void;
  userName: string;
  onViewCrimeList: (location: string) => void;
  onReportCrime: (lat?: number, lng?: number) => void;
  onViewCrimeDetail?: (crime: Crime) => void; // ADD THIS
}

interface LocationStats {
  location: string;
  totalCrimes: number;
  safetyScore: number;
  trend: "up" | "down";
  recentCrimes: Crime[];
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
}

const API_URL = 'http://localhost:4000/api';

export function MainMapView({
  onViewProfile,
  userName,
  onViewCrimeList,
  onReportCrime,
  onViewCrimeDetail, // ADD THIS
}: MainMapViewProps) {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationStats, setLocationStats] = useState<LocationStats | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  const fetchCrimes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/crimes`);
      if (!response.ok) throw new Error('Failed to fetch crimes');

      const data = await response.json();
      const mappedCrimes = data.map((crime: any) => ({
        id: String(crime.id),
        type: crime.type,
        location: crime.location,
        date: crime.date,
        time: crime.time,
        severity: crime.severity.toLowerCase(),
        description: crime.description,
        latitude: crime.latitude,
        longitude: crime.longitude,
        reportedBy: crime.reportedBy,
        status: crime.status,
        witnesses: 0,
        caseNumber: crime.caseNumber
      }));
      
      setCrimes(mappedCrimes);
    } catch (error) {
      console.error('Error fetching crimes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrimes();
  }, []);

  let filteredCrimes = [...crimes];

  if (filterType !== "all") {
    filteredCrimes = filteredCrimes.filter(
      (crime) => crime.type === filterType
    );
  }

  if (filterSeverity !== "all") {
    filteredCrimes = filteredCrimes.filter(
      (crime) => crime.severity === filterSeverity
    );
  }

  filteredCrimes = filteredCrimes.sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "severity-high":
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case "severity-low":
        const severityOrderAsc = { high: 3, medium: 2, low: 1 };
        return severityOrderAsc[a.severity] - severityOrderAsc[b.severity];
      case "type":
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const crimeTypes = Array.from(new Set(crimes.map((c) => c.type)));
  const hasActiveFilters = filterType !== "all" || filterSeverity !== "all" || sortBy !== "date-desc";

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-600/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-orange-600/10 text-orange-500 border-orange-500/20";
      case "low":
        return "bg-yellow-600/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-zinc-600/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Active":
        return "bg-red-600/10 text-red-500 border-red-500/20";
      case "Under Investigation":
        return "bg-blue-600/10 text-blue-500 border-blue-500/20";
      case "Resolved":
      case "Closed":
        return "bg-green-600/10 text-green-500 border-green-500/20";
      default:
        return "bg-zinc-600/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const calculateLocationStats = (location: string): LocationStats => {
    const locationCrimes = filteredCrimes.filter((c) => c.location === location);
    const highCount = locationCrimes.filter((c) => c.severity === "high").length;
    const mediumCount = locationCrimes.filter((c) => c.severity === "medium").length;
    const lowCount = locationCrimes.filter((c) => c.severity === "low").length;
    const maxCrimes = 10;
    const severityWeight = highCount * 3 + mediumCount * 2 + lowCount;
    const safetyScore = Math.max(0, 100 - (severityWeight / maxCrimes) * 100);

    return {
      location,
      totalCrimes: locationCrimes.length,
      safetyScore: Math.round(safetyScore),
      trend: Math.random() > 0.5 ? "down" : "up",
      recentCrimes: locationCrimes.slice(0, 3),
      highSeverityCount: highCount,
      mediumSeverityCount: mediumCount,
      lowSeverityCount: lowCount,
    };
  };

  const totalCrimes = filteredCrimes.length;
  const highSeverityCount = filteredCrimes.filter((c) => c.severity === "high").length;
  const mediumSeverityCount = filteredCrimes.filter((c) => c.severity === "medium").length;
  const lowSeverityCount = filteredCrimes.filter((c) => c.severity === "low").length;
  const citySeverityWeight = highSeverityCount * 3 + mediumSeverityCount * 2 + lowSeverityCount;
  const citySafetyScore = Math.max(0, 100 - (citySeverityWeight / (totalCrimes * 3)) * 100);

  const handleLocationClick = (location: string, lat: number, lng: number) => {
    setSelectedLocation(location);
    setLocationStats(calculateLocationStats(location));
  };

  const handleResetFilter = () => {
    setSelectedLocation(null);
    setLocationStats(null);
    setFilterType("all");
    setFilterSeverity("all");
    setSortBy("date-desc");
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const getSafetyColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getSafetyLabel = (score: number) => {
    if (score >= 70) return "Safe";
    if (score >= 40) return "Moderate";
    return "High Risk";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-[Outfit]">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 flex items-center justify-between relative">
        <div className="absolute inset-0 bg-red-600/5 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg shadow-md shadow-red-700/40">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="tracking-tight text-lg font-semibold">
              <span className="text-red-500">Red</span>
              <span className="text-white">Lens</span>
            </h1>
            <p className="text-xs text-zinc-500">Crime Hotspots</p>
          </div>
        </div>
        <button
          onClick={onViewProfile}
          className="hover:opacity-90 transition-opacity relative z-10"
        >
          <Avatar className="w-10 h-10 border-2 border-red-600">
            <AvatarFallback className="bg-red-600 text-white">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>

      {/* Map Section */}
      <div className="relative bg-zinc-900 border-b border-zinc-800">
        <InteractiveMap
          crimes={filteredCrimes}
          onSelectLocation={handleLocationClick}
          onReportCrime={onReportCrime}
          selectedLocation={selectedLocation || undefined}
        />
      </div>

      {/* Filter Controls - FIXED DROPDOWN DIRECTION */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-3 backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-xs h-9 hover:bg-zinc-800 hover:border-red-500/40 transition-all">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-red-300" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent side="bottom" className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">All Types</SelectItem>
              {crimeTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-xs h-9 hover:bg-zinc-800 hover:border-red-500/40 transition-all">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-red-300" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent side="bottom" className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-xs h-9 hover:bg-zinc-800 hover:border-red-500/40 transition-all">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-red-300" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent side="bottom" className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="date-desc">Latest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="severity-high">High Severity</SelectItem>
              <SelectItem value="severity-low">Low Severity</SelectItem>
              <SelectItem value="type">By Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              {filteredCrimes.length} crimes match your filters
            </p>
            <button
              onClick={handleResetFilter}
              className="text-xs text-red-500 hover:text-red-400"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Filtered Crime List - ADDED ONCLICK */}
      {hasActiveFilters && !locationStats && (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3 pb-24">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white flex items-center gap-2">
                <div className="w-1 h-5 bg-red-600 rounded-full"></div>
                Filtered Crime Reports
              </h2>
              <Badge variant="outline" className="text-xs bg-red-600/10 text-red-400 border-red-600/30">
                {filteredCrimes.length} reports
              </Badge>
            </div>

            {loading ? (
              <div className="text-center py-12"><p className="text-zinc-400">Loading...</p></div>
            ) : filteredCrimes.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-zinc-900 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-zinc-600" />
                </div>
                <p className="text-zinc-400">No crimes match your filters</p>
              </div>
            ) : (
              filteredCrimes.map((crime) => (
                <Card
                  key={crime.id}
                  onClick={() => onViewCrimeDetail?.(crime)}
                  className="bg-zinc-900 border-zinc-800 p-4 hover:border-red-600/30 transition-all cursor-pointer active:scale-[0.98] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-transparent to-transparent group-hover:from-red-600/5 transition-all duration-200"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-red-600/20 p-2 rounded-lg flex-shrink-0">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-white font-medium">{crime.type}</h3>
                            <Badge variant="outline" className={getSeverityColor(crime.severity)}>
                              {crime.severity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{crime.location}</span>
                            <span className="mx-1">•</span>
                            <span>Case #{crime.caseNumber}</span>
                          </div>
                          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                            {crime.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(crime.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{crime.time}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className={getStatusColor(crime.status)}>
                              {crime.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      )}

      {/* Location Stats */}
      {locationStats && (
        <div className="relative bg-gradient-to-t from-zinc-950 via-zinc-900 to-transparent border-t border-zinc-800">
          <Card className="mx-4 mt-4 bg-zinc-900 border border-zinc-800 overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.05)] hover:shadow-[0_0_25px_rgba(239,68,68,0.15)] transition-all rounded-2xl">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{locationStats.location}</h3>
                  <p className="text-sm text-zinc-500">{locationStats.totalCrimes} reported crimes</p>
                </div>
                <button
                  onClick={handleResetFilter}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Clear
                </button>
              </div>

              <div className="bg-zinc-800/40 rounded-xl p-4 mb-4 border border-zinc-700/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-5 h-5 ${getSafetyColor(locationStats.safetyScore)}`} />
                    <span className="text-sm text-zinc-400">Safety Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {locationStats.trend === "down" ? (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs text-zinc-500">
                      {locationStats.trend === "down" ? "Improving" : "Worsening"}
                    </span>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold bg-gradient-to-br from-red-500 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
                    {locationStats.safetyScore}
                  </span>
                  <span className="text-sm text-zinc-500 mb-1">/ 100</span>
                  <span className={`text-sm mb-1.5 ml-2 ${getSafetyColor(locationStats.safetyScore)}`}>
                    {getSafetyLabel(locationStats.safetyScore)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 text-center">
                  <p className="text-xl text-red-500 font-semibold">{locationStats.highSeverityCount}</p>
                  <p className="text-xs text-zinc-500">High</p>
                </div>
                <div className="bg-orange-600/10 border border-orange-600/20 rounded-lg p-3 text-center">
                  <p className="text-xl text-orange-500 font-semibold">{locationStats.mediumSeverityCount}</p>
                  <p className="text-xs text-zinc-500">Medium</p>
                </div>
                <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-3 text-center">
                  <p className="text-xl text-yellow-500 font-semibold">{locationStats.lowSeverityCount}</p>
                  <p className="text-xs text-zinc-500">Low</p>
                </div>
              </div>

              <Button
                onClick={() => onViewCrimeList(locationStats.location)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-xl"
              >
                View All Crimes
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Citywide Overview - CANVA STYLE FONTS */}
      {!locationStats && !hasActiveFilters && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center w-full max-w-lg mx-auto bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8 shadow-lg backdrop-blur-md">
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              CITYWIDE OVERVIEW
            </h3>
            <div className="flex justify-around mb-6">
              <div>
                <p className={`text-5xl font-black mb-2 ${getSafetyColor(citySafetyScore)}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {Math.round(citySafetyScore)}
                </p>
                <p className="text-sm font-bold uppercase tracking-wide text-zinc-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>Safety Score</p>
              </div>
              <div>
                <p className="text-5xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{totalCrimes}</p>
                <p className="text-sm font-bold uppercase tracking-wide text-zinc-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>Total Crimes</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4">
                <p className="text-2xl text-red-500 font-black mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{highSeverityCount}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>High</p>
              </div>
              <div className="bg-orange-600/10 border border-orange-600/20 rounded-lg p-4">
                <p className="text-2xl text-orange-500 font-black mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{mediumSeverityCount}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>Medium</p>
              </div>
              <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
                <p className="text-2xl text-yellow-500 font-black mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{lowSeverityCount}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>Low</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Report Button */}
      <button
        onClick={() => onReportCrime()}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 rounded-full shadow-lg shadow-red-600/50 hover:shadow-red-500/70 transition-all z-50 animate-pulse hover:animate-none"
        aria-label="Report Crime"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
