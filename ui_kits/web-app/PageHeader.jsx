const headerStyles = {
  root: {
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
    padding: '28px 32px 20px',
    gap: 24,
  },
  crumbs: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 500, color: '#6B7280',
    marginBottom: 8,
  },
  crumbLink: { color: '#6B7280', cursor: 'pointer', textDecoration: 'none' },
  title: {
    fontSize: 26, fontWeight: 700, color: '#1A1A1A',
    letterSpacing: '-0.015em', lineHeight: 1.2,
  },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  actions: { display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 },
};

const PageHeader = ({ title, subtitle, breadcrumbs, actions }) => {
  return (
    <div style={headerStyles.root}>
      <div>
        {breadcrumbs && (
          <div style={headerStyles.crumbs}>
            {breadcrumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon name="chevronRight" size={12} color="#9AA3A0" strokeWidth={2} />}
                <a style={headerStyles.crumbLink} onClick={c.onClick}>{c.label}</a>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 style={headerStyles.title}>{title}</h1>
        {subtitle && <div style={headerStyles.subtitle}>{subtitle}</div>}
      </div>
      {actions && <div style={headerStyles.actions}>{actions}</div>}
    </div>
  );
};

Object.assign(window, { PageHeader });
