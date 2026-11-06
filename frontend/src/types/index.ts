
/* =========================================================
   GEOGRAPHIC TYPES
   ========================================================= */

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

/* =========================================================
   SCIENTIFIC DATA AND EVIDENCE
   ========================================================= */

export interface EvidenceProvenance {
  source: string;
  sourceId?: string;
  sourceUrl?: string;
  processingMethod?: string;
  processingDate?: string;
  limitations?: string[];
}

export interface Dataset {
  id: string;
  name: string;
  source: string;
  description: string;
  resolutionMeters?: number;
  available: boolean;
  provenance?: EvidenceProvenance;
}

export interface Observation {
  id: string;
  datasetId: string;
  name: string;
  coordinates?: Coordinates;
  observationDate?: string;
  source: string;
  description?: string;
  provenance?: EvidenceProvenance;
}

export interface ScientificTarget {
  id: string;
  name: string;
  coordinates: Coordinates;
  description: string;
  observationIds: string[];
}

export interface KnowledgeGap {
  id: string;
  description: string;
  reason: string;
  relatedDatasetIds: string[];
  relatedObservationIds: string[];
}

/* =========================================================
   EVIDENCE INTERPRETATION
   ========================================================= */

export interface DerivedAnalysis {
  id: string;
  name: string;
  description: string;
  inputObservationIds: string[];
  method: string;
  value?: number;
  unit?: string;
  limitations: string[];
}

export interface ScientificInterpretation {
  id: string;
  description: string;
  supportingEvidenceIds: string[];
  limitations: string[];
  generatedBy: "AI" | "User";
}

export interface UserHypothesis {
  id: string;
  statement: string;
  relatedEvidenceIds: string[];
  createdAt: string;
}

/* =========================================================
   MISSION CONFIGURATION
   ========================================================= */

export interface TerrainPreferences {
  preferredSlopeDegrees?: number;
  preferredRoughness?: number;
  avoidKnownObstacles: boolean;
}

export interface MissionConfiguration {
  startingLocation: Coordinates;
  scientificTargetIds: string[];
  missionDurationSols: number;
  hypotheticalEVADurationHours: number;
  terrainPreferences: TerrainPreferences;
  sciencePriorities: string[];
  explorationStrategy: string;
}

/* =========================================================
   ROUTE PLANNING
   ========================================================= */

export interface Waypoint {
  id: string;
  coordinates: Coordinates;
  targetId?: string;
  name?: string;
  visited: boolean;
}

export interface RouteTerrainMetrics {
  slopeDistribution?: Record<string, number>;
  averageSlopeDegrees?: number;
  maximumSlopeDegrees?: number;
  averageRoughness?: number;
  knownObstacles?: string[];
  dataCoverage?: number;
  uncertaintyNotes: string[];
  assumptions: string[];
}

export interface Route {
  id: string;
  name: string;
  waypoints: Waypoint[];
  distanceMeters?: number;
  elevationGainMeters?: number;
  elevationLossMeters?: number;
  terrainMetrics?: RouteTerrainMetrics;
  reachedTargetIds: string[];
}

/* =========================================================
   SIMULATION STATE
   ========================================================= */

export interface SimulationState {
  currentPosition: Coordinates | null;
  visitedTargetIds: string[];
  elapsedTimeSeconds: number;
  progressPercentage: number;
  isActive: boolean;
}

/* =========================================================
   MISSION STATE
   ========================================================= */

export interface Mission {
  id: string;
  name: string;
  objective: string;
  question: string;

  region: Region | null;
  configuration: MissionConfiguration | null;

  selectedDatasets: Dataset[];
  selectedObservations: Observation[];
  scientificTargets: ScientificTarget[];
  knowledgeGaps: KnowledgeGap[];

  derivedAnalyses: DerivedAnalysis[];
  interpretations: ScientificInterpretation[];
  hypotheses: UserHypothesis[];

  candidateRoutes: Route[];
  selectedRoute: Route | null;

  simulation: SimulationState;

  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   FIELD NOTES
   ========================================================= */

export interface FieldNote {
  id: string;
  missionId: string;
  content: string;
  coordinates: Coordinates;
  relatedTargetId?: string;
  createdAt: string;
}

/* =========================================================
   EXPEDITION REPORT
   ========================================================= */

export interface ExpeditionReport {
  id: string;
  missionId: string;
  title: string;
  summary: string;

  datasetIds: string[];
  observationIds: string[];
  scientificTargetIds: string[];

  candidateRouteIds: string[];
  selectedRouteId?: string;

  fieldNotes: FieldNote[];
  knowledgeGaps: KnowledgeGap[];
  limitations: string[];
  conclusions: string[];
  recommendedInvestigations: string[];

  generatedAt: string;
}
