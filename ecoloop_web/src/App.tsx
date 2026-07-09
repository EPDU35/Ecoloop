import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./config/routes";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
