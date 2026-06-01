export default function DashboardCard({ title, value, icon, variant = '' }) {
  const variantClass = variant === 'success' ? 'variant-green'
    : variant === 'warning' || variant === 'amber' ? 'variant-amber'
    : variant === 'accent' || variant === 'purple' ? 'variant-purple'
    : '';

  return (
    <div className={`stat-card ${variantClass}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-title">{title}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}
