
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { Mission, Region } from "../../types";

interface MissionContextValue {
  mission: Mission;
  setMission: Dispatch<SetStateAction<Mission>>;
  setRegion: (region: Region | null) => void;
  updateMission: (
    updates: Partial<Omit<Mission, "id" | "createdAt">>
  ) => void;
}

function createInitialMission(): Mission {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: "Untitled Expedition",
    objective: "",
    question: "",

    region: null,
    configuration: null,

    selectedDatasets: [],
    selectedObservations: [],
    scientificTargets: [],
    knowledgeGaps: [],

    derivedAnalyses: [],
    interpretations: [],
    hypotheses: [],

    candidateRoutes: [],
    selectedRoute: null,

    simulation: {
      currentPosition: null,
      visitedTargetIds: [],
      elapsedTimeSeconds: 0,
      progressPercentage: 0,
      isActive: false,
    },

    createdAt: now,
    updatedAt: now,
  };
}

const MissionContext =
  createContext<MissionContextValue | null>(null);

export function MissionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mission, setMission] = useState<Mission>(
    createInitialMission
  );

  function updateMission(
    updates: Partial<Omit<Mission, "id" | "createdAt">>
  ): void {
    setMission((current) => ({
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }

  function setRegion(region: Region | null): void {
    updateMission({ region });
  }

  return (
    <MissionContext.Provider
      value={{
        mission,
        setMission,
        setRegion,
        updateMission,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMission(): MissionContextValue {
  const context = useContext(MissionContext);

  if (!context) {
    throw new Error(
      "useMission must be used inside MissionProvider"
    );
  }

  return context;
}
