import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Asteroids from "./pages/Asteroids";

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
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            APOD
          </NavLink>
          <NavLink
            to="/asteroids"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            Asteroids
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/asteroids" element={<Asteroids />} />
      </Routes>
    </BrowserRouter>
  );
}
