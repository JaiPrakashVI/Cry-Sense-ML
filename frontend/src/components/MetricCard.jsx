export default function MetricCard({ icon: Icon, label, value, sublabel, color = 'var(--primary)' }) {
  return (
    <div className="metric-card card">
      {Icon && (
        <div className="metric-icon" style={{ background: `${color}15`, color }}>
          <Icon size={20} />
        </div>
      )}
      <div className="metric-content">
        <span className="metric-value">{value}</span>
        <span className="metric-label">{label}</span>
        {sublabel && <span className="metric-sublabel">{sublabel}</span>}
      </div>
    </div>
  );
}
