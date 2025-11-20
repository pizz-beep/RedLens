import { useState, useEffect } from 'react';
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
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber: string;
  crimesReported: number;
  verifiedReports: number;
  joinedDate: string;
  lastLogin: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('auth');
  const [previousView, setPreviousView] = useState<View | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user session on mount
  useEffect(() => {
    const checkSavedSession = () => {
      try {
        const savedUser = localStorage.getItem('redlens_user');
        
        if (!savedUser) {
          setCurrentView('auth');
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(savedUser);
        
        // Validate user data structure
        if (!user || !user.userId || !user.name || !user.email) {
          console.error('Invalid saved user data');
          localStorage.removeItem('redlens_user');
          setCurrentView('auth');
          setIsLoading(false);
          return;
        }
        
        // Normalize role to lowercase
        let normalizedRole: UserRole = 'public';
        const roleStr = String(user.role || '').toLowerCase();
        
        if (roleStr === 'admin') normalizedRole = 'admin';
        else if (roleStr === 'analyst') normalizedRole = 'analyst';
        else normalizedRole = 'public';
        
        // Sanitize user data to ensure no NaN or undefined values
        const sanitizedUser: User = {
          userId: String(user.userId || ''),
          name: String(user.name || ''),
          email: String(user.email || ''),
          role: normalizedRole,
          phoneNumber: String(user.phoneNumber || ''),
          crimesReported: Number(user.crimesReported) || 0,
          verifiedReports: Number(user.verifiedReports) || 0,
          joinedDate: String(user.joinedDate || ''),
          lastLogin: String(user.lastLogin || '')
        };
        
        setUserData(sanitizedUser);
        
        // Navigate based on role
        if (normalizedRole === 'admin') {
          setCurrentView('adminDashboard');
        } else if (normalizedRole === 'analyst') {
          setCurrentView('analystDashboard');
        } else {
          setCurrentView('main');
        }
      } catch (error) {
        console.error('Error loading saved session:', error);
        localStorage.removeItem('redlens_user');
        setCurrentView('auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedSession();
  }, []);

  const handleLogin = (role: UserRole, user: any) => {
    try {
      // Sanitize and validate user data
      const sanitizedUser: User = {
        userId: String(user.userId || ''),
        name: String(user.name || ''),
        email: String(user.email || ''),
        role: role,
        phoneNumber: String(user.phoneNumber || ''),
        crimesReported: Number(user.crimesReported) || 0,
        verifiedReports: Number(user.verifiedReports) || 0,
        joinedDate: String(user.joinedDate || ''),
        lastLogin: String(user.lastLogin || new Date().toISOString())
      };
      
      setUserData(sanitizedUser);
      
      if (role === 'admin') {
        setCurrentView('adminDashboard');
      } else if (role === 'analyst') {
        setCurrentView('analystDashboard');
      } else {
        setCurrentView('main');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setCurrentView('auth');
    }
  };

  const handleLogout = () => {
    setCurrentView('auth');
    setUserData(null);
    setSelectedLocation(null);
    setSelectedCrime(null);
    setSelectedUserId(null);
    localStorage.removeItem('redlens_user');
  };

  const handleViewProfile = () => {
    setCurrentView('profile');
  };

  const handleBackToMain = () => {
    if (userData?.role === 'admin') {
      setCurrentView('adminDashboard');
    } else if (userData?.role === 'analyst') {
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

  const handleManageUsers = async () => {
    try {
      console.log("🔄 Fetching users for Manage Users view...");
      const response = await fetch("http://localhost:4000/api/users");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Fetched users:", data.length);
      console.log("📋 Sample user:", data[0]);
      
      // Validate data is an array
      if (!Array.isArray(data)) {
        console.error("❌ Users data is not an array:", data);
        toast.error("Invalid user data received");
        return;
      }
      
      setUsers(data);
      setCurrentView('manageUsers');
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      toast.error("Failed to load users. Please try again.");
    }
  };

  const handleBackToAdminDashboard = () => {
    setCurrentView('adminDashboard');
    setSelectedUserId(null);
  };

  const handleViewUserDetail = (user: any) => {
    console.log("📍 Viewing user detail:", user);
    setSelectedUser(user);
    setPreviousView('manageUsers');
    setCurrentView('userDetail');
  };

  const handleBackToManageUsers = async () => {
  // Refresh users list when coming back
    try {
      const response = await fetch("http://localhost:4000/api/users");
      const data = await response.json();
      console.log("🔄 Refreshed users:", data.length);
      setUsers(data);
    } catch (error) {
      console.error("Error refreshing users:", error);
    }
    
    setCurrentView('manageUsers');
    setSelectedUser(null);
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

  const getUserRole = (): UserRole => {
    if (!userData) return 'public';
    return userData.role;
  };

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Toaster position="top-center" />
      
      {currentView === 'auth' && <AuthScreen onLogin={handleLogin} />}
      
      {currentView === 'main' && userData && (
        <MainMapView 
          onViewProfile={handleViewProfile} 
          userName={userData.name}
          onViewCrimeList={handleViewCrimeList}
          onReportCrime={handleReportCrime}
          onViewCrimeDetail={handleViewCrimeDetail}
        />
      )}
      
      {currentView === 'profile' && userData && (
        <ProfileView
          user={userData}
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
          userRole={getUserRole()}
        />
      )}
      
      {currentView === 'adminDashboard' && userData && (
        <AdminDashboard
          onViewProfile={handleViewProfile}
          userName={userData.name}
          onViewCrimeDetail={handleViewCrimeDetail}
          onManageUsers={handleManageUsers}
          onViewAnalytics={handleViewAnalytics}
        />
      )}
      
      {currentView === 'analystDashboard' && userData && (
        <AnalystDashboard
          onViewProfile={handleViewProfile}
          userName={userData.name}
          userId={userData.userId}
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
      
      {currentView === 'userDetail' && selectedUser && (
        <UserDetailView
          user={selectedUser}
          onBack={handleBackToManageUsers}
          onViewCrimeDetail={handleViewCrimeDetail}
        />
      )}
            
      {currentView === 'reportCrime' && userData && (
        <ReportCrimeForm
          onBack={handleBackToMain}
          onSubmit={handleCrimeSubmitted}
          userName={userData.name}
          userId={userData.userId}
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
