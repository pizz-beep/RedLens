import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Mail, Calendar, Clock, AlertTriangle, BarChart, MapPin, Ban, CheckCircle, Shield, Activity } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Crime } from '../App';
import { toast } from 'sonner';

interface UserDetailViewProps {
  user: any;
  onBack: () => void;
  onViewCrimeDetail: (crime: Crime) => void;
}

export function UserDetailView({ user, onBack, onViewCrimeDetail }: UserDetailViewProps) {
  const [userReports, setUserReports] = useState<Crime[]>([]);
  const [userStatus, setUserStatus] = useState(user.status || 'active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/users/${user.id}/reports`);
        if (!response.ok) throw new Error("Failed to fetch reports");
        const data = await response.json();
        setUserReports(data);
      } catch (error) {
        console.error("Error fetching user reports:", error);
        toast.error("Failed to load user reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    return role === 'analyst' 
      ? 'bg-purple-600/10 text-purple-400 border-purple-600/30'
      : 'bg-blue-600/10 text-blue-400 border-blue-600/30';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-600/10 text-green-400 border-green-600/30';
      case 'pending':
        return 'bg-yellow-600/10 text-yellow-400 border-yellow-600/30';
      case 'discarded':
        return 'bg-zinc-600/10 text-zinc-400 border-zinc-600/30';
      default:
        return 'bg-zinc-600/10 text-zinc-400 border-zinc-600/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-600/10 text-red-400 border-red-600/30';
      case 'medium':
        return 'bg-orange-600/10 text-orange-400 border-orange-600/30';
      case 'low':
        return 'bg-yellow-600/10 text-yellow-400 border-yellow-600/30';
      default:
        return 'bg-zinc-600/10 text-zinc-400 border-zinc-600/30';
    }
  };

  const reportStats = {
    verified: userReports.filter(r => r.status === 'verified').length,
    pending: userReports.filter(r => r.status === 'pending').length,
    discarded: userReports.filter(r => r.status === 'discarded').length
  };

  const handleSuspendUser = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${user.id}/suspend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' })
      });

      if (!response.ok) throw new Error("Failed to suspend user");
      setUserStatus('suspended');
      toast.success(`User account suspended`);
    } catch (error) {
      console.error("Error suspending user:", error);
      toast.error("Failed to suspend user");
    }
  };

  const handleActivateUser = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${user.id}/activate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });

      if (!response.ok) throw new Error("Failed to activate user");
      setUserStatus('active');
      toast.success(`User account activated`);
    } catch (error) {
      console.error("Error activating user:", error);
      toast.error("Failed to activate user");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="hover:bg-zinc-800 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-red-600/20 p-2.5 rounded-lg border border-red-600/30">
              <User className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-base">User Management</h1>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">{user.role} Account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          
          {/* User Profile Card - Clean Corporate Style */}
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20 border-2 border-zinc-700">
                  <AvatarFallback className="bg-zinc-800 text-white text-lg font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">{user.name}</h2>
                      <p className="text-sm text-zinc-400">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        <span className="uppercase text-xs font-medium tracking-wide">{user.role}</span>
                      </Badge>
                      <Badge variant="outline" className={
                        userStatus === 'active' 
                          ? 'bg-green-600/10 text-green-400 border-green-600/30' 
                          : 'bg-red-600/10 text-red-400 border-red-600/30'
                      }>
                        <Activity className="w-3 h-3 mr-1" />
                        <span className="uppercase text-xs font-medium tracking-wide">{userStatus}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Account Info & Stats */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Account Details - Table Style */}
              <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-red-400" />
                    Account Information
                  </h3>
                  <div className="space-y-0">
                    <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm text-zinc-400">Email Address</span>
                      </div>
                      <span className="text-sm text-white font-mono">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm text-zinc-400">Account Created</span>
                      </div>
                      <span className="text-sm text-white">{user.createdAt || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm text-zinc-400">Last Activity</span>
                      </div>
                      <span className="text-sm text-white">{user.lastActive || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm text-zinc-400">Total Reports</span>
                      </div>
                      <span className="text-sm text-white font-semibold">{user.reportsCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Report Statistics - Clean Grid */}
              <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Report Analytics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-green-600/20 bg-green-600/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">{reportStats.verified}</span>
                      </div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wide">Verified</p>
                    </div>
                    <div className="border border-yellow-600/20 bg-yellow-600/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-2xl font-bold text-yellow-400">{reportStats.pending}</span>
                      </div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wide">Pending</p>
                    </div>
                    <div className="border border-zinc-600/20 bg-zinc-600/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Ban className="w-4 h-4 text-zinc-400" />
                        <span className="text-2xl font-bold text-zinc-400">{reportStats.discarded}</span>
                      </div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wide">Discarded</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Reports List - Professional Cards */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4 px-1">
                  {user.role === 'analyst' ? 'Generated Reports' : 'Submitted Reports'} 
                  <span className="text-zinc-500 ml-2">({userReports.length})</span>
                </h3>
                {loading ? (
                  <Card className="bg-zinc-900/50 border-zinc-800 p-12">
                    <p className="text-zinc-500 text-center text-sm">Loading reports...</p>
                  </Card>
                ) : userReports.length === 0 ? (
                  <Card className="bg-zinc-900/50 border-zinc-800 p-12">
                    <p className="text-zinc-500 text-center text-sm">No reports submitted</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {userReports.map((report) => (
                      <Card
                        key={report.id}
                        onClick={() => onViewCrimeDetail(report)}
                        className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all cursor-pointer"
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-red-600/10 p-2.5 rounded-lg border border-red-600/20 flex-shrink-0">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h4 className="text-white font-medium text-sm">{report.type}</h4>
                                <Badge variant="outline" className={getSeverityColor(report.severity)}>
                                  <span className="uppercase text-xs tracking-wide">{report.severity}</span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{report.location}</span>
                              </div>
                              <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{report.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{new Date(report.date).toLocaleDateString()}</span>
                                </div>
                                <Badge variant="outline" className={getStatusColor(report.status)}>
                                  <span className="uppercase text-xs tracking-wide">{report.status}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Admin Actions */}
            <div className="space-y-6">
              <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800 sticky top-24">
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-400" />
                    Administrative Controls
                  </h3>
                  
                  <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wide">Current Status</p>
                    <Badge variant="outline" className={
                      userStatus === 'active' 
                        ? 'bg-green-600/10 text-green-400 border-green-600/30' 
                        : 'bg-red-600/10 text-red-400 border-red-600/30'
                    }>
                      <Activity className="w-3 h-3 mr-1.5" />
                      <span className="uppercase text-xs font-medium tracking-wide">{userStatus}</span>
                    </Badge>
                  </div>
                  
                  {userStatus === 'active' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full border-red-600/50 text-red-400 hover:bg-red-600/10 hover:border-red-600"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend Account
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
                      Activate Account
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
