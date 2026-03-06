interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export default function Button({ variant = 'primary', loading = false, children, disabled, className = '', ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : variant === 'danger' ? 'btn-danger' : 'btn-ghost';
  const classes = `btn ${variantClass} ${className}`.trim();

  return (
    <button {...props} disabled={disabled || loading} className={classes}>
      {loading ? '⏳ Loading...' : children}
    </button>
  );
}
