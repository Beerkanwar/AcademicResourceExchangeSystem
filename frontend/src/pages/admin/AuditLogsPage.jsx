import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import {
  HiOutlineClipboardList,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineEye,
  HiOutlineX
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/audit', { params: { page, limit: 15 } });
      setLogs(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-5 animate-fade-in w-full max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#1a3a6e] uppercase tracking-tight flex items-center gap-2">
            <HiOutlineClipboardList className="w-8 h-8 text-[#d69e2e]" /> System Audit Logs
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Review critical administrative and systemic actions.
          </p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm">
          {pagination.total} Records
        </div>
      </div>

      {/* Table */}
      <div className="panel shadow-sm overflow-hidden">
        <div className="overflow-x-auto content-card-body p-0 border-t-0 rounded-t-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8fbff] border-b border-[#c5d8ed]">
                {['Timestamp', 'Actor/User', 'Action', 'Target', 'Details'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-black uppercase tracking-widest px-6 py-4 text-[#1a3a6e]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8eef5]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 rounded bg-slate-100 animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-slate-400 font-medium tracking-wide">
                    No audit records available.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">
                          {log.actor ? `${log.actor.firstName || ''} ${log.actor.lastName || ''}`.trim() || log.actor.email : 'System/Deleted User'}
                        </span>
                        {log.actor && (
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#d69e2e]">
                            {log.actor.role}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-widest rounded border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                        {log.targetType} <span className="opacity-50 font-mono lower">({log.targetId.slice(-6)})</span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                      >
                        <HiOutlineEye className="w-3.5 h-3.5" /> View JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-[#f8fbff] px-6 py-4 border-t border-[#c5d8ed] flex items-center justify-between rounded-b-lg">
            <span className="text-xs font-bold tracking-widest uppercase text-[#1a3a6e]">Page {pagination.page} / {pagination.pages}</span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(pagination.page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded bg-white border border-[#c5d8ed] text-[#1a3a6e] hover:bg-[#e8f0fd] disabled:opacity-50"
              >
                <HiOutlineChevronLeft />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchLogs(pagination.page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded bg-white border border-[#c5d8ed] text-[#1a3a6e] hover:bg-[#e8f0fd] disabled:opacity-50"
              >
                <HiOutlineChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[80vh]">
              <div className="gradient-header px-6 py-4 flex items-center justify-between">
                 <h3 className="text-white font-bold text-sm tracking-widest uppercase">Audit Log Details</h3>
                 <button onClick={() => setSelectedLog(null)} className="text-white/50 hover:text-white p-1">
                   <HiOutlineX className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto bg-slate-50 content-card-body m-0 border-none">
                 <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a3a6e] mb-1">Target Object ID</p>
                    <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 font-mono tracking-wide">
                      {selectedLog.targetId}
                    </code>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a3a6e] mb-1">Payload / Details</p>
                    <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.details, null, 2) === '{}' ? 'No additional payload details.' : JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                 </div>
                 {selectedLog.ipAddress && (
                   <div className="mt-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#1a3a6e] mb-1">IP Address recorded</p>
                      <p className="text-xs font-mono text-slate-500">{selectedLog.ipAddress}</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
