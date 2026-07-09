export default function Input({ label, error, className = '', textarea, ...rest }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/60">
          {label}
        </span>
      )}
      <Tag
        className={`w-full rounded-md border border-ink/20 bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20 ${textarea ? 'min-h-[110px] resize-y' : ''} ${className}`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs font-medium text-status-rejected">{error}</span>}
    </label>
  );
}
