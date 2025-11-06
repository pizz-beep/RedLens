import { useState } from 'react';
import { MapPin, AlertTriangle, Filter, ArrowUpDown, ChevronRight, FileText, Map, BarChart3, Shield, Upload, Calendar, Clock, Download, Eye, TrendingUp, Activity } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { InteractiveMap } from './InteractiveMap';
import { Crime } from '../App';
import { toast } from 'sonner@2.0.3';

interface AnalystDashboardProps {
  onViewProfile: () => void;
  userName: string;
  onViewCrimeDetail: (crime: Crime) => void;
}

// Mock crime data
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
    reportedBy: 'City Patrol',
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
    reportedBy: 'Witness',
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
    reportedBy: 'Homeowner',
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
    reportedBy: 'Vehicle Owner',
    status: 'pending',
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
    status: 'verified',
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
    status: 'discarded',
    witnesses: 1,
    caseNumber: 'CP-2024-1022'
  }
];

export function AnalystDashboard({ onViewProfile, userName, onViewCrimeDetail }: AnalystDashboardProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCrimeForAction, setSelectedCrimeForAction] = useState<Crime | null>(null);
  const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false);
  const [isUploadReportOpen, setIsUploadReportOpen] = useState(false);
  const [isSafetyScoreOpen, setIsSafetyScoreOpen] = useState(false);
  const [isMapVisualizationOpen, setIsMapVisualizationOpen] = useState(false);

  // Filter and sort crimes
  let filteredCrimes = [...mockCrimes];

  // Apply location filter (from map selection)
  if (selectedLocation) {
    filteredCrimes = filteredCrimes.filter(crime => crime.location === selectedLocation);
  }

  // Apply type filter
  if (filterType !== 'all') {
    filteredCrimes = filteredCrimes.filter(crime => crime.type === filterType);
  }

  // Apply severity filter
  if (filterSeverity !== 'all') {
    filteredCrimes = filteredCrimes.filter(crime => crime.severity === filterSeverity);
  }

  // Apply status filter
  if (filterStatus !== 'all') {
    filteredCrimes = filteredCrimes.filter(crime => crime.status === filterStatus);
  }

  // Apply sorting
  filteredCrimes = filteredCrimes.sort((a, b) => {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
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

  const handleLocationClick = (location: string) => {
    setSelectedLocation(location === selectedLocation ? null : location);
  };

  const handleCrimeActions = (crime: Crime) => {
    setSelectedCrimeForAction(crime);
  };

  const handleGenerateReport = () => {
    toast.success('Analysis report generated successfully');
    setIsGenerateReportOpen(false);
    setSelectedCrimeForAction(null);
  };

  const handleUploadReport = () => {
    toast.success('Report uploaded successfully');
    setIsUploadReportOpen(false);
    setSelectedCrimeForAction(null);
  };

  const handleGenerateSafetyScore = () => {
    toast.success('Safety score calculated and saved');
    setIsSafetyScoreOpen(false);
    setSelectedCrimeForAction(null);
  };

  const handleGenerateMap = () => {
    toast.success('Map visualization generated successfully');
    setIsMapVisualizationOpen(false);
    setSelectedCrimeForAction(null);
  };

  const stats = {
    total: mockCrimes.length,
    pending: mockCrimes.filter(c => c.status === 'pending').length,
    verified: mockCrimes.filter(c => c.status === 'verified').length,
    high: mockCrimes.filter(c => c.severity === 'high').length
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Enhanced Header with Modern Styling */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-900/95 border-b border-zinc-800/50 px-4 py-5 relative overflow-hidden shadow-xl">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/3 via-transparent to-purple-600/3"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-3 rounded-2xl shadow-lg shadow-purple-600/30 ring-2 ring-purple-600/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="tracking-tight text-xl">
                  <span className="text-red-500">Red</span>
                  <span className="text-white">Lens</span>
                </h1>
                <p className="text-xs text-purple-300 mt-0.5">Analyst Dashboard</p>
              </div>
            </div>
            <button
              onClick={onViewProfile}
              className="hover:opacity-90 transition-all hover:scale-105"
            >
              <Avatar className="w-11 h-11 border-2 border-purple-500 shadow-lg shadow-purple-600/30 ring-2 ring-purple-600/10">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-zinc-800/90 via-zinc-800/70 to-zinc-800/50 border-zinc-700/60 backdrop-blur-sm p-4 text-center relative overflow-hidden group hover:border-zinc-600/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Activity className="w-4 h-4 text-zinc-300" />
                  <p className="text-2xl text-white">{stats.total}</p>
                </div>
                <p className="text-xs text-zinc-400">Total Cases</p>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-600/15 via-blue-600/10 to-blue-600/5 border-blue-500/40 backdrop-blur-sm p-4 text-center relative overflow-hidden group hover:border-blue-500/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Clock className="w-4 h-4 text-blue-300" />
                  <p className="text-2xl text-blue-300">{stats.pending}</p>
                </div>
                <p className="text-xs text-zinc-400">Pending</p>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-600/15 via-green-600/10 to-green-600/5 border-green-500/40 backdrop-blur-sm p-4 text-center relative overflow-hidden group hover:border-green-500/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Shield className="w-4 h-4 text-green-300" />
                  <p className="text-2xl text-green-300">{stats.verified}</p>
                </div>
                <p className="text-xs text-zinc-400">Verified</p>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-600/15 via-red-600/10 to-red-600/5 border-red-500/40 backdrop-blur-sm p-4 text-center relative overflow-hidden group hover:border-red-500/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <TrendingUp className="w-4 h-4 text-red-300" />
                  <p className="text-2xl text-red-300">{stats.high}</p>
                </div>
                <p className="text-xs text-zinc-400">High Risk</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Interactive Map with Modern Overlay */}
      <div className="relative bg-zinc-900/50 border-b border-zinc-800/50">
        <div className="h-72">
          <InteractiveMap
            crimes={mockCrimes}
            onSelectLocation={handleLocationClick}
            onReportCrime={() => {}}
            selectedLocation={selectedLocation || undefined}
          />
        </div>
        {selectedLocation && (
          <div className="absolute top-4 left-4 right-4">
            <Card className="bg-zinc-900/98 backdrop-blur-xl border-purple-500/40 p-4 shadow-2xl ring-1 ring-purple-600/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-600/30 to-purple-600/20 p-2 rounded-xl ring-1 ring-purple-500/30">
                    <MapPin className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <span className="text-sm text-white font-medium">{selectedLocation}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30 h-5">
                        {filteredCrimes.length} crimes
                      </Badge>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-xs text-purple-300 hover:text-purple-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-600/20 ring-1 ring-purple-500/20"
                >
                  Clear
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Enhanced Filters Bar */}
      <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-900/50 border-b border-zinc-800/50 px-4 py-4 backdrop-blur-sm">
        <div className="grid grid-cols-4 gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-xs h-10 hover:bg-zinc-800 hover:border-purple-500/40 transition-all">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-purple-300" />
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
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-xs h-10 hover:bg-zinc-800 hover:border-purple-500/40 transition-all">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-purple-300" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-xs h-10 hover:bg-zinc-800 hover:border-purple-500/40 transition-all">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-purple-300" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="discarded">Discarded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-xs h-10 hover:bg-zinc-800 hover:border-purple-500/40 transition-all">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-purple-300" />
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

      {/* Enhanced Crime List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
              Crime Reports
            </h2>
            <Badge variant="outline" className="text-xs bg-purple-600/10 text-purple-400 border-purple-600/30">
              {filteredCrimes.length} reports
            </Badge>
          </div>

          {filteredCrimes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-zinc-900 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-400">No crimes match your filters</p>
              <p className="text-sm text-zinc-600 mt-1">Try adjusting your filter criteria</p>
            </div>
          ) : (
            filteredCrimes.map((crime) => (
              <Card
                key={crime.id}
                className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-900/80 border-zinc-800 hover:border-purple-600/30 p-4 transition-all duration-200 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-transparent to-transparent group-hover:from-purple-600/5 transition-all duration-200"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-gradient-to-br from-red-600/20 to-red-600/10 p-2 rounded-lg flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-white">{crime.type}</h3>
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
                          <Badge variant="outline" className={getStatusColor(crime.status)}>
                            {crime.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-zinc-800 my-3" />

                  {/* Enhanced Analyst Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewCrimeDetail(crime)}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 text-xs transition-all group/btn"
                    >
                      <Eye className="w-3 h-3 mr-1.5 group-hover/btn:text-purple-400 transition-colors" />
                      View Details
                    </Button>
                    <Dialog open={isGenerateReportOpen && selectedCrimeForAction?.id === crime.id} onOpenChange={(open) => {
                      setIsGenerateReportOpen(open);
                      if (open) setSelectedCrimeForAction(crime);
                      else setSelectedCrimeForAction(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-700/50 text-purple-300 hover:bg-purple-900/30 hover:border-purple-600 text-xs transition-all"
                        >
                          <FileText className="w-3 h-3 mr-1.5" />
                          Generate Report
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <div className="bg-purple-600/20 p-1.5 rounded-lg">
                              <FileText className="w-4 h-4 text-purple-400" />
                            </div>
                            Generate Analysis Report
                          </DialogTitle>
                          <DialogDescription className="text-zinc-400">
                            Create a detailed analysis report for case #{crime.caseNumber}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Report Title</Label>
                            <Input
                              placeholder="Analysis Report Title"
                              className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-600 transition-colors"
                              defaultValue={`${crime.type} Analysis - ${crime.location}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Report Type</Label>
                            <Select defaultValue="detailed">
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectItem value="summary">Summary Report</SelectItem>
                                <SelectItem value="detailed">Detailed Analysis</SelectItem>
                                <SelectItem value="forensic">Forensic Report</SelectItem>
                                <SelectItem value="statistical">Statistical Analysis</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Additional Notes</Label>
                            <Textarea
                              placeholder="Add any additional observations or notes..."
                              className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-600 transition-colors"
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsGenerateReportOpen(false)} className="border-zinc-700 text-zinc-300">
                            Cancel
                          </Button>
                          <Button onClick={handleGenerateReport} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Generate Report
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isUploadReportOpen && selectedCrimeForAction?.id === crime.id} onOpenChange={(open) => {
                      setIsUploadReportOpen(open);
                      if (open) setSelectedCrimeForAction(crime);
                      else setSelectedCrimeForAction(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-700/50 text-blue-300 hover:bg-blue-900/30 hover:border-blue-600 text-xs transition-all"
                        >
                          <Upload className="w-3 h-3 mr-1.5" />
                          Upload Report
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <div className="bg-blue-600/20 p-1.5 rounded-lg">
                              <Upload className="w-4 h-4 text-blue-400" />
                            </div>
                            Upload Report
                          </DialogTitle>
                          <DialogDescription className="text-zinc-400">
                            Upload an existing report for case #{crime.caseNumber}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Report File</Label>
                            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-blue-600/50 transition-colors cursor-pointer bg-zinc-800/50">
                              <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                              <p className="text-sm text-zinc-400">Click to upload or drag and drop</p>
                              <p className="text-xs text-zinc-600 mt-1">PDF, DOC, DOCX (max. 10MB)</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Report Title</Label>
                            <Input
                              placeholder="Report title"
                              className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-600 transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              placeholder="Brief description of the report..."
                              className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-600 transition-colors"
                              rows={2}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsUploadReportOpen(false)} className="border-zinc-700 text-zinc-300">
                            Cancel
                          </Button>
                          <Button onClick={handleUploadReport} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Upload Report
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isSafetyScoreOpen && selectedCrimeForAction?.id === crime.id} onOpenChange={(open) => {
                      setIsSafetyScoreOpen(open);
                      if (open) setSelectedCrimeForAction(crime);
                      else setSelectedCrimeForAction(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-700/50 text-green-300 hover:bg-green-900/30 hover:border-green-600 text-xs transition-all"
                        >
                          <Shield className="w-3 h-3 mr-1.5" />
                          Safety Score
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <div className="bg-green-600/20 p-1.5 rounded-lg">
                              <Shield className="w-4 h-4 text-green-400" />
                            </div>
                            Generate Safety Score
                          </DialogTitle>
                          <DialogDescription className="text-zinc-400">
                            Calculate safety score for {crime.location}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Card className="bg-zinc-800 border-zinc-700 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-zinc-400">Current Location</span>
                              <Badge variant="outline" className="text-xs">{crime.location}</Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Total Incidents:</span>
                                <span className="text-white">
                                  {mockCrimes.filter(c => c.location === crime.location).length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">High Severity:</span>
                                <span className="text-red-500">
                                  {mockCrimes.filter(c => c.location === crime.location && c.severity === 'high').length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Time Range:</span>
                                <span className="text-white">Last 30 days</span>
                              </div>
                            </div>
                          </Card>
                          <div className="space-y-2">
                            <Label>Analysis Parameters</Label>
                            <Select defaultValue="standard">
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectItem value="basic">Basic Assessment</SelectItem>
                                <SelectItem value="standard">Standard Analysis</SelectItem>
                                <SelectItem value="comprehensive">Comprehensive Review</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-600/30 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Shield className="w-5 h-5 text-green-400" />
                              <span className="text-sm text-green-400">Estimated Safety Score</span>
                            </div>
                            <p className="text-3xl text-green-400">72/100</p>
                            <p className="text-xs text-zinc-500 mt-1">Based on current data</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsSafetyScoreOpen(false)} className="border-zinc-700 text-zinc-300">
                            Cancel
                          </Button>
                          <Button onClick={handleGenerateSafetyScore} className="bg-green-600 hover:bg-green-700 text-white">
                            Generate Score
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isMapVisualizationOpen && selectedCrimeForAction?.id === crime.id} onOpenChange={(open) => {
                      setIsMapVisualizationOpen(open);
                      if (open) setSelectedCrimeForAction(crime);
                      else setSelectedCrimeForAction(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-700/50 text-red-300 hover:bg-red-900/30 hover:border-red-600 text-xs transition-all"
                        >
                          <Map className="w-3 h-3 mr-1.5" />
                          Generate Map
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <div className="bg-red-600/20 p-1.5 rounded-lg">
                              <Map className="w-4 h-4 text-red-400" />
                            </div>
                            Generate Map Visualization
                          </DialogTitle>
                          <DialogDescription className="text-zinc-400">
                            Create a visual map analysis for {crime.location}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Map Type</Label>
                            <Select defaultValue="hotspot">
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectItem value="hotspot">Crime Hotspot Map</SelectItem>
                                <SelectItem value="density">Density Heatmap</SelectItem>
                                <SelectItem value="timeline">Timeline Visualization</SelectItem>
                                <SelectItem value="pattern">Pattern Analysis</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Area Coverage</Label>
                            <Select defaultValue="location">
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectItem value="location">Current Location Only</SelectItem>
                                <SelectItem value="surrounding">Include Surrounding Areas</SelectItem>
                                <SelectItem value="all">All Locations</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Time Period</Label>
                            <Select defaultValue="30days">
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectItem value="7days">Last 7 Days</SelectItem>
                                <SelectItem value="30days">Last 30 Days</SelectItem>
                                <SelectItem value="90days">Last 90 Days</SelectItem>
                                <SelectItem value="year">Last Year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                            <p className="text-sm text-zinc-400 mb-2">Export Options:</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 text-xs hover:bg-zinc-700">
                                <Download className="w-3 h-3 mr-1.5" />
                                PNG
                              </Button>
                              <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 text-xs hover:bg-zinc-700">
                                <Download className="w-3 h-3 mr-1.5" />
                                PDF
                              </Button>
                              <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 text-xs hover:bg-zinc-700">
                                <Download className="w-3 h-3 mr-1.5" />
                                SVG
                              </Button>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsMapVisualizationOpen(false)} className="border-zinc-700 text-zinc-300">
                            Cancel
                          </Button>
                          <Button onClick={handleGenerateMap} className="bg-red-600 hover:bg-red-700 text-white">
                            Generate Map
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}