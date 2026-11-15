// NASA Earth imagery configuration for LUNAFORGE.
// The URLs below request NASA GIBS visualizations; they are not locally fabricated images.
export const NASA_GIBS_WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
export const NASA_EONET_EVENTS_URL = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=8";
export const NASA_EARTH_TEXTURE_URL =
  `${NASA_GIBS_WMS}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&FORMAT=image/jpeg&TRANSPARENT=false&LAYERS=BlueMarble_NextGeneration&CRS=EPSG:4326&BBOX=-90,-180,90,180&WIDTH=2048&HEIGHT=1024`;

export const NILE_DELTA_BBOX = "29,30,33,33";

export const NASA_IMAGERY_LAYERS = [
  {
    id: "MODIS_Terra_CorrectedReflectance_TrueColor",
    name: "Terra MODIS · True color",
    satellite: "Terra",
    resolution: "250 m browse imagery",
  },
  {
    id: "MODIS_Aqua_CorrectedReflectance_TrueColor",
    name: "Aqua MODIS · True color",
    satellite: "Aqua",
    resolution: "250 m browse imagery",
  },
  {
    id: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
    name: "Suomi NPP VIIRS · True color",
    satellite: "Suomi NPP",
    resolution: "375 m browse imagery",
  },
];

export function getNasaObservationDate(daysBack = 2, now = new Date()) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - Math.max(0, daysBack));
  return date.toISOString().slice(0, 10);
}

export function buildNileDeltaImageryUrl({
  layer = NASA_IMAGERY_LAYERS[0].id,
  date = getNasaObservationDate(),
  width = 1200,
  height = 720,
} = {}) {
  const params = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.3.0",
    FORMAT: "image/jpeg",
    TRANSPARENT: "false",
    LAYERS: layer,
    CRS: "EPSG:4326",
    BBOX: NILE_DELTA_BBOX,
    WIDTH: String(width),
    HEIGHT: String(height),
    TIME: date,
  });
  return `${NASA_GIBS_WMS}?${params.toString()}`;
}
