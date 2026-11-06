
const BASE_URL = "https://trek.nasa.gov/tiles/Mars/EQ";

const NASA_LAYERS = {
  mars_global_mola: {
    id: "Mars_MGS_MOLA_ClrShade_merge_global_463m",
    static: true,
    tileUrlTemplate:
      `${BASE_URL}/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
    zoomOffset: -1
  },

  mars_mola_roughness: {
    id: "mola_roughness"
  },

  mars_tes_dust: {
    id: "TES_Dust"
  },

  mars_tes_thermal: {
    id: "TES_Thermal_Inertia"
  }
};

function getText(element, name) {
  return element
    ?.getElementsByTagNameNS("*", name)[0]
    ?.textContent
    ?.trim();
}

function getElements(element, name) {
  return [
    ...element.getElementsByTagNameNS("*", name)
  ];
}

async function fetchCapabilities(layer) {
  const url =
    `${BASE_URL}/${layer.id}/1.0.0/WMTSCapabilities.xml`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `NASA HTTP ${response.status}: ${layer.id}`
    );
  }

  const xmlText = await response.text();

  const xml = new DOMParser().parseFromString(
    xmlText,
    "application/xml"
  );

  if (xml.querySelector("parsererror")) {
    throw new Error("Invalid NASA WMTS XML.");
  }

  // Find the requested layer.
  const matchingLayer = getElements(xml, "Layer").find(
    item => getText(item, "Identifier") === layer.id
  );

  if (!matchingLayer) {
    throw new Error(
      `Layer identifier not found: ${layer.id}`
    );
  }

  // Find the default style.
  const styles = getElements(matchingLayer, "Style");

  const style =
    styles.find(item =>
      ["true", "1"].includes(item.getAttribute("isDefault"))
    ) || styles[0];

  const styleId = getText(style, "Identifier");

  if (!styleId) {
    throw new Error("No valid WMTS style found.");
  }

  // Find the matrix set referenced by this layer.
  const matrixSetId = getText(
    matchingLayer.getElementsByTagNameNS(
      "*",
      "TileMatrixSet"
    )[0]?.parentElement || matchingLayer,
    "TileMatrixSet"
  );

  if (!matrixSetId) {
    throw new Error("No tile matrix set reference found.");
  }

  // Find the actual matrix set definition.
  const matrixSetDefinition = getElements(
    xml,
    "TileMatrixSet"
  ).find(item =>
    getText(item, "Identifier") === matrixSetId &&
    getElements(item, "TileMatrix").length > 0
  );

  if (!matrixSetDefinition) {
    throw new Error(
      `Matrix set definition not found: ${matrixSetId}`
    );
  }

  const matrixIds = getElements(
    matrixSetDefinition,
    "TileMatrix"
  ).map(item => getText(item, "Identifier"));

  if (matrixIds.length === 0) {
    throw new Error("No tile matrix levels found.");
  }

  // Leaflet's default zoom numbering must match
  // the numeric NASA matrix identifiers.
  const sequential = matrixIds.every(
    (id, index) => id === String(index)
  );

  if (!sequential) {
    throw new Error(
      `Unsupported tile matrix identifiers: ${matrixIds.join(", ")}`
    );
  }

  // Find the actual image URL template.
  const resources = getElements(
    matchingLayer,
    "ResourceURL"
  );

  const tileResource = resources.find(
    item => item.getAttribute("resourceType") === "tile"
  );

  const template = tileResource?.getAttribute("template");

  if (!template) {
    throw new Error("No WMTS tile URL template found.");
  }

  const tileUrl = template
  .replaceAll("{Style}", styleId)
  .replaceAll("{TileMatrixSet}", matrixSetId)
  .replaceAll("{TileMatrix}", "{z}")
  .replaceAll("{TileRow}", "{y}")
  .replaceAll("{TileCol}", "{x}")
  .replace(/\/+/g, "/")
  .replace(/^https:\//, "https://")
  .replace(/^http:\//, "http:/");

// Preserve Leaflet's placeholders literally.
const resolvedTileUrl = tileUrl
  .replaceAll("%7Bz%7D", "{z}")
  .replaceAll("%7By%7D", "{y}")
  .replaceAll("%7Bx%7D", "{x}")
  .replaceAll("%7bz%7d", "{z}")
  .replaceAll("%7by%7d", "{y}")
  .replaceAll("%7bx%7d", "{x}");
    return {
  tileUrlTemplate: resolvedTileUrl,
  zoomOffset: -1,
  attribution: "NASA Mars Trek",
  matrixSet: matrixSetId,
  style: styleId,
  matrixIds
};

}

export const nasaTrekProvider = {
  id: "nasaTrek",

  getAvailableLayers() {
    return Object.keys(NASA_LAYERS);
  },

  async getLayerConfig(layerId) {
    const layer = NASA_LAYERS[layerId];

    if (!layer) {
      throw new Error(`Unknown NASA layer: ${layerId}`);
    }

    if (layer.static) {
      return {
        tileUrlTemplate: layer.tileUrlTemplate,
        zoomOffset: layer.zoomOffset,
        attribution: "NASA Mars Trek"
      };
    }

    return fetchCapabilities(layer);
  }
};
