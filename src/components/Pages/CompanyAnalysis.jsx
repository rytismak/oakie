import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Link } from "react-router-dom";
import PriceChart from "../CompanyAnalysis/PriceChart";
import ValuationMetrics from "../CompanyAnalysis/ValuationMetrics";
import InfoCards from "../CompanyAnalysis/InfoCards";

const pageName = "ACME Corporation";
export default function CompanyAnalysis() {
  return (
    <div className="container mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{pageName}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <h1>{pageName}</h1>

      {/* Company Description */}
      <p>
        ACME is a leading manufacturer of industrial equipment, serving markets
        across North America and Europe.
      </p>

      <div className="container p-0 mt-4">
        <InfoCards
          stockPrice={120.5}
          evaluationMin={115}
          evaluationMax={125}
          differencePercent={-3.2}
        />
      </div>

      <PriceChart />
      <ValuationMetrics />
    </div>
  );
}
