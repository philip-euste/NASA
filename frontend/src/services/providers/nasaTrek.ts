
import type {
  TileLayerConfig,
  DataProvider,
} from "../dataProviders";

import type { MapLayerId } from "../../data/mapLayers";

const BASE_URL = "https://trek.nasa.gov/tiles/Mars/EQ";

interface NasaLayerDefinition {
  id: string;
  static?: boolean;
  tileUrlTemplate?: string;
  zoomOffset?: number;
}

const NASA_LAYERS: Record<MapLayerId, NasaLayerDefinition> = {
  mars_global_mola: {
    id: "Mars_MGS_MOLA_ClrShade_merge_global_463m",
    static: true,
    tileUrlTemplate:
      `${BASE_URL}/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
    zoomOffset: -1,
  },

  mars_mola_roughness: {
    id: "mola_roughness",
  },

  mars_tes_dust: {
    id: "TES_Dust",
  },

  mars_tes_thermal: {
    id: "TES_Thermal_Inertia",
  },
};

function getText(
  element: Element | Document | null,
  name: string
): string | undefined {
  return element
    ?.getElementsByTagNameNS("*", name)[0]
    ?.textContent
    ?.trim();
}

function getElements(
  element: Element | Document,
  name: string
): Element[] {
  return Array.from(
    element.getElementsByTagNameNS("*", name)
  );
}

async function fetchCapabilities(
  layer: NasaLayerDefinition
): Promise<TileLayerConfig> {
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

  const matchingLayer = getElements(xml, "Layer").find(
    (item) => getText(item, "Identifier") === layer.id
  );

  if (!matchingLayer) {
    throw new Error(
      `Layer identifier not found: ${layer.id}`
    );
  }

  const styles = getElements(matchingLayer, "Style");

  const style =
    styles.find((item) =>
      ["true", "1"].includes(
        item.getAttribute("isDefault") ?? ""
      )
    ) ?? styles[0];

  const styleId = style
    ? getText(style, "Identifier")
    : undefined;

  if (!styleId) {
    throw new Error("No valid WMTS style found.");
  }

  const tileMatrixSetLink = getElements(
    matchingLayer,
    "TileMatrixSetLink"
  )[0];

  const matrixSetId = tileMatrixSetLink
    ? getText(tileMatrixSetLink, "TileMatrixSet")
    : undefined;

  if (!matrixSetId) {
    throw new Error("No tile matrix set reference found.");
  }

  const matrixSetDefinition = getElements(
    xml,
    "TileMatrixSet"
  ).find(
    (item) =>
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
  )
    .map((item) => getText(item, "Identifier"))
    .filter((id): id is string => Boolean(id));

  if (matrixIds.length === 0) {
    throw new Error("No tile matrix levels found.");
  }

  const sequential = matrixIds.every(
    (id, index) => id === String(index)
  );

  if (!sequential) {
    throw new Error(
      `Unsupported tile matrix identifiers: ${matrixIds.join(", ")}`
    );
  }

  const resources = getElements(
    matchingLayer,
    "ResourceURL"
  );

  const tileResource = resources.find(
    (item) => item.getAttribute("resourceType") === "tile"
  );

  const template = tileResource?.getAttribute("template");

  if (!template) {
    throw new Error("No WMTS tile URL template found.");
  }

  const resolvedTileUrl = template
    .replaceAll("{Style}", styleId)
    .replaceAll("{TileMatrixSet}", matrixSetId)
    .replaceAll("{TileMatrix}", "{z}")
    .replaceAll("{TileRow}", "{y}")
    .replaceAll("{TileCol}", "{x}");

  return {
    tileUrlTemplate: resolvedTileUrl,
    zoomOffset: -1,
    attribution: "NASA Mars Trek",
    matrixSet: matrixSetId,
    style: styleId,
    matrixIds,
  };
}

export const nasaTrekProvider: DataProvider = {
  id: "nasaTrek",

  getAvailableLayers(): string[] {
    return Object.keys(NASA_LAYERS);
  },

  async getLayerConfig(
    layerId: string
  ): Promise<TileLayerConfig> {
    const layer = NASA_LAYERS[layerId as MapLayerId];

    if (!layer) {
      throw new Error(`Unknown NASA layer: ${layerId}`);
    }

    if (layer.static && layer.tileUrlTemplate) {
      return {
        tileUrlTemplate: layer.tileUrlTemplate,
        zoomOffset: layer.zoomOffset ?? -1,
        attribution: "NASA Mars Trek",
      };
    }

    return fetchCapabilities(layer);
  },
};
