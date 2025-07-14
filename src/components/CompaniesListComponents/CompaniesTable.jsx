import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CompaniesTable() {
  const [companies, setCompanies] = useState([]);
  const [industryOptions, setIndustryOptions] = useState(["All sectors"]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.BASE_URL}/companies-data/companies.json`)
      .then((response) => {
        setCompanies(response.data);
        // Extract unique sectors for filter dropdown
        const sectors = Array.from(new Set(response.data.map((c) => c.Sector)));
        setIndustryOptions(["All sectors", ...sectors.filter(Boolean).sort()]);
      })
      .catch((error) => {
        console.error("Failed to load companies:", error);
      });
  }, []);

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterMarketCap, setFilterMarketCap] = useState("");

  const perPage = 15;

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
    const cap = comp.MarketCap / 1e9; // Convert to billions
    if (filterMarketCap === "Micro") return cap < 2;
    if (filterMarketCap === "Small") return cap >= 2 && cap < 10;
    if (filterMarketCap === "Mid") return cap >= 10 && cap <= 200;
    if (filterMarketCap === "Large") return cap > 200;
    return true;
  };

  const filtered = companies.filter((comp) => {
    return (
      (filterIndustry === "" ||
        filterIndustry === "All sectors" ||
        comp.Sector === filterIndustry) &&
      filterByMarketCap(comp) &&
      (comp.Company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.Ticker.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField) {
      let valA = a[sortField];
      let valB = b[sortField];
      if (
        sortField === "CurrentPrice" ||
        sortField === "MarketCap"
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
            <option value="Micro">Small (&lt;$2B)</option>
            <option value="Small">Mid ($2B - $10B)</option>
            <option value="Mid">Large ($10B - $200B)</option>
            <option value="Large">Mega (&gt;$200B)</option>
          </select>
        </div>

        <div className="col-12  mb-3 col-md-2">
          <button
            className="btn btn-outline-dark w-100"
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
              {["Company", "Ticker", "Market Cap", "Sector", "Stock Price"].map((field, idx) => (
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
                    width: idx === 0 ? "250px" : "auto", // even wider
                    minWidth: idx === 0 ? "250px" : "120px",
                  }}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field &&
                    (sortOrder === "asc" ? "\u00A0▲" : "\u00A0▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ fontSize: "0.8rem" }}>
            {paged.map((comp) => (
              <tr
                key={comp.Ticker}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate(`/company-analysis?ticker=${comp.Ticker}`)
                }
              >
                <td
                  style={{
                    position: "sticky",
                    left: "0",
                    zIndex: "1",
                    background: "white",
                  }}
                >
                  {comp.Company}
                </td>
                <td>{comp.Ticker}</td>
                <td>{comp.MarketCap}</td>
                <td>{comp.Sector}</td>
                <td>{comp.CurrentPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center align-items-center flex-wrap mt-2">
        <button
          className="btn btn-dark me-2 mb-2"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        <ul className="pagination mb-2">
          {(() => {
            const pages = [];
            const showFirst = 5;
            const showLast = 2;
            const total = pageCount;
            // Always show first 5
            for (let i = 1; i <= Math.min(showFirst, total); i++) {
              pages.push(i);
            }
            // If more than 7 pages, show ellipsis and last 2
            if (total > showFirst + showLast) {
              if (currentPage > showFirst && currentPage <= total - showLast) {
                pages.push('ellipsis1');
                // Show current page if it's not in first 5 or last 2
                if (currentPage > showFirst && currentPage <= total - showLast) {
                  pages.push(currentPage);
                }
                pages.push('ellipsis2');
              } else {
                pages.push('ellipsis');
              }
              for (let i = total - showLast + 1; i <= total; i++) {
                pages.push(i);
              }
            } else {
              // If not enough pages for ellipsis, just show all
              for (let i = showFirst + 1; i <= total; i++) {
                pages.push(i);
              }
            }
            return pages.map((p, idx) => {
              if (typeof p === 'string' && p.startsWith('ellipsis')) {
                return (
                  <li key={p + idx} className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                );
              }
              return (
                <li
                  key={p}
                  className={`page-item ${currentPage === p ? "active border-0" : ""}`}
                >
                  <button
                    className={`page-link ${currentPage === p ? "bg-black border-black" : "text-black"}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                </li>
              );
            });
          })()}
        </ul>

        <button
          className="btn btn-dark ms-2 mb-2"
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
