import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineDownload, HiOutlineExclamationCircle, HiOutlineLockClosed } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { signDownloadUrl } from '../../api/axios';
import { getPreviewMeta } from '../../utils/previewMeta';

/**
 * Inline preview for PDFs (iframe) and images (img), loaded via signed preview URLs.
 * Unsupported types show a download-only fallback CTA.
 */
export default function ResourcePreview({
  resourceId,
  mimeType,
  fileType,
  previewable: previewableProp,
  previewKind: previewKindProp,
  fileIcon = '📄',
  onDownload,
}) {
  const { user } = useAuth();
  const { previewable, previewKind } = getPreviewMeta({
    mimeType,
    fileType,
    previewable: previewableProp,
    previewKind: previewKindProp,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setPreviewUrl(null);
      setError(null);

      if (!previewable || !resourceId) {
        return;
      }

      if (!user) {
        setError('auth');
        return;
      }

      setLoading(true);
      try {
        const signed = await signDownloadUrl(resourceId, { purpose: 'preview' });
        if (cancelled) return;
        if (!signed?.url) {
          setError('load');
          return;
        }
        setPreviewUrl(signed.url);
      } catch {
        if (!cancelled) setError('load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [resourceId, previewable, previewKind, user]);

  if (!previewable) {
    return (
      <FallbackPanel
        icon={<span className="text-5xl">{fileIcon}</span>}
        title="Preview not available"
        description={`Inline preview is not supported for .${String(fileType || 'file').toUpperCase()} files. Download the resource to view its contents.`}
        onDownload={onDownload}
      />
    );
  }

  if (error === 'auth') {
    return (
      <FallbackPanel
        icon={<HiOutlineLockClosed className="w-12 h-12 text-[#1a3a6e]" />}
        title="Sign in to preview"
        description="Previews use a short-lived signed URL tied to your account. Log in to view this file inline."
        extra={
          <Link to="/login" className="mt-6 btn-nitj-primary px-6 py-2 inline-flex items-center">
            Log in to preview
          </Link>
        }
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-sm text-[#6c7a8e] gap-3">
        <div className="w-8 h-8 border-4 border-[#c5d8ed] border-t-[#1a3a6e] rounded-full animate-spin" />
        Loading secure preview…
      </div>
    );
  }

  if (error || !previewUrl) {
    return (
      <FallbackPanel
        icon={<HiOutlineExclamationCircle className="w-12 h-12 text-[#dd6b20]" />}
        title="Preview unavailable"
        description="You may not have permission to preview this file, or the signed preview link could not be loaded."
        onDownload={onDownload}
      />
    );
  }

  if (previewKind === 'pdf') {
    return (
      <div className="relative w-full h-[min(70vh,720px)] bg-[#e8eef5]">
        <iframe
          src={previewUrl}
          className="w-full h-full border-none bg-white"
          title="PDF preview"
        />
        <div className="absolute bottom-3 right-3">
          <button
            type="button"
            onClick={onDownload}
            className="btn-nitj-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 shadow-md bg-white/95"
          >
            <HiOutlineDownload className="w-4 h-4" /> Download
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[320px] h-[min(70vh,720px)] bg-[#f8fbff] flex items-center justify-center p-6">
      <img
        src={previewUrl}
        alt="Resource preview"
        className="max-h-full max-w-full object-contain rounded-lg shadow-md bg-white"
      />
      <div className="absolute bottom-3 right-3">
        <button
          type="button"
          onClick={onDownload}
          className="btn-nitj-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 shadow-md bg-white/95"
        >
          <HiOutlineDownload className="w-4 h-4" /> Download
        </button>
      </div>
    </div>
  );
}

function FallbackPanel({ icon, title, description, onDownload, extra = null }) {
  return (
    <div className="flex flex-col items-center justify-center h-[420px] text-center p-8 bg-[#f8fbff]">
      <div className="mb-4">{icon}</div>
      <h4 className="text-lg font-bold text-[#1a3a6e] mb-2">{title}</h4>
      <p className="text-sm text-[#6c7a8e] max-w-md">{description}</p>
      {extra}
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          className="mt-6 btn-nitj-primary px-6 py-2 inline-flex items-center gap-2"
        >
          <HiOutlineDownload className="w-5 h-5" />
          Download to view
        </button>
      )}
    </div>
  );
}
