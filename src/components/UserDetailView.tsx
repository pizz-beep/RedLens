import { useState } from 'react';
import { ChevronLeft, User, Mail, Calendar, Clock, AlertTriangle, BarChart, MapPin, Ban, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Crime } from '../App';
import { toast } from 'sonner@2.0.3';

interface UserDetailViewProps {
  userId: string;
  onBack: () => void;
  onViewCrimeDetail: (crime: Crime) => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'public' | 'analyst';
  reportsCount: number;
  joinedDate: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
}

// Mock data - in real app would fetch based on userId
const mockUsers: Record<string, UserData> = {
  'U001': {
    id: 'U001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    role: 'public',
    reportsCount: 5,
    joinedDate: 'January 15, 2024',
    lastActive: '2 hours ago',
    status: 'active'
  },
  'A001': {
    id: 'A001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@redlens.com',
    role: 'analyst',
    reportsCount: 24,
    joinedDate: 'August 10, 2023',
    lastActive: '30 minutes ago',
    status: 'active'
  }
};

const mockUserReports: Record<string, Crime[]> = {
  'U001': [
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
      caseNumber: 'DT-2024-1028'
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
      reportedBy: 'John Smith',
      reportedById: 'U001',
      status: 'verified',
      caseNumber: 'RD-2024-1025'
    }
  ],
  'A001': [
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
      caseNumber: 'DT-2024-1027'
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
      reportedBy: 'Sarah Johnson (Analyst)',
      reportedById: 'A001',
      status: 'verified',
      caseNumber: 'DT-2024-1024'
    }
  ]
};

export function UserDetailView({ userId, onBack, onViewCrimeDetail }: UserDetailViewProps) {
  const user = mockUsers[userId] || mockUsers['U001'];
  const userReports = mockUserReports[userId] || [];
  const [userStatus, setUserStatus] = useState(user.status);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    return role === 'analyst' 
      ? 'bg-purple-600/10 text-purple-500 border-purple-500/20'
      : 'bg-blue-600/10 text-blue-500 border-blue-500/20';
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

  const reportStats = {
    verified: userReports.filter(r => r.status === 'verified').length,
    pending: userReports.filter(r => r.status === 'pending').length,
    discarded: userReports.filter(r => r.status === 'discarded').length
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
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white">User Profile</h1>
              <p className="text-xs text-zinc-500">{user.role} account</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 pb-6">
          {/* User Info Card */}
          <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-zinc-800 p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 border-4 border-zinc-700 mb-4">
                <AvatarFallback className={user.role === 'analyst' ? 'bg-purple-600 text-white text-2xl' : 'bg-blue-600 text-white text-2xl'}>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl text-white mb-2">{user.name}</h2>
              <p className="text-zinc-400 mb-3">{user.email}</p>
              <div className="flex gap-2">
                <Badge variant="outline" className={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
                <Badge variant="outline" className={
                  user.status === 'active' 
                    ? 'bg-green-600/10 text-green-500 border-green-500/20' 
                    : user.status === 'suspended'
                    ? 'bg-red-600/10 text-red-500 border-red-500/20'
                    : 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20'
                }>
                  {user.status}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Account Details */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-white mb-4">Account Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </div>
                <span className="text-white text-sm">{user.email}</span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Joined</span>
                </div>
                <span className="text-white text-sm">{user.joinedDate}</span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Last Active</span>
                </div>
                <span className="text-white text-sm">{user.lastActive}</span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-zinc-400">
                  <BarChart className="w-4 h-4" />
                  <span className="text-sm">Total Reports</span>
                </div>
                <span className="text-white text-sm">{user.reportsCount}</span>
              </div>
            </div>
          </Card>

          {/* Report Statistics */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-white mb-4">Report Statistics</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-3 text-center">
                <p className="text-xl text-green-500 mb-1">{reportStats.verified}</p>
                <p className="text-xs text-zinc-500">Verified</p>
              </div>
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3 text-center">
                <p className="text-xl text-blue-500 mb-1">{reportStats.pending}</p>
                <p className="text-xs text-zinc-500">Pending</p>
              </div>
              <div className="bg-zinc-600/10 border border-zinc-600/20 rounded-lg p-3 text-center">
                <p className="text-xl text-zinc-500 mb-1">{reportStats.discarded}</p>
                <p className="text-xs text-zinc-500">Discarded</p>
              </div>
            </div>
          </Card>

          {/* Admin Actions */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-white mb-4">Admin Actions</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Current Status: <Badge variant="outline" className={
                userStatus === 'active' 
                  ? 'bg-green-600/10 text-green-500 border-green-500/20' 
                  : userStatus === 'suspended'
                  ? 'bg-red-600/10 text-red-500 border-red-500/20'
                  : 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20'
              }>{userStatus}</Badge>
            </p>
            
            {userStatus === 'active' ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-red-600 text-red-500 hover:bg-red-600/10"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Suspend User Account?</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                      This will temporarily suspend {user.name}'s account. They will not be able to submit reports or access the system until reactivated.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSuspendUser}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Suspend Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                onClick={handleActivateUser}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate User
              </Button>
            )}
          </Card>

          {/* Reports List */}
          <div>
            <h3 className="text-white mb-3 px-1">
              {user.role === 'analyst' ? 'Generated Reports' : 'Submitted Reports'} ({userReports.length})
            </h3>
            <div className="space-y-3">
              {userReports.map((report) => (
                <Card
                  key={report.id}
                  onClick={() => onViewCrimeDetail(report)}
                  className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-red-600/20 p-2 rounded-lg flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-white">{report.type}</h4>
                        <Badge variant="outline" className={getSeverityColor(report.severity)}>
                          {report.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{report.location}</span>
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-2">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  function handleSuspendUser() {
    setUserStatus('suspended');
    toast.success(`${user.name}'s account has been suspended`);
    console.log(`User ${userId} suspended`);
  }

  function handleActivateUser() {
    setUserStatus('active');
    toast.success(`${user.name}'s account has been activated`);
    console.log(`User ${userId} activated`);
  }
}
