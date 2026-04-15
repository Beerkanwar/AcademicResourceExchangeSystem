import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import {
  HiOutlineAcademicCap,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineCheckCircle,
  HiOutlineBan,
  HiOutlineX
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleToggleStatus = async (dept) => {
    try {
      await api.put(`/departments/${dept._id}`, { isActive: !dept.isActive });
      toast.success(`Department ${dept.isActive ? 'deactivated' : 'activated'}`);
      fetchDepartments();
    } catch {
      toast.error('Failed to change status');
    }
  };

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#1a3a6e] uppercase tracking-tight flex items-center gap-2">
            <HiOutlineAcademicCap className="w-8 h-8 text-[#d69e2e]" /> Academic Departments
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage the institution's faculties available in the system.
          </p>
        </div>
        <button onClick={() => { setEditDept(null); setShowModal(true); }} className="btn-nitj-submit flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {/* Filter */}
      <div className="panel shadow-sm">
        <div className="content-card-body p-4 border-t-0 rounded-t-lg">
          <div className="relative max-w-sm">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or code..."
              className="nitj-input w-full pl-[36px]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="panel shadow-sm overflow-hidden">
        <div className="overflow-x-auto content-card-body p-0 border-t-0 rounded-t-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8fbff] border-b border-[#c5d8ed]">
                {['Department Name', 'Code', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-black uppercase tracking-widest px-6 py-4 text-[#1a3a6e]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8eef5]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array(4).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 rounded bg-slate-100 animate-pulse w-32" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-sm text-slate-400 font-medium tracking-wide">
                    No departments found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredDepts.map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{dept.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-[#1a3a6e]/10 text-[#1a3a6e] font-black text-[10px] uppercase tracking-widest rounded">
                        {dept.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 font-black text-[10px] uppercase tracking-widest rounded ${dept.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => { setEditDept(dept); setShowModal(true); }}
                          className="px-3 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                        >
                          <HiOutlinePencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(dept)}
                          className={`px-3 py-1.5 rounded transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${dept.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                          {dept.isActive ? <HiOutlineBan className="w-3.5 h-3.5" /> : <HiOutlineCheckCircle className="w-3.5 h-3.5" />} 
                          {dept.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <DepartmentModal
          dept={editDept}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchDepartments(); }}
        />
      )}
    </div>
  );
}

function DepartmentModal({ dept, onClose, onSaved }) {
  const isEdit = !!dept;
  const [form, setForm] = useState({
    name: dept?.name || '',
    code: dept?.code || '',
    description: dept?.description || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/departments/${dept._id}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/departments', form);
        toast.success('Department created');
      }
      onSaved();
    } catch {
      toast.error('Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl overflow-hidden bg-white shadow-2xl animate-scale-in">
        <div className="gradient-header px-6 py-4 flex items-center justify-between pointer-events-auto">
          <h3 className="text-white font-bold text-[15px]">{isEdit ? 'Edit Department' : 'Create Department'}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-black tracking-widest uppercase text-slate-500 mb-1">Department Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Computer Science and Engineering"
              className="nitj-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-black tracking-widest uppercase text-slate-500 mb-1">Department Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. CS"
              className="nitj-input w-full uppercase"
              required
            />
          </div>
          <div>
             <label className="block text-[11px] font-black tracking-widest uppercase text-slate-500 mb-1">Description (Optional)</label>
             <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="nitj-textarea w-full"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-nitj-submit flex-1 text-xs">
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
