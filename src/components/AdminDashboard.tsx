import React, { useState, useEffect } from 'react';
import { MapPin, User, AlertTriangle, Filter, Users, CheckCircle, XCircle, Clock, BarChart3, ArrowUpDown, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Crime } from '../App';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onViewProfile: () => void;
  userName: string;
  onViewCrimeDetail: (crime: Crime) => void;
  onManageUsers: () => void;
  onViewAnalytics: () => void;
}

export function AdminDashboard({ onViewProfile, userName, onViewCrimeDetail, onManageUsers, onViewAnalytics }: AdminDashboardProps) {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'verified' | 'pending' | 'discarded'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCrimes = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("http://localhost:4000/api/citizen-reports");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      console.log("📊 Fetched crimes from backend:", data.length);
      
      // Normalize status to lowercase for consistency
      const normalized = data.map((c: any) => ({ 
        ...c, 
        status: (c.status || '').toLowerCase(), 
        severity: (c.severity || '').toLowerCase() 
      }));
      
      setCrimes(normalized);
      console.log("✅ Updated crimes state:", normalized.length);
    } catch (error) {
      console.error("❌ Error fetching crimes:", error);
      toast.error("Failed to load crimes");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCrimes();
  }, []);

  const handleVerifyCrime = async (crimeId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    try {
      console.log("✅ Verifying crime:", crimeId);
      const response = await fetch(`http://localhost:4000/api/crimes/${crimeId}/verify`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify crime');
      }
      
      const result = await response.json();
      console.log("✅ Verification result:", result);
      
      toast.success('Crime verified successfully');
      
      // Force immediate refresh
      await fetchCrimes();
    } catch (error) {
      console.error('❌ Error verifying crime:', error);
      toast.error(error instanceof Error ? error.message : 'Error verifying crime');
    }
  };

  const handleDiscardCrime = async (crimeId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    try {
      console.log("🗑️ Discarding crime:", crimeId);
      const response = await fetch(`http://localhost:4000/api/crimes/${crimeId}/discard`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to discard crime');
      }
      
      const result = await response.json();
      console.log("✅ Discard result:", result);
      
      toast.success('Crime discarded');
      
      // Force immediate refresh
      await fetchCrimes();
    } catch (error) {
      console.error('❌ Error discarding crime:', error);
      toast.error(error instanceof Error ? error.message : 'Error discarding crime');
    }
  };

  // Filters with normalized status checks
  let filteredCrimes = selectedStatus === 'all'
    ? crimes
    : crimes.filter(crime => crime.status === selectedStatus);

  if (filterType !== 'all') filteredCrimes = filteredCrimes.filter(crime => crime.type === filterType);
  if (filterSeverity !== 'all') filteredCrimes = filteredCrimes.filter(crime => crime.severity === filterSeverity);

  filteredCrimes = [...filteredCrimes].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'severity-high': return ({ high: 3, medium: 2, low: 1 })[b.severity] - ({ high: 3, medium: 2, low: 1 })[a.severity];
      case 'severity-low': return ({ high: 3, medium: 2, low: 1 })[a.severity] - ({ high: 3, medium: 2, low: 1 })[b.severity];
      case 'type': return a.type.localeCompare(b.type);
      default: return 0;
    }
  });

  const crimeTypes = Array.from(new Set(crimes.map(c => c.type)));

  const stats = {
    total: crimes.length,
    verified: crimes.filter(c => c.status === 'verified').length,
    pending: crimes.filter(c => c.status === 'pending').length,
    discarded: crimes.filter(c => c.status === 'discarded').length
  };

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
      case 'verified': return 'bg-green-600/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-blue-600/10 text-blue-500 border-blue-500/20';
      case 'discarded': return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
      default: return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
    }
  };
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'discarded': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };
  const getInitials = (name: string) => (name.split(' ').map(n => n[0]).join('').toUpperCase());

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
              <h1 className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <span className="text-red-500">Red</span>
                <span className="text-white">Lens</span>
              </h1>
              <p className="text-xs text-zinc-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Admin Dashboard {isRefreshing && '(Refreshing...)'}
              </p>
            </div>
          </div>
          <button
            onClick={onViewProfile}
            className="hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-10 h-10 border-2 border-red-600">
              <AvatarFallback className="bg-red-600 text-white font-black" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={onManageUsers} className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button onClick={onViewAnalytics} className="bg-purple-600 hover:bg-purple-700 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>
      {/* Stats */}
      <div className="bg-zinc-900/50 px-4 py-4 border-b border-zinc-800">
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-zinc-900 border-zinc-800 p-3 text-center">
            <p className="text-2xl font-black" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stats.total}</p>
            <p className="text-xs text-zinc-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>Total</p>
          </Card>
          <Card className="bg-green-600/10 border-green-600/20 p-3 text-center">
            <p className="text-2xl font-black text-green-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stats.verified}</p>
            <p className="text-xs text-zinc-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>Verified</p>
          </Card>
          <Card className="bg-blue-600/10 border-blue-600/20 p-3 text-center">
            <p className="text-2xl font-black text-blue-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stats.pending}</p>
            <p className="text-xs text-zinc-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>Pending</p>
          </Card>
          <Card className="bg-zinc-600/10 border-zinc-600/20 p-3 text-center">
            <p className="text-2xl font-black text-zinc-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stats.discarded}</p>
            <p className="text-xs text-zinc-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>Discarded</p>
          </Card>
        </div>
      </div>
      {/* Filter Tabs */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)} className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-transparent p-0 h-auto rounded-none border-b border-zinc-800">
            <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent data-[state=active]:text-red-500 py-3 font-black uppercase tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              All
            </TabsTrigger>
            <TabsTrigger value="verified" className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-500 py-3 font-black uppercase tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Verified
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 py-3 font-black uppercase tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Pending
            </TabsTrigger>
            <TabsTrigger value="discarded" className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-600 data-[state=active]:bg-transparent data-[state=active]:text-zinc-500 py-3 font-black uppercase tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Discarded
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Filters and Sorting */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all" style={{ fontFamily: "'Montserrat', sans-serif" }}>All Types</SelectItem>
              {crimeTypes.map(type => (
                <SelectItem key={type} value={type} style={{ fontFamily: "'Montserrat', sans-serif" }}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all" style={{ fontFamily: "'Montserrat', sans-serif" }}>All Levels</SelectItem>
              <SelectItem value="high" style={{ fontFamily: "'Montserrat', sans-serif" }}>High</SelectItem>
              <SelectItem value="medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>Medium</SelectItem>
              <SelectItem value="low" style={{ fontFamily: "'Montserrat', sans-serif" }}>Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="date-desc" style={{ fontFamily: "'Montserrat', sans-serif" }}>Latest First</SelectItem>
              <SelectItem value="date-asc" style={{ fontFamily: "'Montserrat', sans-serif" }}>Oldest First</SelectItem>
              <SelectItem value="severity-high" style={{ fontFamily: "'Montserrat', sans-serif" }}>High Severity</SelectItem>
              <SelectItem value="severity-low" style={{ fontFamily: "'Montserrat', sans-serif" }}>Low Severity</SelectItem>
              <SelectItem value="type" style={{ fontFamily: "'Montserrat', sans-serif" }}>By Type</SelectItem>
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
              <p className="text-zinc-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {isRefreshing ? 'Loading...' : 'No reports in this category'}
              </p>
            </div>
          ) : (
            filteredCrimes.map((crime) => (
              <Card key={crime.id}
                onClick={() => onViewCrimeDetail(crime)}
                className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all cursor-pointer"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-red-600/20 p-2 rounded-lg flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-white font-black uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{crime.type}</h3>
                        <Badge variant="outline" className={getSeverityColor(crime.severity)} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          {crime.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        <MapPin className="w-3 h-3" />
                        <span>{crime.location}</span>
                        <span className="mx-1">•</span>
                        <span>Case #{crime.caseNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        <User className="w-3 h-3" />
                        <span>Reported by: {crime.reportedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-zinc-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(crime.date).toLocaleDateString()} at {crime.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(crime.status)} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      <span className="mr-1">{getStatusIcon(crime.status)}</span>
                      {crime.status}
                    </Badge>
                    {/* Show buttons only if pending */}
                    {crime.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm"
                          onClick={(e) => handleVerifyCrime(crime.id, e)}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold h-8"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          Verify
                        </Button>
                        <Button size="sm"
                          onClick={(e) => handleDiscardCrime(crime.id, e)}
                          className="bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl font-bold h-8"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
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