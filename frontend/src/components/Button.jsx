import { Link } from 'react-router-dom';

const VARIANTS = {
  primary: 'bg-ink text-paper hover:bg-ink-soft',
  amber: 'bg-amber text-ink hover:bg-amber-dark',
  outline: 'border-2 border-ink text-ink hover:bg-ink hover:text-paper',
  ghost: 'text-ink hover:bg-ink/5',
};

export default function Button({
  children,
  variant = 'primary',
  to,
  href,
  className = '',
  as,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-semibold text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal';
  const cls = `${base} ${VARIANTS[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
