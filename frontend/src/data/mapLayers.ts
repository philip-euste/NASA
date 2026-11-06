export interface MapLayer {
  id: string;
  name: string;
  description: string;
  provider: "nasaTrek";
  center: [number, number];
  zoom: number;
}

export const MAP_LAYERS = {
  mars_global_mola: {
    id: "mars_global_mola",
    name: "MOLA Global Hillshade",
    description: "Global shaded-relief terrain visualization.",
    provider: "nasaTrek",
    center: [0, 0],
    zoom: 1,
  },

  mars_mola_roughness: {
    id: "mars_mola_roughness",
    name: "MOLA Surface Roughness",
    description: "Global surface roughness visualization.",
    provider: "nasaTrek",
    center: [0, 0],
    zoom: 1,
  },

  mars_tes_dust: {
    id: "mars_tes_dust",
    name: "TES Global Dust",
    description: "Mars global dust-related data.",
    provider: "nasaTrek",
    center: [0, 0],
    zoom: 1,
  },

  mars_tes_thermal: {
    id: "mars_tes_thermal",
    name: "TES Thermal Inertia",
    description: "Global thermal inertia visualization.",
    provider: "nasaTrek",
    center: [0, 0],
    zoom: 1,
  },
} satisfies Record<string, MapLayer>;

export type MapLayerId = keyof typeof MAP_LAYERS;