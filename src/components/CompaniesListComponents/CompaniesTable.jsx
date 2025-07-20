import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { OverlayTrigger, Popover } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function CompaniesTable() {
  const [companies, setCompanies] = useState([]);
  const [industryOptions, setIndustryOptions] = useState(["All sectors"]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    axios
      .get(`${import.meta.env.BASE_URL}/companies-data/companies.json`)
      .then((response) => {
        setCompanies(response.data);
        setLoading(false); // Set loading to false after data is fetched
        // Extract unique sectors for filter dropdown
        const sectors = Array.from(new Set(response.data.map((c) => c.Sector)));
        setIndustryOptions(["All sectors", ...sectors.filter(Boolean).sort()]);
      })
      .catch((error) => {
        console.error("Failed to load companies:", error);
        setLoading(false); // Set loading to false even if there's an error
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
    setCurrentPage(1);
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

  const calculateDifference = (comp) => {
    return (
      (comp.currentPrice -
        (comp.intrinsicPrice.max + comp.intrinsicPrice.min) / 2) /
      comp.currentPrice
    );
  };

  const sorted = [...filtered].sort((a, b) => {
    if (sortField) {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === "Company") {
        valA = typeof valA === "string" ? valA.toLowerCase() : valA;
        valB = typeof valB === "string" ? valB.toLowerCase() : valB;
      }
      if (sortField === "Sector") {
        valA = typeof valA === "string" ? valA.toLowerCase() : valA;
        valB = typeof valB === "string" ? valB.toLowerCase() : valB;
      }
      if (sortField === "CurrentPrice" || sortField === "MarketCap") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }
      if (sortField === "IntrinsicValue") {
        // Sort by average of DCF and Exit Multiple values
        const getIntrinsicAvg = (comp) => {
          if (
            comp.DCFValue != null &&
            comp.ExitMultipleValue != null &&
            !isNaN(comp.DCFValue) &&
            !isNaN(comp.ExitMultipleValue)
          ) {
            return (Number(comp.DCFValue) + Number(comp.ExitMultipleValue)) / 2;
          }
          return -Infinity; // Treat missing as lowest
        };
        valA = getIntrinsicAvg(a);
        valB = getIntrinsicAvg(b);
      }
      if (sortField === "Difference") {
        // Calculate difference for a and b
        const getDiff = (comp) => {
          if (
            comp.DCFValue != null &&
            comp.ExitMultipleValue != null &&
            comp.CurrentPrice != null &&
            !isNaN(comp.DCFValue) &&
            !isNaN(comp.ExitMultipleValue) &&
            !isNaN(comp.CurrentPrice) &&
            comp.CurrentPrice !== 0
          ) {
            const avg =
              (Number(comp.DCFValue) + Number(comp.ExitMultipleValue)) / 2;
            return avg / Number(comp.CurrentPrice) - 1;
          }
          return -Infinity; // Treat missing as lowest
        };
        valA = getDiff(a);
        valB = getDiff(b);
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Check if mobile view
  const isMobile = window.innerWidth < 992;

  const pageCount = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  const navigate = useNavigate();

  // Table column definitions
  const columns = [
    { field: "Company", label: "Company", align: "left" },
    { field: "Ticker", label: "Ticker", align: "left" },
    { field: "MarketCap", label: "Market\u00A0Cap", align: "right" },
    { field: "CurrentPrice", label: "Stock\u00A0Price", align: "right" },
    { field: "IntrinsicValue", label: "Intrinsic\u00A0Value", align: "right" },
    { field: "Comparatives", label: "Comparatives", align: "right" },
    { field: "Difference", label: "Difference", align: "right" },
  ];

  if (loading) {
    return (
      <div className="container mt-4">
        <h1 className="display-6 mb-4">Loading Companies...</h1>
        <Skeleton count={10} height={40} style={{ marginBottom: "10px" }} />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <style>{`
        @media (max-width: 768px) {
          .table-sticky-col-header {
            position: sticky;
            left: 0;
            background: white;
            z-index: 2;
            width: 160px !important;
            min-width: 160px !important;
            max-width: 160px !important;
          }
          .table-sticky-col {
            position: sticky;
            left: 0;
            background: white;
            z-index: 1;
            width: 220px !important;
            min-width: 220px !important;
            max-width: 220px !important;
          }
        }
      `}</style>
      {/* Header with Total Companies */}
      <h1 className={isMobile ? "h3 mb-4" : "display-6 mb-4"}>
        Companies List ({filtered.length})
      </h1>
      {/* Filters */}
      <div className="row mb-2 align-items-center">
        <div className="col-12 col-md-4">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Search by Company or Ticker"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="col-12 mb-2 col-md-3">
          <select
            className="form-select flex-grow-1"
            onChange={(e) => {
              setFilterIndustry(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setFilterMarketCap(e.target.value);
              setCurrentPage(1);
            }}
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
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="table-responsive"
        style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
      >
        <table
          className="table table-hover"
          style={{ tableLayout: "fixed", minWidth: "900px" }}
        >
          <thead style={{ background: "white", color: "black" }}>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  className={idx === 0 ? "table-sticky-col-header" : ""}
                  style={{
                    cursor: "pointer",
                    color: "black",
                    width:
                      idx === 0
                        ? typeof window !== "undefined" &&
                          window.innerWidth <= 768
                          ? "170px"
                          : "220px"
                        : col.field === "Ticker"
                        ? "50px"
                        : col.field === "IntrinsicValue"
                        ? "160px"
                        : "auto",
                    minWidth:
                      idx === 0
                        ? typeof window !== "undefined" &&
                          window.innerWidth <= 768
                          ? "170px"
                          : "220px"
                        : col.field === "Ticker"
                        ? "50px"
                        : col.field === "IntrinsicValue"
                        ? "160px"
                        : "90px",
                    textAlign: col.align || "left",
                  }}
                >
                  {col.field === "Comparatives" ? (
                    <OverlayTrigger
                      trigger={["hover", "focus"]}
                      placement="top"
                      overlay={
                        <Popover
                          id="popover-comparatives-header"
                          placement="top"
                        >
                          <Popover.Header as="h3">Comparatives</Popover.Header>
                          <Popover.Body>
                            Comparatives shows how a company’s performance
                            stacks up against its industry by comparing the
                            number of strong metrics to weak ones. For example,
                            a score of 200% means the company has twice as many
                            metrics performing better than the industry average
                            as those performing worse.
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <span
                        style={{
                          borderBottom: "1px dashed grey",
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                      >
                        {col.label}
                        {sortField === col.field &&
                          (sortOrder === "asc" ? "\u00A0▲" : "\u00A0▼")}
                      </span>
                    </OverlayTrigger>
                  ) : col.field === "Difference" ? (
                    <OverlayTrigger
                      trigger={["hover", "focus"]}
                      placement="top"
                      overlay={
                        <Popover id="popover-difference-header" placement="top">
                          <Popover.Header as="h3">Difference</Popover.Header>
                          <Popover.Body>
                            Difference indicates how much higher or lower the
                            estimated intrinsic value is compared to current
                            stock price. A positive number means the estimated
                            intrinsic value is higher than the current stock
                            price (i.e. undervaluation), while a negative number
                            means the current stock price is higher than
                            estimated intrinsic value (i.e. overvaluation).
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <span
                        style={{
                          borderBottom: "1px dashed grey",
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                      >
                        {col.label}
                        {sortField === col.field &&
                          (sortOrder === "asc" ? "\u00A0▲" : "\u00A0▼")}
                      </span>
                    </OverlayTrigger>
                  ) : (
                    <>
                      {col.label}
                      {sortField === col.field &&
                        (sortOrder === "asc" ? "\u00A0▲" : "\u00A0▼")}
                    </>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ fontSize: "0.8rem" }}>
            {paged.map((comp) => {
              // Calculate Difference for each row
              let diffText = "—";
              if (
                comp.DCFValue != null &&
                comp.ExitMultipleValue != null &&
                comp.CurrentPrice != null &&
                !isNaN(comp.DCFValue) &&
                !isNaN(comp.ExitMultipleValue) &&
                !isNaN(comp.CurrentPrice) &&
                comp.CurrentPrice !== 0
              ) {
                const avg =
                  (Number(comp.DCFValue) + Number(comp.ExitMultipleValue)) / 2;
                const diff = avg / Number(comp.CurrentPrice) - 1;
                diffText =
                  (diff * 100).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) + "%";
              }
              return (
                <tr
                  key={comp.Ticker}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/company-analysis?ticker=${comp.Ticker}`)
                  }
                >
                  <td className="table-sticky-col">
                    <div>
                      <div>
                        {comp.Company.replace(
                          /\w\S*/g,
                          (w) =>
                            w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8em",
                          color: "#666",
                          marginTop: "2px",
                        }}
                      >
                        {comp.Sector}
                      </div>
                    </div>
                  </td>
                  <td>{comp.Ticker}</td>
                  <td style={{ textAlign: "right" }}>
                    {typeof comp.MarketCap === "number"
                      ? (() => {
                          const val = comp.MarketCap;
                          if (val >= 1e8) {
                            // 100 million or more: show in billions
                            return `$${(val / 1e9).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}B`;
                          } else {
                            // less than 100 million: show in millions
                            return `$${(val / 1e6).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}M`;
                          }
                        })()
                      : comp.MarketCap}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {typeof comp.CurrentPrice === "number"
                      ? `$${comp.CurrentPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : comp.CurrentPrice}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {(() => {
                      if (
                        comp.DCFValue != null &&
                        comp.ExitMultipleValue != null &&
                        !isNaN(comp.DCFValue) &&
                        !isNaN(comp.ExitMultipleValue)
                      ) {
                        const dcf = Number(comp.DCFValue);
                        const exit = Number(comp.ExitMultipleValue);
                        const min = Math.min(dcf, exit);
                        const max = Math.max(dcf, exit);
                        const rangeText = `$${min.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} - $${max.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`;

                        return (
                          <OverlayTrigger
                            trigger={["hover", "focus"]}
                            placement="top"
                            overlay={
                              <div
                                className="shadow-sm"
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: "8px",
                                  padding: "12px 14px",
                                  fontSize: "13px",
                                  lineHeight: "1.4",
                                  color: "#333",
                                  backdropFilter: "blur(4px)",
                                  maxWidth: "250px",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: "600",
                                    color: "#1976d2",
                                    marginBottom: "6px",
                                  }}
                                >
                                  Intrinsic Value Details
                                </div>
                                <div style={{ marginBottom: "4px" }}>
                                  <span
                                    style={{
                                      color: "#666",
                                      display: "inline-block",
                                      minWidth: "50px",
                                    }}
                                  >
                                    DCF:
                                  </span>
                                  <span style={{ fontWeight: "600" }}>
                                    $
                                    {dcf.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                                <div>
                                  <span
                                    style={{
                                      color: "#666",
                                      display: "inline-block",
                                      minWidth: "50px",
                                    }}
                                  >
                                    Exit:
                                  </span>
                                  <span style={{ fontWeight: "600" }}>
                                    $
                                    {exit.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              </div>
                            }
                          >
                            <span
                              style={{
                                borderBottom: "1px dashed grey",
                                textDecoration: "none",
                                cursor: "pointer",
                              }}
                            >
                              {rangeText}
                            </span>
                          </OverlayTrigger>
                        );
                      }
                      return "—";
                    })()}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {typeof comp.Comparatives === "number" ? (
                      <span>{Math.floor(comp.Comparatives * 100)}%</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {(() => {
                      if (diffText === "—") return diffText;
                      const num = parseFloat(diffText);
                      let colorClass = "";
                      if (!isNaN(num)) {
                        colorClass =
                          num >= 0
                            ? "text-success fw-bold"
                            : "text-danger fw-bold";
                      }
                      return <span className={colorClass}>{diffText}</span>;
                    })()}
                  </td>
                </tr>
              );
            })}
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
          {/* Only show page numbers on desktop */}
          {typeof window !== "undefined" &&
            window.innerWidth > 768 &&
            (() => {
              const pages = [];
              const showFirst = 5;
              const showLast = 2;
              const total = pageCount;
              for (let i = 1; i <= Math.min(showFirst, total); i++) {
                pages.push(i);
              }
              if (total > showFirst + showLast) {
                if (
                  currentPage > showFirst &&
                  currentPage <= total - showLast
                ) {
                  pages.push("ellipsis1");
                  if (
                    currentPage > showFirst &&
                    currentPage <= total - showLast
                  ) {
                    pages.push(currentPage);
                  }
                  pages.push("ellipsis2");
                } else {
                  pages.push("ellipsis");
                }
                for (let i = total - showLast + 1; i <= total; i++) {
                  pages.push(i);
                }
              } else {
                for (let i = showFirst + 1; i <= total; i++) {
                  pages.push(i);
                }
              }
              return pages.map((p, idx) => {
                if (typeof p === "string" && p.startsWith("ellipsis")) {
                  return (
                    <li key={p + idx} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }
                return (
                  <li
                    key={p}
                    className={`page-item ${
                      currentPage === p ? "active border-0" : ""
                    }`}
                  >
                    <button
                      className={`page-link ${
                        currentPage === p
                          ? "bg-black border-black"
                          : "text-black"
                      }`}
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
