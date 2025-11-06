import { useState } from 'react';
import { MapPin, User, AlertTriangle, Filter, Users, CheckCircle, XCircle, Clock, ChevronRight, BarChart3, ArrowUpDown } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Crime } from '../App';

interface AdminDashboardProps {
  onViewProfile: () => void;
  userName: string;
  onViewCrimeDetail: (crime: Crime) => void;
  onManageUsers: () => void;
  onViewAnalytics: () => void;
}

// Mock crime data with admin-specific fields
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
    reportedBy: 'John Smith',
    reportedById: 'U001',
    status: 'pending',
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
    reportedBy: 'Sarah Johnson (Analyst)',
    reportedById: 'A001',
    status: 'verified',
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
    reportedBy: 'Mike Davis',
    reportedById: 'U002',
    status: 'verified',
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
    reportedBy: 'Emily Wilson',
    reportedById: 'U003',
    status: 'pending',
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
    reportedBy: 'David Lee (Analyst)',
    reportedById: 'A002',
    status: 'verified',
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
    reportedBy: 'Lisa Brown',
    reportedById: 'U004',
    status: 'discarded',
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
    reportedBy: 'Robert Taylor',
    reportedById: 'U005',
    status: 'pending',
    witnesses: 1,
    caseNumber: 'CP-2024-1022'
  }
];

export function AdminDashboard({ onViewProfile, userName, onViewCrimeDetail, onManageUsers, onViewAnalytics }: AdminDashboardProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'verified' | 'pending' | 'discarded'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Filter by status
  let filteredCrimes = selectedStatus === 'all' 
    ? mockCrimes 
    : mockCrimes.filter(crime => crime.status === selectedStatus);

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

  const crimeTypes = Array.from(new Set(mockCrimes.map(c => c.type)));

  const stats = {
    total: mockCrimes.length,
    verified: mockCrimes.filter(c => c.status === 'verified').length,
    pending: mockCrimes.filter(c => c.status === 'pending').length,
    discarded: mockCrimes.filter(c => c.status === 'discarded').length
  };

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
      case 'verified':
        return 'bg-green-600/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-blue-600/10 text-blue-500 border-blue-500/20';
      case 'discarded':
        return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
      default:
        return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'discarded':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="tracking-tight">
                <span className="text-red-500">Red</span>
                <span className="text-white">Lens</span>
              </h1>
              <p className="text-xs text-zinc-500">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={onViewProfile}
            className="hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-10 h-10 border-2 border-red-600">
              <AvatarFallback className="bg-red-600 text-white">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onManageUsers}
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button
            onClick={onViewAnalytics}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-zinc-900/50 px-4 py-4 border-b border-zinc-800">
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-zinc-900 border-zinc-800 p-3 text-center">
            <p className="text-xl text-white mb-1">{stats.total}</p>
            <p className="text-xs text-zinc-500">Total</p>
          </Card>
          <Card className="bg-green-600/10 border-green-600/20 p-3 text-center">
            <p className="text-xl text-green-500 mb-1">{stats.verified}</p>
            <p className="text-xs text-zinc-500">Verified</p>
          </Card>
          <Card className="bg-blue-600/10 border-blue-600/20 p-3 text-center">
            <p className="text-xl text-blue-500 mb-1">{stats.pending}</p>
            <p className="text-xs text-zinc-500">Pending</p>
          </Card>
          <Card className="bg-zinc-600/10 border-zinc-600/20 p-3 text-center">
            <p className="text-xl text-zinc-500 mb-1">{stats.discarded}</p>
            <p className="text-xs text-zinc-500">Discarded</p>
          </Card>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)} className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-transparent p-0 h-auto rounded-none border-b border-zinc-800">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent data-[state=active]:text-red-500 py-3"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="verified"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-500 py-3"
            >
              Verified
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 py-3"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger 
              value="discarded"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-600 data-[state=active]:bg-transparent data-[state=active]:text-zinc-500 py-3"
            >
              Discarded
            </TabsTrigger>
          </TabsList>
        </Tabs>
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

      {/* Crime Reports List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3 pb-6">
          {filteredCrimes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-zinc-900 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-400">No reports in this category</p>
            </div>
          ) : (
            filteredCrimes.map((crime) => (
              <Card
                key={crime.id}
                onClick={() => onViewCrimeDetail(crime)}
                className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all cursor-pointer"
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
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{crime.location}</span>
                        <span className="mx-1">•</span>
                        <span>Case #{crime.caseNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <User className="w-3 h-3" />
                        <span>Reported by: {crime.reportedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(crime.date).toLocaleDateString()} at {crime.time}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(crime.status)}
                  >
                    <span className="mr-1">{getStatusIcon(crime.status)}</span>
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
