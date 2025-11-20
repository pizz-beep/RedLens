import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Filter, FileText, BarChart3, Shield, Calendar, Clock, Eye, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { InteractiveMap } from './InteractiveMap';
import { Crime } from '../App';
import { toast } from 'sonner';

interface AnalystDashboardProps {
  onViewProfile: () => void;
  userName: string;
  userId: string;
  onViewCrimeDetail: (crime: Crime) => void;
}

const API_URL = 'http://localhost:4000/api';

function toSQLDate(dateStr: string | Date): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function AnalystDashboard({
  onViewProfile,
  userName,
  userId,
  onViewCrimeDetail
}: AnalystDashboardProps) {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [crimeTypes, setCrimeTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [selectedCrimeForAction, setSelectedCrimeForAction] = useState<Crime | null>(null);
  const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false);
  const [isSafetyScoreOpen, setIsSafetyScoreOpen] = useState(false);
  const [safetyScoreData, setSafetyScoreData] = useState<any>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    investigating: 0,
    highSeverity: 0
  });

  const fetchCrimes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterSeverity !== 'all') params.append('severity', filterSeverity);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`${API_URL}/crimes?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCrimes(data.map((crime: any) => ({
        id: String(crime.id),
        type: crime.type,
        location: crime.location,
        date: crime.date,
        time: crime.time,
        severity: crime.severity?.toLowerCase?.() ?? '',
        description: crime.description,
        latitude: crime.latitude,
        longitude: crime.longitude,
        reportedBy: crime.reportedBy,
        status: crime.status?.toLowerCase?.() ?? '',
        witnesses: 0,
        caseNumber: crime.caseNumber
      })));
    } catch (error) {
      console.error('Error fetching crimes:', error);
      toast.error('Failed to fetch crime data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/analytics/dashboard-summary`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStats({
        total: data.total || 0,
        active: data.active || 0,
        resolved: data.resolved || 0,
        investigating: data.investigating || 0,
        highSeverity: data.highSeverity || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCrimeTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/crimes-types`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCrimeTypes(data);
    } catch (error) {
      console.error('Error fetching crime types:', error);
    }
  };

  const fetchSafetyScore = async (areaName: string) => {
    try {
      const encodedAreaName = encodeURIComponent(areaName);
      const response = await fetch(`${API_URL}/analytics/safety-score/${encodedAreaName}?analystId=${userId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSafetyScoreData(data);
      return data;
    } catch (error) {
      console.error('Error fetching safety score:', error);
      toast.error('Failed to calculate safety score');
      return null;
    }
  };

  useEffect(() => { fetchCrimes(); fetchStats(); fetchCrimeTypes(); }, [filterType, filterSeverity, filterStatus]);

  let filteredCrimes = [...crimes];
  filteredCrimes = filteredCrimes.sort((a, b) => {
    switch (sortBy) {
      case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'severity-high':
        return (['high', 'medium', 'low'].indexOf(b.severity) - ['high', 'medium', 'low'].indexOf(a.severity));
      case 'severity-low':
        return (['high', 'medium', 'low'].indexOf(a.severity) - ['high', 'medium', 'low'].indexOf(b.severity));
      case 'type': return a.type.localeCompare(b.type);
      default: return 0;
    }
  });

  const handleGenerateReport = async () => {
    try {
      if (!selectedCrimeForAction) {
        toast.error('No crime selected');
        return;
      }
      const startDate = new Date(selectedCrimeForAction.date);
      startDate.setDate(startDate.getDate() - 30);
      const startDateSQL = toSQLDate(startDate);
      const endDateSQL = toSQLDate(selectedCrimeForAction.date);

      const response = await fetch(`${API_URL}/analytics/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle || `${selectedCrimeForAction.type} Analysis - ${selectedCrimeForAction.location}`,
          type: 'Crime Summary',
          startDate: startDateSQL,
          endDate: endDateSQL,
          filterArea: selectedCrimeForAction.location,
          filterSeverity: null,
          analystId: userId
        })
      });
      if (!response.ok) throw new Error('Failed to generate report');
      const data = await response.json();
      toast.success(`Report generated! Report ID: ${data.ReportID || data.reportId}`);
      setIsGenerateReportOpen(false);
      setSelectedCrimeForAction(null);
      setReportTitle('');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-600/10 text-red-500 border-red-500/30';
      case 'medium': return 'bg-orange-600/10 text-orange-500 border-orange-500/30';
      case 'low': return 'bg-yellow-600/10 text-yellow-500 border-yellow-500/30';
      default: return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
    }
  };
  const getStatusColor = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'resolved': return 'bg-green-600/10 text-green-500 border-green-500/30';
      case 'active': return 'bg-blue-600/10 text-blue-500 border-blue-500/30';
      case 'under investigation': return 'bg-orange-600/10 text-orange-500 border-orange-500/30';
      default: return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
    }
  };
  const displayStatusText = (status: string) => {
    const lower = (status || '').toLowerCase();
    if (lower === 'active') return 'Active';
    if (lower === 'resolved') return 'Resolved';
    if (lower === 'under investigation') return 'Under Investigation';
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* --- Header --- */}
      <div className="bg-gradient-to-r from-purple-900/20 via-zinc-900 to-zinc-900 border-b border-purple-600/20 px-6 py-4 flex items-center justify-between flex-shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2.5 rounded-xl shadow-lg shadow-purple-600/30">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Analyst Dashboard
            </h1>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Crime Analytics & Reporting
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 border-2 border-purple-500/50 shadow-lg">
            <AvatarFallback className="text-white text-sm font-black" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <Button size="sm" variant="ghost" onClick={onViewProfile}
            className="text-zinc-300 hover:text-white hover:bg-purple-900/30 text-sm font-bold uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {userName}
          </Button>
        </div>
      </div>
      {/* --- Stats --- */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 px-6 py-5 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/70 border-zinc-700/50 p-4 hover:border-zinc-600 transition-all shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Total</p>
              <TrendingUp className="w-4 h-4 text-zinc-500" />
            </div>
            <p className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stats.total}</p>
          </Card>
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 border-blue-700/40 p-4 hover:border-blue-600/60 transition-all shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-300 text-xs font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Active</p>
              <AlertTriangle className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-blue-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stats.active}</p>
          </Card>
          <Card className="bg-gradient-to-br from-green-900/30 to-green-950/30 border-green-700/40 p-4 hover:border-green-600/60 transition-all shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-300 text-xs font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Resolved</p>
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-black text-green-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stats.resolved}</p>
          </Card>
          <Card className="bg-gradient-to-br from-red-900/30 to-red-950/30 border-red-700/40 p-4 hover:border-red-600/60 transition-all shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-red-300 text-xs font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>High Risk</p>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-3xl font-black text-red-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stats.highSeverity}</p>
          </Card>
        </div>
      </div>
      {/* --- Map --- */}
      <div className="h-72 bg-zinc-950 border-b border-zinc-800 flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none z-10"></div>
        <InteractiveMap
          crimes={filteredCrimes}
          onSelectLocation={(location) => console.log('Selected:', location)}
          showLegend={true}
        />
      </div>
      {/* --- Filters --- */}
      <div className="bg-zinc-900/80 border-b border-zinc-800/50 px-6 py-4 flex-shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-purple-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-black uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Filters</span>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-sm h-10 w-40 hover:bg-zinc-800 hover:border-purple-500/40 transition-all rounded-xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <SelectValue placeholder="Crime Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white text-sm">
              <SelectItem value="all">All Types</SelectItem>
              {crimeTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-sm h-10 w-36 hover:bg-zinc-800 hover:border-purple-500/40 transition-all rounded-xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white text-sm">
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-sm h-10 w-40 hover:bg-zinc-800 hover:border-purple-500/40 transition-all rounded-xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white text-sm">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="under investigation">Investigating</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-zinc-800/90 border-zinc-700/60 text-white text-sm h-10 w-32 hover:bg-zinc-800 hover:border-purple-500/40 transition-all rounded-xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white text-sm">
              <SelectItem value="date-desc">Latest</SelectItem>
              <SelectItem value="date-asc">Oldest</SelectItem>
              <SelectItem value="severity-high">High First</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700/60 text-zinc-400 hover:text-white text-sm h-10 ml-auto rounded-xl hover:bg-zinc-800 hover:border-purple-500/40 transition-all font-black uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            onClick={() => {
              setFilterType('all'); setFilterSeverity('all'); setFilterStatus('all'); setSortBy('date-desc');
            }}>
            Reset All
          </Button>
        </div>
      </div>
      {/* --- Crime List --- */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-zinc-950 to-black">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Crime Reports</h2>
                <p className="text-sm text-zinc-500 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Showing {filteredCrimes.length} reports
                </p>
              </div>
              <Badge variant="outline"
                className="text-sm bg-purple-600/10 text-purple-400 border-purple-500/30 px-4 py-1.5 font-black uppercase"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {filteredCrimes.length} total
              </Badge>
            </div>
            {loading ?
              (<div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-zinc-400 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Loading crime data...</p>
              </div>) :
              filteredCrimes.length === 0 ?
                (<div className="text-center py-20">
                  <AlertTriangle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400 text-lg font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    No crimes found
                  </p>
                </div>) :
                filteredCrimes.map((crime) => (
                  <Card key={crime.id} className="bg-gradient-to-br from-zinc-900/70 to-zinc-900/50 border-zinc-800 hover:border-purple-600/50 p-5 transition-all hover:shadow-lg hover:shadow-purple-600/10 group backdrop-blur-sm rounded-2xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2.5 rounded-xl ${getSeverityColor(crime.severity)} group-hover:scale-110 transition-transform`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-black text-base text-white uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{crime.type}</p>
                            <Badge variant="outline" className={`text-xs font-black ${getSeverityColor(crime.severity)}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                              {crime.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-400 leading-relaxed font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs font-black ${getStatusColor(crime.status)}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {displayStatusText(crime.status)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-3 my-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-2 bg-zinc-800/40 px-3 py-2 rounded-lg">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className="truncate font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.location}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-800/40 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.date}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-800/40 px-3 py-2 rounded-lg">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.time}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-800/40 px-3 py-2 rounded-lg">
                        <span className="text-purple-400 font-mono font-black" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>#{crime.caseNumber}</span>
                      </div>
                    </div>
                    <Separator className="bg-zinc-700/50 my-4" />
                    <div className="grid grid-cols-3 gap-3">
                      <Button size="sm" variant="outline"
                        onClick={() => onViewCrimeDetail(crime)}
                        className="border-zinc-700 text-zinc-300 hover:bg-purple-900/30 hover:text-white hover:border-purple-500/50 text-sm h-10 rounded-xl transition-all font-black uppercase"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        <Eye className="w-4 h-4 mr-2" />View Details
                      </Button>
                      {/* Generate Report Dialog */}
                      <Dialog open={isGenerateReportOpen && selectedCrimeForAction?.id === crime.id}
                        onOpenChange={open => {
                          setIsGenerateReportOpen(open);
                          if (open) setSelectedCrimeForAction(crime); else setSelectedCrimeForAction(null);
                        }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline"
                            className="border-purple-700/50 text-purple-400 hover:bg-purple-900/30 hover:border-purple-500 text-sm h-10 rounded-xl transition-all font-black uppercase"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            <FileText className="w-4 h-4 mr-2" />Report
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                              Generate Analytics Report
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <Input placeholder="Enter report title..."
                              className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-12 font-semibold"
                              style={{ fontFamily: "'Montserrat', sans-serif" }}
                              value={reportTitle}
                              onChange={(e) => setReportTitle(e.target.value)} />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsGenerateReportOpen(false)} className="rounded-xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Cancel</Button>
                            <Button onClick={handleGenerateReport}
                              className="bg-purple-600 hover:bg-purple-700 rounded-xl font-bold"
                              style={{ fontFamily: "'Montserrat', sans-serif" }}>Generate Report</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      {/* Safety Score Dialog */}
                      <Dialog open={isSafetyScoreOpen && selectedCrimeForAction?.id === crime.id}
                        onOpenChange={open => {
                          setIsSafetyScoreOpen(open);
                          if (open) { setSelectedCrimeForAction(crime); fetchSafetyScore(crime.location); }
                          else { setSelectedCrimeForAction(null); setSafetyScoreData(null); }
                        }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline"
                            className="border-green-700/50 text-green-400 hover:bg-green-900/30 hover:border-green-500 text-sm h-10 rounded-xl transition-all font-black uppercase"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            <Shield className="w-4 h-4 mr-2" />Safety
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                              Safety Score - {crime.location}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-6">
                            <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-600/30 rounded-2xl p-6">
                              <p className="text-5xl text-green-400 font-black" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                {safetyScoreData?.safetyScore !== undefined ? `${safetyScoreData.safetyScore}/100` : 'Loading...'}
                              </p>
                              <p className="text-sm text-zinc-500 mt-2 font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                {safetyScoreData?.riskLevel || '-'} Risk Level
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => setIsSafetyScoreOpen(false)}
                              className="bg-green-600 hover:bg-green-700 rounded-xl font-bold"
                              style={{ fontFamily: "'Montserrat', sans-serif" }}>Close</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
