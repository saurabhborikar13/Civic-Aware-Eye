const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'var(--color-status-pending)' },
  in_progress: { label: 'In Progress', color: 'var(--color-status-progress)' },
  resolved: { label: 'Resolved', color: 'var(--color-status-resolved)' },
  rejected: { label: 'Rejected', color: 'var(--color-status-rejected)' },
};

export default function StampBadge({ status, size = 'md' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };
  return (
    <span
      className={`stamp inline-block uppercase font-bold ${sizes[size]}`}
      style={{ color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

export { STATUS_CONFIG };
