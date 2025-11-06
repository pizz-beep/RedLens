import { useState } from 'react';
import { ChevronLeft, MapPin, AlertTriangle, Clock, Calendar, User, Eye, FileText, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Crime } from '../App';
import { toast } from 'sonner@2.0.3';

interface CrimeDetailViewProps {
  crime: Crime;
  onBack: () => void;
  userRole?: 'public' | 'admin' | 'analyst';
}

export function CrimeDetailView({ crime, onBack, userRole }: CrimeDetailViewProps) {
  const [currentStatus, setCurrentStatus] = useState(crime.status);
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="hover:bg-zinc-800 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white">Crime Report</h1>
              <p className="text-xs text-zinc-500">Case #{crime.caseNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 pb-6">
          {/* Crime Type Header */}
          <Card className="bg-gradient-to-br from-red-950 via-zinc-900 to-zinc-950 border-zinc-800 p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600/30 p-3 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-white mb-1">{crime.type}</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getSeverityColor(crime.severity)}>
                        {crime.severity} severity
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(crime.status)}>
                        {crime.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-zinc-300">{crime.description}</p>
            </div>
          </Card>

          {/* Key Information */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              Key Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-zinc-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Location</span>
                </div>
                <span className="text-white">{crime.location}</span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Date</span>
                </div>
                <span className="text-white">{new Date(crime.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Time</span>
                </div>
                <span className="text-white">{crime.time}</span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-zinc-400">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Reported By</span>
                </div>
                <span className="text-white">{crime.reportedBy || 'Unknown'}</span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Witnesses</span>
                </div>
                <span className="text-white">{crime.witnesses || 0}</span>
              </div>
            </div>
          </Card>

          {/* Case Details */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-white mb-4">Case Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Case Number</p>
                <p className="text-white">{crime.caseNumber}</p>
              </div>
              <Separator className="bg-zinc-800" />
              <div>
                <p className="text-sm text-zinc-400 mb-1">Status</p>
                <Badge variant="outline" className={getStatusColor(crime.status)}>
                  {crime.status}
                </Badge>
              </div>
              <Separator className="bg-zinc-800" />
              <div>
                <p className="text-sm text-zinc-400 mb-1">Severity Level</p>
                <Badge variant="outline" className={getSeverityColor(crime.severity)}>
                  {crime.severity.charAt(0).toUpperCase() + crime.severity.slice(1)}
                </Badge>
              </div>
              {crime.officerAssigned && (
                <>
                  <Separator className="bg-zinc-800" />
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Assigned Officer</p>
                    <p className="text-white">{crime.officerAssigned}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Location Map Placeholder */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-white mb-4">Location</h3>
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl h-48 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-500 rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 text-center">
                <MapPin className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-zinc-400">{crime.location}</p>
                <p className="text-sm text-zinc-600 mt-1">
                  {crime.latitude.toFixed(4)}, {crime.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </Card>

          {/* Evidence (if available) */}
          {crime.evidence && crime.evidence.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <h3 className="text-white mb-4">Evidence</h3>
              <div className="space-y-2">
                {crime.evidence.map((item, index) => (
                  <div key={index} className="bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-300">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Additional Notes */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-white mb-3">Additional Information</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This incident has been reported to local authorities and is being tracked in the RedLens system. 
              If you have any information related to this case, please contact local law enforcement.
            </p>
          </Card>

          {/* Admin Actions */}
          {userRole === 'admin' && (
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <h3 className="text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                Admin Actions
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Current Status: <Badge variant="outline" className={getStatusColor(currentStatus)}>{currentStatus}</Badge>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleStatusChange('verified')}
                  disabled={currentStatus === 'verified'}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify
                </Button>
                <Button
                  onClick={() => handleStatusChange('discarded')}
                  disabled={currentStatus === 'discarded'}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Discard
                </Button>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  function handleStatusChange(newStatus: 'verified' | 'pending' | 'discarded') {
    setCurrentStatus(newStatus);
    toast.success(`Report ${newStatus === 'verified' ? 'verified' : 'discarded'} successfully`);
    console.log(`Status changed to: ${newStatus} for crime ${crime.id}`);
  }
}
