import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { OverlayTrigger, Popover, Badge } from "react-bootstrap";

function CompaniesTable() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.BASE_URL}/data/companies-list.json`)
      .then((response) => {
        setCompanies(response.data);
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

  const industryOptions = [
    "All sectors",
    "Consumer Goods",
    "Energy",
    "Finance",
    "Healthcare",
    "Real Estate",
    "Retail",
    "Technology",
    "Telecommunications",
    "Transportation",
    "Utilities",
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
    if (filterMarketCap === "Micro") return comp.marketCap < 2;
    if (filterMarketCap === "Small")
      return comp.marketCap >= 2 && comp.marketCap < 10;
    if (filterMarketCap === "Mid")
      return comp.marketCap >= 10 && comp.marketCap <= 200;
    if (filterMarketCap === "Large") return comp.marketCap > 200;
    return true;
  };

  const filtered = companies.filter((comp) => {
    return (
      (filterIndustry === "" ||
        filterIndustry === "All sectors" ||
        comp.industry === filterIndustry) &&
      filterByMarketCap(comp) &&
      (comp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.ticker.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const calculateDifference = (comp) => {
    return (
      (comp.currentPrice -
        (comp.intrinsicPrice.max + comp.intrinsicPrice.min) / 2) /
      comp.currentPrice
    );
  };

  const sorted = [...filtered].sort((a, b) => {
    if (sortField) {
      let valA, valB;

      if (sortField === "currentPrice" || sortField === "marketCap") {
        valA = parseFloat(a[sortField]);
        valB = parseFloat(b[sortField]);
      } else if (sortField === "intrinsicPrice") {
        valA = (a.intrinsicPrice.min + a.intrinsicPrice.max) / 2;
        valB = (b.intrinsicPrice.min + b.intrinsicPrice.max) / 2;
      } else if (sortField === "difference") {
        valA = calculateDifference(a);
        valB = calculateDifference(b);
      } else {
        valA = a[sortField];
        valB = b[sortField];
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
      {/* Header with Total Companies */}
      <h2 className="mb-4">Companies List ({filtered.length})</h2>

      {/* Filters */}
      <div className="row mb-2 align-items-center">
        <div className="col-12 col-md-4">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Search by Company or Ticker"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-12 mb-2 col-md-3">
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

        <div className="col-12 mb-2 col-md-3">
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

        <div className="col-12  mb-2 col-md-2">
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
        <table className="table table-hover" style={{ tableLayout: "fixed" }}>
          <thead style={{ background: "white", color: "black" }}>
            <tr>
              {[
                "companyName",
                "ticker",
                "marketCap",
                "industry",
                "currentPrice",
                "intrinsicPrice",
                "difference",
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
                    width:
                      idx === 1 || idx === 2 || idx === 4 || idx === 6
                        ? "90px"
                        : idx === 0
                        ? "200px"
                        : idx === 5
                        ? "140px"
                        : "auto",
                    maxWidth:
                      idx === 1 || idx === 2 || idx === 4 || idx === 6
                        ? "90px"
                        : idx === 0
                        ? "200px"
                        : idx === 5
                        ? "140px"
                        : "auto",
                    minWidth: idx === 0 ? "150px" : "90px",
                    textAlign:
                      idx === 2 || idx === 4 || idx === 5 || idx === 6
                        ? "right"
                        : "left",
                  }}
                >
                  {field === "intrinsicPrice"
                    ? "Intrinsic Value"
                    : field === "difference"
                    ? "Difference"
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field &&
                    (sortOrder === "asc" ? "\u00A0▲" : "\u00A0▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((comp) => (
              <tr
                key={comp.ticker}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate(`/company-analysis?ticker=${comp.ticker}`)
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
                  {comp.companyName}
                </td>
                <td>{comp.ticker}</td>
                <td
                  style={{
                    textAlign: "right",
                  }}
                >
                  {comp.marketCap}
                </td>
                <td>{comp.industry}</td>
                <td
                  style={{
                    textAlign: "right",
                  }}
                >
                  {comp.currentPrice}
                </td>
                <td
                  style={{
                    textAlign: "right",
                  }}
                >
                  {comp.intrinsicPrice.min} - {comp.intrinsicPrice.max}
                </td>
                <td style={{ textAlign: "right" }}>
                  <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="top"
                    overlay={
                      <Popover id={`popover-${comp.ticker}`}>
                        <Popover.Body>
                          {calculateDifference(comp) < 0
                            ? "Undervalued"
                            : "Overvalued"}
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <Badge
                      pill
                      className={
                        calculateDifference(comp) > 0
                          ? "badge bg-danger-subtle border border-danger-subtle text-danger-emphasis rounded-pill"
                          : "badge bg-success-subtle border border-success-subtle text-success-emphasis rounded-pill"
                      }
                      style={{ minWidth: "60px", cursor: "pointer" }}
                    >
                      {calculateDifference(comp).toFixed(2)}%
                    </Badge>
                  </OverlayTrigger>
                </td>
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
          {Array.from({ length: pageCount }).map((_, i) => (
            <li
              key={i}
              className={`page-item ${
                currentPage === i + 1 ? "active border-0" : ""
              }`}
            >
              <button
                className={`page-link ${
                  currentPage === i + 1 ? "bg-black border-black" : "text-black"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}
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
