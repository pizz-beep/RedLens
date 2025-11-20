import { useState } from 'react';
import { ChevronLeft, MapPin, AlertTriangle, Calendar, LogOut, Trash2, Bell, Shield, HelpCircle, Settings, User, Mail, Lock } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';

interface User {
  userId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  crimesReported: number;
  verifiedReports: number;
  joinedDate: string;
}

interface ProfileViewProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const API_URL = 'http://localhost:4000/api';

export function ProfileView({ user, onBack, onLogout }: ProfileViewProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Edit profile state
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phoneNumber || '');
  const [editEmail, setEditEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  
  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/users/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phoneNumber: editPhone,
          email: editEmail
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      setEditMode(false);
      
      // Update local storage with new user data
      const updatedUser = { ...user, name: editName, email: editEmail, phoneNumber: editPhone };
      localStorage.setItem('redlens_user', JSON.stringify(updatedUser));
      
      // Reload page to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${user.userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection(null);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${user.userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.userId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast.success('Account deleted successfully');
      localStorage.removeItem('redlens_user');
      onLogout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
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
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white">Profile</h1>
              <p className="text-xs text-zinc-500">Manage your account</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 pb-6">
          {/* Profile Card */}
          <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-zinc-800 p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 border-4 border-zinc-700 mb-4">
                <AvatarFallback className="bg-red-600 text-white text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl text-white mb-1">{user.name}</h2>
              <p className="text-zinc-400 mb-3">{user.email}</p>
              <p className="text-xs text-zinc-500">Joined {user.joinedDate}</p>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-zinc-900 border-zinc-800 p-4 text-center">
              <div className="bg-red-600/20 p-3 rounded-lg w-fit mx-auto mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl text-white mb-1">{user.crimesReported || 0}</p>
              <p className="text-xs text-zinc-500">Crimes Reported</p>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 p-4 text-center">
              <div className="bg-green-600/20 p-3 rounded-lg w-fit mx-auto mb-2">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl text-white mb-1">{user.verifiedReports || 0}</p>
              <p className="text-xs text-zinc-500">Verified Reports</p>
            </Card>
          </div>

          {/* Account Settings Section */}
          <div className="space-y-2">
            <h3 className="text-zinc-400 text-sm px-1 mb-3">Account Settings</h3>

            {/* General Settings - Edit Profile */}
            <Dialog open={editMode} onOpenChange={setEditMode}>
              <DialogTrigger asChild>
                <Card className="bg-zinc-900 border-zinc-800 p-4 cursor-pointer hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600/20 p-2 rounded-lg">
                      <Settings className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white">General Settings</h4>
                      <p className="text-xs text-zinc-500">Edit profile information</p>
                    </div>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Privacy & Security - Change Password */}
            <Dialog open={activeSection === 'security'} onOpenChange={(open) => setActiveSection(open ? 'security' : null)}>
              <DialogTrigger asChild>
                <Card className="bg-zinc-900 border-zinc-800 p-4 cursor-pointer hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600/20 p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white">Privacy & Security</h4>
                      <p className="text-xs text-zinc-500">Change password</p>
                    </div>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveSection(null);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Notifications - Placeholder */}
            <Card className="bg-zinc-900 border-zinc-800 p-4 opacity-50">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/20 p-2 rounded-lg">
                  <Bell className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white">Notifications</h4>
                  <p className="text-xs text-zinc-500">Coming soon</p>
                </div>
              </div>
            </Card>

            {/* Help & Support - Placeholder */}
            <Card className="bg-zinc-900 border-zinc-800 p-4 opacity-50">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600/20 p-2 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white">Help & Support</h4>
                  <p className="text-xs text-zinc-500">Coming soon</p>
                </div>
              </div>
            </Card>
          </div>

          <Separator className="bg-zinc-800" />

          {/* Danger Zone */}
          <div className="space-y-3">
            <h3 className="text-red-400 text-sm px-1">Danger Zone</h3>

            {/* Log Out */}
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Log Out
            </Button>

            {/* Delete Account */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-red-600/50 text-red-500 hover:bg-red-600/10"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
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
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
