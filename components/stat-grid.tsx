type StatGridProps = {
  items: Array<{ label: string; value: string }>;
};

export function StatGrid({ items }: StatGridProps) {
  return (
    <div className="stats-grid">
      {items.map((item) => (
        <div key={item.label} className="stat-card">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
