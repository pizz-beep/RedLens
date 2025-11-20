import { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, AlertTriangle, Clock, Calendar, Shield, Filter, ArrowUpDown } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Crime } from '../App';

interface CrimeListViewProps {
  location: string;
  onBack: () => void;
  onViewCrimeDetail: (crime: Crime) => void;
}

const API_URL = 'http://localhost:4000/api';

export function CrimeListView({ location, onBack, onViewCrimeDetail }: CrimeListViewProps) {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  useEffect(() => {
    const fetchCrimes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/crimes`);
        const data = await response.json();
        const locationCrimes = data.filter((crime: any) => crime.location === location);
        const transformedCrimes: Crime[] = locationCrimes.map((crime: any) => ({
          id: String(crime.id),
          type: crime.type,
          location: crime.location,
          date: crime.date,
          time: crime.time,
          severity: crime.severity.toLowerCase() as 'low' | 'medium' | 'high',
          description: crime.description,
          latitude: crime.latitude || 0,
          longitude: crime.longitude || 0,
          reportedBy: crime.reportedBy,
          status: crime.status?.toLowerCase() as 'verified' | 'pending' | 'discarded',
          caseNumber: crime.caseNumber || `CASE-${crime.id}`
        }));
        setCrimes(transformedCrimes);
      } catch (error) {
        console.error('Error fetching crimes:', error);
        setCrimes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCrimes();
  }, [location]);

  let filteredCrimes = [...crimes];
  if (filterType !== 'all') {
    filteredCrimes = filteredCrimes.filter(crime => crime.type === filterType);
  }
  if (filterSeverity !== 'all') {
    filteredCrimes = filteredCrimes.filter(crime => crime.severity === filterSeverity);
  }
  filteredCrimes = filteredCrimes.sort((a, b) => {
    switch (sortBy) {
      case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'severity-high':
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case 'severity-low':
        const severityOrderAsc = { high: 3, medium: 2, low: 1 };
        return severityOrderAsc[a.severity] - severityOrderAsc[b.severity];
      case 'type': return a.type.localeCompare(b.type);
      default: return 0;
    }
  });

  const crimeTypes = Array.from(new Set(crimes.map(c => c.type)));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-600/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-orange-600/10 text-orange-500 border-orange-500/20';
      case 'low': return 'bg-yellow-600/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-red-600/10 text-red-500 border-red-500/20';
      case 'under investigation': return 'bg-blue-600/10 text-blue-500 border-blue-500/20';
      case 'resolved':
      case 'closed': return 'bg-green-600/10 text-green-500 border-green-500/20';
      default: return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const calculateStats = () => {
    const highCount = filteredCrimes.filter(c => c.severity === 'high').length;
    const mediumCount = filteredCrimes.filter(c => c.severity === 'medium').length;
    const lowCount = filteredCrimes.filter(c => c.severity === 'low').length;
    const maxCrimes = 10;
    const severityWeight = (highCount * 3) + (mediumCount * 2) + (lowCount * 1);
    const safetyScore = Math.max(0, 100 - (severityWeight / maxCrimes) * 100);
    return { safetyScore: Math.round(safetyScore), highCount, mediumCount, lowCount };
  };

  const stats = calculateStats();
  const getSafetyColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  console.log('🚨 RENDERING with', filteredCrimes.length, 'crimes');

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="hover:bg-zinc-800 p-2 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{location}</h1>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {loading ? 'Loading...' : `${filteredCrimes.length} reported crimes`}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${getSafetyColor(stats.safetyScore)}`} />
              <span className="text-sm text-zinc-400 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Safety Score:</span>
              <span className={`font-black ${getSafetyColor(stats.safetyScore)}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stats.safetyScore}/100</span>
            </div>
            <div className="flex gap-2 text-xs font-black" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <span className="text-red-500">{stats.highCount}H</span>
              <span className="text-orange-500">{stats.mediumCount}M</span>
              <span className="text-yellow-500">{stats.lowCount}L</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9">
              <Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent side="bottom" className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">All Types</SelectItem>
              {crimeTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9">
              <Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent side="bottom" className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9">
              <ArrowUpDown className="w-3 h-3 mr-1" /><SelectValue placeholder="Sort" />
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
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3 pb-6">
          {loading ? (
            <div className="text-center py-12"><p className="text-zinc-400">Loading crimes...</p></div>
          ) : filteredCrimes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-zinc-900 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-400">No crimes found for this location</p>
            </div>
          ) : (
            filteredCrimes.map((crime) => (
              <div
                key={crime.id}
                onClick={() => {
                  console.log('🔥🔥🔥 CLICKED:', crime.type);
                  onViewCrimeDetail(crime);
                }}
                className="cursor-pointer"
              >
                <Card className="bg-zinc-900 border-zinc-800 p-4 hover:border-red-600/30 transition-all active:scale-[0.98] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-transparent to-transparent group-hover:from-red-600/5 transition-all"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-red-600/20 p-2 rounded-lg flex-shrink-0">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-white font-black uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{crime.type}</h3>
                            <Badge variant="outline" className={`${getSeverityColor(crime.severity)} font-black text-xs uppercase`} style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.severity}</Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            <span>Case #{crime.caseNumber}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-zinc-500 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /><span>{new Date(crime.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /><span>{crime.time}</span>
                        </div>
                      </div>
                      {crime.status && <Badge variant="outline" className={`${getStatusColor(crime.status)} font-black text-xs uppercase`} style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.status}</Badge>}
                    </div>
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
