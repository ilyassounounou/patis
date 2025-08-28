import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import ShopContextProvider from "./context/ShopContext.jsx";
import "./index.css";

const root = document.getElementById("root");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
      {/* ✅ هذا يساعد على اكتشاف مشاكل React أثناء التطوير */}
    </BrowserRouter>
  </StrictMode>
);
