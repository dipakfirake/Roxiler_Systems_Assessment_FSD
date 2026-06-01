export default function DashboardCard({ title, value, icon, variant = 'accent' }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-title">{title}</div>
      <div className="stat-card-value">{value ?? '—'}</div>
    </div>
  );
}
