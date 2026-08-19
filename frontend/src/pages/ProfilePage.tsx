import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { formatDate } from '../utils/formatters';
import {
  UserCheck,
  Mail,
  Calendar,
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
  LogOut,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Security Operator Profile"
        subtitle="Active user identity, credentials telemetry, and DLP access posture"
        icon={UserCheck}
        badge="Authenticated Session"
        actions={
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        }
      />

      {/* Profile Overview Card */}
      <div className="cyber-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-cyber-800">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-shield-cyan/20 to-shield-emerald/20 border-2 border-shield-cyan/50 flex items-center justify-center text-shield-cyan font-bold text-3xl font-mono shadow-glow-cyan">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="text-center sm:text-left min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-bold text-white">{user?.full_name || 'Admin User'}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                ACTIVE OPERATOR
              </span>
            </div>

            <p className="text-xs font-mono text-cyber-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
              <Mail className="w-3.5 h-3.5 text-cyber-500" />
              {user?.email || 'admin@genshield.com'}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono text-cyber-400">
              <span className="px-2.5 py-1 rounded-lg bg-cyber-850 border border-cyber-800">
                User ID: #{user?.id || 1}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyber-850 border border-cyber-800">
                Role: Security Admin
              </span>
            </div>
          </div>
        </div>

        {/* Account Details & Session Posture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <Calendar className="w-4 h-4 text-shield-cyan" />
              <span className="text-xs font-mono font-semibold uppercase">Account Created</span>
            </div>
            <p className="text-xs font-mono text-white">
              {formatDate(user?.created_at)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <KeyRound className="w-4 h-4 text-shield-cyan" />
              <span className="text-xs font-mono font-semibold uppercase">Token Authentication</span>
            </div>
            <p className="text-xs font-mono text-emerald-400 font-semibold">
              JWT Bearer (HS256) Active
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <Shield className="w-4 h-4 text-shield-emerald" />
              <span className="text-xs font-mono font-semibold uppercase">Permission Scope</span>
            </div>
            <p className="text-xs text-cyber-200">
              Full access to Vector Vault, Simulator, and Audit Logs
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <Lock className="w-4 h-4 text-shield-indigo" />
              <span className="text-xs font-mono font-semibold uppercase">Security Protocol</span>
            </div>
            <p className="text-xs text-cyber-200">
              Argon2 Password Hashing & Strict CORS Enforcement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
