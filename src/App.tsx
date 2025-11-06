import { useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { MainMapView } from './components/MainMapView';
import { ProfileView } from './components/ProfileView';
import { CrimeListView } from './components/CrimeListView';
import { CrimeDetailView } from './components/CrimeDetailView';
import { AdminDashboard } from './components/AdminDashboard';
import { AnalystDashboard } from './components/AnalystDashboard';
import { ManageUsersView } from './components/ManageUsersView';
import { UserDetailView } from './components/UserDetailView';
import { ReportCrimeForm } from './components/ReportCrimeForm';
import { AnalyticsView } from './components/AnalyticsView';
import { Toaster } from './components/ui/sonner';

type View = 'auth' | 'main' | 'profile' | 'crimeList' | 'crimeDetail' | 'adminDashboard' | 'analystDashboard' | 'manageUsers' | 'userDetail' | 'reportCrime' | 'analytics';
type UserRole = 'public' | 'admin' | 'analyst';

export interface Crime {
  id: string;
  type: string;
  location: string;
  date: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  latitude: number;
  longitude: number;
  reportedBy?: string;
  reportedById?: string;
  status?: 'verified' | 'pending' | 'discarded';
  witnesses?: number;
  evidence?: string[];
  officerAssigned?: string;
  caseNumber?: string;
}

export interface User {
  UserId: string;
  Name: string;
  Email: string;
  Role: UserRole;
  crimesReported?: number;
  createdAt: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('auth');
  const [previousView, setPreviousView] = useState<View | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'public',
    crimesReported: 12,
    joinedDate: 'January 2024'
  });

  const handleLogin = (role: UserRole) => {
    setUser({ ...user, role });
    if (role === 'admin') {
      setCurrentView('adminDashboard');
    } else if (role === 'analyst') {
      setCurrentView('analystDashboard');
    } else {
      setCurrentView('main');
    }
  };

  const handleLogout = () => {
    setCurrentView('auth');
    setUser({ ...user, role: 'public' });
  };

  const handleViewProfile = () => {
    setCurrentView('profile');
  };

  const handleBackToMain = () => {
    if (user.role === 'admin') {
      setCurrentView('adminDashboard');
    } else if (user.role === 'analyst') {
      setCurrentView('analystDashboard');
    } else {
      setCurrentView('main');
    }
    setSelectedLocation(null);
    setSelectedCrime(null);
  };

  const handleViewCrimeList = (location: string) => {
    setSelectedLocation(location);
    setCurrentView('crimeList');
  };

  const handleViewCrimeDetail = (crime: Crime) => {
    setPreviousView(currentView);
    setSelectedCrime(crime);
    setCurrentView('crimeDetail');
  };

  const handleBackFromCrimeDetail = () => {
    setSelectedCrime(null);
    // Go back to the previous view, or default to main
    if (previousView === 'crimeList') {
      setCurrentView('crimeList');
    } else if (previousView === 'adminDashboard') {
      setCurrentView('adminDashboard');
    } else if (previousView === 'analystDashboard') {
      setCurrentView('analystDashboard');
    } else if (previousView === 'analytics') {
      setCurrentView('analytics');
    } else if (previousView === 'userDetail') {
      setCurrentView('userDetail');
    } else {
      handleBackToMain();
    }
    setPreviousView(null);
  };

  const [users, setUsers] = useState<any[]>([]);

  const handleManageUsers = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/users");
      const data = await response.json();
      console.log("Fetched users:", data);
      setUsers(data);
      setCurrentView('manageUsers');
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleBackToAdminDashboard = () => {
    setCurrentView('adminDashboard');
    setSelectedUserId(null);
  };

  const handleViewUserDetail = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView('userDetail');
  };

  const handleBackToManageUsers = () => {
    setCurrentView('manageUsers');
    setSelectedUserId(null);
  };

  const handleReportCrime = (lat?: number, lng?: number) => {
    setCurrentView('reportCrime');
  };

  const handleViewAnalytics = () => {
    setCurrentView('analytics');
  };

  const handleCrimeSubmitted = () => {
    handleBackToMain();
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Toaster position="top-center" />
      {currentView === 'auth' && <AuthScreen onLogin={handleLogin} />}
      {currentView === 'main' && (
        <MainMapView 
          onViewProfile={handleViewProfile} 
          userName={user.name}
          onViewCrimeList={handleViewCrimeList}
          onReportCrime={handleReportCrime}
        />
      )}
      {currentView === 'profile' && (
        <ProfileView
          user={user}
          onBack={handleBackToMain}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'crimeList' && selectedLocation && (
        <CrimeListView
          location={selectedLocation}
          onBack={handleBackToMain}
          onViewCrimeDetail={handleViewCrimeDetail}
        />
      )}
      {currentView === 'crimeDetail' && selectedCrime && (
        <CrimeDetailView
          crime={selectedCrime}
          onBack={handleBackFromCrimeDetail}
          userRole={user.role}
        />
      )}
      {currentView === 'adminDashboard' && (
        <AdminDashboard
          onViewProfile={handleViewProfile}
          userName={user.name}
          onViewCrimeDetail={handleViewCrimeDetail}
          onManageUsers={handleManageUsers}
          onViewAnalytics={handleViewAnalytics}
        />
      )}
      {currentView === 'analystDashboard' && (
        <AnalystDashboard
          onViewProfile={handleViewProfile}
          userName={user.name}
          onViewCrimeDetail={handleViewCrimeDetail}
        />
      )}
      {currentView === 'manageUsers' && (
        <ManageUsersView
          onBack={handleBackToAdminDashboard}
          onViewUserDetail={handleViewUserDetail}
          users={users} 
        />
      )}
      {currentView === 'userDetail' && selectedUserId && (
        <UserDetailView
          userId={selectedUserId}
          onBack={handleBackToManageUsers}
          onViewCrimeDetail={handleViewCrimeDetail}
        />
      )}
      {currentView === 'reportCrime' && (
        <ReportCrimeForm
          onBack={handleBackToMain}
          onSubmit={handleCrimeSubmitted}
          userName={user.name}
          userId={user.id}
        />
      )}
      {currentView === 'analytics' && (
        <AnalyticsView
          onBack={handleBackToAdminDashboard}
          onViewCrimeDetail={handleViewCrimeDetail}
        />
      )}
    </div>
  );
}
