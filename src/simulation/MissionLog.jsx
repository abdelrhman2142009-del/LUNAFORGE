export default function MissionLog({ entries = [] }) {
  return (
    <section className="lfx-card" aria-labelledby="lfx-log-title">
      <div className="lfx-section-kicker">FLIGHT RECORD</div>
      <h2 id="lfx-log-title">Mission log</h2>
      {entries.length === 0 ? (
        <p className="lfx-muted">Mission updates will appear here as the simulation runs.</p>
      ) : (
        <ol className="lfx-log-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <time>{entry.time}</time>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.message}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
