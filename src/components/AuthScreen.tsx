import { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';


type UserRole = 'public' | 'admin' | 'analyst';


interface AuthScreenProps {
  onLogin: (role: UserRole, userData: any) => void;
}


const API_URL = 'http://localhost:4000/api';


export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('public');
  
  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('public');
  const [signupPhone, setSignupPhone] = useState('');
  
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roleMap = {
        'public': 'Public',
        'admin': 'Admin',
        'analyst': 'Analyst'
      };

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          role: roleMap[loginRole]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // ✅ FIXED: Sanitize data to prevent NaN values
      const sanitizedData = {
        userId: String(data.userId || ''),
        name: String(data.name || ''),
        email: String(data.email || loginEmail),
        role: loginRole,
        phoneNumber: String(data.phoneNumber || ''),
        crimesReported: Number(data.crimesReported) || 0,
        verifiedReports: Number(data.verifiedReports) || 0,
        joinedDate: String(data.joinedDate || ''),
        lastLogin: String(data.lastLogin || new Date().toISOString())
      };

      // Save to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('redlens_user', JSON.stringify(sanitizedData));
      }

      toast.success(`Welcome back, ${data.name}!`);
      onLogin(loginRole, sanitizedData);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!agreeToTerms) {
      toast.error('You must agree to the Terms of Service');
      return;
    }

    setLoading(true);

    try {
      const roleMap = {
        'public': 'Public'
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: roleMap[signupRole],
          phoneNumber: signupPhone || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success('Account created successfully! Please log in.');
      
      // Switch to login tab and pre-fill email
      setActiveTab('login');
      setLoginEmail(signupEmail);
      setLoginRole(signupRole);
      
      // Clear signup form
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupPhone('');
      setAgreeToTerms(false);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-[Outfit] relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-[0.6] scale-105 animate-pan"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-zinc-950/80 to-black/90" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-700/30 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-800/20 blur-[100px] rounded-full animate-pulse-slow delay-700" />

      {/* Header */}
      <div className="relative h-[340px] flex flex-col items-center justify-center z-10 overflow-hidden">
        <div className="relative flex flex-col items-center text-center select-none">
          <div className="absolute w-60 h-60 bg-red-600/30 blur-[100px] animate-glow-pulse" />

          <div className="relative bg-gradient-to-br from-red-600 to-red-700 p-5 rounded-2xl shadow-[0_0_35px_rgba(239,68,68,0.4)] mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="white"
              className="w-10 h-10"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5c5 0 9 4 9 9s-9 10-9 10S3 16.5 3 11.5s4-9 9-9z" />
            </svg>
          </div>

          <h1
            className="text-7xl md:text-8xl font-extrabold tracking-tight drop-shadow-[0_0_25px_rgba(239,68,68,0.4)] text-white animate-neon"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Red<span className="text-red-500">Lens</span>
          </h1>
          <p className="text-zinc-400 text-lg mt-4 font-light tracking-wide animate-fadeInSlow">
            Visualize the unseen. Stay safe. Stay informed.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 px-6 -mt-10 mb-10">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl border border-zinc-800/60 shadow-[0_0_30px_rgba(239,68,68,0.1)] backdrop-blur-lg overflow-hidden">
          <Tabs defaultValue="login" className="w-full relative" onValueChange={(val) => setActiveTab(val as 'login' | 'signup')}>
            {/* Tab Header */}
            <div className="relative flex justify-center pt-8 pb-4">
              <TabsList className="flex gap-20 bg-transparent relative">
                <TabsTrigger
                  value="login"
                  className="relative text-lg px-4 pb-3 border-b-2 border-transparent 
                    data-[state=active]:border-red-500 
                    data-[state=active]:text-white 
                    data-[state=active]:bg-transparent
                    focus-visible:ring-0 focus-visible:outline-none
                    text-zinc-400 hover:text-white transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="relative text-lg px-4 pb-3 border-b-2 border-transparent 
                    data-[state=active]:border-red-500 
                    data-[state=active]:text-white 
                    data-[state=active]:bg-transparent
                    focus-visible:ring-0 focus-visible:outline-none
                    text-zinc-400 hover:text-white transition-all duration-300"
                >
                  Signup
                </TabsTrigger>

                <div
                  className={`absolute bottom-0 h-[2px] bg-red-500 transition-all duration-500 ease-in-out rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)] ${
                    activeTab === 'login'
                      ? 'left-0 translate-x-[12%] w-[70px]'
                      : 'left-[60%] translate-x-[12%] w-[85px]'
                  }`}
                />
              </TabsList>
            </div>

            <div className="h-px bg-zinc-800/50" />

            {/* LOGIN FORM */}
            <TabsContent value="login" className="p-6 pt-8">
              <h2 className="text-xl font-semibold mb-4">Welcome Back</h2>
              <div className="h-0.5 w-12 bg-red-500 mb-6 rounded-full"></div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label className="text-zinc-300">Login As</Label>
                  <Select value={loginRole} onValueChange={(v) => setLoginRole(v as UserRole)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectItem value="public">Public User</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white pr-10"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-zinc-600 data-[state=checked]:bg-red-600"
                    />
                    <Label className="text-sm text-zinc-400">Remember me</Label>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 py-6 rounded-xl text-white disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </TabsContent>

            {/* SIGNUP FORM */}
            <TabsContent value="signup" className="p-6 pt-8">
              <h2 className="text-xl font-semibold mb-4">Create Your Account</h2>
              <div className="h-0.5 w-12 bg-red-500 mb-6 rounded-full"></div>

              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <Label className="text-zinc-300">Account Type</Label>
                  <Select value={signupRole} onValueChange={(v) => setSignupRole(v as UserRole)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectItem value="public">Public User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300">Full Name</Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Phone Number (Optional)</Label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white pr-10"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-zinc-300">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white pr-10"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    checked={agreeToTerms}
                    onCheckedChange={(c) => setAgreeToTerms(c as boolean)}
                    className="border-zinc-600 data-[state=checked]:bg-red-600 mt-1"
                  />
                  <Label className="text-sm text-zinc-400 leading-relaxed">
                    I agree to the Terms of Service and Privacy Policy.
                  </Label>
                </div>
                <Button
                  type="submit"
                  disabled={!agreeToTerms || loading}
                  className="w-full bg-red-600 hover:bg-red-700 py-6 rounded-xl text-white transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="mt-8 mb-10 flex items-start gap-3 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 backdrop-blur-md">
          <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-zinc-300">Your safety is our priority</p>
            <p className="text-xs text-zinc-500 mt-1">
              All data is encrypted and stored securely. User registration creates audit logs automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
