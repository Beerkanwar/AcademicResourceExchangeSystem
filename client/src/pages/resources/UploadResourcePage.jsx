import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineTag,
  HiOutlineAcademicCap,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const FILE_ICONS = {
  pdf: '📄', ppt: '📊', pptx: '📊', doc: '📝', docx: '📝',
  txt: '📃', zip: '📦', rar: '📦', xls: '📈', xlsx: '📈', csv: '📈',
  png: '🖼️', jpg: '🖼️', jpeg: '🖼️',
};

export default function UploadResourcePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    department: '',
    semester: '',
    subject: '',
    courseCode: '',
    academicYear: '',
    author: '',
    tags: '',
  });

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data.data || []);
      } catch { /* ignore */ }
    };
    fetchDepts();
  }, []);

  // Fetch subjects when department or semester changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!form.department) { setSubjects([]); return; }
      try {
        const params = { department: form.department };
        if (form.semester) params.semester = form.semester;
        const res = await api.get('/subjects', { params });
        setSubjects(res.data.data || []);
      } catch { setSubjects([]); }
    };
    fetchSubjects();
  }, [form.department, form.semester]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) selectFile(dropped);
  };

  const selectFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    const allowed = 'pdf,ppt,pptx,doc,docx,txt,zip,rar,xlsx,xls,csv,png,jpg,jpeg'.split(',');
    if (!allowed.includes(ext)) {
      toast.error(`File type .${ext} is not allowed`);
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit');
      return;
    }
    setFile(f);
    // Auto-fill title from filename
    if (!form.title) {
      setForm((prev) => ({ ...prev, title: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') }));
    }
  };

  const removeFile = () => { setFile(null); setProgress(0); };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }

    const formData = new FormData();
    formData.append('file', file);
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });

    setUploading(true);
    setProgress(0);

    try {
      await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
        },
      });
      toast.success('Resource uploaded successfully!');
      navigate('/resources');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const ext = file ? file.name.split('.').pop().toLowerCase() : '';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Upload Resource</h1>
          <p className="text-base text-slate-500 mt-2 font-medium">
            Contribute high-quality academic materials to the NITJ repository.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white px-4 py-2 rounded-lg border border-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-nitj-gold shadow-[0_0_8px_rgba(214,158,46,0.4)]" />
          Internal Secure Upload
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column — File and Main Details */}
        <div className="lg:col-span-2 space-y-10">
          {/* Drop Zone */}
          <div
            className={`card p-0 overflow-hidden transition-all duration-300 border-none shadow-sm ${dragging ? 'ring-4 ring-nitj-gold/20' : 'hover:shadow-xl'}`}
            style={{ borderRadius: '10px' }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {!file ? (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center py-24 px-8 cursor-pointer group bg-slate-50/30"
              >
                <div
                  className="w-24 h-24 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 bg-white shadow-xl"
                  style={{ border: '2px dashed rgba(214,158,46,0.2)' }}
                >
                  <HiOutlineCloudUpload className="w-12 h-12 text-nitj-gold" />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Deploy Academic File</h3>
                <p className="text-base text-slate-500 mt-3 max-w-sm text-center font-medium">
                  Drag and drop your document here or <span className="text-nitj-gold font-black underline decoration-2 underline-offset-4">select from system</span>
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  {['PDF', 'PPTX', 'DOCX', 'ZIP'].map(ext => (
                    <span key={ext} className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[11px] font-black text-slate-400 tracking-widest">{ext}</span>
                  ))}
                </div>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && selectFile(e.target.files[0])}
                />
              </label>
            ) : (
              <div className="p-10 bg-white">
                <div className="flex items-center gap-8">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 bg-slate-50 shadow-inner"
                  >
                    {FILE_ICONS[ext] || '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-slate-800 truncate tracking-tight">{file.name}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                      {formatSize(file.size)} • {ext} archive
                    </p>
                  </div>
                  {!uploading && (
                    <button type="button" onClick={removeFile} className="p-4 rounded-xl bg-slate-50 text-slate-400 hover:text-danger hover:bg-danger/5 transition-all shadow-sm">
                      <HiOutlineX className="w-6 h-6" />
                    </button>
                  )}
                </div>
                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-10">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-[11px] font-black text-nitj-gold uppercase tracking-[0.25em]">Transmission in Progress...</span>
                      <span className="text-lg font-black text-slate-800">{progress}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #d69e2e, #ecc94b)' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="card p-10 space-y-8 border-none shadow-sm bg-white" style={{ borderRadius: '10px' }}>
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
              <div className="p-3 rounded-xl bg-slate-50 text-slate-600 shadow-sm">
                 <HiOutlineDocumentText className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Resource Classification</h2>
            </div>

            <div className="space-y-8">
              <Field label="Document Identification (Title) *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. ADVANCED ALGORITHMS - UNIT 1 LECTURE NOTES" />
              
              <div className="space-y-3">
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Resource Context / Abstract</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide a detailed technical abstract of the resource content..."
                  rows={5}
                  className="input-field !pl-5 pt-4 h-auto text-base"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Field label="Academic Author / Professor" value={form.author} onChange={(v) => setForm({ ...form, author: v })} placeholder="e.g. DR. R.K. SINGH" />
                <Field label="Academic Year" value={form.academicYear} onChange={(v) => setForm({ ...form, academicYear: v })} placeholder="e.g. 2026-27" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Categorization */}
        <div className="space-y-10">
          {/* Categorization */}
          <div className="card p-10 space-y-8 border-none shadow-sm bg-white" style={{ borderRadius: '10px' }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-50 text-slate-600 shadow-sm">
                 <HiOutlineAcademicCap className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Hierarchy</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value, subject: '' })}
                  className="input-field !pl-5 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem_1.5rem] bg-[right_1rem_center] bg-no-repeat font-bold text-slate-700"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Semester Cycle</label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value, subject: '' })}
                  className="input-field !pl-5 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem_1.5rem] bg-[right_1rem_center] bg-no-repeat font-bold text-slate-700"
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Subject Module</label>
                <select
                  value={form.subject}
                  onChange={(e) => {
                    const sub = subjects.find((s) => s._id === e.target.value);
                    setForm({ ...form, subject: e.target.value, courseCode: sub?.code || form.courseCode });
                  }}
                  className="input-field !pl-4 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                  disabled={!form.department}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <Field label="System Course Code" value={form.courseCode} onChange={(v) => setForm({ ...form, courseCode: v })} placeholder="e.g. CSP-301" />
            </div>
          </div>

          {/* Tags */}
          <div className="card p-10 space-y-8 border-none shadow-sm bg-white" style={{ borderRadius: '10px' }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-50 text-slate-600 shadow-sm">
                 <HiOutlineTag className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Keywords</h2>
            </div>
            
            <div className="space-y-6">
              <Field
                label="Search Keywords (CSV)"
                value={form.tags}
                onChange={(v) => setForm({ ...form, tags: v })}
                placeholder="e.g. notes, midterm, verified"
              />
              {form.tags && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <button type="submit" disabled={uploading || !file} className="btn-primary h-[56px] text-base font-black uppercase tracking-widest shadow-2xl shadow-primary/20">
              {uploading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><HiOutlineCloudUpload className="w-6 h-6" /> Deploy Resource</>
              )}
            </button>
            <button type="button" onClick={() => navigate(-1)}
              className="w-full h-[52px] rounded-xl text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-danger hover:bg-danger/5 transition-all border border-transparent hover:border-danger/10">
              Abort Transmission
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold mb-1" style={{ color: '#4a5568' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-field !pl-3" />
    </div>
  );
}
