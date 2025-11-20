import { useState, useEffect } from 'react';
import { ChevronLeft, Users, User, BarChart, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';

interface ManageUsersViewProps {
  onBack: () => void;
  onViewUserDetail: (user: any) => void;
  users?: any[];
}

export function ManageUsersView({ onBack, onViewUserDetail, users: propUsers }: ManageUsersViewProps) {
  const [selectedRole, setSelectedRole] = useState<'all' | 'public' | 'analyst'>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        console.log("🔄 ManageUsersView: Loading users...");
        console.log("📦 Props users:", propUsers);
        
        // If users were passed as props, use them
        if (propUsers && Array.isArray(propUsers) && propUsers.length > 0) {
          console.log("✅ Using users from props:", propUsers.length);
          setUsers(propUsers);
        } else {
          // Otherwise fetch from API
          console.log("🌐 Fetching users from API...");
          const response = await fetch("http://localhost:4000/api/users");
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("✅ Fetched users from API:", data.length);
          console.log("📋 Sample user:", data[0]);
          
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("❌ Error loading users:", error);
        toast.error("Failed to load users");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [propUsers]);

  console.log("🎨 Rendering ManageUsersView");
  console.log("📊 Current users state:", users.length);

  // Defensive checks
  const safeUsers = Array.isArray(users) ? users : [];

  // Filter users based on role first, then exclude suspended users from display
  const filteredUsers =
    selectedRole === 'all'
      ? safeUsers
      : safeUsers.filter((user) => user.role?.toLowerCase() === selectedRole);

  console.log("🔍 Filtered users:", filteredUsers.length);

  // Calculate stats excluding suspended users
  const activePublicUsers = safeUsers.filter((u) => u.role?.toLowerCase() === 'public');
  const activeAnalystUsers = safeUsers.filter((u) => u.role?.toLowerCase() === 'analyst');

  const stats = {
    totalPublic: activePublicUsers.length,
    totalAnalysts: activeAnalystUsers.length,
    publicReports: activePublicUsers.reduce((sum, u) => sum + (u.reportsCount || 0), 0),
    analystReports: activeAnalystUsers.reduce((sum, u) => sum + (u.reportsCount || 0), 0),
  };

  const getInitials = (name: string) =>
    name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : '?';

  const getRoleColor = (role: string) =>
    role?.toLowerCase() === 'analyst'
      ? 'bg-purple-600/10 text-purple-500 border-purple-500/20'
      : 'bg-blue-600/10 text-blue-500 border-blue-500/20';

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-600/10 text-green-500 border-green-500/20';
      case 'suspended':
        return 'bg-red-600/10 text-red-500 border-red-500/20';
      default:
        return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="hover:bg-zinc-800 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white">Manage Users</h1>
              <p className="text-xs text-zinc-500">
                {isLoading ? 'Loading...' : `${filteredUsers.length} users`}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-blue-600/10 border-blue-600/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <User className="w-4 h-4 text-blue-500" />
              <Badge
                variant="outline"
                className="bg-blue-600/10 text-blue-500 border-blue-500/20"
              >
                Public
              </Badge>
            </div>
            <p className="text-xl text-white mb-1">{stats.totalPublic}</p>
            <p className="text-xs text-zinc-500">{stats.publicReports} reports</p>
          </Card>

          <Card className="bg-purple-600/10 border-purple-600/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <BarChart className="w-4 h-4 text-purple-500" />
              <Badge
                variant="outline"
                className="bg-purple-600/10 text-purple-500 border-purple-500/20"
              >
                Analyst
              </Badge>
            </div>
            <p className="text-xl text-white mb-1">{stats.totalAnalysts}</p>
            <p className="text-xs text-zinc-500">{stats.analystReports} reports</p>
          </Card>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <Tabs
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as any)}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-3 bg-transparent p-0 h-auto rounded-none border-b border-zinc-800">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent data-[state=active]:text-red-500 py-3"
            >
              All Users
            </TabsTrigger>
            <TabsTrigger
              value="public"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 py-3"
            >
              Public
            </TabsTrigger>
            <TabsTrigger
              value="analyst"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:text-purple-500 py-3"
            >
              Analysts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Users List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3 pb-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-zinc-900 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-500">No users found.</p>
              <p className="text-xs text-zinc-600 mt-2">
                Total users in database: {safeUsers.length}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card
                key={user.id || user.UserId || user.userId}
                onClick={() => {
                  console.log("👤 Viewing user:", user);
                  onViewUserDetail(user);
                }}
                className={`bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all cursor-pointer ${
                  user.status?.toLowerCase() === 'suspended' ? 'opacity-60' : ''
                }`}
              >
                {user.status?.toLowerCase() === 'suspended' && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-red-600/10 text-red-500 border-red-500/20">
                      Suspended
                    </Badge>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12 border-2 border-zinc-700">
                    <AvatarFallback
                      className={
                        user.role?.toLowerCase() === 'analyst'
                          ? 'bg-purple-600 text-white'
                          : 'bg-blue-600 text-white'
                      }
                    >
                      {getInitials(user.name || user.Name || '')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="text-white">{user.name || user.Name}</h3>
                        <p className="text-sm text-zinc-500">{user.email || user.Email}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                    </div>

                    <div className="flex items-center gap-2 mt-3 mb-3">
                      <Badge variant="outline" className={getRoleColor(user.role || user.Role)}>
                        {user.role || user.Role}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(user.status || 'active')}>
                        {user.status || 'active'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-zinc-500">Reports</p>
                        <p className="text-white">{user.reportsCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Joined</p>
                        <p className="text-white">{user.createdAt || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Last Active</p>
                        <p className="text-white">{user.lastActive || 'N/A'}</p>
                      </div>
                    </div>
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