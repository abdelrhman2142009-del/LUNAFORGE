# NASA data and imagery in LUNAFORGE

## What is connected

LUNAFORGE also reads NASA's Earth Observatory Natural Event Tracker (EONET) v3 open-events feed. It displays a small list of NASA-curated event records with category, date, description, and source link. The feed is refreshed on demand and when the panel is mounted.

LUNAFORGE uses NASA's Global Imagery Browse Services (GIBS) to request real Earth-observation visualizations over the web.

- **Earth globe texture:** NASA GIBS `BlueMarble_NextGeneration` global image, projected onto a shaded sphere-like globe in the interface.
- **Nile Delta imagery:** selectable Terra MODIS, Aqua MODIS, and Suomi NPP VIIRS corrected-reflectance true-colour browse layers.
- **Date controls:** the viewer requests dated imagery and steps backward when a requested date is not available.
- **NASA Worldview:** the viewer links to Worldview for broader exploration of available NASA layers and dates.

## NASA references

1. NASA GIBS API documentation — access methods, map projections, WMS and WMTS: https://nasa-gibs.github.io/gibs-api-docs/
2. NASA GIBS WMS access basics: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
3. NASA GIBS Python usage — documented Blue Marble and MODIS examples: https://nasa-gibs.github.io/gibs-api-docs/python-usage/
4. NASA Worldview: https://worldview.earthdata.nasa.gov/
5. NASA Earth Observatory Natural Event Tracker (EONET) v3 API documentation: https://eonet.gsfc.nasa.gov/docs/v3
6. NASA EONET overview: https://eonet.gsfc.nasa.gov/
7. NASA Earth Observatory, *The Nile Delta's Disappearing Farmland* (2021): https://science.nasa.gov/earth/earth-observatory/the-nile-deltas-disappearing-farmland-149183/

## Important scientific distinctions

- GIBS provides browse visualizations. A displayed image is not automatically a calibrated science product or a downloaded source raster suitable for quantitative analysis.
- The imagery shown in the viewer comes from NASA's remote service when the user opens the page; it is not bundled as a local image file.
- The Earth globe uses a NASA Blue Marble map image as its surface texture. The sphere shading and rotation are interface rendering effects.
- The mission's simulated observations, mission events, data-generation quantities, spacecraft power values, and downlink outcomes remain educational gameplay values unless an individual value is separately sourced and labeled.
- The viewer does not claim that LUNAFORGE's fictional CubeSat captured the displayed NASA imagery.
- NASA imagery availability depends on the layer's coverage, processing latency, date, and service availability. A failed image request is not evidence that no Earth observation exists for that date.
- Do not use browse imagery alone to calculate shoreline movement, crop yield, wetland area, or other scientific measurements. Such work needs appropriate source products, processing, validation, and uncertainty analysis.

## Implementation

- URL construction and layer metadata: `src/data/nasaEarthData.js`
- Textured globe: `src/components/EarthGlobe.jsx` and `EarthGlobe.css`
- Regional imagery viewer: `src/components/NasaImageryPanel.jsx` and `NasaImageryPanel.css`
- Live natural-event feed: `src/components/NasaEventsPanel.jsx` and `NasaEventsPanel.css`
- Automated URL and date tests: `tests/nasa-earth-data.test.js`

No NASA API key is embedded in the frontend. GIBS browse requests are made directly to the documented public imagery endpoint.
