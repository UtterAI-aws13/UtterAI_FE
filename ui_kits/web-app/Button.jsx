const buttonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    borderRadius: 999,
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  sizes: {
    sm: { fontSize: 12, padding: '6px 12px', height: 30 },
    md: { fontSize: 13, padding: '9px 18px', height: 36 },
    lg: { fontSize: 14, padding: '11px 22px', height: 44 },
  },
  variants: {
    primary:   { background: '#1A3C34', color: '#fff' },
    secondary: { background: '#fff', color: '#1A3C34', borderColor: '#1A3C34' },
    ghost:     { background: 'transparent', color: '#2D6A4F' },
    danger:    { background: '#EF4444', color: '#fff' },
    soft:      { background: '#ECF5EF', color: '#1A3C34' },
  },
  hovers: {
    primary:   { background: '#0F2A24' },
    secondary: { background: '#ECF5EF' },
    ghost:     { background: '#ECF5EF' },
    danger:    { background: '#B91C1C' },
    soft:      { background: '#D8ECDF' },
  },
};

const Button = ({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, disabled, style, type = 'button' }) => {
  const [hover, setHover] = React.useState(false);
  const compiled = {
    ...buttonStyles.base,
    ...buttonStyles.sizes[size],
    ...buttonStyles.variants[variant],
    ...(hover && !disabled ? buttonStyles.hovers[variant] : {}),
    ...(disabled ? { background: '#EEF1EF', color: '#9AA3A0', borderColor: 'transparent', cursor: 'not-allowed' } : {}),
    ...style,
  };
  const iconSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;
  return (
    <button
      type={type}
      style={compiled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {icon && <Icon name={icon} size={iconSize} strokeWidth={2.2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} strokeWidth={2.2} />}
    </button>
  );
};

Object.assign(window, { Button });
