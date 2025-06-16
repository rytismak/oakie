import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={`${import.meta.env.BASE_URL}chart-white.svg`}
            alt="Logo"
            style={{ maxWidth: "28px", maxHeight: "28px", marginRight: "8px" }}
          />
          Oakie
        </Link>

        {/* Toggle Button for Mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/our-approach">
                Our Approach
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/key-metrics">
                Key Metrics
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/featured-companies">
                Featured Companies
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/feedback">
                Feedback
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
