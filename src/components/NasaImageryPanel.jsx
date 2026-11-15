import { useMemo, useState } from "react";
import {
  buildNileDeltaImageryUrl,
  getNasaObservationDate,
  NASA_IMAGERY_LAYERS,
} from "../data/nasaEarthData.js";
import "./NasaImageryPanel.css";

export default function NasaImageryPanel() {
  const [layerId, setLayerId] = useState(NASA_IMAGERY_LAYERS[0].id);
  const [daysBack, setDaysBack] = useState(2);
  const [failed, setFailed] = useState(false);
  const date = useMemo(() => getNasaObservationDate(daysBack), [daysBack]);
  const layer = NASA_IMAGERY_LAYERS.find((item) => item.id === layerId) ?? NASA_IMAGERY_LAYERS[0];
  const imageUrl = useMemo(
    () => buildNileDeltaImageryUrl({ layer: layerId, date }),
    [layerId, date],
  );

  function changeLayer(nextLayer) {
    setLayerId(nextLayer);
    setDaysBack(2);
    setFailed(false);
  }

  function changeDate(direction) {
    setDaysBack((current) => Math.max(0, Math.min(14, current + direction)));
    setFailed(false);
  }

  return (
    <section className="lf-nasa-panel" aria-labelledby="lf-nasa-heading">
      <div className="lf-nasa-panel-heading">
        <div>
          <span className="lf-nasa-kicker">LIVE EARTH DATA / NASA GIBS</span>
          <h2 id="lf-nasa-heading">Nile Delta from orbit</h2>
          <p>Real satellite browse imagery for the region—not a generated game scene.</p>
        </div>
        <span className="lf-nasa-live-tag">NASA DATA</span>
      </div>

      <div className="lf-nasa-controls">
        <label>
          Satellite layer
          <select value={layerId} onChange={(event) => changeLayer(event.target.value)}>
            {NASA_IMAGERY_LAYERS.map((item) => (
              <option value={item.id} key={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <div className="lf-nasa-date-controls">
          <span>Observation date: <strong>{date}</strong></span>
          <div>
            <button type="button" onClick={() => changeDate(1)} disabled={daysBack >= 14}>Older</button>
            <button type="button" onClick={() => changeDate(-1)} disabled={daysBack <= 0}>Newer</button>
          </div>
        </div>
      </div>

      <div className="lf-nasa-image-frame">
        {!failed ? (
          <img
            src={imageUrl}
            alt={`NASA ${layer.satellite} satellite true-color imagery of the Nile Delta on ${date}`}
            loading="lazy"
            onError={() => {
              if (daysBack < 14) setDaysBack((current) => current + 1);
              else setFailed(true);
            }}
          />
        ) : (
          <div className="lf-nasa-image-fallback">
            <strong>NASA imagery is temporarily unavailable.</strong>
            <span>Try another date or open NASA Worldview to explore the archive.</span>
          </div>
        )}
      </div>

      <div className="lf-nasa-panel-footer">
        <span>{layer.name} · {layer.resolution}</span>
        <a href="https://worldview.earthdata.nasa.gov/" target="_blank" rel="noreferrer">Explore NASA Worldview ↗</a>
      </div>
      <p className="lf-nasa-credit">
        Imagery: NASA Global Imagery Browse Services (GIBS), part of NASA Earth Science Data and Information System.
        Browse imagery is for exploration and education; it is not a calibrated analysis product.
      </p>
    </section>
  );
}
