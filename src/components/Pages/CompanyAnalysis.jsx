// Helper to format market cap
function formatMarketCap(cap) {
  if (cap == null || isNaN(cap)) return "—";
  const num = Number(cap);
  // Always show in billions with 'B', as in CompaniesList
  if (num >= 1e9) {
    // Show in billions if 1 billion or more
    return `$${(num / 1e9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
  } else {
    // Show in millions if less than 1 billion
    return `$${(num / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
  }
}
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Link } from "react-router-dom";
import { OverlayTrigger } from "react-bootstrap";
import PriceChart from "../CompanyAnalysis/PriceChart";
import ValuationMetrics from "../CompanyAnalysis/ValuationMetrics";
import InfoCards from "../CompanyAnalysis/InfoCards";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import React, { useState, useEffect } from "react";
import axios from "axios";

// <span className="badge display-2 text-bg-warning">Top 3%</span>

export default function CompanyAnalysis() {
  const [companyData, setcompanyData] = useState({});

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.hash.split("?")[1]);

  const ticker = params.get("ticker");
  const dataURL = `${
    import.meta.env.BASE_URL
  }companies-data/details/${ticker}.json`;
  // console.log(dataURL);

  useEffect(() => {
    axios
      .get(dataURL)
      .then((response) => {
        setcompanyData(response.data);

        // console.log(response.data);
        // console.log(response.data.Years[0]);
      })
      .catch((error) => {
        console.error("Failed to load data:", error);
      });
  }, []);

  // Prepare data for PriceChart
  // HistoricalPrices: [{ Date, Close }]
  // Years: [{ Year, DCFValue, ExitMultipleValue }]
  const dailyStockPrice = (companyData.HistoricalPrices || []).map((p) => ({
    date: p.Date.split("T")[0],
    price: Number(p.Close),
  }));

  // Build intrinsicValueEstimates array from Years
  // Each year is a band from Jan 1 to Dec 31, with DCFValue and ExitMultipleValue
  const intrinsicValueEstimates = (companyData.Years || [])
    .map((y) => {
      const year = y.Year;
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        DCFValue: Number(y.DCFValue),
        ExitMultipleValue: Number(y.ExitMultipleValue),
      };
    })
    .filter((q) => !isNaN(q.DCFValue) && !isNaN(q.ExitMultipleValue));

  // Get last available values
  const lastStockPrice = dailyStockPrice.length
    ? dailyStockPrice[dailyStockPrice.length - 1].price
    : null;
  const lastIntrinsic = intrinsicValueEstimates.length
    ? intrinsicValueEstimates[intrinsicValueEstimates.length - 1]
    : {};
  const lastDCFValue = lastIntrinsic.DCFValue ?? null;
  const lastExitMultipleValue = lastIntrinsic.ExitMultipleValue ?? null;

  // Format company name with proper capitalization
  const formatCompanyName = (name) => {
    if (!name) return "";
    return name.replace(
      /\w\S*/g,
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    );
  };

  // Check if mobile view
  const isMobile = window.innerWidth < 992;

  // State for description expand/collapse
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Get MarketCap from last year if available
  let marketCap = null;
  if (companyData.Years && Array.isArray(companyData.Years) && companyData.Years.length > 0) {
    const lastYear = companyData.Years[companyData.Years.length - 1];
    if (lastYear && lastYear.MarketCap) {
      marketCap = lastYear.MarketCap;
    }
  }

  // Market Cap popover
  const marketCapPopover = (
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
      <div style={{ fontWeight: "600", color: "#1976d2", marginBottom: "6px" }}>
        Market Cap
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      {Object.keys(companyData).length === 0 ? (
        <>
          <div className="mb-3">
            <Skeleton width={200} height={30} />
          </div>
          <div className="row">
            <div className="col-lg-8 col-12 mb-3 mb-lg-0">
              <Skeleton height={300} />
            </div>
            <div className="col-lg-4 col-12 pt-lg-3">
              <Skeleton height={150} />
            </div>
          </div>
          <div className="row g-lg-5">
            <div className="col-lg-6 col-12">
              <Skeleton height={200} />
            </div>
            <div className="col-lg-6 col-12 mb-3 mb-lg-0">
              <Skeleton height={200} />
            </div>
          </div>
        </>
      ) : isMobile ? (
        // Mobile: Show back link with arrow
        <div className="mb-3">
          <Link
            to="/featured-companies"
            className="text-decoration-none text-primary"
          >
            ← Back to Featured Companies
          </Link>
        </div>
      ) : (
        // Desktop: Show breadcrumbs
        <Breadcrumb>
          <Breadcrumb.Item
            linkAs={Link}
            linkProps={{ to: "/featured-companies" }}
          >
            Featured Companies
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {formatCompanyName(companyData.Company)}
          </Breadcrumb.Item>
        </Breadcrumb>
      )}

      {/* PriceChart and InfoCards side by side on desktop, stacked on mobile */}
      <div className="row">
        <div className="col-lg-10 col-12 mb-3 mb-lg-0">
          {/* Header */}
          <h1 className={isMobile ? "h3 mb-0" : "display-6 mb-0"}>
            {formatCompanyName(companyData.Company)}
            {companyData.Ticker ? ` (${companyData.Ticker})` : ticker ? ` (${ticker})` : ""}
            {marketCap && !isNaN(marketCap) && Number(marketCap) > 0 ? (
              <>
                {" | "}
                <OverlayTrigger
                  trigger={["hover", "focus"]}
                  placement="top"
                  overlay={marketCapPopover}
                >
                  <span
                    style={{
                      borderBottom: "1px dashed grey",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    {formatMarketCap(marketCap)}
                  </span>
                </OverlayTrigger>
              </>
            ) : ""}
          </h1>
          {companyData.Sector && (
            <p className="text-muted mb-0" style={{ fontWeight: "normal" }}>
              {companyData.Sector}
            </p>
          )}
          <PriceChart
            intrinsicValueEstimates={intrinsicValueEstimates}
            dailyStockPrice={dailyStockPrice}
          />
        </div>
        <div className="col-lg-2 col-12 pt-lg-3">
          <div>
            <InfoCards
              stockPrice={lastStockPrice}
              dcfValue={lastDCFValue}
              exitMultipleValue={lastExitMultipleValue}
            />
          </div>
        </div>
      </div>

      {/* Company Description */}
      {companyData.Description &&
        companyData.Description.trim() !== "" &&
        (() => {
          const desc = companyData.Description.trim();
          if (desc.length <= 200) {
            return <p>{desc}</p>;
          }
          const first200 = desc.slice(0, 200);
          return (
            <div style={{ position: "relative" }}>
              <p style={{ marginBottom: 0, display: "inline" }}>
                {showFullDescription ? (
                  desc
                ) : (
                  <>
                    {first200 + "... "}
                    <button
                      className="btn btn-link p-0"
                      style={{
                        fontSize: "1em",
                        color: "rgb(25, 118, 210)",
                        textDecoration: "underline",
                        background: "none",
                        border: "none",
                        verticalAlign: "baseline",
                      }}
                      onClick={() => setShowFullDescription(true)}
                    >
                      Read more
                    </button>
                  </>
                )}
              </p>
            </div>
          );
        })()}
      {/* Price Difference Table and ValuationMetrics side by side */}
      <div className="row mt-3 g-lg-5">
        <div className="col-lg-6 mt-0 mb-3 col-12">
          {companyData.Years && (
            <ValuationMetrics
              sector={companyData.Sector}
              years={companyData.Years}
            />
          )}
        </div>
        <div className="col-lg-6 mt-0 col-12 mb-3 mb-lg-0">
          <table className="table w-100">
            <colgroup>
              <col style={{ width: "50%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Stock price change</th>
                <th className="text-end"></th>
                <th className="text-end"></th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const periods = [
                  {
                    label: "1M",
                    getStart: () => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - 1);
                      return d;
                    },
                  },
                  {
                    label: "3M",
                    getStart: () => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - 3);
                      return d;
                    },
                  },
                  {
                    label: "6M",
                    getStart: () => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - 6);
                      return d;
                    },
                  },
                  {
                    label: "YTD",
                    getStart: () => new Date(new Date().getFullYear(), 0, 1),
                  },
                  {
                    label: "1Y",
                    getStart: () => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() - 1);
                      return d;
                    },
                  },
                  {
                    label: "2Y",
                    getStart: () => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() - 2);
                      return d;
                    },
                  },
                  {
                    label: "3Y",
                    getStart: () => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() - 3);
                      return d;
                    },
                  },
                  {
                    label: "4Y",
                    getStart: () => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() - 4);
                      return d;
                    },
                  },
                  {
                    label: "5Y",
                    getStart: () => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() - 5);
                      return d;
                    },
                  },
                ];
                const last = dailyStockPrice.length
                  ? dailyStockPrice[dailyStockPrice.length - 1].price
                  : null;
                return periods.map((period) => {
                  const startDate = period.getStart();
                  // Find the entry with the date closest to startDate
                  let minDiff = Infinity;
                  let startEntry = null;
                  for (const p of dailyStockPrice) {
                    const diff = Math.abs(new Date(p.date) - startDate);
                    if (diff < minDiff) {
                      minDiff = diff;
                      startEntry = p;
                    }
                  }
                  const startPrice = startEntry ? startEntry.price : null;
                  let change = null;
                  let priceDiff = null;
                  if (startPrice != null && last != null && startPrice !== 0) {
                    change = ((last - startPrice) / startPrice) * 100;
                    priceDiff = last - startPrice;
                  }
                  let changeCell = "-";
                  let priceDiffCell = "-";
                  if (change != null) {
                    const isPositive = change >= 0;
                    const colorClass = isPositive
                      ? "text-success fw-bold"
                      : "text-danger fw-bold";
                    const symbol = isPositive ? "▲" : "▼";
                    changeCell = (
                      <span>
                        {change.toFixed(2)}%{" "}
                        <span className={colorClass}>{symbol}</span>
                      </span>
                    );
                    priceDiffCell = (
                      <span>
                        {priceDiff >= 0 ? "+" : "-"}$
                        {Math.abs(priceDiff).toFixed(2)}
                      </span>
                    );
                  }
                  return (
                    <tr key={period.label}>
                      <td>{period.label}</td>
                      <td className="text-end">{priceDiffCell}</td>
                      <td className="text-end">{changeCell}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
