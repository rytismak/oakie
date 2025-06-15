import React, { useState } from "react";
import Navbar from "./GlobalComponents/Navbar";

import Footer from "./GlobalComponents/Footer";
import CompaniesList from "./Pages/CompaniesList";

import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Pages/Home";
import KeyMetrics from "./Pages/KeyMetrics";
import OurApproach from "./Pages/OurApproach";
import FeaturedCompanies from "./Pages/FeaturedCompanies";
import Feedback from "./Pages/Feedback";
import CompanyAnalysis from "./Pages/CompanyAnalysis";

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <div className="container align-items-center">
          <Routes>
            <Route path="/" element={<CompaniesList />} />
            <Route path="/key-metrics" element={<KeyMetrics />} />
            <Route path="/our-approach" element={<OurApproach />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/company-analysis" element={<CompanyAnalysis />} />
            <Route path="/featured-companies" element={<FeaturedCompanies />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </div>
  );
}

export default App;
