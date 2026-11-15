import { useCallback, useEffect, useState } from "react";
import "./NasaEventsPanel.css";

const EVENTS_URL = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=8";

export default function NasaEventsPanel() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadEvents = useCallback(async (signal) => {
    setStatus("loading");
    try {
      const response = await fetch(EVENTS_URL, { signal });
      if (!response.ok) throw new Error(`NASA EONET returned HTTP ${response.status}`);
      const payload = await response.json();
      setEvents(Array.isArray(payload.events) ? payload.events : []);
      setUpdatedAt(new Date());
      setStatus("ready");
    } catch (error) {
      if (error.name !== "AbortError") setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadEvents(controller.signal);
    return () => controller.abort();
  }, [loadEvents]);

  return (
    <section className="lf-nasa-events" aria-labelledby="lf-nasa-events-heading">
      <div className="lf-nasa-events-heading">
        <div>
          <span className="lf-nasa-kicker">NASA EONET / EARTH OBSERVATORY</span>
          <h2 id="lf-nasa-events-heading">Earth events happening now</h2>
          <p>NASA-curated natural-event reports that can inspire new observation missions.</p>
        </div>
        <button type="button" onClick={() => loadEvents()} disabled={status === "loading"}>
          {status === "loading" ? "Updating…" : "Refresh"}
        </button>
      </div>

      {status === "loading" && <p className="lf-nasa-events-state">Loading NASA event feed…</p>}
      {status === "error" && (
        <div className="lf-nasa-events-state">
          NASA EONET could not be reached. Check your connection and refresh.
        </div>
      )}
      {status === "ready" && events.length === 0 && (
        <p className="lf-nasa-events-state">No currently open events were returned by the feed.</p>
      )}

      {status === "ready" && events.length > 0 && (
        <div className="lf-nasa-events-grid">
          {events.map((event) => {
            const latestGeometry = event.geometry?.[event.geometry.length - 1];
            const categoryNames = (event.categories ?? []).map((category) => category.title).join(" · ");
            const sourceUrl = event.sources?.[0]?.url;
            return (
              <article className="lf-nasa-event" key={event.id}>
                <span className="lf-nasa-event-category">{categoryNames || "Natural event"}</span>
                <h3>{event.title}</h3>
                {event.description && <p>{event.description}</p>}
                <div className="lf-nasa-event-meta">
                  <span>{latestGeometry?.date ? new Date(latestGeometry.date).toLocaleDateString() : "Date not supplied"}</span>
                  {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer">Event source ↗</a>}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="lf-nasa-events-credit">
        Feed: NASA Earth Observatory Natural Event Tracker (EONET) v3. Event records are curated metadata,
        not direct measurements made by the LUNAFORGE spacecraft.
        {updatedAt ? ` Last updated ${updatedAt.toLocaleTimeString()}.` : ""}
      </p>
    </section>
  );
}
