import { useState } from 'react';
import { ChevronLeft, MapPin, AlertTriangle, Clock, Calendar, User, Eye, FileText, Shield, CheckCircle, XCircle, Navigation } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Crime } from '../App';
import { toast } from 'sonner';

interface CrimeDetailViewProps {
  crime: Crime;
  onBack: () => void;
  userRole?: 'public' | 'admin' | 'analyst';
}

const getSeverityColor = (severity: string) => {
  const lowerSeverity = severity?.toLowerCase();
  switch (lowerSeverity) {
    case 'high': return 'bg-red-600/10 text-red-500 border-red-500/20';
    case 'medium': return 'bg-orange-600/10 text-orange-500 border-orange-500/20';
    case 'low': return 'bg-yellow-600/10 text-yellow-500 border-yellow-500/20';
    default: return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
  }
};

const getStatusColor = (status?: string) => {
  const lowerStatus = status?.toLowerCase();
  switch (lowerStatus) {
    case 'active': return 'bg-red-600/10 text-red-500 border-red-500/20';
    case 'under investigation': return 'bg-blue-600/10 text-blue-500 border-blue-500/20';
    case 'resolved':
    case 'closed':
    case 'verified': return 'bg-green-600/10 text-green-500 border-green-500/20';
    case 'pending': return 'bg-yellow-600/10 text-yellow-500 border-yellow-500/20';
    default: return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
  }
};

export function CrimeDetailView({ crime, onBack, userRole }: CrimeDetailViewProps) {
  const [currentStatus, setCurrentStatus] = useState<'verified' | 'pending' | 'discarded'>(
    crime.status === 'verified' ? 'verified' : 
    crime.status === 'discarded' ? 'discarded' : 'pending'
  );

  if (!crime) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-zinc-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>No crime data available</p>
          <Button onClick={onBack} className="mt-4 bg-red-600 hover:bg-red-700" style={{ fontFamily: "'Montserrat', sans-serif" }}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: 'verified' | 'pending' | 'discarded') => {
    setCurrentStatus(newStatus);
    toast.success(`Report ${newStatus === 'verified' ? 'verified' : 'discarded'} successfully`);
  };

  const lat = parseFloat(String(crime.latitude)) || 0;
  const lng = parseFloat(String(crime.longitude)) || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header - BIGGER */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="hover:bg-zinc-800 p-2 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Crime Report Details</h1>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Case #{crime.caseNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3 pb-6">
          {/* Crime Type Header - BIGGER */}
          <Card className="bg-zinc-900 border-zinc-800 p-4 relative overflow-hidden">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-red-600/20 p-2 rounded-lg flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-white text-2xl mb-2 font-black tracking-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{crime.type}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={`${getSeverityColor(crime.severity)} font-black text-xs uppercase`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {crime.severity}
                  </Badge>
                  <Badge variant="outline" className={`${getStatusColor(crime.status)} font-black text-xs uppercase`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {crime.status}
                  </Badge>
                </div>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.description}</p>
              </div>
            </div>
          </Card>

          {/* Key Information - BIGGER HEADER */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-white mb-3 flex items-center gap-2 font-black text-lg uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <Shield className="w-5 h-5 text-red-500" />
              Key Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Location</span>
                </div>
                <span className="text-white font-semibold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.location}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Date</span>
                </div>
                <span className="text-white font-semibold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>{new Date(crime.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Time</span>
                </div>
                <span className="text-white font-semibold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.time}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Reported By</span>
                </div>
                <span className="text-white font-semibold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.reportedBy || 'PUB006'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Witnesses</span>
                </div>
                <span className="text-white font-semibold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>{crime.witnesses || 0}</span>
              </div>
            </div>
          </Card>

          {/* Case Details - BIGGER HEADER */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-white mb-3 font-black text-lg uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Case Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-400 mb-1 font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Case Number</p>
                <p className="text-white font-black text-2xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>#{crime.caseNumber}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1 font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Status</p>
                <Badge variant="outline" className={`${getStatusColor(crime.status)} font-black text-xs uppercase`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {crime.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1 font-bold uppercase tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Severity Level</p>
                <Badge variant="outline" className={`${getSeverityColor(crime.severity)} font-black text-xs uppercase`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {crime.severity}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Location - BIGGER HEADER & CENTERED */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-white mb-3 font-black text-lg uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Location</h3>
            <div className="bg-zinc-800/50 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-red-600/20 p-3 rounded-full mx-auto mb-2 border border-red-500/30 inline-flex">
                  <Navigation className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-white font-black text-lg uppercase mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{crime.location}</p>
                <p className="text-xs text-zinc-500 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{lat.toFixed(4)}, {lng.toFixed(4)}</p>
              </div>
            </div>
          </Card>

          {/* Admin Actions */}
          {userRole === 'admin' && (
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <h3 className="text-white mb-3 flex items-center gap-2 font-black text-base uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <Shield className="w-4 h-4 text-red-500" />
                Admin Actions
              </h3>
              <p className="text-sm text-zinc-400 mb-3 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Current Status: <Badge variant="outline" className={`${getStatusColor(currentStatus)} font-black uppercase`} style={{ fontFamily: "'Montserrat', sans-serif" }}>{currentStatus}</Badge>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleStatusChange('verified')}
                  disabled={currentStatus === 'verified'}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 font-black text-xs uppercase"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verify
                </Button>
                <Button
                  onClick={() => handleStatusChange('discarded')}
                  disabled={currentStatus === 'discarded'}
                  variant="outline"
                  className="border-red-600/50 text-red-400 hover:bg-red-900/20 disabled:opacity-50 font-black text-xs uppercase"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Discard
                </Button>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
