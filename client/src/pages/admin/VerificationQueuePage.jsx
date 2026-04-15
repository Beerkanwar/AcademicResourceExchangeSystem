import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  HiOutlineShieldCheck,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineEye
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function VerificationQueuePage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/verification/pending');
      setResources(res.data.data.resources || []);
    } catch (error) {
      toast.error('Failed to load pending resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/verification/${id}/approve`);
      toast.success('Resource approved successfully');
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve resource');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      await api.post(`/verification/${rejectingId}/reject`, { reason: rejectReason });
      toast.success('Resource rejected');
      setResources((prev) => prev.filter((r) => r._id !== rejectingId));
      setRejectingId(null);
      setRejectReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject resource');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Verification Queue</h1>
          <p className="text-base text-slate-500 mt-2 font-medium">
            Review and approve student-uploaded academic resources.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white px-5 py-2.5 rounded-lg border border-slate-200 shadow-sm">
          <HiOutlineShieldCheck className="w-4 h-4 text-nitj-gold" />
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{resources.length}</span> Pending
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-nitj-gold rounded-full animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Loading Queue...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="card p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <HiOutlineShieldCheck className="w-10 h-10 text-nitj-gold/40" />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Queue Clear</h3>
            <p className="text-slate-500 mt-2 text-sm font-medium">All student uploads have been reviewed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {resources.map((resource) => (
              <div key={resource._id} className="card p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
                  <HiOutlineDocumentText className="w-8 h-8 text-slate-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-800 truncate">{resource.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span>{resource.department?.code || 'N/A'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{resource.subject?.code || 'N/A'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>By: {resource.uploadedBy?.firstName} {resource.uploadedBy?.lastName} ({resource.uploadedBy?.role})</span>
                  </div>
                  {resource.description && (
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2 pr-4">{resource.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <button 
                    onClick={() => navigate(`/resources/${resource._id}`)}
                    className="flex-1 md:flex-none h-11 px-4 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors"
                  >
                    <HiOutlineEye className="w-4 h-4" /> View
                  </button>
                  <button 
                    onClick={() => handleApprove(resource._id)}
                    className="flex-1 md:flex-none h-11 px-4 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors"
                  >
                    <HiOutlineCheck className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => setRejectingId(resource._id)}
                    className="flex-1 md:flex-none h-11 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors"
                  >
                    <HiOutlineX className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRejectingId(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-2">Reject Resource</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              Please provide a reason for rejecting this document. This will be visible to the uploader.
            </p>
            <form onSubmit={handleReject}>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Incomplete notes, irrelevant material..."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-nitj-gold focus:ring-4 focus:ring-nitj-gold/20 outline-none transition-all resize-none text-sm font-medium"
                autoFocus
              />
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => { setRejectingId(null); setRejectReason(''); }}
                  className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-danger text-black text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-danger/20 hover:bg-red-600 transition-colors"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
