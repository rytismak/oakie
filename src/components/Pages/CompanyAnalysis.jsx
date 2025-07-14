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
  const dataURL = `${import.meta.env.BASE_URL}companies-data/details/${ticker}.json`;
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
    date: p.Date.split('T')[0],
    price: Number(p.Close)
  }));

  // Build intrinsicValueEstimates array from Years
  // Each year is a band from Jan 1 to Dec 31, with DCFValue and ExitMultipleValue
  const intrinsicValueEstimates = (companyData.Years || []).map((y) => {
    const year = y.Year;
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      DCFValue: Number(y.DCFValue),
      ExitMultipleValue: Number(y.ExitMultipleValue)
    };
  }).filter(q => !isNaN(q.DCFValue) && !isNaN(q.ExitMultipleValue));

  // Get last available values
  const lastStockPrice = dailyStockPrice.length ? dailyStockPrice[dailyStockPrice.length - 1].price : null;
  const lastIntrinsic = intrinsicValueEstimates.length ? intrinsicValueEstimates[intrinsicValueEstimates.length - 1] : {};
  const lastDCFValue = lastIntrinsic.DCFValue ?? null;
  const lastExitMultipleValue = lastIntrinsic.ExitMultipleValue ?? null;

  return (
    <div className="container mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/featured-companies" }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{companyData.Company}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <h1 className="display-4">{companyData.Company}</h1>

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

      {companyData.Years && (
        <ValuationMetrics years={companyData.Years} />
      )}
     
    </div>
  );
}