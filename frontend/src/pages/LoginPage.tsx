import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      await login({ email, password });
      navigate('/chat');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@genshield.com');
    setPassword('GenShield2026!');
  };

  return (
    <div className="min-h-screen bg-cyber-950 flex flex-col justify-center items-center p-4 selection:bg-shield-cyan/30">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-shield-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-shield-emerald/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-shield-cyan/20 to-shield-emerald/20 border border-shield-cyan/40 text-shield-cyan mb-4 shadow-glow-cyan">
            <Shield className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-2xl font-extrabold tracking-wider text-white">
            <span>GEN</span>
            <span className="text-shield-cyan">SHIELD</span>
          </div>
          <p className="text-xs font-mono text-cyber-400 uppercase tracking-widest mt-1">
            Enterprise AI Knowledge Assistant
          </p>
        </div>

        {/* Login Card */}
        <div className="cyber-card p-6 sm:p-8 bg-cyber-900/90 border-cyber-750 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">Sign In</h2>
          <p className="text-xs text-cyber-400 mb-6">
            Access the Aurelia Systems AI workspace protected by GenShield
          </p>

          {error && <ErrorMessage message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-cyber-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@aurelia.systems"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-cyber-950 border border-cyber-750 focus:border-shield-cyan/80 focus:ring-1 focus:ring-shield-cyan/50 rounded-xl text-xs font-mono text-cyber-100 placeholder-cyber-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-medium text-cyber-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-cyber-950 border border-cyber-750 focus:border-shield-cyan/80 focus:ring-1 focus:ring-shield-cyan/50 rounded-xl text-xs font-mono text-cyber-100 placeholder-cyber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyber-500 hover:text-cyber-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-shield-cyan hover:bg-shield-cyanDark text-cyber-950 shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-cyber-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Open AI Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-cyber-800 text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-shield-cyan hover:text-shield-cyanDark transition"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Fill Demo Credentials
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-cyber-400">
            Need an enterprise account?{' '}
            <Link
              to="/register"
              className="font-semibold text-shield-cyan hover:text-shield-cyanDark transition font-mono"
            >
              Register Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
