const StatsPanel = ({ stats, loading }) => {
  const cards = [
    { label: 'Total Tasks', value: stats?.total ?? 0, accent: true },
    { label: 'Completed', value: stats?.completed ?? 0 },
    { label: 'Pending', value: stats?.pending ?? 0 },
    { label: 'Overdue', value: stats?.overdue ?? 0 },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} className={`stat-card ${card.accent ? 'accent' : ''}`}>
          <div className="stat-value">{loading ? '—' : card.value}</div>
          <div className="stat-label">{card.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;
