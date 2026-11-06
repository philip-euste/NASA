
import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  CircleMarker,
  Popup
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { MAP_LAYERS } from "../../data/mapLayers";
import { getDataProvider } from "../../services/dataProviders";

function MapController({
  layerId,
  focusLocation,
  resetCounter
}) {
  const map = useMap();

  useEffect(() => {
    const layer = MAP_LAYERS[layerId];

    if (focusLocation) {
      map.flyTo(
        [focusLocation.latitude, focusLocation.longitude],
        Math.max(map.getZoom(), 4)
      );
    } else {
      map.setView(layer.center, layer.zoom);
    }
  }, [layerId, focusLocation, resetCounter, map]);

  return null;
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng
      });
    }
  });

  return null;
}

export default function MarsMap() {
  const [selectedLayer, setSelectedLayer] =
    useState("mars_global_mola");

  const [tileConfig, setTileConfig] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);

  const [locationName, setLocationName] = useState("");
  const [opacity, setOpacity] = useState(1);

  const [focusLocation, setFocusLocation] = useState(null);
  const [resetCounter, setResetCounter] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const layer = MAP_LAYERS[selectedLayer];

  useEffect(() => {
    let cancelled = false;

    async function loadLayer() {
      setLoading(true);
      setError(null);
      setTileConfig(null);

      try {
        const provider = getDataProvider(layer.provider);
        const config = await provider.getLayerConfig(selectedLayer);

        if (!cancelled) {
          setTileConfig(config);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLayer();

    return () => {
      cancelled = true;
    };
  }, [selectedLayer, layer.provider]);

  function saveLocation() {
    if (!coordinates) return;

    const duplicate = savedLocations.some(location =>
      Math.abs(location.latitude - coordinates.latitude) < 0.00001 &&
      Math.abs(location.longitude - coordinates.longitude) < 0.00001
    );

    if (duplicate) {
      setMessage("This location has already been saved.");
      return;
    }

    const name = locationName.trim() ||
      `Location ${savedLocations.length + 1}`;

    const newLocation = {
      id: Date.now(),
      name,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    };

    setSavedLocations(current => [
      ...current,
      newLocation
    ]);

    setLocationName("");
    setMessage(`${name} saved.`);
  }

  function removeLocation(id) {
    setSavedLocations(current =>
      current.filter(location => location.id !== id)
    );

    setMessage("Location removed.");
  }

  function resetView() {
    setFocusLocation(null);
    setResetCounter(current => current + 1);
  }

  return (
    <section>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        alignItems: "center",
        marginBottom: "12px"
      }}>
        <label htmlFor="mars-layer">
          Imagery layer:
        </label>

        <select
          id="mars-layer"
          value={selectedLayer}
          onChange={event => {
            setSelectedLayer(event.target.value);
            setFocusLocation(null);
          }}
        >
          {Object.values(MAP_LAYERS).map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <button onClick={resetView}>
          Reset View
        </button>
      </div>

      <p>{layer.description}</p>

      <div style={{
        height: "600px",
        width: "100%",
        background: "#171717"
      }}>
        <MapContainer
          center={layer.center}
          zoom={layer.zoom}
          crs={L.CRS.EPSG4326}
          style={{ height: "100%", width: "100%" }}
        >
          <MapController
            layerId={selectedLayer}
            focusLocation={focusLocation}
            resetCounter={resetCounter}
          />

          <MapClickHandler onSelect={setCoordinates} />

          {tileConfig && (
            <TileLayer
              key={selectedLayer}
              url={tileConfig.tileUrlTemplate}
              attribution={tileConfig.attribution}
              zoomOffset={tileConfig.zoomOffset}
              opacity={opacity}
            />
          )}

          {savedLocations.map(location => (
            <CircleMarker
              key={location.id}
              center={[
                location.latitude,
                location.longitude
              ]}
              radius={7}
              pathOptions={{
                color: "#ffcc00",
                fillColor: "#ffcc00",
                fillOpacity: 0.9
              }}
            >
              <Popup>
                <strong>{location.name}</strong>
                <br />
                Latitude: {location.latitude.toFixed(5)}°
                <br />
                Longitude: {location.longitude.toFixed(5)}°
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {loading && (
        <p>Loading {layer.name} from NASA...</p>
      )}

      {error && (
        <div style={{
          padding: "12px",
          marginTop: "12px",
          border: "1px solid #dc6666"
        }}>
          <strong>Layer loading failed</strong>
          <p>{error}</p>
          <p>
            The NASA endpoint may be unavailable or may
            not allow browser requests.
          </p>
        </div>
      )}

      {tileConfig && (
        <div style={{ padding: "12px" }}>
          <label htmlFor="layer-opacity">
            Layer opacity: {Math.round(opacity * 100)}%
          </label>

          <input
            id="layer-opacity"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={event =>
              setOpacity(Number(event.target.value))
            }
            style={{ display: "block", width: "220px" }}
          />
        </div>
      )}

      {coordinates && (
        <div style={{ padding: "12px" }}>
          <h3>Selected Location</h3>

          <p>
            Latitude: {coordinates.latitude.toFixed(5)}°
          </p>

          <p>
            Longitude: {coordinates.longitude.toFixed(5)}°
          </p>

          <input
            type="text"
            value={locationName}
            onChange={event =>
              setLocationName(event.target.value)
            }
            placeholder="Location name (optional)"
            maxLength={50}
          />

          <button
            onClick={saveLocation}
            style={{ marginLeft: "8px" }}
          >
            Save Location
          </button>
        </div>
      )}

      {message && (
        <p role="status">{message}</p>
      )}

      <div style={{ padding: "12px" }}>
        <h3>Saved Locations ({savedLocations.length})</h3>

        {savedLocations.length === 0 ? (
          <p>No saved locations yet.</p>
        ) : (
          savedLocations.map(location => (
            <div
              key={location.id}
              style={{
                padding: "10px",
                borderBottom: "1px solid #444",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <div>
                <strong>{location.name}</strong>

                <p>
                  {location.latitude.toFixed(5)}°,{" "}
                  {location.longitude.toFixed(5)}°
                </p>
              </div>

              <div>
                <button
                  onClick={() => setFocusLocation(location)}
                >
                  Go to
                </button>

                <button
                  onClick={() => removeLocation(location.id)}
                  style={{ marginLeft: "8px" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
