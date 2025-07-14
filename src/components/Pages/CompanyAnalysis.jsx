// import "bootstrap/dist/css/bootstrap.min.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Link } from "react-router-dom";
import PriceChart from "../CompanyAnalysis/PriceChart";
import ValuationMetrics from "../CompanyAnalysis/ValuationMetrics";
import InfoCards from "../CompanyAnalysis/InfoCards";

import React, { useState, useEffect } from "react";
import axios from "axios";

// <span className="badge display-2 text-bg-warning">Top 3%</span>

// const pageName = "ACME Corporation";
export default function CompanyAnalysis() {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.hash.split("?")[1]);
  const ticker = params.get("ticker");
  const dataURL = `${
    import.meta.env.BASE_URL
  }companies-data/details/${ticker}.json`;
  // console.log(dataURL);

  const [companyData, setcompanyData] = useState({});

  useEffect(() => {
    axios
      .get(dataURL)
      .then((response) => {
        setcompanyData(response.data);
        console.log(response.data);
        console.log(response.data.Years[0]);
      })
      .catch((error) => {
        console.error("Failed to load companies:", error);
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

  return (
    <div className="container mt-4">
      <Breadcrumb>
        <Breadcrumb.Item
          linkAs={Link}
          linkProps={{ to: "/featured-companies" }}
        >
          Featuted Companies
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{companyData.Company}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <h1 className="display-6">{companyData.Company}</h1>

      {/* Company Description */}
      <p className="mt-4 text-muted">{companyData.Description}</p>

      <InfoCards
        stockPrice={lastStockPrice}
        dcfValue={lastDCFValue}
        exitMultipleValue={lastExitMultipleValue}
      />

      <PriceChart
        intrinsicValueEstimates={intrinsicValueEstimates}
        dailyStockPrice={dailyStockPrice}
      />

      {/* Price Difference Table and ValuationMetrics side by side */}
      <div className="row my-4">
        <div className="col-lg-6 col-12 pe-4">
          {companyData.Years && <ValuationMetrics sector={companyData.Sector} years={companyData.Years} />}
        </div>
        <div className="col-lg-6 col-12 mb-3 mb-lg-0 ps-4">
          <table className="ps-4 table w-auto" style={{ minWidth: 400 }}>
            <colgroup>
              <col style={{ width: "33%" }} />
              <col style={{ width: "33%" }} />
              <col style={{ width: "33%" }} />
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
                      <span className={colorClass}>
                        {change.toFixed(2)}% {symbol}
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
