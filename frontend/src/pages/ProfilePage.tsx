import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { authApi } from '../services/authApi';
import { UserProfileSummary } from '../types/auth';
import { parseApiError } from '../utils/errorHandler';
import { formatDate } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<UserProfileSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setSummary(await authApi.getProfileSummary());
      } catch (err) {
        setError(parseApiError(err, 'Failed to load profile summary'));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Profile"
        subtitle="Identity, activity, and current access posture"
        icon={UserCheck}
        badge="Authenticated Session"
        actions={
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        }
      />

      {error && <ErrorMessage message={error} />}
      {isLoading && <LoadingSpinner size="lg" label="Loading profile..." />}

      <div className="cyber-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-cyber-800">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-shield-cyan/20 to-shield-emerald/20 border-2 border-shield-cyan/50 flex items-center justify-center text-shield-cyan font-bold text-3xl font-mono shadow-glow-cyan">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="text-center sm:text-left min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-bold text-white">{user?.full_name || 'User'}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                ACTIVE USER
              </span>
            </div>

            <p className="text-xs font-mono text-cyber-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
              <Mail className="w-3.5 h-3.5 text-cyber-500" />
              {user?.email || 'user@genshield.local'}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono text-cyber-400">
              <span className="px-2.5 py-1 rounded-lg bg-cyber-850 border border-cyber-800">
                User ID: #{user?.id || 1}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyber-850 border border-cyber-800">
                Role: {user?.role?.replace('_', ' ') || 'EMPLOYEE'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <Calendar className="w-4 h-4 text-shield-cyan" />
              <span className="text-xs font-mono font-semibold uppercase">Account Created</span>
            </div>
            <p className="text-xs font-mono text-white">{formatDate(user?.created_at)}</p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <KeyRound className="w-4 h-4 text-shield-cyan" />
              <span className="text-xs font-mono font-semibold uppercase">Token Authentication</span>
            </div>
            <p className="text-xs font-mono text-emerald-400 font-semibold">JWT Bearer Active</p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <Shield className="w-4 h-4 text-shield-emerald" />
              <span className="text-xs font-mono font-semibold uppercase">Permission Scope</span>
            </div>
            <p className="text-xs text-cyber-200">
              {user?.role === 'EMPLOYEE'
                ? 'Dashboard, chatbot, profile, and settings access'
                : 'Full security dashboard, analysis history, protected sources, and chatbot access'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <Lock className="w-4 h-4 text-shield-indigo" />
              <span className="text-xs font-mono font-semibold uppercase">Security Protocol</span>
            </div>
            <p className="text-xs text-cyber-200">Argon2 password hashing and authenticated API access</p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <UserCheck className="w-4 h-4 text-shield-cyan" />
              <span className="text-xs font-mono font-semibold uppercase">Requests</span>
            </div>
            <p className="text-xs font-mono text-white">{summary?.request_count ?? 0}</p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <CheckCircle2 className="w-4 h-4 text-shield-emerald" />
              <span className="text-xs font-mono font-semibold uppercase">Detections</span>
            </div>
            <p className="text-xs font-mono text-white">{summary?.detection_count ?? 0}</p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800 sm:col-span-2">
            <div className="flex items-center gap-2 mb-2 text-cyber-300">
              <Calendar className="w-4 h-4 text-shield-cyan" />
              <span className="text-xs font-mono font-semibold uppercase">Last Activity</span>
            </div>
            <p className="text-xs font-mono text-white">
              {summary?.last_activity_at ? formatDate(summary.last_activity_at) : 'No recorded requests yet'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
