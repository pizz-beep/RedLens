import { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type UserRole = 'public' | 'admin' | 'analyst';

interface AuthScreenProps {
  onLogin: (role: UserRole) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('public');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('public');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginRole);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(signupRole);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-[Outfit] relative overflow-hidden">
      {/* Animated Cinematic Background */}
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
          {/* Glow behind logo */}
          <div className="absolute w-60 h-60 bg-red-600/30 blur-[100px] animate-glow-pulse" />

          {/* Logo Circle */}
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

          {/* Title */}
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

                {/* Underline */}
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
                  <button type="button" className="text-sm text-red-500 hover:text-red-400">
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-6 rounded-xl text-white">
                  Log In
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
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
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
                    I agree to the{' '}
                    <button type="button" className="text-red-500 hover:text-red-400">Terms of Service</button>{' '}
                    and{' '}
                    <button type="button" className="text-red-500 hover:text-red-400">Privacy Policy</button>.
                  </Label>
                </div>
                <Button
                  type="submit"
                  disabled={!agreeToTerms}
                  className="w-full bg-red-600 hover:bg-red-700 py-6 rounded-xl text-white transition-all duration-300"
                >
                  Create Account
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
              All data is encrypted and your location is only used to show nearby hotspots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
