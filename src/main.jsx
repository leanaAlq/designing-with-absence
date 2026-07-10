import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// fonts: the paired Latin + Arabic system (tokens.css)
import "@fontsource/lora/500.css";
import "@fontsource/lora/600.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/600.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";

import "./styles/base.css";
import "./styles/smoke.css";
import "./i18n/index.js";

import { CorpusProvider } from "./corpus/CorpusProvider.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CorpusProvider>
      <App />
    </CorpusProvider>
  </StrictMode>
);
