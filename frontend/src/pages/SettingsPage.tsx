import React, { useEffect, useState } from 'react';
import { KeyRound, LogOut, Settings2, Shield, SlidersHorizontal, UserRound } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import { SettingsResponse } from '../types/auth';
import { parseApiError } from '../utils/errorHandler';

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setData(await authApi.getSettings());
      } catch (err) {
        setError(parseApiError(err, 'Failed to load settings'));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Backend-backed account, session, and detection policy configuration"
        icon={Settings2}
        badge="Runtime Config"
      />

      {error && <ErrorMessage message={error} />}
      {isLoading && <LoadingSpinner size="lg" label="Loading settings..." />}

      {data && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="cyber-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <UserRound className="h-4 w-4 text-shield-cyan" />
              <h2 className="text-sm font-semibold">Account</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-cyber-500">Name</p>
                <p className="text-cyber-100">{data.account.full_name}</p>
              </div>
              <div>
                <p className="text-cyber-500">Email</p>
                <p className="text-cyber-100">{data.account.email}</p>
              </div>
              <div>
                <p className="text-cyber-500">Role</p>
                <p className="text-cyber-100">{data.account.role.replace('_', ' ')}</p>
              </div>
            </div>
          </section>

          <section className="cyber-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Shield className="h-4 w-4 text-shield-emerald" />
              <h2 className="text-sm font-semibold">Security</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-cyber-500">Session Auth</p>
                <p className="text-cyber-100">{data.security.session_auth}</p>
              </div>
              <div>
                <p className="text-cyber-500">Password Hashing</p>
                <p className="text-cyber-100">{data.security.password_hashing}</p>
              </div>
              <div>
                <p className="text-cyber-500">Logout</p>
                <p className="text-cyber-100">{data.security.logout_behavior}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-800/60 bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-950/50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </section>

          <section className="cyber-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <SlidersHorizontal className="h-4 w-4 text-shield-indigo" />
              <h2 className="text-sm font-semibold">Detection Settings</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-cyber-500">Semantic Warn Threshold</p>
                <p className="text-cyber-100">{data.detection.similarity_warn_threshold}</p>
              </div>
              <div>
                <p className="text-cyber-500">Semantic Block Threshold</p>
                <p className="text-cyber-100">{data.detection.similarity_block_threshold}</p>
              </div>
              <div>
                <p className="text-cyber-500">Risk Thresholds</p>
                <p className="text-cyber-100">
                  Warn {data.detection.risk_warn_threshold}, Block {data.detection.risk_block_threshold}
                </p>
              </div>
              <div>
                <p className="text-cyber-500">Factual Overlap</p>
                <p className="text-cyber-100">{data.detection.factual_overlap_mode}</p>
              </div>
              <div>
                <p className="text-cyber-500">Embedding Model</p>
                <p className="text-cyber-100">{data.detection.embedding_model}</p>
              </div>
            </div>
            <div className="rounded-xl border border-cyber-800 bg-cyber-950/60 p-3 text-xs text-cyber-400">
              <div className="flex items-center gap-2 text-cyber-300">
                <KeyRound className="h-3.5 w-3.5" />
                Change password is not yet exposed as a backend mutation. This page currently shows live server-backed settings only.
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
