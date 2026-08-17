/**
 * Consistent empty-state panel for list pages.
 */
export default function EmptyState({
  icon = '🔎',
  title,
  description,
  action = null,
}) {
  return (
    <div className="card p-16 sm:p-24 text-center border-none shadow-sm bg-white rounded-[10px] animate-fade-in">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
        {typeof icon === 'string' ? <span className="text-5xl">{icon}</span> : icon}
      </div>
      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{title}</h3>
      {description && (
        <p className="text-base text-slate-500 mt-3 max-w-md mx-auto leading-relaxed font-medium">
          {description}
        </p>
      )}
      {action && <div className="mt-10">{action}</div>}
    </div>
  );
}
