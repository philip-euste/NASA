
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { Mission, Region } from "../../types";

interface MissionContextValue {
  mission: Mission;
  setRegion: (region: Region | null) => void;
  setMission: (mission: Mission) => void;
}

const initialMission: Mission = {
  id: crypto.randomUUID(),
  name: "Untitled Expedition",
  objective: "",
  question: "",
  region: null,
  selectedDatasets: [],
  selectedObservations: [],
  selectedRoute: null,
  createdAt: new Date().toISOString(),
};

const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mission, setMission] = useState<Mission>(initialMission);

  function setRegion(region: Region | null) {
    setMission((current) => ({
      ...current,
      region,
    }));
  }

  return (
    <MissionContext.Provider
      value={{ mission, setRegion, setMission }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const context = useContext(MissionContext);

  if (!context) {
    throw new Error(
      "useMission must be used inside MissionProvider"
    );
  }

  return context;
}
