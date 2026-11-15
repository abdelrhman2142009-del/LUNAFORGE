import { NASA_EARTH_TEXTURE_URL } from "../data/nasaEarthData.js";
import "./EarthGlobe.css";

export default function EarthGlobe() {
  return (
    <div className="lf-earth-globe-wrap" role="img" aria-label="Three-dimensional globe textured with NASA Blue Marble Earth imagery">
      <div className="lf-earth-globe">
        <div
          className="lf-earth-globe-texture"
          style={{ backgroundImage: `url("${NASA_EARTH_TEXTURE_URL}")` }}
        />
        <div className="lf-earth-globe-shade" />
        <div className="lf-earth-globe-atmosphere" />
      </div>
      <span className="lf-earth-globe-caption">NASA BLUE MARBLE / 3D GLOBE</span>
    </div>
  );
}
