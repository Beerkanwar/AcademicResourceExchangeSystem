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
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <section className="panel">
            <div className="content-card-header">
              <HiOutlineCloudUpload className="w-5 h-5 mr-2" /> Upload Protocol
            </div>
            <div className="content-card-body p-6">
              <div
                className={`border-2 border-dashed ${dragging ? 'border-[#e8a020] bg-[#fffaf0]' : 'border-[#aac0d8] bg-[#f8fbff]'} rounded-lg transition-all text-center`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {!file ? (
                  <label htmlFor="file-upload" className="block py-16 cursor-pointer">
                    <HiOutlineCloudUpload className="w-12 h-12 text-[#1a3a6e] mx-auto mb-3" />
                    <p className="text-sm font-bold text-[#1a3a6e]">Click to upload or drag and drop</p>
                    <p className="text-xs text-[#6c7a8e] mt-1">PDF, PPT, DOC, ZIP (Max. 50MB)</p>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => e.target.files[0] && selectFile(e.target.files[0])}
                    />
                  </label>
                ) : (
                  <div className="p-6">
                    <div className="flex items-center gap-4 bg-white p-4 border border-[#c5d8ed] rounded-md shadow-sm">
                      <div className="text-3xl">{FILE_ICONS[ext] || '📄'}</div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-bold text-[#1a3a6e] truncate text-sm">{file.name}</p>
                        <p className="text-xs text-[#6c7a8e] uppercase">{formatSize(file.size)}</p>
                      </div>
                      {!uploading && (
                        <button type="button" onClick={removeFile} className="text-[#dc3545] hover:bg-[#ffebeb] p-2 rounded">
                          <HiOutlineX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    {uploading && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-bold text-[#1a3a6e] mb-1">
                          <span>Uploading...</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#e8eef5] overflow-hidden">
                          <div className="h-full bg-[#1a3a6e] transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Metadata */}
          <section className="panel">
            <div className="content-card-header">
              <HiOutlineDocumentText className="w-5 h-5 mr-2" /> Content Metdata
            </div>
            <div className="content-card-body p-6">
              <div className="space-y-4">
                <Field label="Document Identification (Title) *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. ADVANCED ALGORITHMS" />
                
                <div className="space-y-1">
                  <label className="nitj-label">Resource Context / Abstract</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Provide abstract..."
                    className="form-control nitj-textarea w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Academic Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} placeholder="DR. R.K. SINGH" />
                  <Field label="Academic Year" value={form.academicYear} onChange={(v) => setForm({ ...form, academicYear: v })} placeholder="2026-27" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column — Categorization */}
        <div className="space-y-6">
          <section className="panel">
            <div className="content-card-header">
              <HiOutlineAcademicCap className="w-5 h-5 mr-2" /> Hierarchy
            </div>
            <div className="content-card-body p-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="nitj-label">Department *</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value, subject: '' })}
                    className="form-select nitj-select w-full"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="nitj-label">Semester</label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value, subject: '' })}
                    className="form-select nitj-select w-full"
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="nitj-label">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => {
                      const sub = subjects.find((s) => s._id === e.target.value);
                      setForm({ ...form, subject: e.target.value, courseCode: sub?.code || form.courseCode });
                    }}
                    className="form-select nitj-select w-full"
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
          </section>

          <section className="panel">
            <div className="content-card-header">
              <HiOutlineTag className="w-5 h-5 mr-2" /> Keywords
            </div>
            <div className="content-card-body p-6">
              <Field
                label="Tags (Comma separated)"
                value={form.tags}
                onChange={(v) => setForm({ ...form, tags: v })}
                placeholder="e.g. notes, midterm"
              />
              {form.tags && (
                <div className="flex flex-wrap gap-1 pt-3">
                  {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} className="text-[10px] bg-[#e8eef5] text-[#1a3a6e] px-2 py-0.5 rounded-md font-bold uppercase">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="flex flex-col gap-2">
            <button type="submit" disabled={uploading || !file} className="btn-nitj-submit w-full py-3 flex items-center justify-center gap-2">
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><HiOutlineCloudUpload className="w-5 h-5" /> Deploy Resource</>
              )}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-nitj-secondary w-full py-2">
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
    <div className="space-y-1">
      <label className="nitj-label">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="form-control nitj-input w-full" />
    </div>
  );
}
