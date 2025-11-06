import { useState } from 'react';
import { ChevronLeft, MapPin, AlertTriangle, Clock, Calendar, Shield, TrendingDown, TrendingUp, Filter, ArrowUpDown } from 'lucide-react';
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

// Mock crime data (same as MainMapView)
const mockCrimes: Crime[] = [
  {
    id: '1',
    type: 'Theft',
    location: 'Downtown Plaza',
    date: '2024-10-28',
    time: '14:30',
    severity: 'medium',
    description: 'Reported theft from vehicle in parking area',
    latitude: 40.7128,
    longitude: -74.0060,
    reportedBy: 'Anonymous',
    status: 'Under Investigation',
    witnesses: 2,
    caseNumber: 'DT-2024-1028'
  },
  {
    id: '2',
    type: 'Vandalism',
    location: 'Downtown Plaza',
    date: '2024-10-27',
    time: '22:15',
    severity: 'low',
    description: 'Graffiti on public property',
    latitude: 40.7128,
    longitude: -74.0060,
    reportedBy: 'City Patrol',
    status: 'Resolved',
    witnesses: 0,
    caseNumber: 'DT-2024-1027'
  },
  {
    id: '3',
    type: 'Assault',
    location: 'Central Park',
    date: '2024-10-26',
    time: '19:45',
    severity: 'high',
    description: 'Physical altercation reported',
    latitude: 40.7829,
    longitude: -73.9654,
    reportedBy: 'Witness',
    status: 'Active',
    witnesses: 3,
    caseNumber: 'CP-2024-1026'
  },
  {
    id: '4',
    type: 'Burglary',
    location: 'Riverside District',
    date: '2024-10-25',
    time: '03:20',
    severity: 'high',
    description: 'Break-in at residential property',
    latitude: 40.7589,
    longitude: -73.9851,
    reportedBy: 'Homeowner',
    status: 'Under Investigation',
    witnesses: 1,
    caseNumber: 'RD-2024-1025'
  },
  {
    id: '5',
    type: 'Car Theft',
    location: 'Downtown Plaza',
    date: '2024-10-24',
    time: '11:00',
    severity: 'high',
    description: 'Vehicle reported stolen from street parking',
    latitude: 40.7128,
    longitude: -74.0060,
    reportedBy: 'Vehicle Owner',
    status: 'Active',
    witnesses: 0,
    caseNumber: 'DT-2024-1024'
  },
  {
    id: '6',
    type: 'Shoplifting',
    location: 'Shopping District',
    date: '2024-10-23',
    time: '16:45',
    severity: 'low',
    description: 'Retail theft incident',
    latitude: 40.7489,
    longitude: -73.9680,
    reportedBy: 'Store Manager',
    status: 'Resolved',
    witnesses: 2,
    caseNumber: 'SD-2024-1023'
  },
  {
    id: '7',
    type: 'Theft',
    location: 'Central Park',
    date: '2024-10-22',
    time: '10:30',
    severity: 'medium',
    description: 'Pickpocketing incident reported',
    latitude: 40.7829,
    longitude: -73.9654,
    reportedBy: 'Victim',
    status: 'Closed',
    witnesses: 1,
    caseNumber: 'CP-2024-1022'
  }
];

export function CrimeListView({ location, onBack, onViewCrimeDetail }: CrimeListViewProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Filter by location first
  let filteredCrimes = mockCrimes.filter(crime => crime.location === location);

  // Apply type filter
  if (filterType !== 'all') {
    filteredCrimes = filteredCrimes.filter(crime => crime.type === filterType);
  }

  // Apply severity filter
  if (filterSeverity !== 'all') {
    filteredCrimes = filteredCrimes.filter(crime => crime.severity === filterSeverity);
  }

  // Apply sorting
  filteredCrimes = [...filteredCrimes].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'severity-high':
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case 'severity-low':
        const severityOrderAsc = { high: 3, medium: 2, low: 1 };
        return severityOrderAsc[a.severity] - severityOrderAsc[b.severity];
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const crimeTypes = Array.from(new Set(mockCrimes.filter(c => c.location === location).map(c => c.type)));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-600/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-orange-600/10 text-orange-500 border-orange-500/20';
      case 'low':
        return 'bg-yellow-600/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-red-600/10 text-red-500 border-red-500/20';
      case 'Under Investigation':
        return 'bg-blue-600/10 text-blue-500 border-blue-500/20';
      case 'Resolved':
      case 'Closed':
        return 'bg-green-600/10 text-green-500 border-green-500/20';
      default:
        return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const calculateStats = () => {
    const highCount = filteredCrimes.filter(c => c.severity === 'high').length;
    const mediumCount = filteredCrimes.filter(c => c.severity === 'medium').length;
    const lowCount = filteredCrimes.filter(c => c.severity === 'low').length;
    const maxCrimes = 10;
    const severityWeight = (highCount * 3) + (mediumCount * 2) + (lowCount * 1);
    const safetyScore = Math.max(0, 100 - (severityWeight / maxCrimes) * 100);
    
    return {
      safetyScore: Math.round(safetyScore),
      highCount,
      mediumCount,
      lowCount
    };
  };

  const stats = calculateStats();

  const getSafetyColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="hover:bg-zinc-800 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white">{location}</h1>
              <p className="text-xs text-zinc-500">{filteredCrimes.length} reported crimes</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-zinc-800/50 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${getSafetyColor(stats.safetyScore)}`} />
              <span className="text-sm text-zinc-400">Safety Score:</span>
              <span className={`${getSafetyColor(stats.safetyScore)}`}>
                {stats.safetyScore}/100
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-red-500">{stats.highCount}H</span>
              <span className="text-orange-500">{stats.mediumCount}M</span>
              <span className="text-yellow-500">{stats.lowCount}L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">All Types</SelectItem>
              {crimeTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9">
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="date-desc">Latest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="severity-high">High Severity</SelectItem>
              <SelectItem value="severity-low">Low Severity</SelectItem>
              <SelectItem value="type">By Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Crime List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3 pb-6">
          {filteredCrimes.length === 0 ? (
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
                onClick={() => onViewCrimeDetail(crime)}
                className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-red-600/20 p-2 rounded-lg flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-white">{crime.type}</h3>
                        <Badge
                          variant="outline"
                          className={getSeverityColor(crime.severity)}
                        >
                          {crime.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span>Case #{crime.caseNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{crime.description}</p>

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
                  <Badge
                    variant="outline"
                    className={getStatusColor(crime.status)}
                  >
                    {crime.status}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
