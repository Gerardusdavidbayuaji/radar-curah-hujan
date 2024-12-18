import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import RainViewer from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RainViewer />
  </StrictMode>
);
