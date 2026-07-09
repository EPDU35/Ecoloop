import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

/* ------------------------------------------------------------------
   Styles globaux — chargés UNE SEULE FOIS pour toute l'application.
   C'est pour ça que les composants (Dashboard.tsx, Home.tsx, etc.)
   n'importent aucun CSS eux-mêmes : ils s'appuient tous sur les mêmes
   classes `el-*` et variables définies ici.
   Ordre important : tokens d'abord (couleurs, espacements), puis les
   styles qui les utilisent.
   ------------------------------------------------------------------ */
import "./styles/tokens.css";
import "./styles/layout.css";
import "./styles/widgets.css";
import "./styles/landing.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Élément #root introuvable dans index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
