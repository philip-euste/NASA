
import { Navigate, Route, Routes } from "react-router-dom";
import WelcomePage from "../../features/welcome/WelcomePage";
import ExplorerPage from "../../features/planetary-explorer/ExplorerPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/explorer" element={<ExplorerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
