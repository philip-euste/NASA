
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Region {
  id: string;
  name: string;
  coordinates: Coordinates;
  description: string;
}

export interface Dataset {
  id: string;
  name: string;
  source: string;
  description: string;
  resolution?: number;
  available: boolean;
}

export interface Observation {
  id: string;
  datasetId: string;
  name: string;
  coordinates?: Coordinates;
  observationDate?: string;
  source: string;
  description?: string;
}

export interface Waypoint {
  id: string;
  coordinates: Coordinates;
  targetId?: string;
  visited: boolean;
}

export interface Route {
  id: string;
  name: string;
  waypoints: Waypoint[];
  distanceMeters?: number;
  elevationGainMeters?: number;
  elevationLossMeters?: number;
}

export interface Mission {
  id: string;
  name: string;
  objective: string;
  question: string;
  region: Region | null;
  selectedDatasets: Dataset[];
  selectedObservations: Observation[];
  selectedRoute: Route | null;
  createdAt: string;
}

export interface FieldNote {
  id: string;
  missionId: string;
  content: string;
  coordinates: Coordinates;
  createdAt: string;
}

export interface ExpeditionReport {
  id: string;
  missionId: string;
  title: string;
  summary: string;
  fieldNotes: FieldNote[];
  generatedAt: string;
}
