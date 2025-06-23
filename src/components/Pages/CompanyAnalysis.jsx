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
  const ticker = params.get("ticker").toLowerCase();
  const dataURL = `${import.meta.env.BASE_URL}data/details/${ticker}.json`;
  // console.log(dataURL);

  const [companyData, setcompanyData] = useState([]);

  useEffect(() => {
    axios
      .get(dataURL)
      .then((response) => {
        setcompanyData(response.data);
        // console.log(response.data.evaluationMetrics);
      })
      .catch((error) => {
        console.error("Failed to load companies:", error);
      });
  }, []);

  return (
    <div className="container mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/featured-companies" }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{companyData.companyName}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <h1 className="display-4">{companyData.companyName}</h1>

      {/* Company Description */}
      <p className="mt-4 text-muted">{companyData.description}</p>

      <div className="container p-0 mt-4">
        <InfoCards
          stockPrice={120.5}
          evaluationMin={115}
          evaluationMax={125}
          differencePercent={-3.2}
        />
      </div>

      <PriceChart
        intrinsicValueEstimates={companyData.intrinsicValueEstimates}
        dailyStockPrice={companyData.dailyStockPrice}
      />

      <ValuationMetrics evaluationMetrics={companyData.evaluationMetrics} />
     
    </div>
  );
}
//  