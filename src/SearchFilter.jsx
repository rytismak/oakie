import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const SearchFilter = ({ onSearch }) => {
  // State for search and filters
  const [query, setQuery] = useState("");
  const [marketCap, setMarketCap] = useState("");
  const [industry, setIndustry] = useState("");

  // Market Cap options
  const marketCapOptions = ["All", "Small", "Mid", "Large"];
  // Industry options
  const industryOptions = ["All", "Tech", "Finance", "Healthcare", "Retail"];

  const handleSearch = () => {
    onSearch({ query, marketCap, industry });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Search & Filter</h2>
      <div className="row g-3">
        {/* Search Field */}
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search company..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Market Cap Dropdown */}
        <div className="col-md-3">
          <select
            className="form-select"
            value={marketCap}
            onChange={(e) => setMarketCap(e.target.value)}
          >
            {marketCapOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Industry Dropdown */}
        <div className="col-md-3">
          <select
            className="form-select"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            {industryOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
