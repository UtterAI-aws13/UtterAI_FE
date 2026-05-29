const statCardStyles = {
  root: {
    background: '#fff',
    border: '1px solid #E2E6E4',
    borderRadius: 12,
    padding: '18px 20px',
    boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  label: {
    fontSize: 11, fontWeight: 600, color: '#6B7280',
    letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  value: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 36, fontWeight: 500, color: '#1A3C34',
    fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
    letterSpacing: '-0.01em',
  },
  delta: (tone) => ({
    fontSize: 11, fontWeight: 500, marginTop: 2,
    color: tone === 'pos' ? '#15803D' : tone === 'neg' ? '#B91C1C' : '#6B7280',
    display: 'inline-flex', alignItems: 'center', gap: 4,
  }),
};

const StatCard = ({ label, value, delta, tone = 'neutral', icon }) => {
  return (
    <div style={statCardStyles.root}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={statCardStyles.label}>{label}</div>
        {icon && (
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ECF5EF', color: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={15} strokeWidth={1.8} />
          </div>
        )}
      </div>
      <div style={statCardStyles.value}>{value}</div>
      {delta && <div style={statCardStyles.delta(tone)}>{delta}</div>}
    </div>
  );
};

Object.assign(window, { StatCard });
