import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { I18nProvider } from "./i18n.jsx";
import "./styles.css";
import "./platform.css";
import "./home-enhance.css";
import "./learn.css";
import "./modern.css";
import "./redesign.css";
import "./editorial.css";
import "./landing.css";
import "./leemo.css";
import "./bold.css";
import "./pages-bold.css";
import "./eduflow.css";
import "./dashboard.css";
import "./auth.css";
import "./dog.css";
import "./dog.css";
import "./builder.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
