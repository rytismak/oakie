import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Generate 70 realistic dummy companies
const companies = Array.from({ length: 70 }).map((_, i) => {
  return {
    id: i + 1,
    name: `Company ${i + 1}`,
    ticker: `TICK${i + 1}`,
    marketCap: Math.round(Math.random() * 100000) + 500,
    industry: ["Technology", "Healthcare", "Retail", "Energy", "Automotive"][
      Math.floor(Math.random() * 5)
    ],
    currentPrice: parseFloat((Math.random() * 500).toFixed(2)),
    intrinsicValue: parseFloat((Math.random() * 500).toFixed(2)),
  };
});

function CompaniesTable() {
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterMarketCap, setFilterMarketCap] = useState("");

  const perPage = 15;

  const industryOptions = [
    "All sectors",
    "Technology",
    "Healthcare",
    "Retail",
    "Energy",
    "Automotive",
  ];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filterByMarketCap = (comp) => {
    if (!filterMarketCap) return true;
    if (filterMarketCap === "Micro") return comp.marketCap < 300;
    if (filterMarketCap === "Small")
      return comp.marketCap >= 300 && comp.marketCap < 2000;
    if (filterMarketCap === "Mid")
      return comp.marketCap >= 2000 && comp.marketCap <= 10000;
    if (filterMarketCap === "Large") return comp.marketCap > 10000;
    return true;
  };

  const filtered = companies.filter((comp) => {
    return (
      (filterIndustry === "" ||
        filterIndustry === "All sectors" ||
        comp.industry === filterIndustry) &&
      filterByMarketCap(comp) &&
      (comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.ticker.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField) {
      let valA = a[sortField];
      let valB = b[sortField];
      if (
        sortField === "currentPrice" ||
        sortField === "intrinsicValue" ||
        sortField === "marketCap"
      ) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });

  const pageCount = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      {/* Filters */}
      <div className="row mb-3 align-items-center">
        <div className="col-12  mb-3 col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Company or Ticker"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-12 mb-3 col-md-3">
          <select
            className="form-select flex-grow-1"
            onChange={(e) => setFilterIndustry(e.target.value)}
            value={filterIndustry}
            aria-label="Filter by industry"
          >
            {industryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 mb-3 col-md-3">
          <select
            className="form-select flex-grow-1"
            onChange={(e) => setFilterMarketCap(e.target.value)}
            value={filterMarketCap}
            aria-label="Filter by market capitalization"
          >
            <option value="">All Market Caps</option>
            <option value="Micro">Micro (&lt;$300M)</option>
            <option value="Small">Small ($300M - $2B)</option>
            <option value="Mid">Mid ($2B - $10B)</option>
            <option value="Large">Large (&gt;$10B)</option>
          </select>
        </div>

        <div className="col-12  mb-3 col-md-2">
          <button
            className="btn btn-outline-primary w-100"
            style={{ minWidth: "130px" }}
            onClick={() => {
              setSearchTerm("");
              setFilterIndustry("");
              setFilterMarketCap("");
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ overflowX: "auto" }}>
        <table
          className="table table-hover"
          style={{ tableLayout: "fixed", minWidth: "800px" }}
        >
          <thead style={{ background: "white", color: "black" }}>
            <tr>
              {[
                "name",
                "ticker",
                "marketCap",
                "industry",
                "currentPrice",
                "intrinsicValue",
              ].map((field, idx) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  style={{
                    cursor: "pointer",
                    position: idx === 0 ? "sticky" : "",
                    left: idx === 0 ? 0 : "",
                    zIndex: idx === 0 ? 2 : "",
                    background: "white",
                    color: "black",
                  }}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field && (sortOrder === "asc" ? " 🔼" : " 🔽")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((comp) => (
              <tr
                key={comp.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/company-analysis")} // <- use navigate here
              >
                <td
                  style={{
                    position: "sticky",
                    left: "0",
                    zIndex: "1",
                    background: "white",
                  }}
                >
                  {comp.name}
                </td>
                <td>{comp.ticker}</td>
                <td>{comp.marketCap}</td>
                <td>{comp.industry}</td>
                <td>{comp.currentPrice}</td>
                <td>{comp.intrinsicValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center align-items-center flex-wrap">
        <button
          className="btn btn-primary me-2 mb-2"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        <ul className="pagination mb-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>

        <button
          className="btn btn-primary ms-2 mb-2"
          disabled={currentPage === pageCount}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default CompaniesTable;
