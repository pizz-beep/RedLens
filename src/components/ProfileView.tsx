import { ChevronLeft, MapPin, AlertTriangle, Calendar, LogOut, Trash2, Bell, Shield, HelpCircle, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface User {
  name: string;
  email: string;
  crimesReported: number;
  joinedDate: string;
}

interface ProfileViewProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

export function ProfileView({ user, onBack, onLogout }: ProfileViewProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleDeleteAccount = () => {
    console.log('Delete account requested');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="hover:bg-zinc-800 p-2 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="tracking-tight">
              <span className="text-red-500">Red</span>
              <span className="text-white">Lens</span>
            </h1>
            <p className="text-xs text-zinc-500">Profile</p>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-red-950 via-zinc-900 to-zinc-950 px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <Avatar className="w-24 h-24 border-4 border-red-600 mb-4">
            <AvatarFallback className="bg-red-600 text-white text-2xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl text-white mb-1">{user.name}</h2>
          <p className="text-zinc-400">{user.email}</p>
          <p className="text-sm text-zinc-500 mt-2">Joined {user.joinedDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-600/20 p-3 rounded-xl mb-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-2xl text-white mb-1">{user.crimesReported}</p>
              <p className="text-sm text-zinc-500">Crimes Reported</p>
            </div>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-600/20 p-3 rounded-xl mb-3">
                <MapPin className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-2xl text-white mb-1">8</p>
              <p className="text-sm text-zinc-500">Areas Tracked</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Menu Options */}
      <div className="flex-1 px-6">
        <h3 className="text-zinc-400 mb-3 text-sm">Account Settings</h3>
        
        <Card className="bg-zinc-900 border-zinc-800 divide-y divide-zinc-800">
          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <Settings className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white">General Settings</p>
              <p className="text-xs text-zinc-500">Preferences and customization</p>
            </div>
          </button>

          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white">Notifications</p>
              <p className="text-xs text-zinc-500">Manage alert preferences</p>
            </div>
          </button>

          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white">Privacy & Security</p>
              <p className="text-xs text-zinc-500">Control your data</p>
            </div>
          </button>

          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <HelpCircle className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white">Help & Support</p>
              <p className="text-xs text-zinc-500">Get assistance</p>
            </div>
          </button>
        </Card>

        {/* Danger Zone */}
        <h3 className="text-zinc-400 mb-3 mt-6 text-sm">Danger Zone</h3>
        
        <Card className="bg-zinc-900 border-zinc-800 divide-y divide-zinc-800 mb-6">
          <button
            onClick={onLogout}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors"
          >
            <div className="bg-orange-600/20 p-2 rounded-lg">
              <LogOut className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white">Log Out</p>
              <p className="text-xs text-zinc-500">Sign out of your account</p>
            </div>
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors">
                <div className="bg-red-600/20 p-2 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white">Delete Account</p>
                  <p className="text-xs text-zinc-500">Permanently remove your account</p>
                </div>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </div>
  );
}
