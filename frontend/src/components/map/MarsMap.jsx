
import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const API = "http://127.0.0.1:8000";

export default function MarsMap() {
  const [tileConfig, setTileConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMap() {
      try {
        const response = await fetch(
          `${API}/api/nasa/layers/mars_global_mola/tile-config`
        );

        if (!response.ok) {
          throw new Error("Failed to retrieve NASA tile configuration");
        }

        const data = await response.json();
        setTileConfig(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadMap();
  }, []);

  if (error) {
    return <p>Map error: {error}</p>;
  }

  if (!tileConfig) {
    return <p>Loading Mars imagery...</p>;
  }

  const url = tileConfig.tile_url_template
    .replace("{Style}", "default")
    .replace("{TileMatrixSet}", "default028mm")
    .replace("{TileMatrix}", "{z}")
    .replace("{TileRow}", "{y}")
    .replace("{TileCol}", "{x}");

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer
        center={[0, 0]}
        zoom={1}
        minZoom={1}
        maxZoom={10}
        crs={L.CRS.EPSG4326}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url={url}
          minZoom={1}
          maxZoom={10}
          zoomOffset={-1}
          attribution="NASA Mars Trek"
        />
      </MapContainer>
    </div>
  );
}
