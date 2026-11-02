import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { HolographicShield3D } from '../three/HolographicShield3D';

export const AuthPortal: React.FC = () => {
  const { login, register, demoLogin, error, clearError, isLoading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (isRegister) {
      if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
        setFormError('Please fill in all registration fields.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return;
      }
      try {
        await register({ full_name: fullName, email, username, password });
      } catch (err: any) {
        setFormError(err.message);
      }
    } else {
      if (!email.trim() || !password) {
        setFormError('Please enter both email and password.');
        return;
      }
      try {
        await login({ email, password });
      } catch (err: any) {
        setFormError(err.message);
      }
    }
  };

  const handleDemoSignIn = async () => {
    setFormError(null);
    clearError();
    try {
      await demoLogin();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050B16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Neon Glows and Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(33,212,253,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b1525_1px,transparent_1px),linear-gradient(to_bottom,#0b1525_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Main Centered Authentication Container */}
      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: 3D Holographic Visual Attraction */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center text-center p-4">
          <div className="w-full max-w-md">
            <HolographicShield3D height="340px" />
          </div>

          <div className="space-y-3 mt-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Next-Gen Predictive Defence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
              CYBERSHIELD <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>
            </h1>

            <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
              Real-time epidemic modeling (SEIR), Graph Neural Networks (GNN), and autonomous Reinforcement Learning defense in a unified 3D command architecture.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs font-mono text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                • SEIR ODE Solver
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                • PyTorch Spectral GCN
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                • Deep RL Policy Agent
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Login / Register Form */}
        <div className="lg:col-span-5 w-full">
          <div className="glass-panel p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            {/* Top Logo */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(33,212,253,0.5)]">
                <Shield className="w-6 h-6 text-slate-950 fill-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {isRegister ? 'Create Portal Account' : 'Security Command Sign In'}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  {isRegister ? 'Enter operator credentials' : 'Authorized personnel authentication'}
                </p>
              </div>
            </div>

            {/* Judge Demo Quick Access Banner */}
            <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-400/40 text-left relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-cyan-300 text-xs font-bold font-mono">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>JUDGE & EVALUATOR ACCESS</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Instant one-click login with pre-configured judge credentials. No registration required.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={isLoading}
                className="mt-2.5 w-full py-2 px-3 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(33,212,253,0.4)] transition flex items-center justify-center space-x-1.5"
              >
                <span>Launch Judge Demo Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Error Banner */}
            {(formError || error) && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError || error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Alan Turing"
                        className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Username</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="operator_one"
                        className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  {isRegister ? 'Email Address' : 'Email or Username'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@cybershield.ai"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-slate-300">Password</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => alert('For password recovery, use the Judge Demo access or reset via database.')}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                </div>
              )}

              {!isRegister && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer select-none">
                    Remember this terminal session
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(52,120,246,0.4)] transition disabled:opacity-50"
              >
                {isLoading ? 'Verifying Credentials...' : (isRegister ? 'Create Account' : 'Sign In to Command Center')}
              </button>
            </form>

            {/* Toggle Login / Register */}
            <div className="mt-6 text-center pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setFormError(null);
                  clearError();
                }}
                className="text-xs text-slate-400 hover:text-cyan-300 transition"
              >
                {isRegister
                  ? 'Already registered? Return to Sign In'
                  : "Don't have an account? Create an Operator Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

