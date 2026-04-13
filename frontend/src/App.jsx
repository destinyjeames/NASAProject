import { useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Asteroids from "./pages/Asteroids";
import { prefetchApod } from "./services/api";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-icon">&#9679;</span>
          Droid Stats
        </div>
        <div className="navbar-links">
          <NavLink
            to="/asteroids"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            Asteroids
          </NavLink>
          <NavLink
            to="/apod"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            APOD
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  // Prefetch today's APOD in the background while the user is on the asteroid page
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    prefetchApod(today);
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/asteroids" replace />} />
        <Route path="/asteroids" element={<Asteroids />} />
        <Route path="/apod" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
