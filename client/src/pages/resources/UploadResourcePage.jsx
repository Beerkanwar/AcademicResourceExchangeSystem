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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#1a202c' }}>Upload Resource</h1>
        <p className="text-[13px] mt-0.5" style={{ color: '#a0aec0' }}>
          Share academic materials with your peers at NITJ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop Zone */}
        <div
          className={`card p-0 overflow-hidden transition-all ${dragging ? 'ring-2 ring-offset-2' : ''}`}
          style={dragging ? { borderColor: '#d69e2e', ringColor: '#d69e2e' } : {}}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {!file ? (
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center py-14 px-6 cursor-pointer group"
              style={{ background: 'linear-gradient(180deg, #f7fafc 0%, #ffffff 100%)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg, #d69e2e20, #ecc94b20)', border: '2px dashed #d69e2e40' }}
              >
                <HiOutlineCloudUpload className="w-8 h-8" style={{ color: '#d69e2e' }} />
              </div>
              <p className="text-[14px] font-semibold" style={{ color: '#2d3748' }}>
                Drop your file here or <span style={{ color: '#d69e2e' }}>browse</span>
              </p>
              <p className="text-[12px] mt-1" style={{ color: '#a0aec0' }}>
                PDF, PPT, DOC, TXT, ZIP, Excel, Images • Max 50MB
              </p>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip,.rar,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                onChange={(e) => e.target.files[0] && selectFile(e.target.files[0])}
              />
            </label>
          ) : (
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: '#1a365d10' }}
                >
                  {FILE_ICONS[ext] || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold truncate" style={{ color: '#2d3748' }}>{file.name}</p>
                  <p className="text-[12px]" style={{ color: '#a0aec0' }}>
                    {formatSize(file.size)} • .{ext.toUpperCase()}
                  </p>
                </div>
                {!uploading && (
                  <button type="button" onClick={removeFile} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#e53e3e' }}>
                    <HiOutlineX className="w-5 h-5" />
                  </button>
                )}
              </div>
              {/* Upload Progress */}
              {uploading && (
                <div className="mt-3">
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #d69e2e, #ecc94b)' }}
                    />
                  </div>
                  <p className="text-[11px] mt-1 text-right font-medium" style={{ color: '#d69e2e' }}>{progress}%</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineDocumentText className="w-5 h-5" style={{ color: '#1a365d' }} />
            <h2 className="text-[15px] font-bold" style={{ color: '#2d3748' }}>Resource Details</h2>
          </div>

          <Field label="Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Data Structures — Linked List Notes" />
          <div>
            <label className="block text-[12px] font-semibold mb-1" style={{ color: '#4a5568' }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the resource content..."
              rows={3}
              className="input-field !pl-3"
              style={{ resize: 'vertical' }}
            />
          </div>
          <Field label="Author / Professor" value={form.author} onChange={(v) => setForm({ ...form, author: v })} placeholder="e.g. Dr. Kumar" />
        </div>

        {/* Academic Details */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineAcademicCap className="w-5 h-5" style={{ color: '#1a365d' }} />
            <h2 className="text-[15px] font-bold" style={{ color: '#2d3748' }}>Academic Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold mb-1" style={{ color: '#4a5568' }}>Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value, subject: '' })}
                className="input-field !pl-3"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1" style={{ color: '#4a5568' }}>Semester</label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value, subject: '' })}
                className="input-field !pl-3"
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold mb-1" style={{ color: '#4a5568' }}>Subject</label>
              <select
                value={form.subject}
                onChange={(e) => {
                  const sub = subjects.find((s) => s._id === e.target.value);
                  setForm({ ...form, subject: e.target.value, courseCode: sub?.code || form.courseCode });
                }}
                className="input-field !pl-3"
                disabled={!form.department}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <Field label="Course Code" value={form.courseCode} onChange={(v) => setForm({ ...form, courseCode: v })} placeholder="e.g. CS301" />
          </div>

          <Field label="Academic Year" value={form.academicYear} onChange={(v) => setForm({ ...form, academicYear: v })} placeholder="e.g. 2025-26" />
        </div>

        {/* Tags */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineTag className="w-5 h-5" style={{ color: '#1a365d' }} />
            <h2 className="text-[15px] font-bold" style={{ color: '#2d3748' }}>Tags</h2>
          </div>
          <Field
            label="Tags (comma-separated)"
            value={form.tags}
            onChange={(v) => setForm({ ...form, tags: v })}
            placeholder="e.g. notes, midterm, important, linked-list"
          />
          {form.tags && (
            <div className="flex flex-wrap gap-1.5">
              {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                <span key={i} className="badge" style={{ background: '#1a365d10', color: '#1a365d' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
            style={{ border: '1px solid #e2e8f0', color: '#718096' }}>
            Cancel
          </button>
          <button type="submit" disabled={uploading || !file} className="btn-primary flex-[2]">
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
            ) : (
              <><HiOutlineCloudUpload className="w-5 h-5" /> Upload Resource</>
            )}
          </button>
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
