import React, { useState, useEffect } from 'react';
import { AnalyticsMetrics } from '../../types';
import { X, Activity, DollarSign, Cpu, Clock, CheckCircle2, AlertTriangle, RefreshCw, Search, ShieldCheck, Database, Trash2 } from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'fallback' | 'failed'>('all');
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('buildmate_admin_key') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [authRequired, setAuthRequired] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchMetrics = async (keyOverride?: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const key = keyOverride ?? adminKey;
      const res = await fetch('/api/v1/analytics', {
        headers: key ? { 'x-admin-key': key } : {},
      });
      if (res.status === 401) {
        setAuthRequired(true);
        setMetrics(null);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAuthRequired(false);
        setMetrics(data.analytics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async () => {
    setAuthError(null);
    const res = await fetch('/api/v1/analytics', {
      headers: { 'x-admin-key': passwordInput },
    });
    if (res.status === 401) {
      setAuthError('Galat password. Dobara koshish karein.');
      return;
    }
    sessionStorage.setItem('buildmate_admin_key', passwordInput);
    setAdminKey(passwordInput);
    await fetchMetrics(passwordInput);
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
    }
  }, [isOpen]);

  const handleResetLogs = async () => {
    if (confirm('Are you sure you want to reset all API request logs?')) {
      await fetch('/api/v1/analytics/reset', {
        method: 'POST',
        headers: adminKey ? { 'x-admin-key': adminKey } : {},
      });
      fetchMetrics();
    }
  };

  if (!isOpen) return null;

  if (authRequired) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="w-full max-w-sm bg-slate-900 border border-indigo-800/60 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-950 border-b border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Admin Access Required</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-xs text-slate-400">
              Ye dashboard usage logs aur cost data dikhata hai — sirf admin ke liye protected hai. Password enter karein.
            </p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Admin password"
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none font-mono"
            />
            {authError && <p className="text-[11px] text-rose-400">{authError}</p>}
            <button
              onClick={handleUnlock}
              className="w-full px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Unlock Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredLogs = metrics?.recentLogs?.filter((log) => {
    const matchesSearch =
      log.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && log.status === statusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-indigo-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-indigo-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Enterprise Router Admin Dashboard
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Live System Metrics
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Monitor request volume, cost tracking, token usage, latency, & provider health
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMetrics}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                Total API Requests
                <Database className="w-4 h-4 text-indigo-400" />
              </span>
              <div className="text-xl font-extrabold text-white font-mono">
                {metrics?.totalRequests || 0}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                {metrics?.successfulRequests || 0} Success | {metrics?.fallbackCount || 0} Fallbacks
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                Est. Cost (USD)
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                ${metrics?.totalCostUsd?.toFixed(4) || '0.0000'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Token Cost Savings Active
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                Total Tokens Processed
                <Cpu className="w-4 h-4 text-purple-400" />
              </span>
              <div className="text-xl font-extrabold text-white font-mono">
                {metrics?.totalTokens?.toLocaleString() || 0}
              </div>
              <div className="text-[10px] text-purple-300 font-medium">
                Input & Output Combined
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                Avg Latency
                <Clock className="w-4 h-4 text-amber-400" />
              </span>
              <div className="text-xl font-extrabold text-amber-300 font-mono">
                {metrics?.avgLatencyMs || 0} ms
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Active Providers: {metrics?.activeProvidersCount || 1}
              </div>
            </div>
          </div>

          {/* Provider Health Matrix */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Active Provider Health Matrix
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
              {metrics?.providerHealth &&
                Object.entries(metrics.providerHealth).map(([id, infoVal]) => {
                  const info = infoVal as { configured?: boolean; latencyMs?: number; status?: string };
                  return (
                    <div
                      key={id}
                      className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                        info.configured
                          ? 'bg-slate-900 border-slate-800'
                          : 'bg-slate-900/40 border-slate-950 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-200 uppercase text-[10px]">{id}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            info.configured ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                          }`}
                        ></span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {info.configured ? `${info.latencyMs || 120}ms` : 'Not Configured'}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* API Request Audit Log Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden space-y-3 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-xs">Request History Audit Log</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {filteredLogs?.length || 0} Records
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-300 text-xs focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="fallback">Fallback</option>
                  <option value="failed">Failed</option>
                </select>

                <button
                  onClick={handleResetLogs}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors border border-rose-900/30"
                  title="Clear Logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left font-mono text-[11px] text-slate-300">
                <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2">Time</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Provider & Model</th>
                    <th className="p-2">Latency</th>
                    <th className="p-2">Tokens</th>
                    <th className="p-2">Cost (USD)</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredLogs && filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-2 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="p-2 font-bold text-indigo-300">{log.category}</td>
                        <td className="p-2">
                          <span className="uppercase text-slate-400 font-bold">{log.provider}:</span>{' '}
                          <span className="text-white">{log.model}</span>
                        </td>
                        <td className="p-2 text-amber-300">{log.latencyMs}ms</td>
                        <td className="p-2 text-purple-300">{log.totalTokens}</td>
                        <td className="p-2 text-emerald-400">${log.estimatedCostUsd?.toFixed(5)}</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'success'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                                : log.status === 'fallback'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500">
                        No request logs recorded yet. Send a prompt in chat to populate analytics!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
