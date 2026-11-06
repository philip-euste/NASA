
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/routes/AppRoutes";
import { MissionProvider } from "./state/mission/MissionContext";

function App() {
  return (
    <MissionProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MissionProvider>
  );
}

export default App;
